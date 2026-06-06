"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Cloud, MessageSquare, Cpu, BarChart3, Shield, ChevronRight, ArrowUpRight } from "lucide-react";

const services = [
  {
    id: "01",
    icon: Phone,
    title: "VMS",
    subtitle: "Virtual Number System",
    description: "Truly simple and flexible digital hosted solution. Get virtual numbers for any country, instant provisioning, and full SIP trunking with zero hardware.",
  },
  {
    id: "02",
    icon: Cloud,
    title: "Cloud PBX",
    subtitle: "Enterprise Phone System",
    description: "Scalable carrier-grade PBX in the cloud with global numbers, auto-attendants, and zero hardware. Perfect for remote teams and multi-office setups.",
  },
  {
    id: "03",
    icon: MessageSquare,
    title: "CPaaS APIs",
    subtitle: "Communication Platform",
    description: "Voice, SMS, and WhatsApp APIs ready to embed in any product within minutes. Programmable communications with global reach.",
  },
  {
    id: "04",
    icon: Cpu,
    title: "AI Voice",
    subtitle: "Conversational AI",
    description: "End-to-end conversational AI — from intent design to production agents that route, qualify, and close. Human-like voice automation at scale.",
  },
  {
    id: "05",
    icon: BarChart3,
    title: "IoT Telephony",
    subtitle: "Connected Devices",
    description: "Connect millions of devices with reliable, low-latency cellular and SIP networks. Built for IoT scale with secure device-to-cloud communication.",
  },
  {
    id: "06",
    icon: Shield,
    title: "Analytics",
    subtitle: "Intelligence & Insights",
    description: "Real-time dashboards, sentiment analysis, and call quality scoring out of the box. Turn every call into actionable business intelligence.",
  },
];

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

  const active = services[activeIdx];
  const ActiveIcon = active.icon;

  return (
    <section id="services" ref={sectionRef} className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-10 flex items-start justify-between gap-6">
          <h2 className="text-3xl font-semibold md:text-4xl text-white">
            Our Services
          </h2>
          <p className="max-w-xs text-xs text-gray-500 leading-relaxed">
            We offer comprehensive cloud-communication solutions that transform your business across every touchpoint.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const SIcon = service.icon;
            const isActive = index === activeIdx;
            return (
              <div
                key={service.id}
                data-index={index}
                onClick={() => setActiveIdx(index)}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-all cursor-pointer ${
                  isActive
                    ? "border-purple-500/60 bg-purple-600/20"
                    : "border-white/10 bg-white/5 hover:border-purple-500/40 hover:bg-white/10"
                } ${visibleCards.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${index * 100}ms`, transitionDuration: "700ms" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isActive ? "bg-purple-500/20" : "bg-purple-500/10"
                  }`}>
                    <SIcon className={`h-5 w-5 ${isActive ? "text-purple-400" : "text-purple-500"}`} />
                  </div>
                  <span className={`text-sm font-mono ${isActive ? "text-purple-400/70" : "text-gray-600"}`}>
                    {service.id}
                  </span>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isActive ? "text-white" : "text-white"}`}>
                    {service.title}
                  </h3>
                  <p className="text-xs mt-0.5 font-medium text-gray-500">
                    {service.subtitle}
                  </p>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
