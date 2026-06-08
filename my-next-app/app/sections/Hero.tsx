"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { FaTelegram } from "react-icons/fa";
import Link from "next/link";
import data from "../data/landing.json";
import { ParticleSphere } from "../components/ParticleSphere";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-6 pb-16 md:pt-10 md:pb-24">
      {/* Navigation Bar */}
      <nav className="relative z-50 flex items-center justify-between py-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-bold text-white">{data.brand.name}</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#platform" className="text-sm text-gray-400 hover:text-white transition-colors">Platform</a>
          <a href="#services" className="text-sm text-gray-400 hover:text-white transition-colors">Services</a>
          <a href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="https://t.me/TeleCloudX_Bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600"
            title="Connect with Telegram Bot"
          >
            <FaTelegram className="h-4 w-4" />
            Telegram
          </a>
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Start Your Project
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
      <div className="relative isolate">
        {/* Floating orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[10%] top-[20%] h-3 w-3 rounded-full bg-primary/60 animate-float blur-[2px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[15%] top-[40%] h-2 w-2 rounded-full bg-accent/80 animate-float blur-[1px]"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[60%] bottom-[30%] h-4 w-4 rounded-full bg-primary/40 animate-float blur-[2px]"
          style={{ animationDelay: "3s" }}
        />

        {/* Top-left light leak */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-10 h-72 w-72 -rotate-45 opacity-50 blur-3xl"
          style={{ background: "linear-gradient(120deg, oklch(0.65 0.14 280 / 0.5), transparent 70%)" }}
        />

        {/* Giant ghost wordmark */}
        <div className="pointer-events-none absolute inset-x-0 top-[22%] flex justify-center overflow-hidden">
          <span className="select-none whitespace-nowrap text-[18vw] font-black tracking-tighter text-foreground/[0.035] md:text-[14vw]">
            {data.brand.name.toUpperCase()}
          </span>
        </div>

        {/* Particle sphere absolute behind */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[560px] w-[560px] max-w-full">
            <div
              aria-hidden
              className="absolute inset-10 rounded-full opacity-50 blur-3xl animate-pulse-glow"
              style={{ background: "radial-gradient(circle, var(--primary-glow), transparent 60%)" }}
            />
            <ParticleSphere className="relative h-full w-full" count={1100} scale={0.42} />
          </div>
        </div>

        {/* Centered headline overlay */}
        <div className="relative flex min-h-[520px] flex-col items-center justify-center text-center">
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium tracking-wide text-gray-400 backdrop-blur-sm mb-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
            </span>
            {data.hero.eyebrow}
          </div>
          <h1
            className={`text-balance text-4xl font-medium leading-[1.1] tracking-tight md:text-6xl lg:text-7xl transition-all duration-1000 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            Building <em className="not-italic font-semibold italic gradient-text">Cloud</em>
            <br />
            <em className="not-italic font-semibold italic gradient-text">Solutions</em> That Matter
          </h1>
          <p
            className={`mt-6 max-w-lg text-sm text-gray-400 md:text-base transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {data.hero.subtitle}
          </p>
          <div
            className={`mt-8 flex flex-wrap items-center justify-center gap-4 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:scale-105 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {data.hero.primaryCta}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#services"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white transition-all hover:border-purple-500/40 hover:bg-white/10"
            >
              <Play className="h-4 w-4 fill-white text-white" />
              {data.hero.secondaryCta}
            </a>
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="relative mt-8 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 md:gap-12">
          {data.hero.stats.map((s, i) => (
            <div
              key={s.label}
              className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              <div className="text-2xl font-bold md:text-4xl gradient-text">{s.value}</div>
              <div className="mt-1.5 text-[11px] uppercase tracking-wider text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}