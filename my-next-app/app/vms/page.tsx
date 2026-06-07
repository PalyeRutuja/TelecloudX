"use client";
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteUserVm, listUserVms, updateUserVm } from "@/lib/vm-store";

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
  cloudstackVmId?: string;
}

export default function VMDashboard() {
  const [vms, setVMs] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [user, setUser] = useState<{ userId: string; name: string; email: string } | null>(null);
  const router = useRouter();

  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleAuthError = (response: Response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      return true;
    }
    return false;
  };

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return false;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(response)) return false;
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return data.user as { userId: string; name: string; email: string };
      } else {
        localStorage.removeItem("token");
        router.push("/login");
        return false;
      }
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
      return false;
    }
  };

  const fetchVMs = async (currentUser?: { userId: string; name: string; email: string }) => {
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
  };

  useEffect(() => {
    checkAuth().then((authUser) => {
      if (authUser && typeof authUser !== "boolean") {
        void fetchVMs(authUser);
      }
    });
  }, []);

  const handleStart = async (vm: VM) => {
    const cloudstackId = vm.cloudstackVmId || vm.id;
    setActionLoading(vm.id);
    try {
      const headers = authHeaders();
      const response = await fetch("/api/cloudstack/vms/start", {
        method: "POST",
        headers,
        body: JSON.stringify({ id: cloudstackId }),
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (data.success) {
        if (user) {
          await updateUserVm(user.userId, user.email, vm.id, { state: "Running" });
        }
        await fetchVMs();
      } else {
        setError(data.error || "Failed to start VM");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start VM";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async (vm: VM) => {
    const cloudstackId = vm.cloudstackVmId || vm.id;
    setActionLoading(vm.id);
    try {
      const headers = authHeaders();
      const response = await fetch("/api/cloudstack/vms/stop", {
        method: "POST",
        headers,
        body: JSON.stringify({ id: cloudstackId }),
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (data.success) {
        if (user) {
          await updateUserVm(user.userId, user.email, vm.id, { state: "Stopped" });
        }
        await fetchVMs();
      } else {
        setError(data.error || "Failed to stop VM");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to stop VM";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDestroy = async (vm: VM) => {
    if (!confirm("Are you sure you want to destroy this VM? This action cannot be undone.")) {
      return;
    }

    const cloudstackId = vm.cloudstackVmId || vm.id;
    setActionLoading(vm.id);
    try {
      const headers = authHeaders();
      const response = await fetch("/api/cloudstack/vms/destroy", {
        method: "POST",
        headers,
        body: JSON.stringify({ id: cloudstackId }),
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (data.success) {
        if (user) {
          await deleteUserVm(user.userId, vm.id);
        }
        await fetchVMs();
      } else {
        setError(data.error || "Failed to destroy VM");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to destroy VM";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "stopped":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "starting":
      case "stopping":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Virtual Machines
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Manage your CloudStack VMs
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Hello, {user.email}
              </span>
            )}
            <Link
              href="/vms/deploy"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              + Deploy New VM
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white font-medium rounded-xl transition-colors"
            >
              Logout
            </button>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-bold text-black dark:text-white">{vms.length}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Total VMs</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-bold text-green-600">
              {vms.filter((vm) => vm.state.toLowerCase() === "running").length}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Running</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-bold text-red-600">
              {vms.filter((vm) => vm.state.toLowerCase() === "stopped").length}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Stopped</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              VM List
            </h2>
            <button
              onClick={() => {
                void fetchVMs();
              }}
              disabled={loading}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-600 dark:text-zinc-400">
              Loading VMs...
            </div>
          ) : vms.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                No VMs found. Deploy your first VM!
              </p>
              <Link
                href="/vms/deploy"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Deploy VM
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">State</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Template</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Specs</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Zone</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">IP</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vms.map((vm) => (
                    <tr
                      key={vm.id}
                      className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium text-black dark:text-white">
                          {vm.displayname || vm.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                          {vm.id}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(
                            vm.state
                          )}`}
                        >
                          {vm.state}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {vm.templatename}
                      </td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {vm.cpunumber} CPU / {(vm.memory / 1024).toFixed(1)} GB
                      </td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {vm.zonename}
                      </td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                        {vm.ipaddress || "N/A"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {vm.state.toLowerCase() !== "running" && (
                            <button
                              onClick={() => handleStart(vm)}
                              disabled={actionLoading === vm.id}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {vm.state.toLowerCase() === "running" && (
                            <button
                              onClick={() => handleStop(vm)}
                              disabled={actionLoading === vm.id}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Stop
                            </button>
                          )}
                          <button
                            onClick={() => handleDestroy(vm)}
                            disabled={actionLoading === vm.id}
                            className="px-3 py-1.5 bg-zinc-600 hover:bg-zinc-700 disabled:bg-zinc-400 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Destroy
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
