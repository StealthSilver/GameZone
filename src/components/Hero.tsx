"use client";

import React from "react";
import FluidSimulation from "./ui/FluidSimulation";

export const Hero = () => {
  return (
    <section className="relative h-[84vh] w-full bg-black overflow-hidden">
      {/* Fluid Animation Background */}
      <FluidSimulation />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center">
          <div className="w-full py-8">
            <div className="space-y-8">
              {/* Main Heading */}
              <h1 className="font-[family-name:var(--font-oxanium)] text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
                Where Classic Games
                <span className="block bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text text-transparent">
                  Get a Glow-Up
                </span>
              </h1>

              {/* Description */}
              <p className="font-[family-name:var(--font-oxanium)] max-w-3xl text-lg text-gray-300 sm:text-xl md:text-2xl">
                Snake, Chess, Tetris, and more — reimagined with sleek design,
                smooth animations, and pure nostalgia.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <button className="font-[family-name:var(--font-oxanium)] group relative px-8 py-4 text-black font-bold text-lg rounded-lg bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] hover:from-[#6C85EA] hover:via-[#8CECF7] hover:to-[#AAFDBB] transition-all duration-700 transform hover:-translate-y-1 hover:scale-105 active:scale-95 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white after:to-transparent after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-1000">
                  <span className="relative z-10 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    Start Playing
                  </span>
                </button>

                <button className="font-[family-name:var(--font-oxanium)] rounded-lg border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:scale-105">
                  Explore Games
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 font-[family-name:var(--font-oxanium)]">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-white md:text-4xl">
                    10K+
                  </p>
                  <p className="text-sm text-gray-400 md:text-base">
                    Active Players
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-white md:text-4xl">
                    500+
                  </p>
                  <p className="text-sm text-gray-400 md:text-base">
                    Games Available
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-white md:text-4xl">
                    24/7
                  </p>
                  <p className="text-sm text-gray-400 md:text-base">
                    Online Support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
    </section>
  );
};
