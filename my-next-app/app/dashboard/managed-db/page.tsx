"use client";

import { useState } from "react";
import {
  Database,
  HardDrive,
  Link2,
  Save,
  Plus,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";

const CLUSTERS = [
  {
    id: "pg-1",
    name: "prod-api-db",
    region: "Mumbai",
    status: "Active",
    version: "PostgreSQL 15",
    storage: "100 GB",
    connections: 42,
    backups: "Enabled",
  },
  {
    id: "pg-2",
    name: "staging-db",
    region: "Singapore",
    status: "Active",
    version: "PostgreSQL 15",
    storage: "40 GB",
    connections: 8,
    backups: "Enabled",
  },
  {
    id: "pg-3",
    name: "analytics-warehouse",
    region: "Frankfurt",
    status: "Maintenance",
    version: "PostgreSQL 14",
    storage: "500 GB",
    connections: 0,
    backups: "Paused",
  },
];

const STATS = [
  { title: "Active Clusters", value: "3", icon: Database, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
  { title: "Total Storage", value: "640 GB", icon: HardDrive, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
  { title: "Active Connections", value: "50", icon: Link2, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
  { title: "Backups", value: "12", icon: Save, iconBg: "bg-amber-500/15", iconColor: "text-amber-400" },
];

export default function ManagedDBPage() {
  const [search, setSearch] = useState("");

  const filtered = CLUSTERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Managed PostgreSQL</h1>
          <p className="text-sm text-[#6b7280] mt-1">Fully managed PostgreSQL clusters.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-600/20">
          <Plus className="h-4 w-4" />
          Create Cluster
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

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search clusters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-[#e5e7eb] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/60 border border-[#1a1a2e] rounded-xl text-sm text-[#d1d5db] hover:bg-zinc-700/60 transition-all">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a2e]">
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Name</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Region</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Status</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Version</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Storage</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Connections</th>
              <th className="text-right p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cluster) => (
              <tr key={cluster.id} className="border-b border-[#1a1a2e]/40 hover:bg-[#0a0a0f]/40 transition-colors">
                <td className="p-4 text-sm font-medium text-white">{cluster.name}</td>
                <td className="p-4 text-sm text-[#9ca3af]">{cluster.region}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    cluster.status === "Active"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cluster.status === "Active" ? "bg-emerald-400" : "bg-amber-400"}`} />
                    {cluster.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-[#9ca3af]">{cluster.version}</td>
                <td className="p-4 text-sm text-[#9ca3af]">{cluster.storage}</td>
                <td className="p-4 text-sm text-[#9ca3af]">{cluster.connections}</td>
                <td className="p-4 text-right">
                  <button className="p-2 text-[#6b7280] hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#6b7280] text-sm">No clusters found.</div>
        )}
      </div>
    </div>
  );
}
