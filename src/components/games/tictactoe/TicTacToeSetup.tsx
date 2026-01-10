"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type GameMode = "player" | "computer" | null;

export const TicTacToeSetup = () => {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<GameMode>(null);

  const handleStartGame = () => {
    if (gameMode) {
      router.push(`/games/tictactoe/play?mode=${gameMode}`);
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
          Tic Tac Toe
        </h1>
        <p className="text-gray-400 mb-12 text-center max-w-md">
          Choose your game mode and test your strategic skills
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">VS Player</h3>
                  <p className="text-sm text-gray-400">Play with a friend</p>
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
                  <h3 className="text-xl font-bold">VS Computer</h3>
                  <p className="text-sm text-gray-400">Challenge the AI</p>
                </div>
              </div>
              {gameMode === "computer" && (
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

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          disabled={!gameMode}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            gameMode
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
