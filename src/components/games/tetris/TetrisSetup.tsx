"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GameMode } from "./TetrisGameEngine";

// Game modes
const gameModes = {
  easy: { name: "Easy", description: "Slow speed" },
  medium: { name: "Medium", description: "Normal speed" },
  hard: { name: "Hard", description: "Fast speed" },
};

export const TetrisSetup: React.FC = () => {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode>("medium");

  const handleStartGame = () => {
    // Navigate to play page with selected options
    const params = new URLSearchParams({
      mode: selectedMode,
    });
    router.push(`/games/tetris/play?${params.toString()}`);
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
          Tetris
        </h1>
        <p className="text-gray-400 mb-12 text-center max-w-md">
          Stack the blocks and clear lines to score points
        </p>

        {/* Game Settings */}
        <div className="w-full max-w-md space-y-6 mb-8">
          {/* Difficulty Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-300">
              Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(gameModes) as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedMode === mode
                      ? "border-[#AAFDBB] bg-[#AAFDBB]/10 shadow-lg shadow-[#AAFDBB]/20"
                      : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                  }`}
                >
                  <div className="text-sm font-bold">
                    {gameModes[mode].name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {gameModes[mode].description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          className="px-8 py-4 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300 transform hover:scale-105"
        >
          Start Game
        </button>

        {/* How to Play */}
        <div className="mt-12 max-w-md bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
            How to Play
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start">
              <span className="text-[#AAFDBB] mr-2">←→</span>
              <span>Move left/right</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#AAFDBB] mr-2">↓</span>
              <span>Move down faster</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#AAFDBB] mr-2">↑</span>
              <span>Rotate piece</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#AAFDBB] mr-2">Space</span>
              <span>Drop piece instantly</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#AAFDBB] mr-2">C</span>
              <span>Hold piece for later</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#AAFDBB] mr-2">P</span>
              <span>Pause game</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
