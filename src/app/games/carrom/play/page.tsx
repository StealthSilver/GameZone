"use client";

import { Suspense } from "react";
import { CarromGame } from "@/components/games/carrom/CarromGame";

function CarromPlayContent() {
  return <CarromGame />;
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
