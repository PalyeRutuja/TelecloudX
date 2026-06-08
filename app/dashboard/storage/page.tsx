"use client";

import { useState } from "react";
import {
  HardDrive,
  Database,
  Link,
  Camera,
  Plus,
  MoreHorizontal,
  Search,
} from "lucide-react";

const VOLUMES = [
  {
    id: "vol-1",
    name: "web-server-disk",
    size: 80,
    used: 45,
    region: "Mumbai",
    attachedTo: "web-server-01",
    status: "Attached",
  },
  {
    id: "vol-2",
    name: "db-data-volume",
    size: 200,
    used: 120,
    region: "Singapore",
    attachedTo: "prod-api-db",
    status: "Attached",
  },
  {
    id: "vol-3",
    name: "backup-storage",
    size: 500,
    used: 0,
    region: "Frankfurt",
    attachedTo: "—",
    status: "Detached",
  },
];

const STATS = [
  { title: "Total Volumes", value: "3", icon: HardDrive, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
  { title: "Total Capacity", value: "780 GB", icon: Database, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
  { title: "Attached", value: "2", icon: Link, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
  { title: "Snapshots", value: "8", icon: Camera, iconBg: "bg-amber-500/15", iconColor: "text-amber-400" },
];

export default function StoragePage() {
  const [search, setSearch] = useState("");

  const filtered = VOLUMES.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Block Storage</h1>
          <p className="text-sm text-[#6b7280] mt-1">High-performance SSD volumes for your VMs.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-600/20">
          <Plus className="h-4 w-4" />
          Create Volume
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
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
        <input
          type="text"
          placeholder="Search volumes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-[#e5e7eb] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
        />
      </div>

      {/* Volume Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((vol) => {
          const pct = Math.round((vol.used / vol.size) * 100);
          return (
            <div key={vol.id} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 hover:border-[#1a1a2e]/60 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-purple-400" />
                </div>
                <button className="p-2 text-[#6b7280] hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="font-semibold text-white mb-1">{vol.name}</div>
              <div className="text-sm text-[#6b7280] mb-4">{vol.region}</div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#9ca3af]">{vol.used} GB used</span>
                  <span className="text-[#6b7280]">{vol.size} GB</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9ca3af]">Attached to: <span className="text-[#d1d5db]">{vol.attachedTo}</span></span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                  vol.status === "Attached"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-zinc-800 text-[#6b7280]"
                }`}>
                  {vol.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-[#6b7280] text-sm">No volumes found.</div>
      )}
    </div>
  );
}
