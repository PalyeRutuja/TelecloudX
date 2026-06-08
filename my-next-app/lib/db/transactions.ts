import crypto from "crypto";
import { adminFirestore } from "@/lib/firebase-admin";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  transactionHash?: string;
  providerTransactionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const transactionsCollection = () => adminFirestore.collection("transactions");

function transactionRef(transactionId: string) {
  return transactionsCollection().doc(transactionId);
}

function nowIso() {
  return new Date().toISOString();
}

function generateTransactionId(): string {
  return `txn_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
): Promise<Transaction> {
  const id = generateTransactionId();
  const now = nowIso();
  
  const transaction: Transaction = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  await transactionRef(id).set(transaction);
  return transaction;
}

export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const snapshot = await transactionRef(transactionId).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as Transaction;
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, "id">>
): Promise<Transaction | null> {
  const ref = transactionRef(transactionId);
  const snapshot = await ref.get();
  
  if (!snapshot.exists) return null;
  
  const current = snapshot.data() as Transaction;
  const updated: Transaction = {
    ...current,
    ...updates,
    updatedAt: nowIso(),
  };
  
  await ref.set(updated);
  return updated;
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  // Sort in-memory instead of using .orderBy() to avoid requiring a Firestore composite index
  const snapshot = await transactionsCollection()
    .where("userId", "==", userId)
    .get();

  return snapshot.docs
    .map((doc) => doc.data() as Transaction)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function getUserTransactionsByStatus(
  userId: string,
  status: Transaction["status"]
): Promise<Transaction[]> {
  // Sort in-memory instead of using .orderBy() to avoid requiring a Firestore composite index
  const snapshot = await transactionsCollection()
    .where("userId", "==", userId)
    .where("status", "==", status)
    .get();

  return snapshot.docs
    .map((doc) => doc.data() as Transaction)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function getPendingTransactions(userId: string): Promise<Transaction[]> {
  return getUserTransactionsByStatus(userId, "PENDING");
}

export async function getSuccessfulTransactions(userId: string): Promise<Transaction[]> {
  return getUserTransactionsByStatus(userId, "SUCCESS");
}

// Atomic operation: Update transaction status and add credits in a single Firestore transaction.
// IMPORTANT: ALL reads must happen before any writes inside runTransaction.
export async function processSuccessfulPayment(
  transactionId: string,
  providerTransactionId?: string,
  metadata?: Record<string, any>
): Promise<{ transaction: Transaction; wallet: { userId: string; balance: number; currency: string } }> {
  const txnRef = transactionRef(transactionId);

  return adminFirestore.runTransaction(async (firestoreTxn) => {
    // ── READS FIRST ──────────────────────────────────────────────────────────
    const txnSnapshot = await firestoreTxn.get(txnRef);
    if (!txnSnapshot.exists) {
      throw new Error("Transaction not found");
    }

    const transaction = txnSnapshot.data() as Transaction;
    const userWalletRef = adminFirestore.collection("wallets").doc(transaction.userId);
    const walletSnapshot = await firestoreTxn.get(userWalletRef);

    // ── PROCESS READS ────────────────────────────────────────────────────────
    if (transaction.status === "SUCCESS") {
      // Already processed – return current state without writes
      const wallet = walletSnapshot.exists
        ? (walletSnapshot.data() as { userId: string; balance: number; currency: string })
        : { userId: transaction.userId, balance: 0, currency: "USD" };
      return { transaction, wallet };
    }

    const now = nowIso();
    const currentWallet = walletSnapshot.exists
      ? (walletSnapshot.data() as {
          userId: string;
          balance: number;
          currency: string;
          createdAt?: string;
          updatedAt?: string;
        })
      : { userId: transaction.userId, balance: 0, currency: "USD" };

    const updatedTransaction: Transaction = {
      ...transaction,
      status: "SUCCESS",
      providerTransactionId: providerTransactionId || transaction.providerTransactionId,
      metadata: { ...transaction.metadata, ...metadata },
      updatedAt: now,
    };

    const walletData = {
      ...currentWallet,
      userId: transaction.userId,
      balance: (currentWallet.balance || 0) + transaction.amount,
      currency: currentWallet.currency || "USD",
      updatedAt: now,
      createdAt: currentWallet.createdAt || now,
    };

    // ── WRITES AFTER ALL READS ───────────────────────────────────────────────
    firestoreTxn.set(txnRef, updatedTransaction);
    firestoreTxn.set(userWalletRef, walletData);

    return { transaction: updatedTransaction, wallet: walletData };
  });
}

export async function processFailedPayment(
  transactionId: string,
  reason?: string
): Promise<Transaction> {
  const ref = transactionRef(transactionId);
  const snapshot = await ref.get();
  
  if (!snapshot.exists) {
    throw new Error("Transaction not found");
  }
  
  const current = snapshot.data() as Transaction;
  const updated: Transaction = {
    ...current,
    status: "FAILED",
    metadata: { ...current.metadata, failureReason: reason },
    updatedAt: nowIso(),
  };
  
  await ref.set(updated);
  return updated;
}

// Atomic debit: Deduct balance and record transaction inside a single Firestore transaction.
// IMPORTANT: ALL reads must happen before any writes inside runTransaction.
export async function processDebit(
  userId: string,
  amount: number,
  provider = "internal",
  metadata: Record<string, any> = {}
): Promise<{ transaction: Transaction; wallet: { userId: string; balance: number; currency: string } }> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid debit amount");
  }

  const walletDocRef = adminFirestore.collection("wallets").doc(userId);
  const transactionId = generateTransactionId();
  const txnRef = transactionRef(transactionId);

  return adminFirestore.runTransaction(async (firestoreTxn) => {
    // ── READS FIRST ──────────────────────────────────────────────────────────
    const walletSnapshot = await firestoreTxn.get(walletDocRef);

    if (!walletSnapshot.exists) {
      throw new Error("Insufficient balance");
    }

    const currentWallet = walletSnapshot.data() as any;

    if ((currentWallet.balance || 0) < amount) {
      throw new Error("Insufficient balance");
    }

    // ── PROCESS READS ────────────────────────────────────────────────────────
    const now = nowIso();

    const updatedWallet = {
      ...currentWallet,
      balance: currentWallet.balance - amount,
      updatedAt: now,
    };

    const transaction: Transaction = {
      id: transactionId,
      userId,
      amount,
      currency: currentWallet.currency || "USD",
      provider,
      status: "SUCCESS",
      metadata,
      createdAt: now,
      updatedAt: now,
    };

    // ── WRITES AFTER ALL READS ───────────────────────────────────────────────
    firestoreTxn.set(walletDocRef, updatedWallet);
    firestoreTxn.set(txnRef, transaction);

    return { transaction, wallet: updatedWallet };
  });
}
