/**
 * bot/lib/payments.js
 */

const { apiRequest } = require("./session");

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI", description: "Pay via UPI app", icon: "📱" },
  { id: "razorpay", name: "Razorpay", description: "Cards, UPI, Netbanking", icon: "💳" },
  { id: "stripe", name: "Stripe", description: "International cards", icon: "🌍" },
];

async function createTransaction(chatId, amount, provider) {
  return apiRequest("POST", "/api/wallet/topup", chatId, { amount, currency: "USD", provider });
}

function generateUPIUrl(amount) {
  return `upi://pay?pa=telecloudx@okaxis&pn=${encodeURIComponent("TelecloudX")}&am=${amount}&cu=INR&tn=Add+Credits`;
}

async function createRazorpayOrder(chatId, amount, receipt) {
  return apiRequest("POST", "/api/payments/razorpay/create-order", chatId, { amount, currency: "USD", receipt });
}

async function createStripeSession(chatId, amount, transactionId) {
  return apiRequest("POST", "/api/payments/stripe/create-session", chatId, { amount, currency: "USD", transactionId });
}

async function verifyWalletTopup(chatId, transactionId, status, providerTransactionId, metadata) {
  return apiRequest("POST", "/api/wallet/verify", chatId, { transactionId, status, providerTransactionId, metadata });
}

async function simulateUPIPayment(chatId, upiId, amount) {
  return apiRequest("POST", "/api/payments/simulate/upi", chatId, { upiId, amount, simulateSuccess: true, delay: 0 });
}

module.exports = {
  PRESET_AMOUNTS,
  PAYMENT_METHODS,
  createTransaction,
  generateUPIUrl,
  createRazorpayOrder,
  createStripeSession,
  verifyWalletTopup,
  simulateUPIPayment,
};
