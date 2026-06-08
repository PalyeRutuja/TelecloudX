"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listUserVms } from "@/lib/vm-store";
import { Wallet, Server, Receipt, Activity, Mail, User } from "lucide-react";

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [vmCount, setVmCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [user, setUser] = useState<{ userId: string; email: string; name?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
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

          const walletResponse = await fetch("/api/wallet", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const walletData = await walletResponse.json();
          if (walletData.success) {
            setBalance(walletData.balance);
          }

          try {
            const vms = await listUserVms(userData.user.userId, userData.user.email);
            setVmCount(vms.length);
          } catch (err) {
            console.error("Failed to fetch VMs:", err);
          }

          setTransactionCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, [router]);

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here is your cloud overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Balance */}
        <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-sm text-gray-400">Wallet Balance</div>
          </div>
          <div className="text-3xl font-bold text-white mb-4">${balance.toFixed(2)}</div>
          <Link
            href="/dashboard/billing/topup"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-sm font-medium text-white transition-all"
          >
            Add Credits
          </Link>
        </div>

        {/* Active VMs */}
        <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Server className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-sm text-gray-400">Active VMs</div>
          </div>
          <div className="text-3xl font-bold text-white mb-4">{vmCount}</div>
          <Link
            href="/vms/deploy"
            className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all"
          >
            Deploy VM
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-sm text-gray-400">Recent Transactions</div>
          </div>
          <div className="text-3xl font-bold text-white mb-4">{transactionCount}</div>
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Activity className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Quick Overview</h2>
            <p className="text-sm text-gray-400">Your cloud resources at a glance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Account Status</div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Email</div>
            <div className="flex items-center gap-2 text-white">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{user?.email || "—"}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">User ID</div>
            <div className="flex items-center gap-2 text-white">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-300">{user?.userId || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
