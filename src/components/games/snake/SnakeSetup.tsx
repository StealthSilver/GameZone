"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SnakeSkin, FruitType, GameMode } from "./SnakeGameEngine";

// Snake skin color schemes
const snakeSkins = {
  classic: {
    name: "Classic",
    head: ["#AAFDBB", "#8CECF7", "#6C85EA"],
    body: ["#AAFDBB", "#8CECF7", "#6C85EA"],
  },
  ocean: {
    name: "Ocean",
    head: ["#00D4FF", "#0099CC", "#006699"],
    body: ["#00D4FF", "#0099CC", "#006699"],
  },
  fire: {
    name: "Fire",
    head: ["#FF6B35", "#FF4500", "#CC0000"],
    body: ["#FF6B35", "#FF4500", "#CC0000"],
  },
  forest: {
    name: "Forest",
    head: ["#90EE90", "#32CD32", "#228B22"],
    body: ["#90EE90", "#32CD32", "#228B22"],
  },
};

// Fruit types with colors
const fruitTypes = {
  apple: { name: "Apple", colors: ["#ff6b6b", "#ff0000"] },
  cherry: { name: "Cherry", colors: ["#ff1493", "#dc143c"] },
  orange: { name: "Orange", colors: ["#ffa500", "#ff8c00"] },
  grape: { name: "Grape", colors: ["#9370db", "#8b008b"] },
};

// Game modes
const gameModes = {
  easy: { name: "Easy", description: "Slow speed" },
  medium: { name: "Medium", description: "Normal speed" },
  hard: { name: "Hard", description: "Fast speed" },
};

export const SnakeSetup: React.FC = () => {
  const router = useRouter();
  const [selectedSkin, setSelectedSkin] = useState<SnakeSkin>("classic");
  const [selectedFruit, setSelectedFruit] = useState<FruitType>("apple");
  const [selectedMode, setSelectedMode] = useState<GameMode>("medium");

  const handleStartGame = () => {
    // Navigate to play page with selected options
    const params = new URLSearchParams({
      skin: selectedSkin,
      fruit: selectedFruit,
      mode: selectedMode,
    });
    router.push(`/games/snake/play?${params.toString()}`);
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
          Snake Game
        </h1>
        <p className="text-gray-400 mb-12 text-center max-w-md">
          Customize your game settings and start playing
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

          {/* Snake Skin Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-300">
              Snake Skin
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(snakeSkins) as SnakeSkin[]).map((skin) => (
                <button
                  key={skin}
                  onClick={() => setSelectedSkin(skin)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedSkin === skin
                      ? "border-white shadow-lg"
                      : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                  }`}
                  style={{
                    background:
                      selectedSkin === skin
                        ? `linear-gradient(135deg, ${snakeSkins[skin].head[0]}, ${snakeSkins[skin].head[2]})`
                        : undefined,
                  }}
                >
                  <div
                    className="font-bold"
                    style={{
                      color: selectedSkin === skin ? "#000" : "#fff",
                    }}
                  >
                    {snakeSkins[skin].name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fruit Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-300">Fruit</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(fruitTypes) as FruitType[]).map((fruit) => (
                <button
                  key={fruit}
                  onClick={() => setSelectedFruit(fruit)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedFruit === fruit
                      ? "border-white shadow-lg"
                      : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                  }`}
                  style={{
                    background:
                      selectedFruit === fruit
                        ? `linear-gradient(135deg, ${fruitTypes[fruit].colors[0]}, ${fruitTypes[fruit].colors[1]})`
                        : undefined,
                  }}
                >
                  <div className="font-bold text-white">
                    {fruitTypes[fruit].name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black hover:shadow-lg hover:shadow-[#8CECF7]/50 hover:scale-105"
        >
          Start Game
        </button>

        {/* Back Button */}
        <button
          onClick={() => router.push("/games")}
          className="mt-6 px-6 py-3 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-300"
        >
          Back to Games
        </button>
      </div>
    </div>
  );
};
