"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Gamepad2, Brain, Moon } from "lucide-react";

// Register plugin on the client side only
gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Zap,
    title: "Instant Play",
    description: "No downloads, no waiting. Jump straight into the action with our browser-based games.",
    color: "primary",
  },
  {
    icon: Gamepad2,
    title: "Classic Games, Modern UI",
    description: "Your favorite classics rebuilt with stunning graphics and smooth animations.",
    color: "secondary",
  },
  {
    icon: Brain,
    title: "Skill-Based Gameplay",
    description: "Challenge yourself with games that reward strategy, reflexes, and quick thinking.",
    color: "accent",
  },
  {
    icon: Moon,
    title: "Dark Neon Interface",
    description: "Easy on the eyes, heavy on style. Game in comfort with our premium dark theme.",
    color: "primary",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".feature-card");
      
      if (cards) {
        gsap.set(cards, { opacity: 0, y: 60 });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          icon: "text-primary",
          glow: "hover:shadow-[0_0_40px_rgba(108,133,234,0.4)]",
          border: "group-hover:border-primary/50",
        };
      case "secondary":
        return {
          icon: "text-secondary",
          glow: "hover:shadow-[0_0_40px_rgba(170,253,187,0.4)]",
          border: "group-hover:border-secondary/50",
        };
      case "accent":
        return {
          icon: "text-accent",
          glow: "hover:shadow-[0_0_40px_rgba(233,250,0,0.4)]",
          border: "group-hover:border-accent/50",
        };
      default:
        return {
          icon: "text-primary",
          glow: "hover:shadow-[0_0_40px_rgba(108,133,234,0.4)]",
          border: "group-hover:border-primary/50",
        };
    }
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-24 md:py-32 overflow-hidden bg-black"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why <span className="text-primary drop-shadow-[0_0_20px_rgba(108,133,234,0.8)]">Game</span> With Us?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">
            Built for gamers who appreciate the classics but demand modern quality.
          </p>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className={`feature-card group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer ${colors.glow} ${colors.border}`}
              >
                <div className="relative mb-4">
                  <Icon className={`w-12 h-12 ${colors.icon} transition-all duration-300 group-hover:scale-110`} />
                  <div className={`absolute inset-0 blur-xl ${colors.icon} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
