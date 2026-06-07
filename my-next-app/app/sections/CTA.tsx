"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import data from "../data/landing.json";
import Image from "next/image";

export default function CTA() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-20 md:py-32">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 md:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.16 285 / 0.3), transparent 60%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.60 0.12 200 / 0.3), transparent 60%)" }}
        />

        <p className="text-xs text-gray-500 relative">&ldquo; {data.cta.kicker}</p>

        <div className="relative mt-10 grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-balance text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
              {data.cta.title}{" "}
              <em className="block not-italic italic font-bold gradient-text">
                {data.cta.titleAccent}
              </em>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="mailto:hello@telecloudx.com"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:scale-105 bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {data.cta.primary}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#services"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white transition-all hover:border-purple-500/40"
              >
                {data.cta.secondary}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            <p className="mt-8 max-w-md text-sm text-gray-500 leading-relaxed">
              {data.cta.body}
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-sm mx-auto">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full opacity-40 blur-3xl"
              style={{ background: "radial-gradient(circle, oklch(0.72 0.16 285 / 0.3), transparent 60%)" }}
            />
            <Image
              src="/cta-figure.jpg"
              alt="Floating figure"
              width={1024}
              height={1024}
              loading="lazy"
              className="relative h-full w-full object-contain mix-blend-screen"
            />
          </div>
        </div>
      </div>
    </section>
  );
}