"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  { title: "Discovery", description: "Understanding your infrastructure needs and goals." },
  { title: "Planning", description: "Designing the optimal cloud architecture for your business." },
  { title: "Development", description: "Building scalable solutions with cutting-edge technology." },
  { title: "Testing", description: "Rigorous quality assurance and performance optimization." },
  { title: "Deployment", description: "Seamless rollout with monitoring and support." },
];

export default function ProcessTimeline() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-step") || "0");
            setVisibleSteps((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    const items = sectionRef.current?.querySelectorAll("[data-step]");
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm text-purple-400 uppercase tracking-wider mb-4">Our Process</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            How We <span className="gradient-text">Work</span>
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600" />

          <div className="grid lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                data-step={index}
                className={`relative text-center transition-all duration-700 ${
                  visibleSteps.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Node */}
                <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-full bg-[#111118] border-2 border-purple-500/50 flex items-center justify-center glow-purple">
                  <span className="text-xl font-bold gradient-text">{index + 1}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
