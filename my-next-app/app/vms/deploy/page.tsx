"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createUserVm } from "@/lib/vm-store";

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

export default function DeployVMPage() {
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [user, setUser] = useState<{ userId: string; name: string; email: string } | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    displayname: "",
    serviceofferingid: "",
    templateid: "",
    zoneid: "",
  });

  const getToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return currentUser.getIdToken();
    }
    return localStorage.getItem("token");
  };

  const authHeaders = async () => {
    const token = await getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch("/api/cloudstack/vms/deploy", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setOfferings(data.offerings);
        setTemplates(data.templates);
        setZones(data.zones);
        if (data.warning) {
          setWarning(data.warning);
        }
      } else {
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        setError(data.error || "Failed to fetch options");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch options";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      router.push("/login");
      return null;
    }

    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!data.success) {
      localStorage.removeItem("token");
      router.push("/login");
      return null;
    }

    setUser(data.user);
    localStorage.setItem("token", token);
    return data.user as { userId: string; name: string; email: string };
  }, [router]);

  useEffect(() => {
    void (async () => {
      const currentUser = await checkAuth();
      if (!currentUser) return;
      await fetchOptions();
    })();
  }, [checkAuth, fetchOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setError("");
    setSuccess("");

    const selectedOffering = offerings.find((offering) => offering.id === formData.serviceofferingid);
    const selectedTemplate = templates.find((template) => template.id === formData.templateid);
    const selectedZone = zones.find((zone) => zone.id === formData.zoneid);

    try {
      const headers = await authHeaders();
      const response = await fetch("/api/cloudstack/vms/deploy", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...formData,
          serviceofferingname: selectedOffering?.name,
          templatename: selectedTemplate?.name,
          zonename: selectedZone?.name,
          cpunumber: selectedOffering?.cpunumber,
          memory: selectedOffering?.memory,
        }),
      });
      const data = await response.json();

      if (data.success) {
        if (user) {
          const deployment = data.data ?? {};
          const vm = await createUserVm(user.userId, user.email, {
            name: formData.name || formData.displayname || "new-vm",
            displayname: formData.displayname || formData.name || "new-vm",
            state: "Running",
            templatename: selectedTemplate?.name || formData.templateid,
            serviceofferingname: selectedOffering?.name || formData.serviceofferingid,
            cpunumber: selectedOffering?.cpunumber,
            memory: selectedOffering?.memory,
            zonename: selectedZone?.name || formData.zoneid,
            cloudstackVmId: typeof deployment.id === "string" ? deployment.id : undefined,
            cloudstackJobId: typeof deployment.jobid === "string" ? deployment.jobid : undefined,
            cloudstackResponse: deployment,
          });
          setSuccess(`VM deployed successfully! ID: ${vm.id || data.data?.id || "N/A"}`);
        } else {
          setSuccess(`VM deployed successfully! ID: ${data.data?.id || "N/A"}`);
        }
        setFormData({
          name: "",
          displayname: "",
          serviceofferingid: "",
          templateid: "",
          zoneid: "",
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
              {offerings.map((offering) => (
                <option key={offering.id} value={offering.id}>
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
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
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
              onChange={(e) =>
                setFormData({ ...formData, zoneid: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a zone...</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.networktype})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={deploying}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
            >
              {deploying ? "Deploying VM..." : "Deploy Virtual Machine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
