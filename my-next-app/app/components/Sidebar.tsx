"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  wip?: boolean;
  active?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Virtual Machines", href: "/vms", icon: "💻" },
  { name: "Deploy VM", href: "/vms/deploy", icon: "🚀" },
  { name: "Managed DB", href: "#", icon: "🗄️", wip: true },
  { name: "Storage", href: "#", icon: "💾", wip: true },
  { name: "Networks", href: "#", icon: "🌐", wip: true },
  { name: "Firewall", href: "#", icon: "🔥", wip: true },
  { name: "Marketplace", href: "#", icon: "🛒", wip: true },
  { name: "Subscriptions", href: "#", icon: "📋" },
  { name: "Wallet", href: "/dashboard/wallet", icon: "💰" },
  { name: "KYC Verification", href: "#", icon: "🆔" },
  { name: "Billing", href: "/dashboard/billing/topup", icon: "💳" },
  { name: "Referrals", href: "#", icon: "👥" },
  { name: "Analytics", href: "#", icon: "📈" },
  { name: "Support", href: "#", icon: "🎧" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800 h-screen sticky top-0 overflow-y-auto">
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <span className="text-lg font-bold">TelecloudX</span>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active || pathname === item.href
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {item.wip && (
                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">WIP</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </div>
    </aside>
  );
}