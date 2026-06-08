"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserVm } from "@/lib/vm-store";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Cpu,
  HardDrive,
  Globe,
  Check,
  Server,
  Zap,
  Box,
  Layers,
} from "lucide-react";

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

// --- Wizard Data ---

const REGIONS = [
  { id: "mumbai", name: "Mumbai", code: "BOM", flag: "🇮🇳", desc: "India West" },
  { id: "singapore", name: "Singapore", code: "SGP", flag: "🇸🇬", desc: "Asia Pacific" },
  { id: "frankfurt", name: "Frankfurt", code: "FRA", flag: "🇩🇪", desc: "Europe Central" },
];

const PLANS = [
  {
    id: "small",
    name: "Small",
    cpu: "2 vCPU",
    ram: "4 GB RAM",
    storage: "80 GB SSD",
    price: 1200,
    icon: Server,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
    popular: false,
  },
  {
    id: "medium",
    name: "Medium",
    cpu: "4 vCPU",
    ram: "8 GB RAM",
    storage: "160 GB SSD",
    price: 2400,
    icon: Zap,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15",
    popular: true,
  },
  {
    id: "gpu",
    name: "GPU Offering",
    cpu: "8 vCPU",
    ram: "32 GB RAM",
    storage: "500 GB NVMe",
    price: 8500,
    icon: Cpu,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
    popular: false,
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    cpu: "4 vCPU × 3",
    ram: "8 GB × 3",
    storage: "160 GB × 3",
    price: 7200,
    icon: Box,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    popular: false,
  },
];

const OS_OPTIONS = [
  { id: "ubuntu-22", name: "Ubuntu 22.04 LTS", version: "Jammy Jellyfish", icon: "🐧", family: "Debian" },
  { id: "debian-12", name: "Debian 12", version: "Bookworm", icon: "🌀", family: "Debian" },
  { id: "centos-9", name: "CentOS 9 Stream", version: "Stream", icon: "🎯", family: "RHEL" },
  { id: "rocky-9", name: "Rocky Linux 9", version: "RHEL Compatible", icon: "⛰️", family: "RHEL" },
  { id: "rhel-9", name: "RHEL 9", version: "Enterprise", icon: "🔴", family: "RHEL" },
];

const NETWORK_OPTIONS = [
  { id: "public-eth", name: "Public Network", type: "Ethernet", desc: "Internet-facing with public IP", icon: Globe },
];

const STEPS = [
  { num: 1, label: "Region" },
  { num: 2, label: "Plan" },
  { num: 3, label: "OS" },
  { num: 4, label: "Network" },
  { num: 5, label: "Configure" },
];

// --- Component ---

export default function DeployVMPage() {
  const [step, setStep] = useState(1);
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

  // Wizard selections
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedOS, setSelectedOS] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [instanceName, setInstanceName] = useState("");

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
          setSuccess(`VM deployed successfully! $${VM_DEPLOYMENT_COST} deducted from your wallet. ID: ${vm.id || data.data?.id || "N/A"}`);
        } else {
          setSuccess(`VM deployed successfully! $${VM_DEPLOYMENT_COST} deducted from your wallet. ID: ${data.data?.id || "N/A"}`);
        }
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

  // --- Wizard helpers ---

  const canGoNext = () => {
    switch (step) {
      case 1: return !!selectedRegion;
      case 2: return !!selectedPlan;
      case 3: return !!selectedOS;
      case 4: return !!selectedNetwork;
      case 5: return !!instanceName.trim();
      default: return false;
    }
  };

  const goNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);
  const selectedRegionData = REGIONS.find((r) => r.id === selectedRegion);
  const selectedOSData = OS_OPTIONS.find((o) => o.id === selectedOS);
  const monthlyEstimate = selectedPlanData ? selectedPlanData.price : 0;

  // --- Render Steps ---

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Choose a Region</h2>
            <p className="text-sm text-zinc-500">Select the data center region closest to your users.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`relative text-left p-5 rounded-2xl border transition-all duration-200 ${
                    selectedRegion === region.id
                      ? "bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30"
                      : "bg-[#111113] border-zinc-800/60 hover:border-zinc-700/60"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{region.flag}</span>
                    <div>
                      <div className="font-semibold text-white">{region.name}</div>
                      <div className="text-xs text-zinc-500">{region.code}</div>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400">{region.desc}</div>
                  {selectedRegion === region.id && (
                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Choose a Plan</h2>
            <p className="text-sm text-zinc-500">Select the compute resources for your instance.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative text-left p-5 rounded-2xl border transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? "bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30"
                        : "bg-[#111113] border-zinc-800/60 hover:border-zinc-700/60"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 left-4 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-md">
                        POPULAR
                      </span>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 ${plan.iconBg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-white mb-1">{plan.name}</div>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Cpu className="h-3.5 w-3.5" />
                        {plan.cpu}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Layers className="h-3.5 w-3.5" />
                        {plan.ram}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <HardDrive className="h-3.5 w-3.5" />
                        {plan.storage}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white">₹{plan.price.toLocaleString("en-IN")}<span className="text-sm font-normal text-zinc-500">/mo</span></div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Choose an Operating System</h2>
            <p className="text-sm text-zinc-500">Select the OS for your instance.</p>
            <div className="grid grid-cols-1 gap-3">
              {OS_OPTIONS.map((os) => (
                <button
                  key={os.id}
                  onClick={() => setSelectedOS(os.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                    selectedOS === os.id
                      ? "bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30"
                      : "bg-[#111113] border-zinc-800/60 hover:border-zinc-700/60"
                  }`}
                >
                  <span className="text-2xl">{os.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{os.name}</div>
                    <div className="text-sm text-zinc-500">{os.version} · {os.family}</div>
                  </div>
                  {selectedOS === os.id && (
                    <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Choose a Network</h2>
            <p className="text-sm text-zinc-500">Configure network connectivity for your instance.</p>
            <div className="grid grid-cols-1 gap-3">
              {NETWORK_OPTIONS.map((net) => {
                const Icon = net.icon;
                return (
                  <button
                    key={net.id}
                    onClick={() => setSelectedNetwork(net.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                      selectedNetwork === net.id
                        ? "bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30"
                        : "bg-[#111113] border-zinc-800/60 hover:border-zinc-700/60"
                    }`}
                  >
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{net.name} <span className="text-zinc-500">({net.type})</span></div>
                      <div className="text-sm text-zinc-500">{net.desc}</div>
                    </div>
                    {selectedNetwork === net.id && (
                      <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Configure Instance</h2>
              <p className="text-sm text-zinc-500 mt-1">Name your instance and review the deployment summary.</p>
            </div>

            <div className="bg-[#111113] border border-zinc-800/60 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Instance Name</label>
                <input
                  type="text"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  className="w-full h-11 px-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
                  placeholder="e.g., web-server-01"
                />
              </div>
            </div>

            {/* Deployment Summary */}
            <div className="bg-[#111113] border border-zinc-800/60 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Deployment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Target Region</span>
                  <span className="text-white font-medium">{selectedRegionData?.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Instance Plan</span>
                  <span className="text-white font-medium">{selectedPlanData?.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Operating System</span>
                  <span className="text-white font-medium">{selectedOSData?.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Network</span>
                  <span className="text-white font-medium">Public Network (Ethernet)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Instance Name</span>
                  <span className="text-white font-medium">{instanceName || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading deployment options...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="border-b border-zinc-800/60 bg-[#0d0d0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/vms" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to VMs
          </Link>
          <div className="text-sm text-zinc-500">
            Balance: <span className={`font-semibold ${balance >= VM_DEPLOYMENT_COST ? "text-emerald-400" : "text-red-400"}`}>${balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
            <button onClick={() => setError("")} className="ml-4 underline">Dismiss</button>
          </div>
        )}
        {warning && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
            ⚠️ {warning}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
            {success}
            <div className="mt-2">
              <Link href="/vms" className="underline">View all VMs →</Link>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center gap-2">
                {STEPS.map((s, idx) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      step === s.num
                        ? "bg-purple-600 text-white"
                        : step > s.num
                        ? "bg-purple-600/20 text-purple-400"
                        : "bg-zinc-800/60 text-zinc-500"
                    }`}>
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                        step === s.num
                          ? "bg-white text-purple-600"
                          : step > s.num
                          ? "bg-purple-500 text-white"
                          : "bg-zinc-700 text-zinc-500"
                      }`}>
                        {step > s.num ? <Check className="h-3 w-3" /> : s.num}
                      </span>
                      {s.label}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-6 h-px ${step > s.num ? "bg-purple-500/40" : "bg-zinc-800"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/60">
              <button
                onClick={goBack}
                disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {step < 5 ? (
                <button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canGoNext() || deploying}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20"
                >
                  {deploying ? "Creating..." : "Create Instance"}
                </button>
              )}
            </div>
          </div>

          {/* Right sidebar — Monthly Estimate */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 bg-[#111113] border border-zinc-800/60 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Monthly Estimate</h3>

              <div className="text-3xl font-bold text-white mb-6">
                ₹{monthlyEstimate.toLocaleString("en-IN")}<span className="text-sm font-normal text-zinc-500">/mo</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Region</span>
                  <span className="text-zinc-300">{selectedRegionData?.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Plan</span>
                  <span className="text-zinc-300">{selectedPlanData?.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">OS</span>
                  <span className="text-zinc-300">{selectedOSData?.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Network</span>
                  <span className="text-zinc-300">Public</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="text-zinc-300">₹{monthlyEstimate.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Tax (18% GST)</span>
                  <span className="text-zinc-300">₹{Math.round(monthlyEstimate * 0.18).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{Math.round(monthlyEstimate * 1.18).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {balance < VM_DEPLOYMENT_COST && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  Insufficient balance. Need ${VM_DEPLOYMENT_COST} to deploy.
                  <Link href="/dashboard/billing/topup?returnTo=/vms/deploy" className="block mt-1 underline">Add credits →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
