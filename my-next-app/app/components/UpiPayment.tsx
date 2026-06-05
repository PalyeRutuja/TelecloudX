"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";

interface UpiPaymentProps {
  amount?: number;
  description?: string;
  onPaymentComplete?: (paymentId: string) => void;
}

interface PaymentDetails {
  vpa: string;
  name: string;
  amount: number;
  currency: string;
  transactionNote: string;
}

function generateUPILink(details: PaymentDetails): string {
  // Build UPI URI manually to ensure proper formatting without spaces
  const encodedPA = encodeURIComponent(details.vpa);
  const encodedPN = encodeURIComponent(details.name);
  const encodedAM = encodeURIComponent(details.amount.toFixed(2));
  const encodedCU = encodeURIComponent(details.currency);
  const encodedTN = encodeURIComponent(details.transactionNote);
  
  return `upi://pay?pa=${encodedPA}&pn=${encodedPN}&am=${encodedAM}&cu=${encodedCU}&tn=${encodedTN}&mode=02&orgid=000000`;
}

function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export default function UpiPayment({
  amount = 2499,
  description = "Cloud Server (Basic) - 1 Month",
  onPaymentComplete,
}: UpiPaymentProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [paymentId, setPaymentId] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const paymentDetails: PaymentDetails = {
    vpa: "telecloudx@okaxis",
    name: "TelecloudX",
    amount,
    currency: "INR",
    transactionNote: description,
  };

  const upiLink = generateUPILink(paymentDetails);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    // Generate QR Code
    QRCode.toDataURL(upiLink, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation failed:", err);
      });
  }, [upiLink]);

  const openUPIApp = useCallback(() => {
    window.location.href = upiLink;
  }, [upiLink]);

  const simulatePaymentSuccess = async () => {
    setPaymentStatus("pending");
    setShowConfirmation(false);

    // Simulate webhook delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const simulatedPaymentId = `upi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setPaymentId(simulatedPaymentId);
    setPaymentStatus("success");

    // Log webhook simulation
    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: simulatedPaymentId,
            order_id: `order_${Date.now()}`,
            amount: amount * 100,
            currency: "INR",
            status: "captured",
            method: "upi",
            upi: {
              vpa: paymentDetails.vpa,
              payer_vpa: "customer@upi",
            },
            description: paymentDetails.transactionNote,
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
    };

    console.log("UPI Webhook received:", webhookPayload);

    if (onPaymentComplete) {
      onPaymentComplete(simulatedPaymentId);
    }
  };

  const simulatePaymentFailure = async () => {
    setPaymentStatus("pending");
    setShowConfirmation(false);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setPaymentStatus("failed");

    const webhookPayload = {
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `upi_${Date.now()}`,
            amount: amount * 100,
            currency: "INR",
            status: "failed",
            method: "upi",
            error_description: "Payment declined by user or bank",
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
    };

    console.log("UPI Failed Webhook:", webhookPayload);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl font-bold text-blue-600">
          UPI
        </div>
        <div>
          <h2 className="text-xl font-semibold text-black dark:text-white">
            UPI Payment
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Scan QR or open UPI app
          </p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Pay to</span>
          <span className="font-medium text-black dark:text-white">{paymentDetails.name}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">UPI ID</span>
          <span className="font-medium text-black dark:text-white font-mono text-sm">{paymentDetails.vpa}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Description</span>
          <span className="font-medium text-black dark:text-white text-sm">{paymentDetails.transactionNote}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <span className="text-lg font-semibold text-black dark:text-white">Amount</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{amount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* QR Code or Mobile Button */}
      {isMobile ? (
        <div className="space-y-4">
          <button
            onClick={openUPIApp}
            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Pay with UPI App (GPay, PhonePe, Paytm)
          </button>
          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
            Opens your default UPI app with payment details prefilled
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          {qrCodeDataUrl ? (
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <img
                src={qrCodeDataUrl}
                alt="UPI QR Code"
                className="w-64 h-64"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
              <span className="text-zinc-400">Generating QR Code...</span>
            </div>
          )}
          <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
            Scan with any UPI app (Google Pay, PhonePe, Paytm, WhatsApp Pay)
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {["Google Pay", "PhonePe", "Paytm", "WhatsApp Pay"].map((app) => (
              <span
                key={app}
                className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
              >
                {app}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Payment Status */}
      {paymentStatus === "success" && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-400">
                Payment Successful!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                Payment ID: {paymentId}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                ₹{amount.toLocaleString("en-IN")} has been credited to your
                TelecloudX balance
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === "failed" && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-400">
                Payment Failed
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                The payment was not completed. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === "pending" && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center animate-spin">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-400">
                Processing Payment...
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Please wait while we verify your payment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Buttons */}
      {paymentStatus === "idle" && (
        <div className="mt-6 space-y-3">
          {!showConfirmation ? (
            <button
              onClick={() => setShowConfirmation(true)}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              I&apos;ve completed the payment
            </button>
          ) : (
            <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-sm text-center text-zinc-600 dark:text-zinc-400 mb-3">
                Did your payment go through?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={simulatePaymentSuccess}
                  className="py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                >
                  Yes, Success ✅
                </button>
                <button
                  onClick={simulatePaymentFailure}
                  className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  No, Failed ❌
                </button>
              </div>
              <button
                onClick={() => setShowConfirmation(false)}
                className="w-full py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Retry Button */}
      {(paymentStatus === "success" || paymentStatus === "failed") && (
        <button
          onClick={() => {
            setPaymentStatus("idle");
            setPaymentId("");
            setShowConfirmation(false);
          }}
          className="mt-4 w-full py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-black dark:text-white font-medium transition-colors"
        >
          Make Another Payment
        </button>
      )}
    </div>
  );
}
