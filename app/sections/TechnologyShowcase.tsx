"use client";

import { useEffect, useRef, useState } from "react";

const technologies = [
  {
    title: "Blockchain Solutions",
    description: "Decentralized infrastructure for transparent and secure telecom operations.",
    features: ["Smart Contracts", "Distributed Ledger", "Tokenization"],
  },
  {
    title: "Smart Contracts",
    description: "Automated agreement execution for SLA management and billing.",
    features: ["Auto-execution", "Immutable Records", "Cost Reduction"],
  },
  {
    title: "Web3 Infrastructure",
    description: "Decentralized web services for next-gen telecom applications.",
    features: ["IPFS Storage", "Node Networks", "dApp Integration"],
  },
  {
    title: "Cloud Architecture",
    description: "Multi-cloud and hybrid cloud solutions for telecom workloads.",
    features: ["Auto-scaling", "Multi-region", "High Availability"],
  },
];

export default function TechnologyShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm text-blue-400 uppercase tracking-wider mb-4">Technology Stack</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Our <span className="gradient-text">Technology</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Animated 3D Object placeholder */}
          <div
            className={`flex justify-center items-center h-[400px] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Floating hexagon grid */}
              <div className="relative w-64 h-64">
                {technologies.map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-20 h-20 rounded-2xl border border-purple-500/30 flex items-center justify-center cursor-pointer transition-all duration-500 ${
                      activeIndex === i
                        ? "bg-purple-600/20 border-purple-500/60 scale-110 shadow-lg shadow-purple-500/20"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                    style={{
                      top: `${Math.sin((i * Math.PI * 2) / 4) * 100 + 100}px`,
                      left: `${Math.cos((i * Math.PI * 2) / 4) * 100 + 100}px`,
                    }}
                    onClick={() => setActiveIndex(i)}
                  >
                    <span className="text-2xl">{["🔗", "📜", "🌐", "☁️"][i]}</span>
                  </div>
                ))}
                {/* Center glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-600/20 rounded-full blur-[40px]" />
              </div>
            </div>
          </div>

          {/* Right - Technology info */}
          <div
            className={`space-y-6 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            {technologies.map((tech, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  activeIndex === index
                    ? "bg-purple-600/10 border-purple-500/30"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <h3 className="text-xl font-bold text-white mb-2">{tech.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{tech.description}</p>
                <div className="flex flex-wrap gap-2">
                  {tech.features.map((feature, fi) => (
                    <span
                      key={fi}
                      className="px-3 py-1 text-xs rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
