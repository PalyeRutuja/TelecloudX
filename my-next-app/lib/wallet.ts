import crypto from "crypto";

// In-memory store (replace with PostgreSQL in production)
interface Wallet {
  userId: string;
  balance: number;
  currency: string;
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

const wallets = new Map<string, Wallet>();
const transactions = new Map<string, Transaction>();

export function getWallet(userId: string): Wallet {
  if (!wallets.has(userId)) {
    wallets.set(userId, {
      userId,
      balance: 0,
      currency: "USD",
    });
  }
  return wallets.get(userId)!;
}

export function getBalance(userId: string): number {
  return getWallet(userId).balance;
}

export function addCredits(userId: string, amount: number): Wallet {
  const wallet = getWallet(userId);
  wallet.balance += amount;
  return wallet;
}

export function createTransaction(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Transaction {
  const transaction: Transaction = {
    ...data,
    id: `txn_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  transactions.set(transaction.id, transaction);
  return transaction;
}

export function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>
): Transaction | null {
  const transaction = transactions.get(transactionId);
  if (!transaction) return null;
  
  const updated = {
    ...transaction,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  transactions.set(transactionId, updated);
  return updated;
}

export function getTransaction(transactionId: string): Transaction | null {
  return transactions.get(transactionId) || null;
}

export function getUserTransactions(userId: string): Transaction[] {
  return Array.from(transactions.values())
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function processSuccessfulPayment(
  transactionId: string,
  providerTransactionId?: string,
  metadata?: Record<string, any>
): Promise<{ transaction: Transaction; wallet: Wallet }> {
  const transaction = getTransaction(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }
  
  if (transaction.status === "SUCCESS") {
    throw new Error("Transaction already processed");
  }
  
  const updated = updateTransaction(transactionId, {
    status: "SUCCESS",
    providerTransactionId,
    metadata: { ...transaction.metadata, ...metadata },
  });
  
  if (!updated) {
    throw new Error("Failed to update transaction");
  }
  
  const wallet = addCredits(transaction.userId, transaction.amount);
  
  return { transaction: updated, wallet };
}

export async function processFailedPayment(
  transactionId: string,
  reason?: string
): Promise<Transaction> {
  const transaction = getTransaction(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }
  
  const updated = updateTransaction(transactionId, {
    status: "FAILED",
    metadata: { ...transaction.metadata, failureReason: reason },
  });
  
  if (!updated) {
    throw new Error("Failed to update transaction");
  }
  
  return updated;
}
