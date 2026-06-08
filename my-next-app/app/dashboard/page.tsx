"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  Server, 
  History, 
  ArrowUpRight, 
  Plus, 
  Coins, 
  Activity, 
  TrendingUp,
  LayoutGrid
} from "lucide-react";

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [vmCount, setVmCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [user, setUser] = useState<{ userId: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
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
            // Count success/pending transactions
            if (Array.isArray(walletData.transactions)) {
              setTransactionCount(walletData.transactions.length);
            }
          }

          // Fetch VM count from CloudStack
          try {
            const vmResponse = await fetch("/api/cloudstack/vms/list", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const vmData = await vmResponse.json();
            if (vmData.success) {
              setVmCount(vmData.count || 0);
            }
          } catch (err) {
            console.error("Failed to fetch VMs:", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="p-8 min-h-screen bg-[#050505] text-white">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <LayoutGrid className="text-purple-500 h-8 w-8" />
          Dashboard Overview
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {user ? `Welcome back, ${user.email}. ` : ""}Monitor your active cloud resources and wallet metrics.
        </p>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Wallet Balance Card */}
        <div className="bg-[#0a0a0f] border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group shadow-card hover:border-emerald-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
          
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/25 px-2 py-0.5 rounded-full border border-emerald-900/30">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>

          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Wallet Balance</div>
          <div className="text-4xl font-extrabold text-white mt-1 text-glow-emerald">
            ${balance.toFixed(2)}
          </div>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">Available credits for deploying cloud instances.</p>

          <Link
            href="/dashboard/billing/topup"
            className="mt-6 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Coins className="h-3.5 w-3.5" /> Add Credits
          </Link>
        </div>

        {/* Active VMs Card */}
        <div className="bg-[#0a0a0f] border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group shadow-card hover:border-purple-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all" />
          
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Server className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-400 uppercase tracking-wider bg-purple-950/25 px-2 py-0.5 rounded-full border border-purple-900/30">
              <Activity className="h-3 w-3 animate-pulse" /> Active
            </span>
          </div>

          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Active Instances</div>
          <div className="text-4xl font-extrabold text-white mt-1 text-glow-purple">
            {vmCount}
          </div>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">Currently active virtual machine workloads.</p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Link
              href="/vms/deploy"
              className="inline-flex items-center justify-center gap-1 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              <Plus className="h-3.5 w-3.5" /> Deploy
            </Link>
            <Link
              href="/vms"
              className="inline-flex items-center justify-center gap-1 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all"
            >
              View List
            </Link>
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="bg-[#0a0a0f] border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group shadow-card hover:border-indigo-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
          
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <History className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              History
            </span>
          </div>

          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Topup Count</div>
          <div className="text-4xl font-extrabold text-white mt-1 text-glow-indigo">
            {transactionCount}
          </div>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">Transactions logged inside your credit wallet ledger.</p>

          <Link
            href="/dashboard/wallet"
            className="mt-6 w-full inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all"
          >
            View History Ledger <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>

      </div>
      
    </div>
  );
}