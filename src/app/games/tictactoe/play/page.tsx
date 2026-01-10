"use client";

import { TicTacToeGame } from "@/components/games/tictactoe/TicTacToeGame";
import { GameMode } from "@/components/games/tictactoe/TicTacToeEngine";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TicTacToePlayContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as GameMode) || "player";

  return <TicTacToeGame mode={mode} />;
}

export default function TicTacToePlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <TicTacToePlayContent />
    </Suspense>
  );
}
