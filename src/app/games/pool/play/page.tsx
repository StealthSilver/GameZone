"use client";

import { Suspense } from "react";
import { PoolGame } from "@/components/games/pool/PoolGame";

function PoolGameWrapper() {
  return <PoolGame />;
}

export default function PoolPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-2xl">Loading game...</div>
        </div>
      }
    >
      <PoolGameWrapper />
    </Suspense>
  );
}
