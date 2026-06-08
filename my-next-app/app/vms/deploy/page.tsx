"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ServiceOffering {
  id: string;
  name: string;
  cpunumber: number;
  memory: number;
  displaytext: string;
}

interface Template {
  id: string;
  name: string;
  displaytext: string;
  ostypename: string;
}

interface Zone {
  id: string;
  name: string;
  networktype: string;
}

interface Network {
  id?: string;
  uuid?: string;
  name?: string;
  displaytext?: string;
  traffictype?: string;
  networkofferingname?: string;
}

export default function DeployVMPage() {
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNetworks, setLoadingNetworks] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [user, setUser] = useState<{ userId: string; name: string; email: string } | null>(null);
  const [balance, setBalance] = useState(0);
  const router = useRouter();

  const VM_DEPLOYMENT_COST = 10;

  const [formData, setFormData] = useState({
    name: "",
    displayname: "",
    serviceofferingid: "",
    templateid: "",
    zoneid: "",
    networkid: "",
  });

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

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await fetch("/api/cloudstack/vms/deploy", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(response)) return;
      const data = await response.json();

      if (data.success) {
        setOfferings(data.offerings);
        setTemplates(data.templates);
        setZones(data.zones);
        if (data.warning) {
          setWarning(data.warning);
        }
      } else {
        setError(data.error || "Failed to fetch options");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch options";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchNetworks = useCallback(async (zoneid: string) => {
    if (!zoneid) {
      setNetworks([]);
      return;
    }
    try {
      setLoadingNetworks(true);
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await fetch(`/api/cloudstack/vms/networks?zoneid=${encodeURIComponent(zoneid)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      if (data.success) {
        setNetworks(Array.isArray(data.networks) ? data.networks : []);
      } else {
        setNetworks([]);
        setError(data.error || "Failed to fetch networks");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch networks";
      setNetworks([]);
      setError(message);
    } finally {
      setLoadingNetworks(false);
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return null;
    }

    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (handleAuthError(response)) return null;
    const data = await response.json();
    if (!data.success) {
      localStorage.removeItem("token");
      router.push("/login");
      return null;
    }

    setUser(data.user);
    return data.user as { userId: string; name: string; email: string };
  }, [router]);

  const fetchBalance = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void (async () => {
      const currentUser = await checkAuth();
      if (!currentUser) return;
      await fetchOptions();
      await fetchBalance();
    })();
  }, [checkAuth, fetchOptions, fetchBalance]);

  const handleZoneChange = (zoneid: string) => {
    setFormData((current) => ({
      ...current,
      zoneid,
      networkid: "",
    }));
    setNetworks([]);
    if (zoneid) {
      void fetchNetworks(zoneid);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setError("");
    setSuccess("");

    // Check balance
    if (balance < VM_DEPLOYMENT_COST) {
      setError(`Insufficient balance. You need $${VM_DEPLOYMENT_COST} to deploy a VM, but your balance is $${balance.toFixed(2)}.`);
      setDeploying(false);
      return;
    }

    const selectedOffering = offerings.find((offering) => offering.id === formData.serviceofferingid);
    const selectedTemplate = templates.find((template) => template.id === formData.templateid);
    const selectedZone = zones.find((zone) => zone.id === formData.zoneid);

    try {
      const headers = authHeaders();
      const response = await fetch("/api/cloudstack/vms/deploy", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...formData,
          serviceofferingid: formData.serviceofferingid,
          templateid: formData.templateid,
          zoneid: formData.zoneid,
          networkids: formData.networkid,
          serviceofferingname: selectedOffering?.name,
          templatename: selectedTemplate?.name,
          zonename: selectedZone?.name,
          cpunumber: selectedOffering?.cpunumber,
          memory: selectedOffering?.memory,
        }),
      });
      if (handleAuthError(response)) return;
      const data = await response.json();

      if (data.success) {
        // Deduct $10 from wallet
        try {
          const deductResponse = await fetch("/api/wallet/transaction", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
              amount: VM_DEPLOYMENT_COST,
              type: "debit",
              description: `VM Deployment: ${formData.name || formData.displayname || "unnamed"}`,
            }),
          });
          if (deductResponse.ok) {
            const deductData = await deductResponse.json();
            if (deductData.success) {
              setBalance(deductData.balance);
            }
          }
        } catch (err) {
          console.error("Failed to deduct balance:", err);
        }

        const persistedVm = data.vm ?? {};
        setSuccess(
          `VM deployed successfully! $${VM_DEPLOYMENT_COST} deducted from your wallet. ID: ${persistedVm.cloudstackVmId || data.data?.id || persistedVm.id || "N/A"}`
        );
        setFormData({
          name: "",
          displayname: "",
          serviceofferingid: "",
          templateid: "",
          zoneid: "",
          networkid: "",
        });
      } else {
        setError(data.error || "Failed to deploy VM");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to deploy VM";
      setError(message);
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading deployment options...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/vms"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to VMs
          </Link>
          <h1 className="text-3xl font-bold text-black dark:text-white mt-4">
            Deploy Virtual Machine
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Create a new VM in your CloudStack environment
          </p>
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

        {warning && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-800 dark:text-yellow-400 text-sm">
            ⚠️ {warning}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-400">
            {success}
            <div className="mt-2">
              <Link
                href="/vms"
                className="text-sm underline"
              >
                View all VMs →
              </Link>
            </div>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-300">VM Deployment Cost</span>
            <span className="text-xl font-bold text-blue-400">${VM_DEPLOYMENT_COST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Your Balance</span>
            <span className={`font-semibold ${balance >= VM_DEPLOYMENT_COST ? "text-green-400" : "text-red-400"}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
          {balance < VM_DEPLOYMENT_COST && (
            <div className="mt-2 text-sm text-red-400">
              Insufficient ${VM_DEPLOYMENT_COST.toFixed(2)} balance available.{" "}
              <Link href="/dashboard/billing/topup?returnTo=/vms/deploy" className="underline">
                Add amount
              </Link>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              VM Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-vm-01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Display Name (optional)
            </label>
            <input
              type="text"
              value={formData.displayname}
              onChange={(e) =>
                setFormData({ ...formData, displayname: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Production VM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Service Offering
            </label>
            <select
              value={formData.serviceofferingid}
              onChange={(e) =>
                setFormData({ ...formData, serviceofferingid: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a service offering...</option>
              {offerings.map((offering, index) => (
                <option key={`${offering.id}-${index}`} value={offering.id}>
                  {offering.name} ({offering.cpunumber} CPU,{" "}
                  {(offering.memory / 1024).toFixed(1)} GB RAM)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Template
            </label>
            <select
              value={formData.templateid}
              onChange={(e) =>
                setFormData({ ...formData, templateid: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a template...</option>
              {templates.map((template, index) => (
                <option key={`${template.id}-${index}`} value={template.id}>
                  {template.name} ({template.ostypename})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Zone
            </label>
            <select
              value={formData.zoneid}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a zone...</option>
              {zones.map((zone, index) => (
                <option key={`${zone.id}-${index}`} value={zone.id}>
                  {zone.name} ({zone.networktype})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Network
            </label>
            <select
              value={formData.networkid}
              onChange={(e) =>
                setFormData({ ...formData, networkid: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.zoneid || loadingNetworks}
            >
              <option value="">
                {loadingNetworks
                  ? "Loading networks..."
                  : formData.zoneid
                    ? "Select a network..."
                    : "Select a zone first..."}
              </option>
              {networks.map((network, index) => {
                const networkValue = network.id || network.uuid || "";
                const label =
                  network.name ||
                  network.displaytext ||
                  network.networkofferingname ||
                  network.id ||
                  network.uuid ||
                  "Unnamed network";
                return (
                  <option key={`network-${index}-${networkValue}`} value={networkValue}>
                    {label}
                    {network.traffictype ? ` (${network.traffictype})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="pt-4">
            {balance >= VM_DEPLOYMENT_COST ? (
              <button
                type="submit"
                disabled={deploying}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
              >
                {deploying ? "Deploying VM..." : `Deploy VM - $${VM_DEPLOYMENT_COST.toFixed(2)}`}
              </button>
            ) : (
              <Link
                href="/dashboard/billing/topup?returnTo=/vms/deploy"
                className="block w-full py-3 px-6 bg-zinc-600 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors text-center"
              >
                Insufficient ${VM_DEPLOYMENT_COST.toFixed(2)} balance available. Add amount
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
