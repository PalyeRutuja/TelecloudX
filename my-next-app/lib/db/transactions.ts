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
  const snapshot = await transactionsCollection()
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
  
  return snapshot.docs.map((doc) => doc.data() as Transaction);
}

export async function getUserTransactionsByStatus(
  userId: string,
  status: Transaction["status"]
): Promise<Transaction[]> {
  const snapshot = await transactionsCollection()
    .where("userId", "==", userId)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .get();
  
  return snapshot.docs.map((doc) => doc.data() as Transaction);
}

export async function getPendingTransactions(userId: string): Promise<Transaction[]> {
  return getUserTransactionsByStatus(userId, "PENDING");
}

export async function getSuccessfulTransactions(userId: string): Promise<Transaction[]> {
  return getUserTransactionsByStatus(userId, "SUCCESS");
}

// Atomic operation: Update transaction status and add credits in a single Firestore transaction
export async function processSuccessfulPayment(
  transactionId: string,
  providerTransactionId?: string,
  metadata?: Record<string, any>
): Promise<{ transaction: Transaction; wallet: { userId: string; balance: number; currency: string } }> {
  const txnRef = transactionRef(transactionId);
  const walletRef = adminFirestore.collection("wallets").doc();
  
  // First, read both documents outside transaction to get userId
  const txnSnapshot = await txnRef.get();
  if (!txnSnapshot.exists) {
    throw new Error("Transaction not found");
  }
  
  const transaction = txnSnapshot.data() as Transaction;
  
  if (transaction.status === "SUCCESS") {
    // Already processed, just return current state
    const walletSnapshot = await adminFirestore.collection("wallets").doc(transaction.userId).get();
    const wallet = walletSnapshot.exists 
      ? walletSnapshot.data() as { userId: string; balance: number; currency: string }
      : { userId: transaction.userId, balance: 0, currency: "USD" };
    return { transaction, wallet };
  }
  
  // Now do atomic update - all reads first, then writes
  const userWalletRef = adminFirestore.collection("wallets").doc(transaction.userId);
  
  return await adminFirestore.runTransaction(async (tx) => {
    // Read wallet first
    const walletSnapshot = await tx.get(userWalletRef);
    
    // Prepare data
    const updatedTransaction: Transaction = {
      ...transaction,
      status: "SUCCESS",
      providerTransactionId: providerTransactionId || transaction.providerTransactionId,
      metadata: { ...transaction.metadata, ...metadata },
      updatedAt: nowIso(),
    };
    
    let walletData: { userId: string; balance: number; currency: string; createdAt: string; updatedAt: string };
    
    if (!walletSnapshot.exists) {
      walletData = {
        userId: transaction.userId,
        balance: transaction.amount,
        currency: "USD",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    } else {
      const current = walletSnapshot.data() as any;
      walletData = {
        ...current,
        balance: (current.balance || 0) + transaction.amount,
        updatedAt: nowIso(),
      };
    }
    
    // All writes after all reads
    tx.set(txnRef, updatedTransaction);
    tx.set(userWalletRef, walletData);
    
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

// Atomic debit: Create transaction and deduct balance in a single operation
export async function processDebit(
  userId: string,
  amount: number,
  provider = "internal",
  metadata: Record<string, any> = {}
): Promise<{ transaction: Transaction; wallet: { userId: string; balance: number; currency: string } }> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid debit amount");
  }
  
  const walletRef = adminFirestore.collection("wallets").doc(userId);
  const transactionId = generateTransactionId();
  const txnRef = transactionRef(transactionId);
  const now = nowIso();
  
  return await adminFirestore.runTransaction(async (tx) => {
    const walletSnapshot = await tx.get(walletRef);
    
    if (!walletSnapshot.exists) {
      throw new Error("Insufficient balance");
    }
    
    const currentWallet = walletSnapshot.data() as any;
    
    if ((currentWallet.balance || 0) < amount) {
      throw new Error("Insufficient balance");
    }
    
    // Deduct from wallet
    const updatedWallet = {
      ...currentWallet,
      balance: currentWallet.balance - amount,
      updatedAt: now,
    };
    tx.set(walletRef, updatedWallet);
    
    // Create debit transaction
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
    tx.set(txnRef, transaction);
    
    return { transaction, wallet: updatedWallet };
  });
}
