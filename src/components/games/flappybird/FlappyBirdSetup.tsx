"use client";

import React from "react";
import { useRouter } from "next/navigation";

export const FlappyBirdSetup: React.FC = () => {
  const router = useRouter();

  const handleStartGame = () => {
    router.push(`/games/flappybird/play`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8CECF7]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
          Flappy Bird
        </h1>
        <p className="text-gray-400 mb-12 text-center max-w-md">
          Tap to flap and navigate through the pipes!
        </p>

        {/* Game Info */}
        <div className="w-full max-w-md space-y-6 mb-8">
          <div className="p-6 rounded-xl border-2 border-gray-800 bg-gray-900/50">
            <h3 className="text-lg font-semibold mb-3 text-gray-300">
              How to Play
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <span className="text-[#AAFDBB] mr-2">•</span>
                <span>Click or press Space/↑ to make the bird flap</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#AAFDBB] mr-2">•</span>
                <span>Navigate through the gaps between pipes</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#AAFDBB] mr-2">•</span>
                <span>Avoid hitting pipes or the ground</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#AAFDBB] mr-2">•</span>
                <span>Each pipe you pass increases your score</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#AAFDBB] mr-2">•</span>
                <span>Game starts after a 3-second countdown</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          className="px-8 py-4 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300 transform hover:scale-105"
        >
          Start Game
        </button>

        {/* Back Button */}
        <button
          onClick={() => router.push("/games")}
          className="mt-4 px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-800 transition-all duration-300"
        >
          ← Back to Games
        </button>
      </div>
    </div>
  );
};
