"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugin on the client side only
gsap.registerPlugin(ScrollTrigger);

const games = [
  { name: "Snake", icon: "🐍", color: "#6C85EA" },
  { name: "Chess", icon: "♟️", color: "#AAFDBB" },
  { name: "Carrom", icon: "🎯", color: "#E9FA00" },
  { name: "Go", icon: "⚫", color: "#6C85EA" },
  { name: "Tetris", icon: "🧱", color: "#AAFDBB" },
  { name: "Pool", icon: "🎱", color: "#E9FA00" },
  { name: "Tic Tac Toe", icon: "⭕", color: "#6C85EA" },
  { name: "Snake and Ladder", icon: "🎲", color: "#AAFDBB" },
];

export default function GamesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          {
            y: 80,
            opacity: 0,
            scale: 0.7,
            rotation: -10,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.8,
            stagger: {
              amount: 1.2,
              from: "start",
              ease: "power2.out",
            },
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 75%",
              end: "bottom 25%",
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
      id="games"
      ref={sectionRef}
      className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-black via-[#0a0a0a] to-black overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, #6C85EA 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#E9FA00] rounded-full blur-[150px] opacity-15 animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-10 w-72 h-72 bg-[#6C85EA] rounded-full blur-[150px] opacity-15 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-[#E9FA00] via-[#AAFDBB] to-[#6C85EA] bg-clip-text text-transparent">
              Choose Your Game
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Eight timeless classics, reimagined for the modern player
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {games.map((game, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 group-hover:border-white/40 transition-all duration-500"></div>

              {/* Glow Effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-2xl"
                style={{ backgroundColor: game.color }}
              ></div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                {/* Icon */}
                <div
                  className="text-8xl mb-6 transform group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-500 filter drop-shadow-[0_0_20px_rgba(108,133,234,0.8)]"
                  style={{
                    filter: `drop-shadow(0 0 20px ${game.color})`,
                  }}
                >
                  {game.icon}
                </div>

                {/* Game Name */}
                <h3
                  className="text-2xl font-bold text-white text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-500"
                  style={{
                    ...(games.findIndex((g) => g.name === game.name) === index
                      ? {}
                      : {}),
                  }}
                >
                  <span className="group-hover:hidden">{game.name}</span>
                  <span className="hidden group-hover:inline bg-gradient-to-r from-[#6C85EA] via-[#AAFDBB] to-[#E9FA00] bg-clip-text text-transparent">
                    {game.name}
                  </span>
                </h3>

                {/* Play Button (appears on hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-sm">
                  <button className="px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-[#6C85EA] to-[#AAFDBB] rounded-full transform scale-0 group-hover:scale-100 transition-all duration-500 shadow-[0_0_30px_rgba(108,133,234,0.8)] hover:shadow-[0_0_50px_rgba(108,133,234,1)]">
                    Play Now
                  </button>
                </div>
              </div>

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
