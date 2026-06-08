"use client";

import { useState } from "react";
import {
  Shield,
  Plus,
  Globe,
  Lock,
  Unlock,
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
} from "lucide-react";

const FIREWALLS = [
  {
    id: "fw-1",
    name: "web-tier-rules",
    rules: [
      { id: "r1", type: "Inbound", protocol: "TCP", port: "80", source: "0.0.0.0/0", action: "Allow" },
      { id: "r2", type: "Inbound", protocol: "TCP", port: "443", source: "0.0.0.0/0", action: "Allow" },
      { id: "r3", type: "Inbound", protocol: "TCP", port: "22", source: "10.0.0.0/8", action: "Allow" },
    ],
    appliedTo: "web-server-01",
    status: "Active",
  },
  {
    id: "fw-2",
    name: "db-tier-rules",
    rules: [
      { id: "r4", type: "Inbound", protocol: "TCP", port: "5432", source: "10.0.2.0/24", action: "Allow" },
      { id: "r5", type: "Inbound", protocol: "TCP", port: "22", source: "10.0.1.0/24", action: "Deny" },
    ],
    appliedTo: "prod-api-db",
    status: "Active",
  },
];

const STATS = [
  { title: "Firewalls", value: "2", icon: Shield, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
  { title: "Total Rules", value: "5", icon: Lock, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
  { title: "Allow Rules", value: "4", icon: Unlock, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
  { title: "Deny Rules", value: "1", icon: Lock, iconBg: "bg-red-500/15", iconColor: "text-red-400" },
];

export default function FirewallPage() {
  const [expanded, setExpanded] = useState<string | null>("fw-1");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Firewall</h1>
          <p className="text-sm text-[#6b7280] mt-1">Manage inbound and outbound traffic rules.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-600/20">
          <Plus className="h-4 w-4" />
          Create Firewall
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
              <div className={`h-10 w-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <div className="text-sm text-[#6b7280] mb-1">{s.title}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Firewall Groups */}
      <div className="space-y-4">
        {FIREWALLS.map((fw) => (
          <div key={fw.id} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#0a0a0f]/40 transition-colors"
              onClick={() => setExpanded(expanded === fw.id ? null : fw.id)}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">{fw.name}</div>
                  <div className="text-sm text-[#6b7280]">Applied to: <span className="text-[#d1d5db]">{fw.appliedTo}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                  {fw.status}
                </span>
                <button className="p-2 text-[#6b7280] hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Rules Table */}
            {expanded === fw.id && (
              <div className="border-t border-[#1a1a2e]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a2e]/40">
                      <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Type</th>
                      <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Protocol</th>
                      <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Port</th>
                      <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Source</th>
                      <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fw.rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-[#1a1a2e]/30 hover:bg-[#0a0a0f]/40 transition-colors">
                        <td className="p-4 text-sm text-[#d1d5db]">
                          <span className="flex items-center gap-1.5">
                            {rule.type === "Inbound" ? <ArrowDown className="h-3.5 w-3.5 text-purple-400" /> : <ArrowUp className="h-3.5 w-3.5 text-amber-400" />}
                            {rule.type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-[#9ca3af] font-mono">{rule.protocol}</td>
                        <td className="p-4 text-sm text-[#9ca3af] font-mono">{rule.port}</td>
                        <td className="p-4 text-sm text-[#9ca3af] font-mono">{rule.source}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                            rule.action === "Allow"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/15 text-red-400 border border-red-500/20"
                          }`}>
                            {rule.action === "Allow" ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            {rule.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
