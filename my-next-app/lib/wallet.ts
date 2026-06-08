import crypto from "crypto";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const WALLETS_FILE = path.join(DATA_DIR, "wallets.json");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "transactions.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readWallets(): Map<string, Wallet> {
  ensureDataDir();
  if (!fs.existsSync(WALLETS_FILE)) {
    return new Map();
  }
  try {
    const data = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf-8"));
    return new Map(data.map((w: Wallet) => [w.userId, w]));
  } catch {
    return new Map();
  }
}

function writeWallets(wallets: Map<string, Wallet>) {
  ensureDataDir();
  fs.writeFileSync(WALLETS_FILE, JSON.stringify(Array.from(wallets.values()), null, 2));
}

function readTransactions(): Map<string, Transaction> {
  ensureDataDir();
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    return new Map();
  }
  try {
    const data = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, "utf-8"));
    return new Map(data.map((t: Transaction) => [t.id, t]));
  } catch {
    return new Map();
  }
}

function writeTransactions(transactions: Map<string, Transaction>) {
  ensureDataDir();
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(Array.from(transactions.values()), null, 2));
}

interface Wallet {
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

let walletsCache: Map<string, Wallet> | null = null;
let transactionsCache: Map<string, Transaction> | null = null;

function getWallets(): Map<string, Wallet> {
  if (!walletsCache) {
    walletsCache = readWallets();
  }
  return walletsCache;
}

function getTransactions(): Map<string, Transaction> {
  if (!transactionsCache) {
    transactionsCache = readTransactions();
  }
  return transactionsCache;
}

function saveWallets() {
  if (walletsCache) {
    writeWallets(walletsCache);
  }
}

function saveTransactions() {
  if (transactionsCache) {
    writeTransactions(transactionsCache);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function buildWallet(userId: string, data?: Partial<Wallet>): Wallet {
  const now = nowIso();
  return {
    userId,
    balance: 0,
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    ...data,
  };
}

function buildTransaction(id: string, data: Omit<Transaction, "id">): Transaction {
  return {
    id,
    ...data,
  };
}

export async function getWallet(userId: string): Promise<Wallet> {
  const wallets = getWallets();
  if (!wallets.has(userId)) {
    const wallet = buildWallet(userId);
    wallets.set(userId, wallet);
    saveWallets();
  }
  return wallets.get(userId)!;
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await getWallet(userId);
  return wallet.balance;
}

export async function addCredits(userId: string, amount: number): Promise<Wallet> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid credit amount");
  }

  const wallets = getWallets();
  const current = await getWallet(userId);
  const nextWallet: Wallet = {
    ...current,
    balance: current.balance + amount,
    updatedAt: nowIso(),
  };
  wallets.set(userId, nextWallet);
  saveWallets();

  return nextWallet;
}

export async function deductCredits(userId: string, amount: number): Promise<Wallet> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid debit amount");
  }

  const wallets = getWallets();
  const current = await getWallet(userId);

  if (current.balance < amount) {
    throw new Error("Insufficient balance");
  }

  const nextWallet: Wallet = {
    ...current,
    balance: current.balance - amount,
    updatedAt: nowIso(),
  };
  wallets.set(userId, nextWallet);
  saveWallets();

  return nextWallet;
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
): Promise<Transaction> {
  const transactions = getTransactions();
  const id = `txn_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const now = nowIso();
  const transaction = buildTransaction(id, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  transactions.set(id, transaction);
  saveTransactions();
  return transaction;
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>
): Promise<Transaction | null> {
  const transactions = getTransactions();
  const transaction = transactions.get(transactionId);
  if (!transaction) return null;

  const updated: Transaction = {
    ...transaction,
    ...updates,
    updatedAt: nowIso(),
  };
  transactions.set(transactionId, updated);
  saveTransactions();
  return updated;
}

export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  return getTransactions().get(transactionId) || null;
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  return Array.from(getTransactions().values())
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function processSuccessfulPayment(
  transactionId: string,
  providerTransactionId?: string,
  metadata?: Record<string, any>
): Promise<{ transaction: Transaction; wallet: Wallet }> {
  const transaction = await getTransaction(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status === "SUCCESS") {
    const wallet = await getWallet(transaction.userId);
    return { transaction, wallet };
  }

  const updated = await updateTransaction(transactionId, {
    status: "SUCCESS",
    providerTransactionId,
    metadata: { ...transaction.metadata, ...metadata },
  });

  if (!updated) {
    throw new Error("Failed to update transaction");
  }

  const wallet = await addCredits(transaction.userId, transaction.amount);

  return { transaction: updated, wallet };
}

export async function processFailedPayment(
  transactionId: string,
  reason?: string
): Promise<Transaction> {
  const transaction = await getTransaction(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const updated = await updateTransaction(transactionId, {
    status: "FAILED",
    metadata: { ...transaction.metadata, failureReason: reason },
  });

  if (!updated) {
    throw new Error("Failed to update transaction");
  }

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

  const wallet = await deductCredits(userId, amount);
  const transaction = await createTransaction({
    userId,
    amount,
    currency: wallet.currency,
    provider,
    status: "SUCCESS",
    metadata,
  });

  return { transaction, wallet };
}
