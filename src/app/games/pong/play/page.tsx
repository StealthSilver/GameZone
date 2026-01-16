"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PongGame } from "@/components/games/pong/PongGame";
import { GameMode } from "@/components/games/pong/PongGameEngine";

function PongPlayContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as GameMode) || "medium";

  return <PongGame mode={mode} />;
}

export default function PongPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <PongPlayContent />
    </Suspense>
  );
}
