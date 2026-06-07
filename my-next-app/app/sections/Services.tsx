"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Cloud, MessageSquare, Cpu, BarChart3, Shield, ChevronRight, ArrowUpRight } from "lucide-react";
import data from "../data/landing.json";

const serviceIcons = [Phone, Cloud, MessageSquare, Cpu, BarChart3, Shield] as const;

const vmsContent = {
  items: ["Instant Number Provisioning", "Global SIP Trunking", "IVR & Call Routing", "Voicemail & Recording"],
  tools: ["SIP", "WebRTC", "Asterisk", "AWS"]
};

export default function Services() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const cards = sectionRef.current?.querySelectorAll("[data-index]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-10 flex items-start justify-between gap-6">
          <h2 className="text-3xl font-semibold md:text-4xl text-white">Our Services</h2>
          <p className="max-w-xs text-xs text-gray-500 leading-relaxed">
            We offer comprehensive cloud-communication solutions that transform your business across every touchpoint.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.services.map((s, i) => {
            const SIcon = serviceIcons[i];
            const isActive = i === activeIdx;
            return (
              <article
                key={s.id}
                data-index={i}
                onClick={() => setActiveIdx(i)}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-all cursor-pointer ${
                  isActive
                    ? "border-purple-500/60 bg-purple-600/20"
                    : "border-white/10 bg-white/5 hover:border-purple-500/40 hover:bg-white/10"
                } ${visibleCards.has(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${i * 100}ms`, transitionDuration: "700ms" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isActive ? "bg-purple-500/20" : "bg-purple-500/10"
                  }`}>
                    <SIcon className={`h-5 w-5 ${isActive ? "text-purple-400" : "text-purple-500"}`} />
                  </div>
                  <span className={`text-sm font-mono ${isActive ? "text-purple-400/70" : "text-gray-600"}`}>
                    {s.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  {s.subtitle && (
                    <p className="text-xs mt-0.5 font-medium text-gray-500">{s.subtitle}</p>
                  )}
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>

                {/* Same items for all services */}
                <div className={`mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-xs ${isActive ? "border-white/20" : "border-white/10"}`}>
                  <div>
                    <div className={`mb-2 uppercase tracking-wider text-[10px] ${isActive ? "text-purple-400/60" : "text-gray-600"}`}>Services</div>
                    <ul className="space-y-1.5">
                      {vmsContent.items.map((it) => (
                        <li key={it} className="flex items-center gap-1.5">
                          <ChevronRight className={`h-3 w-3 ${isActive ? "text-purple-400/60" : "text-gray-600"}`} />
                          <span className={isActive ? "text-gray-300" : "text-gray-500"}>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className={`mb-2 uppercase tracking-wider text-[10px] ${isActive ? "text-purple-400/60" : "text-gray-600"}`}>Tools</div>
                    <ul className="space-y-1.5">
                      {vmsContent.tools.map((t) => (
                        <li key={t} className="flex items-center gap-1.5">
                          <ChevronRight className={`h-3 w-3 ${isActive ? "text-purple-400/60" : "text-gray-600"}`} />
                          <span className={isActive ? "text-gray-300" : "text-gray-500"}>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={isActive ? "text-purple-400/80" : "text-purple-500"}>Learn more</span>
                  <ArrowUpRight className={`h-3.5 w-3.5 ${isActive ? "text-purple-400/80" : "text-purple-500"}`} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}