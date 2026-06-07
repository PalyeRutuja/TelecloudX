"use client";

import UpiPayment from "@/app/components/UpiPayment";

export default function UpiPaymentPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            UPI Payment
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Scan QR code or open your UPI app to pay
          </p>
        </div>

        <UpiPayment
          amount={2499}
          description="Cloud Server (Basic) - 1 Month"
          onPaymentComplete={(paymentId) => {
            console.log("Payment completed:", paymentId);
            // Here you would update user's balance in your database
          }}
        />

        <div className="mt-8 text-center">
          <a
            href="/payments"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to all payment methods
          </a>
        </div>
      </div>
    </div>
  );
}
