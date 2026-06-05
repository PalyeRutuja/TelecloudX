"use client";

import { useEffect, useState } from "react";
import ParticleBackground from "../components/ParticleBackground";
import Sphere3D from "../components/Sphere3D";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Diagonal light beam */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="diagonal-beam animate-glow-pulse"
          style={{ left: "20%", top: "-25%" }}
        />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />

      {/* Particle background */}
      <ParticleBackground />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side */}
          <div className="space-y-8">
            <h1
              className={`text-5xl md:text-6xl lg:text-7xl font-black leading-tight transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <span className="block text-white">
                Transforming Ideas
              </span>
              <span className="block text-white">
                Into{" "}
                <span className="gradient-text">Digital</span>
              </span>
              <span className="block gradient-text">Experiences</span>
            </h1>

            <p
              className={`text-gray-400 text-lg max-w-lg leading-relaxed transition-all duration-1000 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              Next-generation cloud infrastructure and telecom analytics powered by AI. 
              Build, deploy, and scale with intelligence.
            </p>

            <div
              className={`flex flex-wrap gap-4 transition-all duration-1000 delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <a
                href="#services"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
              >
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a
                href="#portfolio"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-full transition-all duration-300 hover:bg-white/5 hover:border-white/40"
              >
                View Portfolio
              </a>
            </div>
          </div>

          {/* Right side - 3D Sphere */}
          <div
            className={`flex justify-center items-center transition-all duration-1000 delay-700 relative z-20 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <Sphere3D />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
