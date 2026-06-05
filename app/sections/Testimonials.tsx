"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    quote: "TelecloudX transformed our network infrastructure. Their AI-powered analytics reduced our downtime by 85% and saved us millions in operational costs.",
    name: "Robert Kim",
    company: "Global Telecom Inc.",
    initials: "RK",
    rating: 5,
  },
  {
    quote: "The real-time monitoring dashboard is a game-changer. We can now predict network issues before they impact our customers. Incredible technology.",
    name: "Lisa Wang",
    company: "CloudNet Solutions",
    initials: "LW",
    rating: 5,
  },
  {
    quote: "Their cloud architecture expertise helped us scale from 10K to 1M users seamlessly. The auto-scaling capabilities are truly next-generation.",
    name: "David Martinez",
    company: "ScaleUp Technologies",
    initials: "DM",
    rating: 5,
  },
];

export default function Testimonials() {
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm text-purple-400 uppercase tracking-wider mb-4">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
        </div>

        <div className="relative">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                index === activeIndex
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-10 scale-95 absolute inset-0"
              } ${isVisible ? "" : "opacity-0 translate-y-10"}`}
            >
              <div className="glass-card rounded-3xl p-8 md:p-12 text-center glow-purple">
                {/* Rating */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{testimonial.initials}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "bg-purple-500 w-6" : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
