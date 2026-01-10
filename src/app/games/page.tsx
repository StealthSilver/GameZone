"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const games = [
  { name: "Snakes", image: "/snake.png" },
  { name: "Tic Tac Toe", image: "/tictac.png" },
  { name: "Pool", image: "/pool.png" },
  { name: "Chess", image: "/chess.png" },
  { name: "Carrom", image: "/carrom.png" },
  { name: "Tetris", image: "/tetris.png" },
  { name: "Go", image: "/go.png" },
  { name: "Snake and Ladder", image: "/snakeladder.png" },
];

export default function GamesPage() {
  return (
    <div className="h-[92vh] bg-black overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="bg-black border-b border-gray-800/50 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-oxanium)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
            All Games
          </h1>
          <p className="font-[family-name:var(--font-oxanium)] text-gray-400 text-xs sm:text-sm">
            Choose from our collection of classic games reimagined with modern
            design
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 h-full">
            {games.map((game, index) => (
              <Link
                href={`/games/${game.name.toLowerCase().replace(/ /g, "-")}`}
                key={index}
              >
                <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-950/50 rounded-xl overflow-hidden border border-gray-800/50 hover:border-[#8CECF7]/50 transition-all duration-300 cursor-pointer transform hover:scale-105 backdrop-blur-sm">
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-900/30">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Game Title */}
                  <div className="p-2 sm:p-3 bg-black/40 backdrop-blur-sm">
                    <h3 className="font-[family-name:var(--font-oxanium)] text-sm sm:text-base font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#AAFDBB] group-hover:via-[#8CECF7] group-hover:to-[#6C85EA] group-hover:bg-clip-text transition-all duration-300">
                      {game.name}
                    </h3>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="font-[family-name:var(--font-oxanium)] px-3 py-1.5 sm:px-5 sm:py-2 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold text-xs sm:text-sm rounded-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg hover:shadow-[#8CECF7]/50">
                      Play Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
