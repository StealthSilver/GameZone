"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type GameMode = "player" | "computer" | null;

export const PoolSetup = () => {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<GameMode>(null);

  const handleStartGame = () => {
    if (gameMode) {
      router.push(`/games/pool/play?mode=${gameMode}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8CECF7]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
          8-Ball Pool
        </h1>
        <p className="text-gray-400 mb-12 text-center max-w-md">
          Choose your game mode and pocket all your balls before your opponent
        </p>

        {/* Game Mode Selection */}
        <div className="w-full max-w-md space-y-4 mb-8">
          {/* VS Player */}
          <button
            onClick={() => setGameMode("player")}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
              gameMode === "player"
                ? "border-[#8CECF7] bg-[#8CECF7]/10 shadow-lg shadow-[#8CECF7]/20"
                : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#AAFDBB] to-[#8CECF7] flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">VS Player</h3>
                  <p className="text-sm text-gray-400">
                    Play against a friend locally
                  </p>
                </div>
              </div>
              {gameMode === "player" && (
                <div className="w-6 h-6 rounded-full bg-[#8CECF7] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>

          {/* VS Computer */}
          <button
            onClick={() => setGameMode("computer")}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
              gameMode === "computer"
                ? "border-[#8CECF7] bg-[#8CECF7]/10 shadow-lg shadow-[#8CECF7]/20"
                : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6C85EA] to-[#8CECF7] flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">VS Computer</h3>
                  <p className="text-sm text-gray-400">
                    Challenge the AI opponent
                  </p>
                </div>
              </div>
              {gameMode === "computer" && (
                <div className="w-6 h-6 rounded-full bg-[#8CECF7] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          disabled={!gameMode}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            gameMode
              ? "bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black hover:shadow-lg hover:shadow-[#8CECF7]/50 hover:scale-105"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Start Game
        </button>

        {/* Game Rules */}
        <div className="mt-12 max-w-2xl bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4 text-[#8CECF7]">How to Play</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#AAFDBB] mt-1">•</span>
              <span>
                <strong>Objective:</strong> Pocket all your assigned balls
                (solids or stripes) and then sink the 8-ball to win
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#AAFDBB] mt-1">•</span>
              <span>
                <strong>Break:</strong> Player 1 starts by breaking. The first
                ball pocketed determines your type
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#AAFDBB] mt-1">•</span>
              <span>
                <strong>Controls:</strong> Click and drag on the cue ball to
                aim. Pull back to set power, release to shoot
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#AAFDBB] mt-1">•</span>
              <span>
                <strong>Fouls:</strong> Scratching the cue ball or pocketing
                opponent's balls results in a foul
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#AAFDBB] mt-1">•</span>
              <span>
                <strong>Winning:</strong> Pocket the 8-ball after clearing all
                your balls to win. Early 8-ball means you lose!
              </span>
            </li>
          </ul>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push("/games")}
          className="mt-8 px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-all duration-300"
        >
          ← Back to Games
        </button>
      </div>
    </div>
  );
};
