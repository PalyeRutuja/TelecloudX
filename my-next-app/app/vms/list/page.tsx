"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listUserVms } from "@/lib/vm-store";

interface VM {
  id: string;
  name: string;
  displayname: string;
  state: string;
  templatename: string;
  serviceofferingname: string;
  cpunumber: number;
  memory: number;
  zonename: string;
  created: string;
  ipaddress?: string;
}

export default function VMListPage() {
  const [vms, setVMs] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const router = useRouter();
  const [user, setUser] = useState<{ userId: string; name: string; email: string } | null>(null);

  const getToken = () => localStorage.getItem("token");

  const handleAuthError = (response: Response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      return true;
    }
    return false;
  };

  const fetchVMs = useCallback(async (currentUser?: { userId: string; name: string; email: string }) => {
    try {
      setLoading(true);
      const targetUser = currentUser || user;
      if (!targetUser) return;
      const vms = await listUserVms(targetUser.userId, targetUser.email);
      setVMs(vms);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch VMs";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void (async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (!data.success) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      setUser(data.user);
      await fetchVMs(data.user);
    })();
  }, [fetchVMs, router]);

  const filteredVMs = vms.filter((vm) =>
    vm.name.toLowerCase().includes(filter.toLowerCase()) ||
    vm.displayname?.toLowerCase().includes(filter.toLowerCase()) ||
    vm.state.toLowerCase().includes(filter.toLowerCase())
  );

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "stopped":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/vms"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-black dark:text-white mt-4">
              All Virtual Machines
            </h1>
          </div>
          <Link
            href="/vms/deploy"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            + Deploy New VM
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Filter VMs by name or state..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-400">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            Loading VMs...
          </div>
        ) : filteredVMs.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">No VMs found.</p>
            <Link
              href="/vms/deploy"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Deploy VM
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVMs.map((vm) => (
              <div
                key={vm.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-black dark:text-white">
                      {vm.displayname || vm.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                      {vm.id}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(
                      vm.state
                    )}`}
                  >
                    {vm.state}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Template</span>
                    <span className="text-black dark:text-white">{vm.templatename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Specs</span>
                    <span className="text-black dark:text-white">
                      {vm.cpunumber} CPU / {(vm.memory / 1024).toFixed(1)} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Zone</span>
                    <span className="text-black dark:text-white">{vm.zonename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">IP</span>
                    <span className="text-black dark:text-white font-mono">
                      {vm.ipaddress || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Created</span>
                    <span className="text-black dark:text-white">
                      {new Date(vm.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Link
                    href={`/vms/${vm.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Manage VM →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
