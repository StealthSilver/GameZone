"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugin on the client side only
gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "⚡",
    title: "Instant Play",
    description:
      "Jump into action with zero downloads. Browser-based gaming at its finest.",
    gradient: "from-[#6C85EA] to-[#AAFDBB]",
  },
  {
    icon: "🎮",
    title: "Classic Games, Modern UI",
    description:
      "Beloved classics wrapped in sleek, contemporary design that feels premium.",
    gradient: "from-[#AAFDBB] to-[#E9FA00]",
  },
  {
    icon: "🧠",
    title: "Skill-Based Gameplay",
    description:
      "Strategic thinking meets competitive edge. Every move matters.",
    gradient: "from-[#E9FA00] to-[#6C85EA]",
  },
  {
    icon: "🌙",
    title: "Dark Neon Interface",
    description:
      "Eye-friendly dark mode with vibrant neon accents for extended play sessions.",
    gradient: "from-[#6C85EA] via-[#AAFDBB] to-[#E9FA00]",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          {
            y: 100,
            opacity: 0,
            scale: 0.8,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-black overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6C85EA] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#AAFDBB] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-[#6C85EA] to-[#AAFDBB] bg-clip-text text-transparent">
              Game Zone
            </span>
            ?
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Premium features designed for serious gamers and casual players
            alike
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#6C85EA] transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              {/* Animated Border Pulse */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} blur-xl animate-pulse`}
                ></div>
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#6C85EA] transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <div
                  className={`mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(108,133,234,0.8)]`}
                ></div>
              </div>

              {/* Lift Effect */}
              <div className="absolute inset-0 transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
