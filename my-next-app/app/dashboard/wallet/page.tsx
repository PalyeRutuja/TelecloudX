"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  createdAt: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <Link
          href="/dashboard/billing/topup"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
        >
          + Add Credits
        </Link>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
        <div className="text-sm text-zinc-400 mb-2">Current Balance</div>
        <div className="text-4xl font-bold">${balance.toFixed(2)}</div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">No transactions yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 text-sm font-medium text-zinc-400">ID</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Provider</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-zinc-800/50">
                  <td className="p-4 text-sm font-mono text-zinc-400">{txn.id}</td>
                  <td className="p-4 text-sm">${txn.amount.toFixed(2)}</td>
                  <td className="p-4 text-sm text-zinc-400 capitalize">{txn.provider}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      txn.status === "SUCCESS"
                        ? "bg-green-500/20 text-green-400"
                        : txn.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-zinc-400">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
