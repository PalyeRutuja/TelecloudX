import crypto from "crypto";
import { adminFirestore } from "@/lib/firebase-admin";

interface WalletRecord {
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

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

const walletsCollection = () => adminFirestore.collection("wallets");
const transactionsCollection = () => adminFirestore.collection("walletTransactions");

function walletRef(userId: string) {
  return walletsCollection().doc(userId);
}

function transactionRef(transactionId: string) {
  return transactionsCollection().doc(transactionId);
}

function nowIso() {
  return new Date().toISOString();
}

function buildWallet(userId: string, data: Partial<WalletRecord> | undefined): Wallet {
  const now = nowIso();
  return {
    userId,
    balance: Number(data?.balance ?? 0),
    currency: String(data?.currency ?? "USD"),
    createdAt: String(data?.createdAt ?? now),
    updatedAt: String(data?.updatedAt ?? now),
  };
}

function buildTransaction(id: string, data: Partial<Transaction> & { userId: string; amount: number; currency: string; provider: string; status: Transaction["status"]; createdAt?: string; updatedAt?: string; }): Transaction {
  const createdAt = data.createdAt ?? nowIso();
  return {
    id,
    userId: data.userId,
    amount: Number(data.amount),
    currency: data.currency,
    provider: data.provider,
    status: data.status,
    transactionHash: data.transactionHash,
    providerTransactionId: data.providerTransactionId,
    metadata: data.metadata,
    createdAt,
    updatedAt: data.updatedAt ?? createdAt,
  };
}

function stripUndefined<T>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

async function readWallet(userId: string): Promise<Wallet> {
  const ref = walletRef(userId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    const wallet = buildWallet(userId, undefined);
    await ref.set(wallet);
    return wallet;
  }

  return buildWallet(userId, snapshot.data() as Partial<WalletRecord> | undefined);
}

async function writeWallet(userId: string, wallet: Wallet): Promise<void> {
  await walletRef(userId).set(wallet, { merge: true });
}

export async function getWallet(userId: string): Promise<Wallet> {
  return readWallet(userId);
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await getWallet(userId);
  return wallet.balance;
}

export async function addCredits(userId: string, amount: number): Promise<Wallet> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid credit amount");
  }

  let nextWallet: Wallet | null = null;

  await adminFirestore.runTransaction(async (tx) => {
    const ref = walletRef(userId);
    const snapshot = await tx.get(ref);
    const current = buildWallet(userId, snapshot.exists ? (snapshot.data() as Partial<WalletRecord>) : undefined);
    nextWallet = {
      ...current,
      balance: current.balance + amount,
      updatedAt: nowIso(),
    };
    tx.set(ref, nextWallet, { merge: true });
  });

  return nextWallet!;
}

export async function deductCredits(userId: string, amount: number): Promise<Wallet> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid debit amount");
  }

  let nextWallet: Wallet | null = null;

  await adminFirestore.runTransaction(async (tx) => {
    const ref = walletRef(userId);
    const snapshot = await tx.get(ref);
    const current = buildWallet(userId, snapshot.exists ? (snapshot.data() as Partial<WalletRecord>) : undefined);

    if (current.balance < amount) {
      throw new Error("Insufficient balance");
    }

    nextWallet = {
      ...current,
      balance: current.balance - amount,
      updatedAt: nowIso(),
    };
    tx.set(ref, nextWallet, { merge: true });
  });

  return nextWallet!;
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
): Promise<Transaction> {
  const ref = transactionRef(`txn_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`);
  const transaction = buildTransaction(ref.id, {
    ...data,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  await ref.set(stripUndefined(transaction));
  return transaction;
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>
): Promise<Transaction | null> {
  const ref = transactionRef(transactionId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return null;

  const current = snapshot.data() as Transaction;
  const updated: Transaction = {
    ...current,
    ...updates,
    id: transactionId,
    updatedAt: nowIso(),
  };
  await ref.set(stripUndefined(updated), { merge: true });
  return updated;
}

export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const snapshot = await transactionRef(transactionId).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as Transaction;
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const snapshot = await transactionsCollection().where("userId", "==", userId).get();
  return snapshot.docs
    .map((document) => document.data() as Transaction)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function processSuccessfulPayment(
  transactionId: string,
  providerTransactionId?: string,
  metadata?: Record<string, any>
): Promise<{ transaction: Transaction; wallet: Wallet }> {
  const ref = transactionRef(transactionId);
  let updatedTransaction: Transaction | null = null;
  let updatedWallet: Wallet | null = null;

  await adminFirestore.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) {
      throw new Error("Transaction not found");
    }

    const currentTransaction = snapshot.data() as Transaction;
    const walletSnapshot = await tx.get(walletRef(currentTransaction.userId));
    const currentWallet = buildWallet(
      currentTransaction.userId,
      walletSnapshot.exists ? (walletSnapshot.data() as Partial<WalletRecord>) : undefined
    );

    if (currentTransaction.status === "SUCCESS") {
      updatedTransaction = currentTransaction;
      updatedWallet = currentWallet;
      return;
    }

    const nextWallet: Wallet = {
      ...currentWallet,
      balance: currentWallet.balance + currentTransaction.amount,
      updatedAt: nowIso(),
    };

    const nextTransaction: Transaction = {
      ...currentTransaction,
      status: "SUCCESS",
      providerTransactionId,
      metadata: { ...currentTransaction.metadata, ...metadata },
      updatedAt: nowIso(),
    };

    tx.set(walletRef(currentTransaction.userId), nextWallet, { merge: true });
    tx.set(ref, stripUndefined(nextTransaction), { merge: true });

    updatedTransaction = nextTransaction;
    updatedWallet = nextWallet;
  });

  if (!updatedTransaction || !updatedWallet) {
    throw new Error("Failed to process payment");
  }

  return { transaction: updatedTransaction, wallet: updatedWallet };
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

  await ref.set(stripUndefined(updated), { merge: true });
  return updated;
}

export async function processDebit(
  userId: string,
  amount: number,
  provider = "internal",
  metadata: Record<string, any> = {}
): Promise<{ transaction: Transaction; wallet: Wallet }> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid debit amount");
  }

  let updatedTransaction: Transaction | null = null;
  let updatedWallet: Wallet | null = null;

  await adminFirestore.runTransaction(async (tx) => {
    const walletSnapshot = await tx.get(walletRef(userId));
    const currentWallet = buildWallet(
      userId,
      walletSnapshot.exists ? (walletSnapshot.data() as Partial<WalletRecord>) : undefined
    );

    if (currentWallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const now = nowIso();
    const transactionId = `txn_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const transactionDoc = transactionRef(transactionId);
    const nextWallet: Wallet = {
      ...currentWallet,
      balance: currentWallet.balance - amount,
      updatedAt: now,
    };
    const transaction: Transaction = {
      id: transactionDoc.id,
      userId,
      amount,
      currency: currentWallet.currency,
      provider,
      status: "SUCCESS",
      metadata,
      createdAt: now,
      updatedAt: now,
    };

    tx.set(walletRef(userId), nextWallet, { merge: true });
    tx.set(transactionDoc, stripUndefined(transaction));

    updatedTransaction = transaction;
    updatedWallet = nextWallet;
  });

  if (!updatedTransaction || !updatedWallet) {
    throw new Error("Failed to process debit");
  }

  return { transaction: updatedTransaction, wallet: updatedWallet };
}
