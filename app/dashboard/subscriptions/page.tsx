"use client";

import { ClipboardList, Server, Zap, Crown, Cpu, Layers, HardDrive, Wifi } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    cpu: "1 vCPU",
    ram: "1 GB RAM",
    storage: "20 GB SSD",
    bandwidth: "1 TB bandwidth",
    icon: Server,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15",
  },
  {
    id: "standard",
    name: "Standard",
    price: 299,
    cpu: "2 vCPU",
    ram: "4 GB RAM",
    storage: "80 GB SSD",
    bandwidth: "2 TB bandwidth",
    icon: Zap,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15",
  },
  {
    id: "pro",
    name: "Pro",
    price: 699,
    cpu: "4 vCPU",
    ram: "8 GB RAM",
    storage: "160 GB SSD",
    bandwidth: "Unlimited bandwidth",
    icon: Crown,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Manage your cloud subscription plans.
        </p>
      </div>

      {/* No Active Subscription — Empty State */}
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-8 mb-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-zinc-800/60 rounded-2xl flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            No Active Subscription
          </h2>
          <p className="text-sm text-[#6b7280] max-w-md">
            You don't have any active subscription plan. Choose a plan below to get started with TeleCloudX cloud resources.
          </p>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6 hover:border-[#1a1a2e]/60 transition-all duration-200"
              >
                {/* Icon + Name row */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-11 w-11 ${plan.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                  </div>
                </div>

                {/* Name */}
                <div className="font-semibold text-white mb-1">{plan.name}</div>

                {/* Specs with inline icons */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <Cpu className="h-3.5 w-3.5" />
                    {plan.cpu}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <Layers className="h-3.5 w-3.5" />
                    {plan.ram}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <HardDrive className="h-3.5 w-3.5" />
                    {plan.storage}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <Wifi className="h-3.5 w-3.5" />
                    {plan.bandwidth}
                  </div>
                </div>

                {/* Price */}
                <div className="text-2xl font-bold text-white mb-5">
                  ₹{plan.price}<span className="text-sm font-normal text-[#6b7280]">/mo</span>
                </div>

                {/* Subscribe Button */}
                <button className="w-full py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition-all duration-200 shadow-lg shadow-purple-600/20">
                  Subscribe
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
