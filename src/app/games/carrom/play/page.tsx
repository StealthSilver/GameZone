"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Placeholder for future CarromGame component
// Once the game logic is implemented, import and render it here
// similar to other games (e.g., TicTacToeGame).

type GameMode = "player" | "computer";

function CarromPlayContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as GameMode) || "player";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-[family-name:var(--font-oxanium)]">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
          Carrom
        </h1>
        <p className="text-gray-400">
          Mode selected:{" "}
          <span className="font-semibold capitalize">{mode}</span>
        </p>
        <p className="text-gray-500 max-w-md mx-auto">
          The Carrom board and gameplay logic will appear here soon. For now,
          you have successfully chosen your mode.
        </p>
      </div>
    </div>
  );
}

export default function CarromPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <CarromPlayContent />
    </Suspense>
  );
}
