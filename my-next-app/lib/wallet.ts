// Re-export from Firestore-based modules for backward compatibility
export type { Wallet } from "./db/wallets";
export type { Transaction } from "./db/transactions";

export {
  createWallet,
  getWallet,
  getBalance,
  addCredits,
  deductCredits,
  atomicAddCredits,
  atomicDeductCredits,
  updateWallet,
} from "./db/wallets";

export {
  createTransaction,
  getTransaction,
  updateTransaction,
  getUserTransactions,
  getUserTransactionsByStatus,
  getPendingTransactions,
  getSuccessfulTransactions,
  processSuccessfulPayment,
  processFailedPayment,
  processDebit,
} from "./db/transactions";
