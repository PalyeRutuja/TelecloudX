"use client";

import { useEffect, useRef, useState } from "react";

const projects = [
  {
    name: "Network Monitor Pro",
    category: "Telecom Analytics",
    description: "Real-time network monitoring dashboard with predictive analytics.",
    color: "from-purple-600/20 to-blue-600/20",
  },
  {
    name: "CloudScale Platform",
    category: "Cloud Infrastructure",
    description: "Auto-scaling cloud infrastructure for enterprise workloads.",
    color: "from-blue-600/20 to-cyan-600/20",
  },
  {
    name: "SecureConnect",
    category: "Security",
    description: "End-to-end encrypted communication platform for telecom operators.",
    color: "from-purple-600/20 to-pink-600/20",
  },
  {
    name: "DataFlow Analytics",
    category: "AI Insights",
    description: "Machine learning pipeline for customer behavior analysis.",
    color: "from-indigo-600/20 to-purple-600/20",
  },
];

export default function Portfolio() {
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
    <section id="portfolio" ref={sectionRef} className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm text-purple-400 uppercase tracking-wider mb-4">Our Work</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              data-index={index}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${project.color} p-8 transition-all duration-700 hover:border-purple-500/30 hover:scale-[1.02] cursor-pointer ${
                visibleCards.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Project thumbnail placeholder */}
              <div className="w-full h-48 rounded-2xl bg-white/5 mb-6 flex items-center justify-center overflow-hidden">
                <div className="text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                  {["📊", "☁️", "🔐", "🤖"][index]}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-purple-300 border border-purple-500/20">
                  {project.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-400 text-sm">{project.description}</p>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
