"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "⚡",
    title: "Instant Play",
    description: "Jump into games instantly without downloads or installations",
  },
  {
    icon: "🎮",
    title: "Classic Games, Modern UI",
    description: "Timeless gameplay meets sleek, contemporary design",
  },
  {
    icon: "🧠",
    title: "Skill-Based Gameplay",
    description: "Master your skills and compete with players worldwide",
  },
  {
    icon: "🌙",
    title: "Dark Neon Interface",
    description: "Premium dark theme with stunning neon aesthetics",
  },
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const handlers = new Map<
      HTMLDivElement,
      { onEnter: () => void; onLeave: () => void }
    >();

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        opacity: 0,
        y: 28,
        scale: 0.98,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.09,
      });

      cards.forEach((card) => {
        const icon = card.querySelector(".feature-icon");

        const onEnter = () => {
          gsap.to(card, {
            y: -10,
            rotateX: 2,
            duration: 0.22,
            ease: "power2.out",
          });
          gsap.to(card, {
            boxShadow:
              "0 0 0 rgba(0,0,0,0), 0 30px 120px rgba(108,133,234,0.22)",
            duration: 0.22,
            ease: "power2.out",
          });
          if (icon) {
            gsap.to(icon, {
              scale: 1.08,
              duration: 0.22,
              ease: "power2.out",
            });
          }
        };

        const onLeave = () => {
          gsap.to(card, {
            y: 0,
            rotateX: 0,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            duration: 0.22,
            ease: "power2.out",
          });
          if (icon) {
            gsap.to(icon, {
              scale: 1,
              duration: 0.22,
              ease: "power2.out",
            });
          }
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        handlers.set(card, { onEnter, onLeave });
      });
    }, containerRef);

    return () => {
      cards.forEach((card) => {
        const h = handlers.get(card);
        if (!h) return;
        card.removeEventListener("mouseenter", h.onEnter);
        card.removeEventListener("mouseleave", h.onLeave);
      });
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="features"
      ref={containerRef}
      className="relative py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-16 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[22rem] w-[22rem] translate-x-1/3 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Why <span className="text-primary">The Game Zone</span>?
          </h2>
          <p className="mt-4 text-base text-white/70 md:text-lg">
            Premium polish, subtle motion, and a neon-dark interface built for
            speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={[
                "group relative overflow-hidden rounded-3xl border border-primary/18 bg-black/25 p-7 md:p-8",
                "shadow-[0_0_0_rgba(0,0,0,0)] transition-transform duration-300 will-change-transform",
                "hover:border-secondary/40",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/14 via-transparent to-secondary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:[animation:neon-border_2s_ease-in-out_infinite]" />

              <div className="relative">
                <div className="feature-icon text-5xl">{feature.icon}</div>
                <h3 className="mt-5 text-xl font-black tracking-tight text-white transition-colors duration-300 group-hover:text-secondary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
