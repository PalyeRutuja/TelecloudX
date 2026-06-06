"use client";

import { Zap } from "lucide-react";

const items = [
  "99.9% Uptime SLA",
  "24/7 Global Support",
  "SOC 2 Compliant",
  "HIPAA Ready",
  "GDPR Compliant",
  "Sub-100ms Latency",
  "AI-Powered Routing",
];

export default function StatsTicker() {
  return (
    <div className="border-y border-white/10 bg-white/5 py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 flex items-center gap-2 text-xs font-medium tracking-wide text-gray-500">
            <Zap className="h-3.5 w-3.5 text-purple-500" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
