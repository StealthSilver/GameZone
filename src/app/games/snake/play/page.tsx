"use client";

import { SnakeGame } from "@/components/games/snake/SnakeGame";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  SnakeSkin,
  FruitType,
  GameMode,
} from "@/components/games/snake/SnakeGameEngine";

function SnakePlayContent() {
  const searchParams = useSearchParams();

  const skin = (searchParams.get("skin") as SnakeSkin) || "classic";
  const fruit = (searchParams.get("fruit") as FruitType) || "apple";
  const mode = (searchParams.get("mode") as GameMode) || "medium";

  return (
    <SnakeGame initialSkin={skin} initialFruit={fruit} initialMode={mode} />
  );
}

export default function SnakePlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white text-2xl font-[family-name:var(--font-oxanium)]">
            Loading game...
          </div>
        </div>
      }
    >
      <SnakePlayContent />
    </Suspense>
  );
}
