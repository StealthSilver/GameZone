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
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="font-[family-name:var(--font-oxanium)] text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            All Games
          </h1>
          <p className="font-[family-name:var(--font-oxanium)] text-gray-400 text-lg sm:text-xl max-w-2xl">
            Choose from our collection of classic games reimagined with modern
            design
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {games.map((game, index) => (
            <Link
              href={`/games/${game.name.toLowerCase().replace(/ /g, "-")}`}
              key={index}
            >
              <div className="group relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-[#8CECF7] transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-gray-800">
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Game Title */}
                <div className="p-4 sm:p-6">
                  <h3 className="font-[family-name:var(--font-oxanium)] text-xl sm:text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#AAFDBB] group-hover:via-[#8CECF7] group-hover:to-[#6C85EA] group-hover:bg-clip-text transition-all duration-300">
                    {game.name}
                  </h3>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="px-6 py-3 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                    Play Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
