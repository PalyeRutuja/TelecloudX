"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Wallet } from "lucide-react";

export default function DashboardHeader() {
  const [user, setUser] = useState<{ userId: string; email: string; name?: string } | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const userResponse = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success) {
            setUser(userData.user);
          }
        }

        const walletResponse = await fetch("/api/wallet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          if (walletData.success) {
            setBalance(walletData.balance);
          }
        }
      } catch (err) {
        console.error("Failed to fetch header data:", err);
      }
    };

    fetchData();
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 border-b border-zinc-800/60 bg-[#0d0d0f]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search cloud resources, docs, settings..."
            className="w-full h-10 pl-10 pr-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Balance Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">
            ${balance.toFixed(2)}
          </span>
        </div>

        {/* Notification */}
        <button className="relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#0d0d0f]" />
        </button>

        {/* User Avatar + Name */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/60">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
            {avatarInitial}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-zinc-200">{displayName}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
