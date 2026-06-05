"use client";

import { useEffect, useRef, useState } from "react";

const services = [
  {
    icon: "☁️",
    title: "Cloud Infrastructure",
    description: "Scalable cloud solutions with auto-scaling, load balancing, and high availability across global regions.",
  },
  {
    icon: "📡",
    title: "Telecom Analytics",
    description: "Real-time network monitoring, traffic analysis, and predictive maintenance for telecom operators.",
  },
  {
    icon: "🤖",
    title: "AI Insights",
    description: "Machine learning models for anomaly detection, customer churn prediction, and revenue optimization.",
  },
  {
    icon: "🔒",
    title: "Security Dashboard",
    description: "Comprehensive security monitoring with threat detection, vulnerability scanning, and incident response.",
  },
  {
    icon: "📊",
    title: "Real-Time Metrics",
    description: "Live dashboards with customizable KPIs, alerting systems, and automated reporting tools.",
  },
  {
    icon: "🔌",
    title: "API Integrations",
    description: "Seamless integration with third-party services, billing systems, and OSS/BSS platforms.",
  },
];

export default function Services() {
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
    <section id="features" ref={sectionRef} className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm text-purple-400 uppercase tracking-wider mb-4">Our Services</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            What We{" "}
            <span className="gradient-text">Deliver</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive cloud and telecom solutions that transform your infrastructure 
            and drive innovation across every touchpoint.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              data-index={index}
              className={`glass-card rounded-3xl p-8 transition-all duration-700 ${
                visibleCards.has(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-6">{service.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>

              <div className="mt-6 flex items-center gap-2 text-purple-400 text-sm font-medium group cursor-pointer">
                <span>Learn More</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
