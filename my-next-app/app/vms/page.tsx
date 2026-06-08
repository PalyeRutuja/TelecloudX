"use client";
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  RefreshCw, 
  Play, 
  Square, 
  Trash2, 
  Server, 
  Cpu, 
  Activity, 
  Database,
  Globe,
  Network,
  LogOut,
  User,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

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
  const [balance, setBalance] = useState(0);
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

  const fetchBalance = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBalance(data.balance);
        }
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const fetchVMs = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/cloudstack/vms/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(response)) return;
      
      const data = await response.json();
      if (data.success) {
        const vmList: VM[] = (data.vms || []).map((vm: any) => ({
          id: vm.id || `vm-${Date.now()}`,
          name: vm.name || "unnamed",
          displayname: vm.displayname || vm.name || "unnamed",
          state: vm.state || "Unknown",
          templatename: vm.templatename || "N/A",
          serviceofferingname: vm.serviceofferingname || "N/A",
          cpunumber: vm.cpunumber || 0,
          memory: vm.memory || 0,
          zonename: vm.zonename || "N/A",
          created: vm.created || new Date().toISOString(),
          ipaddress: vm.ipaddress || "N/A",
          cloudstackVmId: vm.id,
        }));
        setVMs(vmList);
      } else {
        setError(data.error || "Failed to fetch VMs");
      }
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
        void fetchVMs();
        void fetchBalance();
      }
    });
  }, []);

  const handleStart = async (vm: VM) => {
    const cloudstackId = vm.cloudstackVmId;
    const firebaseId = vm.id;
    setActionLoading(vm.id);
    try {
      const headers = authHeaders();
      const response = await fetch("/api/cloudstack/vms/start", {
        method: "POST",
        headers,
        body: JSON.stringify({ id: cloudstackId, firebaseId }),
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (data.success) {
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
    const cloudstackId = vm.cloudstackVmId;
    const firebaseId = vm.id;
    setActionLoading(vm.id);
    try {
      const headers = authHeaders();
      const response = await fetch("/api/cloudstack/vms/stop", {
        method: "POST",
        headers,
        body: JSON.stringify({ id: cloudstackId, firebaseId }),
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (data.success) {
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

    const cloudstackId = vm.cloudstackVmId;
    const firebaseId = vm.id;
    setActionLoading(vm.id);
    try {
      const headers = authHeaders();
      const response = await fetch("/api/cloudstack/vms/destroy", {
        method: "POST",
        headers,
        body: JSON.stringify({ id: cloudstackId, firebaseId }),
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (data.success) {
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

  const getStateDetails = (state: string) => {
    const s = state.toLowerCase();
    if (s === "running") {
      return {
        bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
        dot: "bg-emerald-400 animate-pulse",
        label: "Running"
      };
    } else if (s === "stopped") {
      return {
        bg: "bg-red-500/10 border-red-500/30 text-red-400",
        dot: "bg-red-500",
        label: "Stopped"
      };
    } else if (s === "starting" || s === "stopping") {
      return {
        bg: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
        dot: "bg-amber-400 animate-ping",
        label: state
      };
    }
    return {
      bg: "bg-zinc-800 border-zinc-700 text-zinc-400",
      dot: "bg-zinc-500",
      label: state
    };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Virtual Machines</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage and monitor your CloudStack instances</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800/80 rounded-xl px-3 py-2">
                <User className="h-3.5 w-3.5" />
                {user.email}
              </span>
            )}
            <div className="text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800/80 rounded-xl px-3 py-2">
              Balance: <span className="text-white font-semibold">${balance.toFixed(2)}</span>
            </div>
            <Link
              href="/vms/deploy"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <Plus className="h-4 w-4" /> Deploy VM
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-sm font-semibold rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {/* Global Errors */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm glow-red">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Operation Error:</span> {error}
            </div>
            <button onClick={() => setError("")} className="underline text-xs opacity-80 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden flex items-center gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">{vms.length}</div>
              <div className="text-xs text-zinc-400 font-medium mt-0.5">Total Instances</div>
            </div>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden flex items-center gap-4 shadow-[0_0_20px_rgba(16,185,129,0.02)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-400 text-glow">
                {vms.filter((vm) => vm.state.toLowerCase() === "running").length}
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-0.5">Running</div>
            </div>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden flex items-center gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <Square className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-red-400">
                {vms.filter((vm) => vm.state.toLowerCase() === "stopped").length}
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-0.5">Stopped</div>
            </div>
          </div>

        </div>

        {/* VMs Table Card */}
        <div className="bg-[#0a0a0f] border border-zinc-800/80 rounded-2xl shadow-card overflow-hidden">
          
          {/* Table Header Section */}
          <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/20">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="text-purple-400 h-5 w-5" /> Virtual Instances List
            </h2>
            <button
              onClick={() => {
                void fetchVMs();
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <RefreshCw className="h-7 w-7 text-purple-500 animate-spin" />
              <p className="text-zinc-500 text-xs font-medium">Fetching instance lists...</p>
            </div>
          ) : vms.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500 text-2xl">
                🖥️
              </div>
              <p className="text-zinc-400 font-medium mb-1">No active instances found</p>
              <p className="text-zinc-500 text-xs mb-5">Launch your first virtual machine node in minutes.</p>
              <Link
                href="/vms/deploy"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                <Plus className="h-4 w-4" /> Deploy Instance
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-400 text-xs font-bold uppercase tracking-wider bg-zinc-950/15">
                    <th className="p-4 pl-6">Node Instance</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Template (OS)</th>
                    <th className="p-4">Resource Specs</th>
                    <th className="p-4">Zone</th>
                    <th className="p-4 font-mono">IP Address</th>
                    <th className="p-4 pr-6 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-sm">
                  {vms.map((vm) => {
                    const status = getStateDetails(vm.state);
                    const isNodeLoading = actionLoading === vm.id;

                    return (
                      <tr
                        key={vm.id}
                        className="hover:bg-zinc-900/35 transition-colors group"
                      >
                        {/* VM Name / Info */}
                        <td className="p-4 pl-6">
                          <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {vm.displayname || vm.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            ID: {vm.id}
                          </div>
                        </td>
                        
                        {/* State Badge */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>

                        {/* OS / Template */}
                        <td className="p-4 text-xs text-zinc-400 font-medium">
                          {vm.templatename}
                        </td>

                        {/* Resource Specs */}
                        <td className="p-4 text-xs text-zinc-300">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="flex items-center gap-0.5 text-zinc-400">
                              <Cpu className="h-3 w-3" /> {vm.cpunumber} CPU
                            </span>
                            <span className="text-zinc-600">|</span>
                            <span className="text-zinc-400">
                              {(vm.memory / 1024).toFixed(1)} GB RAM
                            </span>
                          </div>
                        </td>

                        {/* Zone */}
                        <td className="p-4 text-xs text-zinc-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5 text-zinc-500" />
                            {vm.zonename}
                          </span>
                        </td>

                        {/* IP Address */}
                        <td className="p-4 text-xs text-zinc-400 font-mono">
                          {vm.ipaddress && vm.ipaddress !== "N/A" ? (
                            <span className="flex items-center gap-1 text-zinc-300 bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded-md w-fit">
                              <Network className="h-3 w-3 text-zinc-500" />
                              {vm.ipaddress}
                            </span>
                          ) : (
                            <span className="text-zinc-600 italic">Not Assigned</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            {vm.state.toLowerCase() !== "running" && (
                              <button
                                onClick={() => handleStart(vm)}
                                disabled={!!actionLoading}
                                title="Start Instance"
                                className="p-2 bg-emerald-950/30 border border-emerald-900/40 hover:bg-emerald-900/40 hover:border-emerald-500/50 disabled:opacity-40 text-emerald-400 rounded-lg text-xs font-semibold transition-all"
                              >
                                <Play className={`h-3.5 w-3.5 ${isNodeLoading ? "animate-spin" : ""}`} />
                              </button>
                            )}
                            {vm.state.toLowerCase() === "running" && (
                              <button
                                onClick={() => handleStop(vm)}
                                disabled={!!actionLoading}
                                title="Stop Instance"
                                className="p-2 bg-amber-950/30 border border-amber-900/40 hover:bg-amber-900/40 hover:border-amber-500/50 disabled:opacity-40 text-amber-400 rounded-lg text-xs font-semibold transition-all"
                              >
                                <Square className={`h-3.5 w-3.5 ${isNodeLoading ? "animate-spin" : ""}`} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDestroy(vm)}
                              disabled={!!actionLoading}
                              title="Destroy Instance"
                              className="p-2 bg-red-950/30 border border-red-900/40 hover:bg-red-900/40 hover:border-red-500/50 disabled:opacity-40 text-red-400 rounded-lg text-xs font-semibold transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
