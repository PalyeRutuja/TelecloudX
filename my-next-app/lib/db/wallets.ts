import { adminFirestore } from "@/lib/firebase-admin";

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

const walletsCollection = () => adminFirestore.collection("wallets");

function walletRef(userId: string) {
  return walletsCollection().doc(userId);
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

export async function createWallet(userId: string): Promise<Wallet> {
  const wallet = buildWallet(userId);
  await walletRef(userId).set(wallet);
  return wallet;
}

export async function getWallet(userId: string): Promise<Wallet> {
  const ref = walletRef(userId);
  const snapshot = await ref.get();
  
  if (!snapshot.exists) {
    // Auto-create wallet if it doesn't exist
    return createWallet(userId);
  }
  
  return snapshot.data() as Wallet;
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await getWallet(userId);
  return wallet.balance;
}

export async function addCredits(userId: string, amount: number): Promise<Wallet> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid credit amount");
  }

  const ref = walletRef(userId);
  const snapshot = await ref.get();
  
  if (!snapshot.exists) {
    // Create wallet with initial balance
    const wallet = buildWallet(userId, { balance: amount });
    await ref.set(wallet);
    return wallet;
  }
  
  const current = snapshot.data() as Wallet;
  const nextWallet: Wallet = {
    ...current,
    balance: current.balance + amount,
    updatedAt: nowIso(),
  };
  
  await ref.set(nextWallet);
  return nextWallet;
}

export async function deductCredits(userId: string, amount: number): Promise<Wallet> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid debit amount");
  }

  const ref = walletRef(userId);
  const snapshot = await ref.get();
  
  if (!snapshot.exists) {
    throw new Error("Insufficient balance");
  }
  
  const current = snapshot.data() as Wallet;
  
  if (current.balance < amount) {
    throw new Error("Insufficient balance");
  }
  
  const nextWallet: Wallet = {
    ...current,
    balance: current.balance - amount,
    updatedAt: nowIso(),
  };
  
  await ref.set(nextWallet);
  return nextWallet;
}

// Atomic balance update using Firestore transaction
export async function atomicAddCredits(userId: string, amount: number): Promise<Wallet> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid credit amount");
  }

  const ref = walletRef(userId);
  
  return await adminFirestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    
    let current: Wallet;
    if (!snapshot.exists) {
      current = buildWallet(userId);
    } else {
      current = snapshot.data() as Wallet;
    }
    
    const nextWallet: Wallet = {
      ...current,
      balance: current.balance + amount,
      updatedAt: nowIso(),
    };
    
    transaction.set(ref, nextWallet);
    return nextWallet;
  });
}

export async function atomicDeductCredits(userId: string, amount: number): Promise<Wallet> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid debit amount");
  }

  const ref = walletRef(userId);
  
  return await adminFirestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    
    if (!snapshot.exists) {
      throw new Error("Insufficient balance");
    }
    
    const current = snapshot.data() as Wallet;
    
    if (current.balance < amount) {
      throw new Error("Insufficient balance");
    }
    
    const nextWallet: Wallet = {
      ...current,
      balance: current.balance - amount,
      updatedAt: nowIso(),
    };
    
    transaction.set(ref, nextWallet);
    return nextWallet;
  });
}

export async function updateWallet(userId: string, updates: Partial<Omit<Wallet, "userId">>): Promise<Wallet> {
  const ref = walletRef(userId);
  const snapshot = await ref.get();
  
  if (!snapshot.exists) {
    throw new Error("Wallet not found");
  }
  
  const current = snapshot.data() as Wallet;
  const updated: Wallet = {
    ...current,
    ...updates,
    updatedAt: nowIso(),
  };
  
  await ref.set(updated);
  return updated;
}
