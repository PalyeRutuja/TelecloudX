"use client";

import { useState } from "react";
import { Network, Server, Globe, Plus, MoreHorizontal } from "lucide-react";

const VPCS = [
  { id: "vpc-1", name: "prod-vpc", region: "Mumbai", cidr: "10.0.0.0/16", status: "Active", subnets: 3 },
  { id: "vpc-2", name: "staging-vpc", region: "Singapore", cidr: "172.16.0.0/16", status: "Active", subnets: 2 },
];

const SUBNETS = [
  { id: "sn-1", name: "web-tier", vpc: "prod-vpc", cidr: "10.0.1.0/24", zone: "Mumbai-1a", ips: 12 },
  { id: "sn-2", name: "app-tier", vpc: "prod-vpc", cidr: "10.0.2.0/24", zone: "Mumbai-1b", ips: 8 },
  { id: "sn-3", name: "db-tier", vpc: "prod-vpc", cidr: "10.0.3.0/24", zone: "Mumbai-1c", ips: 4 },
];

const PORTABLE_IPS = [
  { id: "ip-1", address: "43.204.12.45", region: "Mumbai", attachedTo: "web-server-01", status: "Attached" },
  { id: "ip-2", address: "43.204.12.67", region: "Mumbai", attachedTo: "—", status: "Detached" },
  { id: "ip-3", address: "18.141.22.11", region: "Singapore", attachedTo: "api-gateway", status: "Attached" },
];

const TABS = [
  { id: "vpcs", label: "VPCs", icon: Network },
  { id: "subnets", label: "Subnets", icon: Server },
  { id: "ips", label: "Portable IPs", icon: Globe },
];

export default function NetworksPage() {
  const [activeTab, setActiveTab] = useState("vpcs");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Networking</h1>
          <p className="text-sm text-[#6b7280] mt-1">Manage VPCs, subnets, and portable IPs.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-600/20">
          <Plus className="h-4 w-4" />
          Create VPC
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#1a1a2e]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-[#6b7280] hover:text-[#d1d5db]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* VPCs Tab */}
      {activeTab === "vpcs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VPCS.map((vpc) => (
            <div key={vpc.id} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 hover:border-[#1a1a2e]/60 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
                  <Network className="h-5 w-5 text-purple-400" />
                </div>
                <button className="p-2 text-[#6b7280] hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <div className="font-semibold text-white mb-1">{vpc.name}</div>
              <div className="text-sm text-[#6b7280] mb-4">{vpc.region}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7280]">CIDR</span>
                  <span className="text-[#d1d5db] font-mono">{vpc.cidr}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7280]">Subnets</span>
                  <span className="text-[#d1d5db]">{vpc.subnets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7280]">Status</span>
                  <span className="text-emerald-400">{vpc.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subnets Tab */}
      {activeTab === "subnets" && (
        <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a2e]">
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Name</th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">VPC</th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">CIDR</th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Zone</th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Used IPs</th>
              </tr>
            </thead>
            <tbody>
              {SUBNETS.map((sn) => (
                <tr key={sn.id} className="border-b border-[#1a1a2e]/40 hover:bg-[#0a0a0f]/40 transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{sn.name}</td>
                  <td className="p-4 text-sm text-[#9ca3af]">{sn.vpc}</td>
                  <td className="p-4 text-sm text-[#9ca3af] font-mono">{sn.cidr}</td>
                  <td className="p-4 text-sm text-[#9ca3af]">{sn.zone}</td>
                  <td className="p-4 text-sm text-[#9ca3af]">{sn.ips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Portable IPs Tab */}
      {activeTab === "ips" && (
        <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a2e]">
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">IP Address</th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Region</th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Attached To</th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {PORTABLE_IPS.map((ip) => (
                <tr key={ip.id} className="border-b border-[#1a1a2e]/40 hover:bg-[#0a0a0f]/40 transition-colors">
                  <td className="p-4 text-sm font-medium text-white font-mono">{ip.address}</td>
                  <td className="p-4 text-sm text-[#9ca3af]">{ip.region}</td>
                  <td className="p-4 text-sm text-[#9ca3af]">{ip.attachedTo}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      ip.status === "Attached"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : "bg-zinc-800 text-[#6b7280] border-[#1a1a2e]"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${ip.status === "Attached" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                      {ip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
