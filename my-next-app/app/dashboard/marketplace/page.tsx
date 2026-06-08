"use client";

import { useState } from "react";
import {
  LayoutGrid,
  AppWindow,
  FileCode,
  Search,
  Star,
  Download,
  ChevronRight,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "apps", label: "Apps", icon: AppWindow },
  { id: "templates", label: "Templates", icon: FileCode },
];

const FEATURED = [
  {
    id: "f1",
    name: "WordPress",
    category: "CMS",
    rating: 4.8,
    downloads: "12k",
    desc: "Popular content management system",
    icon: "W",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
  },
  {
    id: "f2",
    name: "Docker",
    category: "DevOps",
    rating: 4.9,
    downloads: "28k",
    desc: "Container platform for developers",
    icon: "D",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
  },
  {
    id: "f3",
    name: "Nginx",
    category: "Web Server",
    rating: 4.7,
    downloads: "45k",
    desc: "High-performance web server",
    icon: "N",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
];

const APPS = [
  { id: "a1", name: "MySQL", category: "Database", rating: 4.6, downloads: "18k", desc: "Open-source relational database" },
  { id: "a2", name: "Redis", category: "Cache", rating: 4.8, downloads: "22k", desc: "In-memory data structure store" },
  { id: "a3", name: "MongoDB", category: "Database", rating: 4.5, downloads: "15k", desc: "NoSQL document database" },
  { id: "a4", name: "Jenkins", category: "CI/CD", rating: 4.4, downloads: "9k", desc: "Automation server for CI/CD" },
  { id: "a5", name: "Prometheus", category: "Monitoring", rating: 4.7, downloads: "11k", desc: "Systems monitoring and alerting" },
  { id: "a6", name: "Grafana", category: "Monitoring", rating: 4.8, downloads: "14k", desc: "Analytics and interactive visualization" },
];

const TEMPLATES = [
  { id: "t1", name: "LAMP Stack", os: "Ubuntu 22.04", desc: "Linux, Apache, MySQL, PHP", size: "2.1 GB" },
  { id: "t2", name: "MEAN Stack", os: "Ubuntu 22.04", desc: "MongoDB, Express, Angular, Node.js", size: "1.8 GB" },
  { id: "t3", name: "MERN Stack", os: "Ubuntu 22.04", desc: "MongoDB, Express, React, Node.js", size: "1.9 GB" },
  { id: "t4", name: "Django", os: "Ubuntu 22.04", desc: "Python Django web framework", size: "1.5 GB" },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");

  const filteredApps = APPS.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            One-click apps and templates for your cloud instances.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
        <input
          type="text"
          placeholder="Search apps, templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-[#0a0a0f]/60 border border-[#1a1a2e] rounded-xl text-sm text-[#e5e7eb] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
        />
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED.map((item) => (
              <div
                key={item.id}
                className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 hover:border-[#1a1a2e]/60 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`h-11 w-11 ${item.iconBg} rounded-xl flex items-center justify-center text-lg font-bold ${item.iconColor}`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    {item.rating}
                  </div>
                </div>
                <div className="font-semibold text-white mb-1">{item.name}</div>
                <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                  {item.category}
                </div>
                <div className="text-sm text-[#9ca3af] mb-4">{item.desc}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-[#6b7280]">
                    <Download className="h-3.5 w-3.5" />
                    {item.downloads}
                  </div>
                  <button className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    Deploy <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apps Tab */}
      {activeTab === "apps" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 hover:border-[#1a1a2e]/60 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-11 w-11 bg-purple-500/15 rounded-xl flex items-center justify-center text-lg font-bold text-purple-400">
                  {app.name[0]}
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {app.rating}
                </div>
              </div>
              <div className="font-semibold text-white mb-1">{app.name}</div>
              <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                {app.category}
              </div>
              <div className="text-sm text-[#9ca3af] mb-4">{app.desc}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-[#6b7280]">
                  <Download className="h-3.5 w-3.5" />
                  {app.downloads}
                </div>
                <button className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  Deploy <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-full p-8 text-center text-[#6b7280] text-sm">
              No apps found.
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a2e]">
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Template
                </th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  OS
                </th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Size
                </th>
                <th className="text-right p-4 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATES.map((tmpl) => (
                <tr
                  key={tmpl.id}
                  className="border-b border-[#1a1a2e]/40 hover:bg-[#0a0a0f]/40 transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-white">
                    {tmpl.name}
                  </td>
                  <td className="p-4 text-sm text-[#9ca3af]">{tmpl.os}</td>
                  <td className="p-4 text-sm text-[#9ca3af]">{tmpl.desc}</td>
                  <td className="p-4 text-sm text-[#9ca3af]">{tmpl.size}</td>
                  <td className="p-4 text-right">
                    <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      Deploy →
                    </button>
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
