"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/wallet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setBalance(data.balance);
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400 mb-2">Wallet Balance</div>
          <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
          <Link
            href="/dashboard/billing/topup"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            Add Credits
          </Link>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400 mb-2">Active VMs</div>
          <div className="text-3xl font-bold">0</div>
          <Link
            href="/vms/deploy"
            className="mt-4 inline-block px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
          >
            Deploy VM
          </Link>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400 mb-2">Recent Transactions</div>
          <div className="text-3xl font-bold">0</div>
          <Link
            href="/dashboard/wallet"
            className="mt-4 inline-block px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </div>
  );
}
