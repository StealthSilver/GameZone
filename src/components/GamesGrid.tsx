"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugin on the client side only
gsap.registerPlugin(ScrollTrigger);

const games = [
  { name: "Snake", icon: "🐍", color: "secondary" },
  { name: "Chess", icon: "♟️", color: "primary" },
  { name: "Carrom", icon: "🎯", color: "accent" },
  { name: "Go", icon: "⚫", color: "primary" },
  { name: "Tetris", icon: "🧱", color: "secondary" },
  { name: "Pool", icon: "🎱", color: "accent" },
  { name: "Tic Tac Toe", icon: "❌", color: "primary" },
  { name: "Snake & Ladder", icon: "🎲", color: "secondary" },
];

export default function GamesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll(".game-card");

      if (cards) {
        gsap.set(cards, { opacity: 0, y: 80, rotateX: -15 });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 70%",
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.8,
              stagger: 0.1,
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
        return "hover:border-primary/60 hover:shadow-[0_0_40px_rgba(108,133,234,0.6)]";
      case "secondary":
        return "hover:border-secondary/60 hover:shadow-[0_0_40px_rgba(170,253,187,0.6)]";
      case "accent":
        return "hover:border-accent/60 hover:shadow-[0_0_40px_rgba(233,250,0,0.6)]";
      default:
        return "hover:border-primary/60 hover:shadow-[0_0_40px_rgba(108,133,234,0.6)]";
    }
  };

  return (
    <section
      ref={sectionRef}
      id="games"
      className="relative py-24 md:py-32 overflow-hidden bg-black"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="text-secondary drop-shadow-[0_0_20px_rgba(170,253,187,0.8)]">Game</span>
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">
            From strategic masterpieces to quick arcade fun — we've got your next obsession covered.
          </p>
        </div>

        {/* Games Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          style={{ perspective: "1000px" }}
        >
          {games.map((game, index) => (
            <div
              key={index}
              className={`game-card group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:rotate-1 ${getColorClasses(game.color)}`}
            >
              {/* Icon */}
              <div className="text-5xl md:text-6xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                {game.icon}
              </div>

              {/* Game Name */}
              <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {game.name}
              </h3>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-primary font-bold text-lg tracking-wider">
                  PLAY →
                </span>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-bl from-primary/20 to-transparent rotate-45" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

              {/* Decorative Corner */}
              <div
                className="absolute top-4 right-4 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"
                style={{ backgroundColor: game.color }}
              ></div>
              <div
                className="absolute bottom-4 left-4 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"
                style={{ backgroundColor: game.color, animationDelay: "0.3s" }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
