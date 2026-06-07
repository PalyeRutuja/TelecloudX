"use client";

import { Sparkles, Globe, Wifi, Layers } from "lucide-react";
import data from "../data/landing.json";

export default function Footer() {
  const footerLinks = [
    {
      title: "Services",
      items: ["AI Voice", "Cloud PBX", "CPaaS", "IoT Telephony", "Analytics"],
    },
    {
      title: "Solutions",
      items: ["Healthcare", "Fintech", "Retail", "Logistics"],
    },
    {
      title: "Resources",
      items: ["Documentation", "Blog", "Status", "API Reference"],
    },
    {
      title: "Company",
      items: ["About", "Careers", "Contact", "Legal"],
    },
  ];

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-[0.15em] uppercase text-white">
                {data.brand.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-gray-500 leading-relaxed">
              AI-driven cloud telephony, CPaaS APIs, and intelligent voice infrastructure that scales with your business.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Globe, label: "Global" },
                { icon: Wifi, label: "Connected" },
                { icon: Layers, label: "Scalable" },
              ].map((item) => (
                <div key={item.label} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <item.icon className="h-4 w-4 text-gray-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {footerLinks.map((col) => (
                <div key={col.title}>
                  <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    {col.title}
                  </div>
                  <ul className="space-y-2.5">
                    {col.items.map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row">
          <div className="text-xs text-gray-600">
            {data.footer.copyright}
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}