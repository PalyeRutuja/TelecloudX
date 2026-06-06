"use client";

import { Globe, Shield, Zap } from "lucide-react";
import data from "../data/landing.json";

export default function Intro() {
  return (
    <section id="platform" className="mx-auto max-w-7xl px-6 py-24 md:py-36">
      <div className="grid gap-10 md:grid-cols-12 items-start">
        <p className="md:col-span-4 text-xs tracking-[0.25em] text-gray-500 uppercase">
          {data.intro.kicker}
        </p>
        <h2 className="md:col-span-8 text-balance text-3xl font-medium leading-[1.15] md:text-5xl lg:text-6xl text-white">
          {data.intro.headline}
        </h2>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { icon: Globe, title: "Global Reach", desc: "Deploy across 50+ regions with intelligent geo-routing and edge optimization." },
          { icon: Shield, title: "Enterprise Security", desc: "End-to-end encryption, SOC 2, HIPAA, and GDPR compliance out of the box." },
          { icon: Zap, title: "Instant Scale", desc: "From zero to millions of concurrent calls with zero configuration." },
        ].map((item) => (
          <div
            key={item.title}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-purple-500/40 hover:bg-white/10"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 transition-colors group-hover:border-purple-500/40 bg-gradient-to-br from-purple-600 to-blue-600">
              <item.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
