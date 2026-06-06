"use client";

import { useEffect, useRef, useState } from "react";

export default function CTA() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div
          className={`relative overflow-hidden rounded-3xl border border-white/10 p-10 md:p-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl" />

          <p className="text-xs text-gray-500 relative">&ldquo; We move fast — but never at the cost of quality or integrity.</p>

          <div className="relative mt-10 grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-balance text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
                Let's Build Something{" "}
                <span className="block gradient-text font-bold italic">
                  That Connects
                </span>
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="mailto:hello@telecloudx.com"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 transition-all hover:scale-105"
                >
                  Start a Project
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <a
                  href="#services"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white transition-all hover:border-purple-500/40"
                >
                  Explore Our Work
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform group-hover:translate-x-1">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
              <p className="mt-8 max-w-md text-sm text-gray-500 leading-relaxed">
                We're built to build for good, for growth, and for the greater impact. What will we build with you?
              </p>
            </div>

            <div className="relative aspect-square w-full max-w-sm mx-auto">
              <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-3xl" />
              <img
                src="/cta-figure.jpg"
                alt="Floating figure"
                width={1024}
                height={1024}
                loading="lazy"
                className="relative h-full w-full object-contain opacity-60"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
