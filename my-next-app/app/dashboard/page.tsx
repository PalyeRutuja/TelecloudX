"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramError, setTelegramError] = useState("");
  const [telegramLink, setTelegramLink] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch balance
        const walletResponse = await fetch("/api/wallet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const walletData = await walletResponse.json();
        if (walletData.success) {
          setBalance(walletData.balance);
        }

        // Check if Telegram is linked
        const meResponse = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meResponse.json();
        if (meData.success && meData.user?.telegramId) {
          setTelegramLinked(true);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  const handleConnectTelegram = async () => {
    setTelegramLoading(true);
    setTelegramError("");
    setTelegramLink("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setTelegramError("Please log in first");
        return;
      }

      const response = await fetch("/api/telegram/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate link");
      }

      setTelegramLink(data.link);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate Telegram link";
      setTelegramError(message);
    } finally {
      setTelegramLoading(false);
    }
  };

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
          <div className="text-sm text-zinc-400 mb-2">Telegram</div>
          <div className="text-lg font-semibold mb-2">
            {telegramLinked ? (
              <span className="text-green-400">Linked</span>
            ) : (
              <span className="text-zinc-400">Not Linked</span>
            )}
          </div>
          {telegramLinked ? (
            <p className="text-xs text-zinc-500">
              Your Telegram account is connected. Use the bot for quick actions.
            </p>
          ) : (
            <button
              onClick={handleConnectTelegram}
              disabled={telegramLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg text-sm font-medium transition-colors"
            >
              {telegramLoading ? "Generating..." : "Connect Telegram"}
            </button>
          )}
        </div>
      </div>

      {telegramError && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-400 text-sm">
          {telegramError}
        </div>
      )}

      {telegramLink && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-400 mb-2">
            Click the link below to connect your Telegram account:
          </p>
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Open in Telegram
          </a>
          <p className="text-xs text-zinc-500 mt-2">
            This link expires in 10 minutes.
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
