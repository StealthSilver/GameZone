"use client";

import React from "react";
import FluidSimulation from "./ui/FluidSimulation";

export const Hero = () => {
  return (
    <section className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Fluid Animation Background */}
      <FluidSimulation />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen items-center">
          <div className="w-full py-20 md:py-32">
            <div className="space-y-8">
              {/* Main Heading */}
              <h1 className="font-oxanium text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
                Where Classic Games
                <span className="block bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Get a Glow-Up
                </span>
              </h1>

              {/* Description */}
              <p className="font-oxanium max-w-3xl text-lg text-gray-300 sm:text-xl md:text-2xl">
                Snake, Chess, Tetris, and more — reimagined with sleek design,
                smooth animations, and pure nostalgia.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <button className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50">
                  <span className="relative z-10">Start Playing</span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>

                <button className="rounded-lg border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:scale-105">
                  Explore Games
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
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
