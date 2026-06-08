"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listUserVms } from "@/lib/vm-store";
import { Wallet, Server, ArrowUpRight, CreditCard, Activity } from "lucide-react";

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
            setTransactionCount(walletData.transactions?.length || 0);
          }

          try {
            const vms = await listUserVms(userData.user.userId, userData.user.email);
            setVmCount(vms.length);
          } catch (err) {
            console.error("Failed to fetch VMs:", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, [router]);

  const cards = [
    {
      title: "Wallet Balance",
      value: `$${balance.toFixed(2)}`,
      icon: Wallet,
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-400",
      action: { label: "Add Credits", href: "/dashboard/billing/topup", primary: true },
    },
    {
      title: "Active VMs",
      value: String(vmCount),
      icon: Server,
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-400",
      action: { label: "Deploy VM", href: "/vms/deploy", primary: false },
    },
    {
      title: "Recent Transactions",
      value: String(transactionCount),
      icon: CreditCard,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      action: { label: "View All", href: "/dashboard/wallet", primary: false },
    },
  ];

  return (
    <div className="p-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Welcome back! Here is your cloud overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 hover:border-zinc-700/60 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`h-11 w-11 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="h-8 w-8 rounded-lg bg-zinc-800/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                </div>
              </div>

              <div className="text-sm text-zinc-500 mb-1">{card.title}</div>
              <div className="text-3xl font-bold text-white mb-5">{card.value}</div>

              <Link
                href={card.action.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  card.action.primary
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/20"
                    : "bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                }`}
              >
                {card.action.label}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Quick Activity Section */}
      <div className="mt-8 bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 bg-amber-500/15 rounded-xl flex items-center justify-center">
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Quick Overview</h2>
            <p className="text-sm text-zinc-500">Your cloud resources at a glance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/[0.02] rounded-xl border border-[#1a1a2e]">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Account Status</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-400">Active</span>
            </div>
          </div>
          <div className="p-4 bg-white/[0.02] rounded-xl border border-[#1a1a2e]">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</div>
            <div className="text-sm font-medium text-zinc-300 truncate">{user?.email || "—"}</div>
          </div>
          <div className="p-4 bg-white/[0.02] rounded-xl border border-[#1a1a2e]">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">User ID</div>
            <div className="text-sm font-medium text-zinc-300 truncate font-mono">{user?.userId || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
