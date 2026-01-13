"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChessGame } from "@/components/games/chess/ChessGame";
import { ChessColor, ChessMode } from "@/components/games/chess/ChessEngine";

function ChessPlayContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ChessMode) || "player";
  const color = (searchParams.get("color") as ChessColor) || "white";

  return <ChessGame mode={mode} playerColor={color} />;
}

export default function ChessPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl font-[family-name:var(--font-oxanium)]">
            Loading chess...
          </div>
        </div>
      }
    >
      <ChessPlayContent />
    </Suspense>
  );
}
