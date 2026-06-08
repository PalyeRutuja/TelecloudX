"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Globe, 
  Cpu, 
  Terminal, 
  Network as NetworkIcon, 
  Settings, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowLeft,
  Server,
  RefreshCw
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
  const INR_EXCHANGE_RATE = 85; // $1 = 85 INR

  const [step, setStep] = useState(1);
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
        setOfferings(data.offerings || []);
        setTemplates(data.templates || []);
        setZones(data.zones || []);
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

  const handleZoneSelect = (zoneid: string) => {
    setFormData((current) => ({
      ...current,
      zoneid,
      networkid: "",
    }));
    setNetworks([]);
    if (zoneid) {
      void fetchNetworks(zoneid);
    }
    setStep(2); // Auto advance to Plan
  };

  const handleOfferingSelect = (serviceofferingid: string) => {
    setFormData((current) => ({
      ...current,
      serviceofferingid,
    }));
    setStep(3); // Auto advance to OS
  };

  const handleTemplateSelect = (templateid: string) => {
    setFormData((current) => ({
      ...current,
      templateid,
    }));
    setStep(4); // Auto advance to Network
  };

  const handleNetworkSelect = (networkid: string) => {
    setFormData((current) => ({
      ...current,
      networkid,
    }));
    setStep(5); // Auto advance to Configure
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setError("");
    setSuccess("");

    if (balance < VM_DEPLOYMENT_COST) {
      setError(`Insufficient balance. You need $${VM_DEPLOYMENT_COST.toFixed(2)} to deploy a VM, but your balance is $${balance.toFixed(2)}.`);
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

        const persistedVm = data.vm ?? {};
        setSuccess(
          `VM deployed successfully! $${VM_DEPLOYMENT_COST.toFixed(2)} (₹${(VM_DEPLOYMENT_COST * INR_EXCHANGE_RATE).toFixed(2)}) deducted from your wallet. ID: ${persistedVm.cloudstackVmId || data.data?.id || persistedVm.id || "N/A"}`
        );
        
        setFormData({
          name: "",
          displayname: "",
          serviceofferingid: "",
          templateid: "",
          zoneid: "",
          networkid: "",
        });
        setStep(1); // Reset step
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

  const getOSDetails = (templateName: string = "") => {
    const nameLower = templateName.toLowerCase();
    if (nameLower.includes("ubuntu")) {
      return { label: "Ubuntu", color: "from-orange-600 to-amber-600", bg: "bg-orange-950/20", border: "border-orange-500/30", text: "text-orange-400" };
    } else if (nameLower.includes("debian")) {
      return { label: "Debian", color: "from-rose-600 to-pink-600", bg: "bg-rose-950/20", border: "border-rose-500/30", text: "text-rose-400" };
    } else if (nameLower.includes("centos")) {
      return { label: "CentOS", color: "from-emerald-600 to-teal-600", bg: "bg-emerald-950/20", border: "border-emerald-500/30", text: "text-emerald-400" };
    } else if (nameLower.includes("windows")) {
      return { label: "Windows", color: "from-blue-600 to-indigo-600", bg: "bg-blue-950/20", border: "border-blue-500/30", text: "text-blue-400" };
    } else if (nameLower.includes("rocky")) {
      return { label: "Rocky", color: "from-green-600 to-emerald-600", bg: "bg-green-950/20", border: "border-green-500/30", text: "text-green-400" };
    }
    return { label: "Linux", color: "from-zinc-600 to-zinc-800", bg: "bg-zinc-950/20", border: "border-zinc-800", text: "text-zinc-400" };
  };

  // Get active selected object names
  const selectedZone = zones.find((z) => z.id === formData.zoneid);
  const selectedOffering = offerings.find((o) => o.id === formData.serviceofferingid);
  const selectedTemplate = templates.find((t) => t.id === formData.templateid);
  const selectedNetwork = networks.find((n) => (n.id || n.uuid) === formData.networkid);

  const stepsList = [
    { id: 1, label: "Region", completed: !!formData.zoneid, icon: Globe },
    { id: 2, label: "Plan", completed: !!formData.serviceofferingid, icon: Cpu },
    { id: 3, label: "OS", completed: !!formData.templateid, icon: Terminal },
    { id: 4, label: "Network", completed: !!formData.networkid, icon: NetworkIcon },
    { id: 5, label: "Configure", completed: !!formData.name, icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Loading deployment options from CloudStack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/vms"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to VMs
            </Link>
            <h1 className="text-3xl font-bold mt-2">Deploy Virtual Machine</h1>
            <p className="text-zinc-400 text-sm mt-1">Configure and launch a high-performance instance instantly</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-4 py-2">
            <span className="text-xs text-zinc-400">Your Balance</span>
            <span className={`text-sm font-semibold ${balance >= VM_DEPLOYMENT_COST ? "text-emerald-400" : "text-red-400"}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Global Warnings / Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm glow-red">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Deployment Warning:</span> {error}
            </div>
            <button onClick={() => setError("")} className="underline text-xs opacity-80 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-sm glow-green">
            <Check className="h-5 w-5 shrink-0 mt-0.5 bg-emerald-950 rounded-full p-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Success!</span> {success}
              <div className="mt-2">
                <Link href="/vms" className="underline font-medium hover:text-white">View Active VMs list →</Link>
              </div>
            </div>
            <button onClick={() => setSuccess("")} className="underline text-xs opacity-80 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {warning && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">CloudStack Status:</span> {warning}
            </div>
          </div>
        )}

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Stepper & Panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stepper Navigation bar */}
            <div className="bg-[#0a0a0f] border border-zinc-800/60 rounded-2xl p-4 flex justify-between items-center overflow-x-auto gap-4">
              {stepsList.map((s, idx) => {
                const StepIcon = s.icon;
                const isActive = step === s.id;
                const isCompleted = s.completed;
                const canNavigate = idx === 0 || stepsList[idx - 1].completed;

                return (
                  <button
                    key={s.id}
                    disabled={!canNavigate}
                    onClick={() => setStep(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                      isActive 
                        ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                        : isCompleted
                        ? "bg-purple-950/20 border-purple-800/50 text-purple-400 cursor-pointer"
                        : "bg-transparent border-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${
                      isActive ? "bg-white text-purple-700" : isCompleted ? "bg-purple-500/20 text-purple-400" : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {isCompleted && !isActive ? <Check className="h-3 w-3" /> : s.id}
                    </span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Stepper Panels */}
            <div className="bg-[#0a0a0f] border border-zinc-800/80 rounded-2xl p-6 min-h-[400px] flex flex-col justify-between shadow-card">
              
              {/* Step 1: Region / Zone Selection */}
              {step === 1 && (
                <div className="animate-scale-in">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Globe className="text-purple-400 h-5 w-5" /> Select Zone (Region)
                  </h2>
                  <p className="text-zinc-400 text-sm mb-6">Choose a deployment region for your virtual server instance.</p>
                  
                  {zones.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                      No zones returned from CloudStack API.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {zones.map((zone) => {
                        const isSelected = formData.zoneid === zone.id;
                        return (
                          <div
                            key={zone.id}
                            onClick={() => handleZoneSelect(zone.id)}
                            className={`p-5 rounded-2xl cursor-pointer border-2 transition-all flex items-start gap-4 hover:border-zinc-700 ${
                              isSelected
                                ? "bg-purple-950/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                : "bg-zinc-950/40 border-zinc-900"
                            }`}
                          >
                            <div className={`p-3 rounded-xl border ${
                              isSelected ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}>
                              <Globe className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-white">{zone.name}</h4>
                                {isSelected && <Check className="h-4 w-4 text-purple-400" />}
                              </div>
                              <p className="text-xs text-zinc-400 mt-1 capitalize">Network Type: {zone.networktype}</p>
                              <span className="inline-block px-2 py-0.5 bg-zinc-800/80 rounded text-[10px] text-zinc-500 mt-3 font-mono">
                                ID: {zone.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Plan Selection */}
              {step === 2 && (
                <div className="animate-scale-in">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Cpu className="text-purple-400 h-5 w-5" /> Select Service Offering (Plan)
                  </h2>
                  <p className="text-zinc-400 text-sm mb-6">Choose compute capacity, RAM limits, and CPU allocations.</p>

                  {offerings.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                      No service offerings returned from CloudStack API.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {offerings.map((offering) => {
                        const isSelected = formData.serviceofferingid === offering.id;
                        return (
                          <div
                            key={offering.id}
                            onClick={() => handleOfferingSelect(offering.id)}
                            className={`p-5 rounded-2xl cursor-pointer border-2 transition-all flex items-start gap-4 hover:border-zinc-700 ${
                              isSelected
                                ? "bg-purple-950/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                : "bg-zinc-950/40 border-zinc-900"
                            }`}
                          >
                            <div className={`p-3 rounded-xl border ${
                              isSelected ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}>
                              <Server className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-white">{offering.name}</h4>
                                {isSelected && <Check className="h-4 w-4 text-purple-400" />}
                              </div>
                              
                              <div className="flex gap-4 mt-3 text-xs text-zinc-300">
                                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800/80 px-2 py-1 rounded-lg">
                                  <Layers className="h-3 w-3 text-zinc-500" />
                                  <span>{offering.cpunumber} CPU Cores</span>
                                </div>
                                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800/80 px-2 py-1 rounded-lg">
                                  <Cpu className="h-3 w-3 text-zinc-500" />
                                  <span>{(offering.memory / 1024).toFixed(1)} GB RAM</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-3 truncate font-mono">
                                ID: {offering.id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: OS / Template Selection */}
              {step === 3 && (
                <div className="animate-scale-in">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Terminal className="text-purple-400 h-5 w-5" /> Select Operating System
                  </h2>
                  <p className="text-zinc-400 text-sm mb-6">Select your system image template (OS distribution).</p>

                  {templates.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                      No OS templates returned from CloudStack API.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template) => {
                        const isSelected = formData.templateid === template.id;
                        const os = getOSDetails(template.name);
                        return (
                          <div
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            className={`p-5 rounded-2xl cursor-pointer border-2 transition-all flex items-start gap-4 hover:border-zinc-700 ${
                              isSelected
                                ? "bg-purple-950/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                : "bg-zinc-950/40 border-zinc-900"
                            }`}
                          >
                            <div className={`p-3 rounded-xl border text-xl font-bold ${
                              isSelected ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}>
                              💻
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-white truncate max-w-[150px]" title={template.name}>
                                  {template.name}
                                </h4>
                                {isSelected && <Check className="h-4 w-4 text-purple-400" />}
                              </div>
                              <p className="text-xs text-zinc-400 mt-1 capitalize">OS Type: {template.ostypename}</p>
                              
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold mt-3 ${os.bg} ${os.border} ${os.text}`}>
                                {os.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Network Selection */}
              {step === 4 && (
                <div className="animate-scale-in">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <NetworkIcon className="text-purple-400 h-5 w-5" /> Select Network
                  </h2>
                  <p className="text-zinc-400 text-sm mb-6">Choose an isolated or shared network segment inside this zone.</p>

                  {!formData.zoneid ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                      Please select a Zone in step 1 first.
                    </div>
                  ) : loadingNetworks ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <RefreshCw className="h-6 w-6 text-purple-500 animate-spin" />
                      <p className="text-zinc-500 text-xs">Querying networks for zone...</p>
                    </div>
                  ) : networks.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                      No networks available in the selected zone.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {networks.map((network, index) => {
                        const networkVal = network.id || network.uuid || "";
                        const isSelected = formData.networkid === networkVal;
                        const label = network.name || network.displaytext || "Default network";

                        return (
                          <div
                            key={`network-${index}-${networkVal}`}
                            onClick={() => handleNetworkSelect(networkVal)}
                            className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex items-center justify-between hover:border-zinc-800 ${
                              isSelected
                                ? "bg-purple-950/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                : "bg-zinc-950/40 border-zinc-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg border ${
                                isSelected ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                              }`}>
                                <NetworkIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-white">{label}</h4>
                                <div className="flex gap-2 items-center text-[10px] text-zinc-400 mt-0.5">
                                  {network.traffictype && <span className="capitalize">{network.traffictype}</span>}
                                  {network.networkofferingname && (
                                    <>
                                      <span className="text-zinc-600">•</span>
                                      <span>{network.networkofferingname}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-purple-400" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Configure & Summary */}
              {step === 5 && (
                <div className="animate-scale-in space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Settings className="text-purple-400 h-5 w-5" /> Configure Instance
                    </h2>
                    <p className="text-zinc-400 text-sm">Assign an identifier name and submit the instance deployment.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Instance Name (Hostname)
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. prod-web-vm-01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Display Label (Friendly Name)
                      </label>
                      <input
                        type="text"
                        value={formData.displayname}
                        onChange={(e) => setFormData({ ...formData, displayname: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. Production Web server"
                      />
                    </div>
                  </form>

                  {/* Summary Block */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Deployment Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500 block text-xs">Target Region</span>
                        <span className="text-zinc-200 font-medium">{selectedZone?.name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-xs">Instance Plan</span>
                        <span className="text-zinc-200 font-medium">{selectedOffering?.name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-xs">Operating System</span>
                        <span className="text-zinc-200 font-medium">{selectedTemplate?.name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-xs">Network segment</span>
                        <span className="text-zinc-200 font-medium">{selectedNetwork?.name || selectedNetwork?.displaytext || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex justify-between items-center border-t border-zinc-900 pt-6 mt-8">
                <button
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-900 transition-colors flex items-center gap-1.5 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>

                {step < 5 ? (
                  <button
                    disabled={
                      (step === 1 && !formData.zoneid) ||
                      (step === 2 && !formData.serviceofferingid) ||
                      (step === 3 && !formData.templateid) ||
                      (step === 4 && !formData.networkid)
                    }
                    onClick={() => setStep(step + 1)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] flex items-center gap-1.5 disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    disabled={deploying || !formData.name || balance < VM_DEPLOYMENT_COST}
                    onClick={handleSubmit}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {deploying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Deploying instance...
                      </>
                    ) : (
                      `Deploy instance - $${VM_DEPLOYMENT_COST.toFixed(2)}`
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Monthly Estimate Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0f] border border-zinc-800/80 rounded-2xl p-6 sticky top-8 shadow-card flex flex-col justify-between">
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Monthly Estimate</h3>
                <div className="mb-6">
                  <div className="text-3xl font-extrabold text-white flex items-baseline gap-1.5">
                    <span>₹{(VM_DEPLOYMENT_COST * INR_EXCHANGE_RATE).toLocaleString()}</span>
                    <span className="text-xs font-normal text-zinc-400">/mo</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Equivalent to <span className="font-semibold text-zinc-400">${VM_DEPLOYMENT_COST.toFixed(2)}/mo</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-zinc-900 pt-4 mb-6 text-xs">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-zinc-500 font-medium shrink-0">Region</span>
                    <span className="text-zinc-300 text-right font-semibold truncate max-w-[140px]" title={selectedZone?.name}>
                      {selectedZone?.name || <span className="text-zinc-600 italic">Not selected</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-zinc-500 font-medium shrink-0">Plan</span>
                    <span className="text-zinc-300 text-right font-semibold truncate max-w-[140px]" title={selectedOffering?.name}>
                      {selectedOffering?.name || <span className="text-zinc-600 italic">Not selected</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-zinc-500 font-medium shrink-0">OS</span>
                    <span className="text-zinc-300 text-right font-semibold truncate max-w-[140px]" title={selectedTemplate?.name}>
                      {selectedTemplate?.name || <span className="text-zinc-600 italic">Not selected</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-zinc-500 font-medium shrink-0">Network</span>
                    <span className="text-zinc-300 text-right font-semibold truncate max-w-[140px]" title={selectedNetwork?.name || selectedNetwork?.displaytext}>
                      {selectedNetwork?.name || selectedNetwork?.displaytext || <span className="text-zinc-600 italic">Not selected</span>}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Subtotal</span>
                    <span>₹{(VM_DEPLOYMENT_COST * INR_EXCHANGE_RATE).toFixed(2)} (${VM_DEPLOYMENT_COST.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Tax (18% GST)</span>
                    <span>₹{(VM_DEPLOYMENT_COST * INR_EXCHANGE_RATE * 0.18).toFixed(2)} (${(VM_DEPLOYMENT_COST * 0.18).toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold border-t border-zinc-900 pt-3 text-white">
                    <span>Total Amount</span>
                    <span className="text-purple-400 text-glow">
                      ₹{(VM_DEPLOYMENT_COST * INR_EXCHANGE_RATE * 1.18).toFixed(2)} (${(VM_DEPLOYMENT_COST * 1.18).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Warning */}
              {balance < VM_DEPLOYMENT_COST && (
                <div className="mt-6 p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-[11px] text-red-400 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>INSUFFICIENT BALANCE</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    You need at least <span className="text-white font-semibold">${VM_DEPLOYMENT_COST.toFixed(2)}</span> to deploy, but your current balance is <span className="text-red-300 font-semibold">${balance.toFixed(2)}</span>.
                  </p>
                  <Link
                    href={`/dashboard/billing/topup?returnTo=/vms/deploy&amount=${VM_DEPLOYMENT_COST}`}
                    className="block text-center py-2 bg-red-950/40 border border-red-800/50 hover:bg-red-900/30 rounded-lg text-white font-bold transition-all mt-1"
                  >
                    Add Wallet Amount
                  </Link>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
