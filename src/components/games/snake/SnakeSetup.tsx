"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  easy: { name: "Easy", description: "Slow speed - Perfect for beginners" },
  medium: { name: "Medium", description: "Normal speed - Balanced challenge" },
  hard: { name: "Hard", description: "Fast speed - For experts only!" },
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
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-black p-4">
      <div className="w-full max-w-4xl">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link href="/">
            <button className="font-[family-name:var(--font-oxanium)] px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </Link>
        </div>

        {/* Setup Header */}
        <div className="mb-6 text-center">
          <h1 className="font-[family-name:var(--font-oxanium)] text-3xl md:text-4xl font-bold text-white mb-2">
            Snake Game Setup
          </h1>
          <p className="font-[family-name:var(--font-oxanium)] text-base text-gray-400">
            Customize your game before you start
          </p>
        </div>

        {/* Customization Options */}
        <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-4 border-2 border-gray-800">
          {/* Game Mode Selection */}
          <div>
            <h3 className="font-[family-name:var(--font-oxanium)] text-lg font-bold text-white mb-2">
              Choose Difficulty
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(gameModes) as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`p-3 rounded-lg font-[family-name:var(--font-oxanium)] font-semibold transition-all border-2 ${
                    selectedMode === mode
                      ? "bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black scale-105 border-transparent"
                      : "bg-gray-800 text-white hover:bg-gray-700 border-gray-700"
                  }`}
                >
                  <div className="text-lg mb-1">{gameModes[mode].name}</div>
                  <div className="text-xs opacity-75">
                    {gameModes[mode].description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Snake Skin Selection */}
          <div>
            <h3 className="font-[family-name:var(--font-oxanium)] text-lg font-bold text-white mb-2">
              Choose Snake Skin
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(snakeSkins) as SnakeSkin[]).map((skin) => (
                <button
                  key={skin}
                  onClick={() => setSelectedSkin(skin)}
                  className={`p-3 rounded-lg font-[family-name:var(--font-oxanium)] font-semibold transition-all border-2 ${
                    selectedSkin === skin
                      ? "scale-105 border-white"
                      : "bg-gray-800 hover:bg-gray-700 border-gray-700"
                  }`}
                  style={{
                    background:
                      selectedSkin === skin
                        ? `linear-gradient(135deg, ${snakeSkins[skin].head[0]}, ${snakeSkins[skin].head[2]})`
                        : undefined,
                    color: selectedSkin === skin ? "black" : "white",
                  }}
                >
                  <div className="text-base">{snakeSkins[skin].name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fruit Type Selection */}
          <div>
            <h3 className="font-[family-name:var(--font-oxanium)] text-lg font-bold text-white mb-2">
              Choose Fruit
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(fruitTypes) as FruitType[]).map((fruit) => (
                <button
                  key={fruit}
                  onClick={() => setSelectedFruit(fruit)}
                  className={`p-3 rounded-lg font-[family-name:var(--font-oxanium)] font-semibold transition-all border-2 ${
                    selectedFruit === fruit
                      ? "scale-105 border-white"
                      : "bg-gray-800 hover:bg-gray-700 border-gray-700"
                  }`}
                  style={{
                    background:
                      selectedFruit === fruit
                        ? `linear-gradient(135deg, ${fruitTypes[fruit].colors[0]}, ${fruitTypes[fruit].colors[1]})`
                        : undefined,
                    color: selectedFruit === fruit ? "white" : "white",
                  }}
                >
                  <div className="text-base">{fruitTypes[fruit].name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary and Start Button */}
        <div className="bg-gray-900 rounded-xl p-4 border-2 border-gray-800">
          <div className="text-center">
            <h3 className="font-[family-name:var(--font-oxanium)] text-lg font-bold text-white mb-3">
              Your Selection
            </h3>
            <div className="flex justify-center gap-4 mb-4 font-[family-name:var(--font-oxanium)] text-sm text-gray-300 flex-wrap">
              <div>
                <span className="text-gray-500">Mode:</span>{" "}
                <span className="text-white font-semibold">
                  {gameModes[selectedMode].name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Snake:</span>{" "}
                <span className="text-white font-semibold">
                  {snakeSkins[selectedSkin].name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Fruit:</span>{" "}
                <span className="text-white font-semibold">
                  {fruitTypes[selectedFruit].name}
                </span>
              </div>
            </div>
            <button
              onClick={handleStartGame}
              className="px-8 py-2 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-[family-name:var(--font-oxanium)] text-lg font-bold rounded-lg hover:scale-105 transition-transform shadow-lg"
            >
              Start Game →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
