"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const TICKETS = [
  {
    id: "TKT-1024",
    subject: "VM not responding after reboot",
    status: "Open",
    priority: "High",
    category: "Compute",
    created: "2 hours ago",
    lastUpdate: "30 min ago",
  },
  {
    id: "TKT-1023",
    subject: "Billing discrepancy on June invoice",
    status: "In Progress",
    priority: "Medium",
    category: "Billing",
    created: "1 day ago",
    lastUpdate: "4 hours ago",
  },
  {
    id: "TKT-1020",
    subject: "Request to open port 587 for SMTP",
    status: "Resolved",
    priority: "Low",
    category: "Networking",
    created: "3 days ago",
    lastUpdate: "1 day ago",
  },
  {
    id: "TKT-1015",
    subject: "PostgreSQL connection timeout",
    status: "Resolved",
    priority: "High",
    category: "Database",
    created: "1 week ago",
    lastUpdate: "5 days ago",
  },
];

const STATS = [
  { title: "Open Tickets", value: "1", icon: MessageCircle, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
  { title: "In Progress", value: "1", icon: Clock, iconBg: "bg-amber-500/15", iconColor: "text-amber-400" },
  { title: "Resolved", value: "2", icon: CheckCircle, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
  { title: "Avg Response", value: "2h", icon: AlertCircle, iconBg: "bg-purple-500/15", iconColor: "text-purple-400" },
];

function statusBadge(status: string) {
  switch (status) {
    case "Open":
      return "bg-purple-500/15 text-purple-400 border-purple-500/20";
    case "In Progress":
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "Resolved":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-zinc-800 text-[#6b7280]";
  }
}

function priorityDot(priority: string) {
  switch (priority) {
    case "High":
      return "bg-red-500";
    case "Medium":
      return "bg-amber-500";
    case "Low":
      return "bg-purple-500";
    default:
      return "bg-zinc-600";
  }
}

export default function SupportPage() {
  const [search, setSearch] = useState("");

  const filtered = TICKETS.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Open and manage support tickets.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-600/20">
          <Plus className="h-4 w-4" />
          New Ticket
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
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-[#e5e7eb] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
        />
      </div>

      {/* Tickets Table */}
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a2e]">
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Ticket</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Subject</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Category</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Priority</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Status</th>
              <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Last Update</th>
              <th className="text-right p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="border-b border-[#1a1a2e]/40 hover:bg-[#0a0a0f]/40 transition-colors">
                <td className="p-4 text-sm font-mono text-[#9ca3af]">{ticket.id}</td>
                <td className="p-4 text-sm font-medium text-white">{ticket.subject}</td>
                <td className="p-4 text-sm text-[#9ca3af]">{ticket.category}</td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-sm text-[#9ca3af]">
                    <span className={`h-2 w-2 rounded-full ${priorityDot(ticket.priority)}`} />
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-[#6b7280]">{ticket.lastUpdate}</td>
                <td className="p-4 text-right">
                  <button className="p-2 text-[#6b7280] hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#6b7280] text-sm">No tickets found.</div>
        )}
      </div>
    </div>
  );
}
