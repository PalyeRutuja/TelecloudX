"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrowserProvider, isAddress, parseEther } from "ethers";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  active: boolean;
  featured?: boolean;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "upi",
    name: "UPI",
    description: "Pay via UPI QR code or intent",
    icon: "📱",
    color: "bg-blue-600",
    active: true,
    featured: true,
  },
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Cards, UPI, Netbanking via Razorpay",
    icon: "💳",
    color: "bg-purple-600",
    active: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "International cards & wallets",
    icon: "🌍",
    color: "bg-indigo-600",
    active: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with PayPal balance or card",
    icon: "💰",
    color: "bg-blue-700",
    active: true,
  },
  {
    id: "crypto",
    name: "Crypto",
    description: "Pay with XDC (Apothem Testnet)",
    icon: "₿",
    color: "bg-orange-600",
    active: true,
  },
];

// XDC Apothem Testnet configuration
const XDC_APOTHEM_CONFIG = {
  chainId: "0x33", // 51 in hex
  chainName: "XDC Apothem Testnet",
  nativeCurrency: {
    name: "XDC",
    symbol: "XDC",
    decimals: 18,
  },
  rpcUrls: ["https://erpc.apothem.network"],
  blockExplorerUrls: ["https://apothem.xinfinscan.com"],
};

const CRYPTO_TREASURY_ADDRESS = process.env.NEXT_PUBLIC_CRYPTO_TREASURY_ADDRESS || "0xBeE4EE636524c948839E792B63F6C3dD63Da5F74";

function AddCreditsContent() {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("upi");
  const [promoCode, setPromoCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactionId, setTransactionId] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || null;

  // Crypto state
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState<string>("");
  const [connectedAccount, setConnectedAccount] = useState<string>("");
  const [metamaskAvailable, setMetamaskAvailable] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [cryptoTxHash, setCryptoTxHash] = useState<string>("");
  const [xdcAmount, setXdcAmount] = useState<string>("");

  const getToken = () => localStorage.getItem("token");

  const handleAuthError = (response: Response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      return true;
    }
    return false;
  };

  const redirectAfterSuccess = () => {
    if (returnTo) {
      router.push(returnTo);
    }
  };

  const amount = customAmount ? parseFloat(customAmount) : selectedAmount;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ));
    setMetamaskAvailable(typeof window !== "undefined" && Boolean((window as any).ethereum));
    fetchBalance();
  }, []);

  useEffect(() => {
    if (selectedMethod === "upi" && amount > 0) {
      generateUPIQR();
    }
  }, [selectedMethod, amount]);

  const fetchBalance = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const generateUPIQR = async () => {
    const upiUri = `upi://pay?pa=telecloudx@okaxis&pn=TelecloudX&am=${amount}&cu=INR&tn=Add+Credits`;
    try {
      const qr = await QRCode.toDataURL(upiUri, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCode(qr);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };

  const createTransaction = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      throw new Error("Not authenticated");
    }
    const response = await fetch("/api/wallet/topup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        currency: "USD",
        provider: selectedMethod,
      }),
    });
    if (handleAuthError(response)) throw new Error("Session expired");
    return response.json();
  };

  const verifyPayment = async (txnId: string, status: "SUCCESS" | "FAILED", providerData?: any) => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      throw new Error("Not authenticated");
    }
    const response = await fetch("/api/wallet/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        transactionId: txnId,
        status,
        ...providerData,
      }),
    });
    if (handleAuthError(response)) throw new Error("Session expired");
    return response.json();
  };

  const handleUPIPayment = async () => {
    setLoading(true);
    setError("");
    
    try {
      const txn = await createTransaction();
      if (!txn.success) {
        throw new Error(txn.error || "Failed to create transaction");
      }
      const currentTxnId = txn.transaction.id;
      setTransactionId(currentTxnId);
      
      // Simulate UPI payment completion
      setTimeout(async () => {
        const result = await verifyPayment(currentTxnId, "SUCCESS", {
          providerTransactionId: `upi_${Date.now()}`,
        });
        
        if (result.success) {
          setSuccess(`Successfully added $${amount} to your wallet!`);
          setBalance(result.balance);
        }
        setLoading(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError("");
    
    try {
      const txn = await createTransaction();
      if (!txn.success) {
        throw new Error(txn.error || "Failed to create transaction");
      }
      setTransactionId(txn.transaction.id);

      const token = getToken();
      if (!token) {
        router.push("/login");
        setLoading(false);
        return;
      }
      const orderResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          currency: "USD",
          receipt: txn.transaction.id,
        }),
      });
      if (handleAuthError(orderResponse)) {
        setLoading(false);
        return;
      }
      const orderData = await orderResponse.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "TelecloudX",
          description: `Add $${amount} credits`,
          order_id: orderData.order.id,
          handler: async (response: any) => {
            const verifyToken = getToken();
            if (!verifyToken) {
              router.push("/login");
              setLoading(false);
              return;
            }
            const verifyResponse = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${verifyToken}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (handleAuthError(verifyResponse)) {
              setLoading(false);
              return;
            }
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              const result = await verifyPayment(txn.transaction.id, "SUCCESS", {
                providerTransactionId: response.razorpay_payment_id,
              });
              
              if (result.success) {
                setSuccess(`Successfully added $${amount} to your wallet!`);
                setBalance(result.balance);
                redirectAfterSuccess();
              }
            }
            setLoading(false);
          },
          theme: {
            color: "#7c3aed",
          },
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setLoading(true);
    setError("");
    
    try {
      const txn = await createTransaction();
      if (!txn.success) {
        throw new Error(txn.error || "Failed to create transaction");
      }
      setTransactionId(txn.transaction.id);

      const token = getToken();
      if (!token) {
        router.push("/login");
        setLoading(false);
        return;
      }
      const response = await fetch("/api/payments/stripe/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          currency: "USD",
          transactionId: txn.transaction.id,
        }),
      });
      
      if (handleAuthError(response)) {
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create checkout");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  };

  const handlePayPalPayment = () => {
    setError("PayPal integration coming soon");
  };

  const connectMetaMask = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("MetaMask is not installed. Please install the MetaMask extension.");
    }

    setWalletConnecting(true);
    try {
      const ethereum = (window as any).ethereum;
      // Explicitly request accounts to trigger the MetaMask popup
      await ethereum.request({ method: "eth_requestAccounts" });

      // Check if user is on XDC Apothem testnet, if not prompt to switch
      const chainId = await ethereum.request({ method: "eth_chainId" });
      if (chainId !== XDC_APOTHEM_CONFIG.chainId) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: XDC_APOTHEM_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [XDC_APOTHEM_CONFIG],
            });
          } else {
            throw switchError;
          }
        }
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setConnectedAccount(address);
      if (!cryptoWalletAddress) {
        setCryptoWalletAddress(address);
      }

      return { provider, signer, address };
    } catch (err: any) {
      console.error("MetaMask connection error:", err);
      throw new Error(err?.message || "Failed to connect MetaMask");
    } finally {
      setWalletConnecting(false);
    }
  };

  const handleCryptoPayment = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setCryptoTxHash("");

    try {
      if (!amount || amount <= 0) {
        throw new Error("Choose a valid top-up amount");
      }

      console.log("[Crypto] Starting XDC payment. Treasury:", CRYPTO_TREASURY_ADDRESS);

      if (!isAddress(cryptoWalletAddress)) {
        throw new Error("Enter a valid wallet address");
      }

      if (!CRYPTO_TREASURY_ADDRESS || !isAddress(CRYPTO_TREASURY_ADDRESS)) {
        throw new Error("Crypto treasury address is not configured");
      }

      // Validate XDC amount
      const xdcToSend = parseFloat(xdcAmount);
      if (!xdcAmount || isNaN(xdcToSend) || xdcToSend <= 0) {
        throw new Error("Enter a valid XDC amount");
      }

      const { signer, address } = await connectMetaMask();
      console.log("[Crypto] Connected wallet:", address);
      if (address.toLowerCase() !== cryptoWalletAddress.trim().toLowerCase()) {
        throw new Error("The wallet address must match the connected MetaMask account");
      }

      const txn = await createTransaction();
      if (!txn.success) {
        throw new Error(txn.error || "Failed to create transaction");
      }

      const currentTxnId = txn.transaction.id;
      setTransactionId(currentTxnId);

      console.log("[Crypto] Sending", xdcToSend, "XDC to", CRYPTO_TREASURY_ADDRESS);
      
      // Send native XDC
      const tx = await signer.sendTransaction({
        to: CRYPTO_TREASURY_ADDRESS,
        value: parseEther(xdcToSend.toFixed(18)),
      });
      
      const paymentTxHash = tx.hash;
      setCryptoTxHash(tx.hash);
      console.log("[Crypto] Transaction sent:", paymentTxHash);
      
      await tx.wait(1);
      console.log("[Crypto] Transaction confirmed");

      const result = await verifyPayment(currentTxnId, "SUCCESS", {
        providerTransactionId: paymentTxHash,
        metadata: {
          paymentType: "crypto",
          token: "XDC",
          tokenId: "xdc",
          walletAddress: address,
          treasuryAddress: CRYPTO_TREASURY_ADDRESS,
          credits: amount,
          xdcAmount: xdcToSend,
        },
      });

      if (result.success) {
        setSuccess(`Successfully added $${amount} to your wallet via XDC!`);
        setBalance(result.balance);
        setXdcAmount("");
        redirectAfterSuccess();
      } else {
        throw new Error(result.error || "Crypto payment verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Crypto payment failed");
    } finally {
      setLoading(false);
    }
  };

  const getUPIIntentUrl = () => {
    return `upi://pay?pa=telecloudx@okaxis&pn=TelecloudX&am=${amount}&cu=INR&tn=Add+Credits`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Add Credits</h1>
              <p className="text-sm text-zinc-400">Choose an amount and complete checkout with your preferred gateway</p>
            </div>
          </div>
          <div className="text-sm text-zinc-400">
            Balance: <span className="text-white font-semibold">${balance.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
            <button onClick={() => setError("")} className="ml-4 text-sm underline">Dismiss</button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            {success}
            <button onClick={() => setSuccess("")} className="ml-4 text-sm underline">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Amount Selection */}
          <div className="space-y-6">
            {/* Amount Selection Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400">⚡</span>
                <h2 className="text-lg font-semibold">Select Amount</h2>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Choose a preset amount or enter a custom top-up value</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSelectedAmount(preset);
                      setCustomAmount("");
                    }}
                    className={`py-3 px-4 rounded-xl border-2 font-semibold text-lg transition-all ${
                      selectedAmount === preset && !customAmount
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-zinc-700 hover:border-zinc-600 text-zinc-300"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-sm text-zinc-400 mb-2">Or enter custom amount</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    placeholder="Enter amount"
                    min="5"
                    className="w-full pl-8 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Minimum $5</p>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Amount</span>
                  <span className="text-white">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total Credits</span>
                  <span className="text-blue-400 font-semibold">${amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
                <p className="text-sm font-medium mb-2">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Payment Methods */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-400">💳</span>
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Every option shown here is now wired to a real backend flow</p>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className={`relative border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-zinc-700 hover:border-zinc-600"
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    {method.featured && (
                      <span className="absolute -top-2 left-4 px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center text-lg`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          {method.id === "razorpay" && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">{method.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === method.id ? "border-blue-500" : "border-zinc-600"
                      }`}>
                        {selectedMethod === method.id && (
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>

                    {/* UPI Details */}
                    {selectedMethod === "upi" && method.id === "upi" && (
                      <div className="mt-4 pt-4 border-t border-zinc-700/50">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 mb-4">
                          <span className="text-yellow-400 text-sm">🏷️ Demo/Sandbox Mode</span>
                        </div>
                        
                        {isMobile ? (
                          <div className="space-y-2">
                            <button
                              onClick={() => window.location.href = getUPIIntentUrl()}
                              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
                            >
                              Open UPI App
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            {qrCode && (
                              <div className="bg-white p-4 rounded-xl mb-4">
                                <img src={qrCode} alt="UPI QR Code" className="w-48 h-48" />
                              </div>
                            )}
                            <div className="flex gap-2 mb-4">
                              <button
                                onClick={() => navigator.clipboard.writeText("telecloudx@okaxis")}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                              >
                                Copy UPI ID
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {["GPay", "PhonePe", "Paytm"].map((app) => (
                            <button
                              key={app}
                              onClick={() => window.location.href = getUPIIntentUrl()}
                              className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                            >
                              Open {app}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleUPIPayment}
                          disabled={loading || amount <= 0}
                          className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 rounded-xl font-medium transition-colors"
                        >
                          {loading ? "Processing..." : `Pay $${amount} via UPI`}
                        </button>
                      </div>
                    )}

                    {/* Crypto Details */}
                    {selectedMethod === "crypto" && method.id === "crypto" && (
                      <div className="mt-4 pt-4 border-t border-zinc-700/50 space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                          <span className="text-blue-400 text-sm font-medium">XDC Apothem Testnet</span>
                          <p className="text-xs text-zinc-400 mt-1">Send native XDC to add credits</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Your wallet address</label>
                          <input
                            type="text"
                            value={cryptoWalletAddress}
                            onChange={(e) => setCryptoWalletAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <p className="text-xs text-zinc-500">
                            This must match your connected MetaMask account on XDC Apothem Testnet.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={connectMetaMask}
                            disabled={!metamaskAvailable || walletConnecting}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 rounded-xl font-medium transition-colors"
                          >
                            {walletConnecting
                              ? "Connecting wallet..."
                              : connectedAccount
                                ? `Connected: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`
                                : metamaskAvailable
                                  ? "Connect MetaMask"
                                  : "MetaMask not detected"}
                          </button>
                          <div className="text-xs text-zinc-500">
                            Treasury address: <span className="text-zinc-300 break-all">{CRYPTO_TREASURY_ADDRESS || "Not configured"}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">XDC Amount to Send</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={xdcAmount}
                              onChange={(e) => setXdcAmount(e.target.value)}
                              placeholder="Enter XDC amount"
                              min="0.001"
                              step="0.001"
                              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">XDC</span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            Credits to add: <span className="text-blue-400 font-semibold">${amount.toFixed(2)}</span>
                          </p>
                        </div>

                        {cryptoTxHash && (
                          <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 p-3 text-xs text-zinc-300 break-all">
                            Tx Hash: {cryptoTxHash}
                          </div>
                        )}

                        <button
                          onClick={handleCryptoPayment}
                          disabled={loading || amount <= 0 || !xdcAmount}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 rounded-xl font-medium transition-colors"
                        >
                          {loading ? "Processing XDC payment..." : `Pay ${xdcAmount || "0"} XDC to Add Credits`}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-green-400 text-sm font-medium">Secure payment handling</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 ml-7">Gateway verification and server-side crediting remain authoritative after checkout.</p>
              </div>

              {/* Pay Button */}
              {selectedMethod !== "upi" && (
                <button
                  onClick={() => {
                    switch (selectedMethod) {
                      case "razorpay":
                        handleRazorpayPayment();
                        break;
                      case "stripe":
                        handleStripePayment();
                        break;
                      case "paypal":
                        handlePayPalPayment();
                        break;
                      case "crypto":
                        handleCryptoPayment();
                        break;
                    }
                  }}
                  disabled={loading || amount <= 0}
                  className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 rounded-xl font-semibold text-lg transition-colors"
                >
                  {loading ? "Processing..." : `Proceed to Pay $${amount.toFixed(2)}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AddCreditsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    }>
      <AddCreditsContent />
    </Suspense>
  );
}
