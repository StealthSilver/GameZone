"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChessColor, ChessMode } from "./ChessEngine";

export const ChessSetup: React.FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<ChessMode | null>(null);
  const [color, setColor] = useState<ChessColor>("white");

  const handleStart = () => {
    if (!mode) return;
    const params = new URLSearchParams({ mode, color });
    router.push(`/games/chess/play?${params.toString()}`);
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
          Chess
        </h1>
        <p className="text-gray-400 mb-12 text-center max-w-md">
          Choose your game mode and piece color before entering the board.
        </p>

        {/* Game Mode Selection */}
        <div className="w-full max-w-md space-y-4 mb-8">
          <button
            onClick={() => setMode("player")}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
              mode === "player"
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
                    Play locally with a friend
                  </p>
                </div>
              </div>
              {mode === "player" && (
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

          <button
            onClick={() => setMode("computer")}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
              mode === "computer"
                ? "border-[#AAFDBB] bg-[#AAFDBB]/10 shadow-lg shadow-[#AAFDBB]/20"
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
                    Challenge the chess AI (coming soon)
                  </p>
                </div>
              </div>
              {mode === "computer" && (
                <div className="w-6 h-6 rounded-full bg-[#AAFDBB] flex items-center justify-center">
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

        {/* Color Selection */}
        <div className="w-full max-w-md mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">
            Piece Color
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setColor("white")}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                color === "white"
                  ? "border-[#AAFDBB] bg-[#AAFDBB]/10 shadow-lg shadow-[#AAFDBB]/20"
                  : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white" />
                <span className="font-semibold">White</span>
              </div>
              {color === "white" && (
                <div className="w-5 h-5 rounded-full bg-[#AAFDBB] flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-black"
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
            </button>

            <button
              onClick={() => setColor("black")}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                color === "black"
                  ? "border-[#8CECF7] bg-[#8CECF7]/10 shadow-lg shadow-[#8CECF7]/20"
                  : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-600" />
                <span className="font-semibold">Black</span>
              </div>
              {color === "black" && (
                <div className="w-5 h-5 rounded-full bg-[#8CECF7] flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-black"
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
            </button>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStart}
          disabled={!mode}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            mode
              ? "bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black hover:shadow-lg hover:shadow-[#8CECF7]/50 hover:scale-105"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
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
