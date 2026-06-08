"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listUserVms } from "@/lib/vm-store";

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [vmCount, setVmCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [user, setUser] = useState<{ userId: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        const userData = await userResponse.json();
        if (userData.success) {
          setUser(userData.user);
          
          // Fetch balance
          const walletResponse = await fetch("/api/wallet", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const walletData = await walletResponse.json();
          if (walletData.success) {
            setBalance(walletData.balance);
          }

          // Fetch VM count from Firebase
          try {
            const vms = await listUserVms(userData.user.userId, userData.user.email);
            setVmCount(vms.length);
          } catch (err) {
            console.error("Failed to fetch VMs:", err);
          }

          // Fetch transaction count
          try {
            const txResponse = await fetch("/api/wallet", {
              headers: { Authorization: `Bearer ${token}` },
            });
            // We could add a transactions endpoint, but for now we'll show the VM count or keep it simple
            // Let's fetch transactions from the wallet API or set to 0 for now
            setTransactionCount(0);
          } catch (err) {
            console.error("Failed to fetch transactions:", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, [router]);

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
          <div className="text-3xl font-bold">{vmCount}</div>
          <Link
            href="/vms/deploy"
            className="mt-4 inline-block px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
          >
            Deploy VM
          </Link>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400 mb-2">Recent Transactions</div>
          <div className="text-3xl font-bold">{transactionCount}</div>
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