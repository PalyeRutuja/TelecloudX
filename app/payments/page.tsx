"use client";

import { useState, useEffect } from "react";
import UpiPayment from "@/app/components/UpiPayment";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface WindowWithRazorpay extends Window {
  Razorpay?: any;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = document.getElementById("razorpay-script");
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function createOrder(amount: number, method?: string) {
  const res = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: { method: method || "all" },
    }),
  });
  return res.json();
}

async function verifyPayment(data: RazorpayResponse) {
  const res = await fetch("/api/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Webhook simulation APIs
async function simulateUPIPayment(upiId: string, simulateSuccess: boolean = true) {
  const res = await fetch("/api/payments/simulate/upi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      upiId,
      amount: 2499,
      simulateSuccess,
      delay: 2000, // Simulate 2 second delay for webhook
    }),
  });
  return res.json();
}

async function simulateBankPayment(bankCode: string, simulateSuccess: boolean = true) {
  const res = await fetch("/api/payments/simulate/bank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bankCode,
      amount: 2499,
      simulateSuccess,
      delay: 2000,
    }),
  });
  return res.json();
}

async function simulateWalletPayment(wallet: string, simulateSuccess: boolean = true) {
  const res = await fetch("/api/payments/simulate/wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet,
      amount: 2499,
      simulateSuccess,
      delay: 1500,
    }),
  });
  return res.json();
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [upiId, setUpiId] = useState("");
  const [webhookLogs, setWebhookLogs] = useState<string[]>([]);

  useEffect(() => {
    loadRazorpayScript().then(setScriptLoaded);
  }, []);

  const addWebhookLog = (message: string) => {
    setWebhookLogs(prev => [message, ...prev].slice(0, 10));
  };

  const openRazorpayCheckout = async (method: string, methodConfig?: any) => {
    if (!scriptLoaded) {
      setPaymentStatus({ type: "error", message: "Razorpay script loading..." });
      return;
    }

    setLoading(true);
    setSelectedMethod(method);
    setPaymentStatus(null);

    try {
      const orderData = await createOrder(29.99, method);
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "TelecloudX",
        description: `Cloud Server (Basic) - ${method.toUpperCase()}`,
        order_id: orderData.order.id,
        handler: async (response: RazorpayResponse) => {
          const verifyData = await verifyPayment(response);
          if (verifyData.success) {
            setPaymentStatus({
              type: "success",
              message: `Payment successful! ID: ${response.razorpay_payment_id}`,
            });
          } else {
            setPaymentStatus({
              type: "error",
              message: verifyData.error || "Payment verification failed",
            });
          }
          setLoading(false);
        },
        prefill: {
          name: "Test User",
          email: "test@telecloudx.com",
          contact: "9999999999",
        },
        notes: {
          address: "TelecloudX Headquarters",
        },
        theme: {
          color: "#2563eb",
        },
        ...(methodConfig || {}),
      };

      const razorpay = new (window as WindowWithRazorpay).Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        setPaymentStatus({
          type: "error",
          message: response.error.description || "Payment failed",
        });
        setLoading(false);
      });
      razorpay.open();
    } catch (error: any) {
      setPaymentStatus({
        type: "error",
        message: error.message || "Something went wrong",
      });
      setLoading(false);
    }
  };

  // UPI via Webhook Simulation
  const payWithUPI = async (simulateSuccess: boolean = true) => {
    setLoading(true);
    setSelectedMethod("upi");
    setPaymentStatus(null);

    try {
      const result = await simulateUPIPayment(upiId, simulateSuccess);
      if (result.success) {
        setPaymentStatus({
          type: "success",
          message: `UPI Payment simulated! ID: ${result.payment.id}`,
        });
        addWebhookLog(`✅ UPI Webhook received: ${result.payment.id}`);
      } else {
        setPaymentStatus({
          type: "error",
          message: result.message || "UPI simulation failed",
        });
        addWebhookLog(`❌ UPI Webhook failed: ${result.payment?.id || 'unknown'}`);
      }
    } catch (error: any) {
      setPaymentStatus({
        type: "error",
        message: error.message || "UPI simulation failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // Bank Transfer via Webhook Simulation
  const payWithBank = async (bankCode: string, simulateSuccess: boolean = true) => {
    setLoading(true);
    setSelectedMethod(`bank-${bankCode}`);
    setPaymentStatus(null);

    try {
      const result = await simulateBankPayment(bankCode, simulateSuccess);
      if (result.success) {
        setPaymentStatus({
          type: "success",
          message: `Bank Transfer simulated! ID: ${result.payment.id}`,
        });
        addWebhookLog(`✅ Bank Webhook received: ${result.payment.id}`);
      } else {
        setPaymentStatus({
          type: "error",
          message: result.message || "Bank simulation failed",
        });
        addWebhookLog(`❌ Bank Webhook failed: ${result.payment?.id || 'unknown'}`);
      }
    } catch (error: any) {
      setPaymentStatus({
        type: "error",
        message: error.message || "Bank simulation failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // Wallet via Webhook Simulation
  const payWithWallet = async (wallet: string, simulateSuccess: boolean = true) => {
    setLoading(true);
    setSelectedMethod(wallet);
    setPaymentStatus(null);

    try {
      const result = await simulateWalletPayment(wallet, simulateSuccess);
      if (result.success) {
        setPaymentStatus({
          type: "success",
          message: `${wallet} Payment simulated! ID: ${result.payment.id}`,
        });
        addWebhookLog(`✅ Wallet Webhook received: ${result.payment.id}`);
      } else {
        setPaymentStatus({
          type: "error",
          message: result.message || "Wallet simulation failed",
        });
        addWebhookLog(`❌ Wallet Webhook failed: ${result.payment?.id || 'unknown'}`);
      }
    } catch (error: any) {
      setPaymentStatus({
        type: "error",
        message: error.message || "Wallet simulation failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // PhonePe (uses wallet simulation)
  const payWithPhonePe = () => payWithWallet("phonepe");

  // Card (uses actual Razorpay checkout)
  const payWithCard = () => {
    openRazorpayCheckout("card", { method: "card" });
  };

  const banks = [
    { code: "HDFC", name: "HDFC Bank" },
    { code: "ICIC", name: "ICICI Bank" },
    { code: "SBI", name: "State Bank of India" },
    { code: "AXIS", name: "Axis Bank" },
    { code: "KKBK", name: "Kotak Mahindra Bank" },
  ];

  const wallets = [
    { code: "paytm", name: "Paytm" },
    { code: "phonepe", name: "PhonePe" },
    { code: "olamoney", name: "Ola Money" },
    { code: "freecharge", name: "Freecharge" },
    { code: "mobikwik", name: "MobiKwik" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold text-center text-black dark:text-white mb-4">
          Payment Gateways
        </h1>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 text-lg">
          Test page for TelecloudX payment integrations (Webhook Simulation Mode)
        </p>

        {paymentStatus && (
          <div
            className={`mb-8 p-4 rounded-xl text-center font-medium ${
              paymentStatus.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {paymentStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UPI QR Code Payment */}
            <div className="md:col-span-2">
              <UpiPayment
                amount={2499}
                description="Cloud Server (Basic) - 1 Month"
                onPaymentComplete={(paymentId) => {
                  console.log("Payment completed:", paymentId);
                  addWebhookLog(`✅ UPI Payment completed: ${paymentId}`);
                }}
              />
            </div>

            {/* UPI via Webhook Simulation */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl font-bold text-blue-600">
                  UPI
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    UPI Payment
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Webhook Simulation
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter UPI ID e.g. user@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => payWithUPI(true)}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors"
                  >
                    {loading && selectedMethod === "upi"
                      ? "Processing..."
                      : "Simulate Success"}
                  </button>
                  <button
                    onClick={() => payWithUPI(false)}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium transition-colors"
                  >
                    Simulate Failure
                  </button>
                </div>
              </div>
            </div>

            {/* PhonePe via Webhook */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                  📱
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    PhonePe
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Webhook Simulation
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => payWithWallet("phonepe", true)}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium transition-colors"
                >
                  {loading && selectedMethod === "phonepe"
                    ? "Processing..."
                    : "Simulate Success"}
                </button>
                <button
                  onClick={() => payWithWallet("phonepe", false)}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium transition-colors"
                >
                  Simulate Failure
                </button>
              </div>
            </div>

            {/* Cards - Real Razorpay */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">
                  💳
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    Credit/Debit Card
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Live Razorpay Checkout
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={payWithCard}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium transition-colors"
                >
                  {loading && selectedMethod === "card"
                    ? "Processing..."
                    : "Pay with Card"}
                </button>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  Test: 4386 2894 0766 0153 | Any CVV | Any future date
                </p>
              </div>
            </div>

            {/* Net Banking - Webhook Simulation */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                  🏦
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    Net Banking
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Webhook Simulation
                  </p>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {banks.map((bank) => (
                  <div key={bank.code} className="flex gap-2">
                    <button
                      onClick={() => payWithBank(bank.code, true)}
                      disabled={loading}
                      className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-black dark:text-white text-sm font-medium transition-colors text-left"
                    >
                      {bank.name}
                    </button>
                    <button
                      onClick={() => payWithBank(bank.code, false)}
                      disabled={loading}
                      className="px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium transition-colors"
                    >
                      Fail
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallets - Webhook Simulation */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl">
                  👛
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    Wallets
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Webhook Simulation
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {wallets.map((wallet) => (
                  <div key={wallet.code} className="flex gap-2">
                    <button
                      onClick={() => payWithWallet(wallet.code, true)}
                      disabled={loading}
                      className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-black dark:text-white text-sm font-medium transition-colors"
                    >
                      {wallet.name}
                    </button>
                    <button
                      onClick={() => payWithWallet(wallet.code, false)}
                      disabled={loading}
                      className="px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium transition-colors"
                    >
                      Fail
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Crypto - Coming Soon */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow opacity-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">
                  ₿
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    Crypto
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Logs Panel */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Webhook Logs
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {webhookLogs.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                  No webhooks received yet. Click any simulate button to trigger.
                </p>
              ) : (
                webhookLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm font-mono ${
                      log.includes("❌")
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Payment Summary
          </h3>
          <div className="flex justify-between items-center py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-600 dark:text-zinc-400">
              Selected Service
            </span>
            <span className="font-medium text-black dark:text-white">
              Cloud Server (Basic)
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-600 dark:text-zinc-400">Duration</span>
            <span className="font-medium text-black dark:text-white">
              1 Month
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-lg font-semibold text-black dark:text-white">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-black dark:text-white">
              ₹2,499
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
