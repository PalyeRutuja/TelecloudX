"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Rocket,
  Database,
  HardDrive,
  Globe,
  Shield,
  ShoppingCart,
  ClipboardList,
  Wallet,
  BadgeCheck,
  CreditCard,
  Users,
  BarChart3,
  Headphones,
  Settings,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Deploy VM", href: "/vms/deploy", icon: Rocket },
  { name: "Managed DB", href: "/dashboard/managed-db", icon: Database, wip: true },
  { name: "Storage", href: "/dashboard/storage", icon: HardDrive, wip: true },
  { name: "Networks", href: "/dashboard/networks", icon: Globe, wip: true },
  { name: "Firewall", href: "/dashboard/firewall", icon: Shield, wip: true },
  { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingCart, wip: true },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: ClipboardList },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "KYC Verification", href: "/dashboard/kyc", icon: BadgeCheck },
  { name: "Billing", href: "/dashboard/billing/topup", icon: CreditCard },
  { name: "Referrals", href: "#", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Support", href: "/dashboard/support", icon: Headphones },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signOut error:", err);
    }
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#0d0d0f] border-r border-[#1a1a2e] h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">TelecloudX</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-purple-600/15 text-purple-400 border border-purple-500/20"
                  : "text-[#9ca3af] hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-purple-400" : ""}`} />
              <span className="flex-1">{item.name}</span>
              {item.wip && (
                <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 text-[10px] font-semibold rounded-md border border-amber-500/20">
                  WIP
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="p-3 border-t border-[#1a1a2e]">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-white/[0.03] transition-all duration-200"
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          <span>Settings</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-1"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
