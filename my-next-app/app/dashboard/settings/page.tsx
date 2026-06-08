"use client";

import { useState } from "react";
import {
  User,
  Shield,
  Key,
  Users,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

const API_KEYS = [
  { id: "key-1", name: "Production API Key", key: "tc_live_51H8m...x9K2", created: "Jun 1, 2026", lastUsed: "2 hours ago" },
  { id: "key-2", name: "Development API Key", key: "tc_test_8J2n...p4L7", created: "May 15, 2026", lastUsed: "1 day ago" },
];

const REFERRALS = [
  { id: "ref-1", email: "friend1@example.com", status: "Active", credits: "₹500", joined: "Jun 5, 2026" },
  { id: "ref-2", email: "friend2@example.com", status: "Pending", credits: "—", joined: "—" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#6b7280] mt-1">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-56 shrink-0">
          <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-2 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? tab.id === "danger"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-purple-600/15 text-purple-400 border border-purple-500/20"
                      : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#6b7280] mb-2">Full Name</label>
                  <input type="text" defaultValue="Aryan Sharma" className="w-full h-11 px-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-2">Email</label>
                  <input type="email" defaultValue="aryan@example.com" className="w-full h-11 px-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-2">Phone</label>
                  <input type="tel" defaultValue="+91 98765 43210" className="w-full h-11 px-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-2">Company</label>
                  <input type="text" defaultValue="TeleCloudX" className="w-full h-11 px-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                </div>
              </div>
              <div className="pt-4 border-t border-[#1a1a2e]">
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-600/20">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full h-11 px-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full h-11 px-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-2">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full h-11 px-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-[#1a1a2e]">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-600/20">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#d1d5db]">Authenticator App</div>
                    <div className="text-sm text-[#6b7280]">Use an authenticator app to generate codes</div>
                  </div>
                  <button className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] text-[#d1d5db] rounded-lg text-sm font-medium border border-[#1a1a2e] transition-all">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === "apikeys" && (
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">API Keys</h2>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-600/20">
                  <Key className="h-4 w-4" />
                  Generate Key
                </button>
              </div>
              <div className="space-y-4">
                {API_KEYS.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 bg-[#0a0a0f]/40 rounded-xl border border-[#1a1a2e]/40">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-white">{apiKey.name}</div>
                      <div className="text-xs text-[#6b7280]">{apiKey.created}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 px-3 py-2 bg-zinc-800/60 rounded-lg font-mono text-sm text-[#9ca3af]">
                        {showKey === apiKey.id ? apiKey.key : apiKey.key.replace(/./g, "•")}
                      </div>
                      <button
                        onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                        className="p-2 text-[#6b7280] hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                      >
                        {showKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(apiKey.key, apiKey.id)}
                        className="p-2 text-[#6b7280] hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                      >
                        {copied === apiKey.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="text-xs text-[#6b7280] mt-2">Last used: {apiKey.lastUsed}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <div className="space-y-6">
              <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Your Referral Code</h2>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl font-mono text-sm text-[#d1d5db]">
                    TELECLOUDX-ARYAN-2026
                  </div>
                  <button
                    onClick={() => handleCopy("TELECLOUDX-ARYAN-2026", "referral")}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    {copied === "referral" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mt-4 text-sm text-[#6b7280]">
                  Share your code and earn ₹500 in credits for each friend who signs up and deploys their first VM.
                </div>
              </div>

              <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Referred Friends</h2>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1a1a2e]">
                        <th className="text-left p-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Email</th>
                        <th className="text-left p-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Status</th>
                        <th className="text-left p-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Credits Earned</th>
                        <th className="text-left p-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REFERRALS.map((ref) => (
                        <tr key={ref.id} className="border-b border-[#1a1a2e]/40">
                          <td className="p-3 text-sm text-[#d1d5db]">{ref.email}</td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                              ref.status === "Active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            }`}>
                              {ref.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-[#9ca3af]">{ref.credits}</td>
                          <td className="p-3 text-sm text-[#6b7280]">{ref.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && (
            <div className="bg-[#0a0a0f] border border-red-500/20 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-500/15 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
                  <p className="text-sm text-[#6b7280]">Irreversible account actions.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1a2e] space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Delete All VMs</div>
                    <div className="text-sm text-[#6b7280]">Permanently delete all virtual machines</div>
                  </div>
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-all">
                    Delete VMs
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Close Account</div>
                    <div className="text-sm text-[#6b7280]">Permanently close your TeleCloudX account</div>
                  </div>
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-all">
                    Close Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
