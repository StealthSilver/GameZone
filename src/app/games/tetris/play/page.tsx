"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TetrisGame } from "@/components/games/tetris/TetrisGame";
import { GameMode } from "@/components/games/tetris/TetrisGameEngine";

function TetrisPlayContent() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState<number>(3);
  const [gameStarted, setGameStarted] = useState(false);

  const mode = (searchParams.get("mode") as GameMode) || "medium";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameStarted(true);
    }
  }, [countdown]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text animate-pulse">
            {countdown}
          </h1>
          <p className="text-2xl text-gray-400">Get Ready!</p>
        </div>
      </div>
    );
  }

  return <TetrisGame mode={mode} />;
}

export default function TetrisPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex items-center justify-center">
          <p className="text-xl text-gray-400">Loading...</p>
        </div>
      }
    >
      <TetrisPlayContent />
    </Suspense>
  );
}
