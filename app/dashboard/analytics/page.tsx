"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Server, Wallet, Activity, Cpu } from "lucide-react";

// --- Mock Data ---

const VM_USAGE_DATA = [
  { day: "Mon", vms: 3 },
  { day: "Tue", vms: 4 },
  { day: "Wed", vms: 4 },
  { day: "Thu", vms: 5 },
  { day: "Fri", vms: 7 },
  { day: "Sat", vms: 6 },
  { day: "Sun", vms: 8 },
];

const MONTHLY_SPEND_DATA = [
  { month: "Jan", amount: 2400 },
  { month: "Feb", amount: 1800 },
  { month: "Mar", amount: 3200 },
  { month: "Apr", amount: 2800 },
  { month: "May", amount: 4100 },
  { month: "Jun", amount: 3600 },
];

const STATS = [
  {
    title: "Total VMs Deployed",
    value: "24",
    icon: Server,
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
  },
  {
    title: "Total Spent",
    value: "₹17,900",
    icon: Wallet,
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
  },
  {
    title: "Uptime %",
    value: "99.97%",
    icon: Activity,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    title: "Active VMs",
    value: "8",
    icon: Cpu,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
];

// --- Custom Tooltip ---

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1c] border border-[#1a1a2e] rounded-lg px-3 py-2 shadow-xl">
        <div className="text-xs text-[#9ca3af] mb-1">{label}</div>
        <div className="text-sm font-semibold text-white">
          {payload[0].value}
          {payload[0].dataKey === "amount" ? " ₹" : " VMs"}
        </div>
      </div>
    );
  }
  return null;
}

// --- Page ---

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Overview of your cloud resource usage and spending.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 hover:border-[#1a1a2e]/60 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`h-11 w-11 ${stat.iconBg} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-sm text-[#6b7280] mb-1">{stat.title}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart — VM Usage */}
        <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              VM Usage (Last 7 Days)
            </h2>
            <p className="text-sm text-[#6b7280] mt-1">
              Number of active VMs per day
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VM_USAGE_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="vms"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ fill: "#a855f7", strokeWidth: 0, r: 4 }}
                  activeDot={{
                    fill: "#a855f7",
                    stroke: "#fff",
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart — Monthly Spend */}
        <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Monthly Spend (Last 6 Months)
            </h2>
            <p className="text-sm text-[#6b7280] mt-1">
              Total cloud spending in ₹
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SPEND_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="amount"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
