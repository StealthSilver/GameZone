"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CarromGameEngine,
  CarromGameState,
  GameMode,
  Piece,
  Pocket,
} from "./CarromGameEngine";

export const CarromGame: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as GameMode) || "player";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CarromGameEngine | null>(null);
  const stateRef = useRef<CarromGameState | null>(null);
  const [state, setState] = useState<CarromGameState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStart, setAimStart] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    const initialize = () => {
      if (cancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        // Try again on next animation frame until the canvas ref is ready
        requestAnimationFrame(initialize);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const baseSize = rect.width || 600;
      const size = Math.max(320, Math.min(700, baseSize));
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      const engine = new CarromGameEngine(size, mode);
      engineRef.current = engine;

      engine.setStateChangeCallback((s) => {
        stateRef.current = s;
        setState(s);
      });

      const initialState = engine.getState();
      stateRef.current = initialState;
      setState(initialState);
      setIsInitialized(true);
    };

    initialize();

    return () => {
      cancelled = true;
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [mode]);

  const drawPieces = useCallback(
    (ctx: CanvasRenderingContext2D, pieces: Piece[]) => {
      for (const piece of pieces) {
        if (piece.pocketed) continue;

        const { position, radius, kind, color } = piece;

        ctx.beginPath();
        ctx.arc(position.x + 2, position.y + 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fill();

        let fill = "#f5f5f5";
        if (kind === "queen") fill = "#e53935";
        else if (kind === "striker") fill = "#fdd835";
        else if (color === "black") fill = "#222222";

        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(position.x, position.y, radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,0,0,0.65)";
        ctx.lineWidth = radius * 0.16;
        ctx.stroke();

        if (kind === "queen") {
          ctx.beginPath();
          ctx.arc(position.x, position.y, radius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = "#fce4ec";
          ctx.fill();
        }

        if (kind === "striker") {
          ctx.beginPath();
          ctx.arc(position.x, position.y, radius * 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = "#ff6f00";
          ctx.lineWidth = radius * 0.16;
          ctx.stroke();
        }
      }
    },
    []
  );

  const drawPockets = useCallback(
    (ctx: CanvasRenderingContext2D, pockets: Pocket[]) => {
      for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(
          pocket.position.x,
          pocket.position.y,
          pocket.radius + 4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
          pocket.position.x,
          pocket.position.y,
          pocket.radius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#000000";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
          pocket.position.x - pocket.radius * 0.35,
          pocket.position.y - pocket.radius * 0.35,
          pocket.radius * 0.35,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fill();
      }
    },
    []
  );

  const drawBoard = useCallback(
    (ctx: CanvasRenderingContext2D, gameState: CarromGameState) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const size = canvas.width;
      const margin = size * 0.08;

      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = "#c89f6a";
      ctx.fillRect(
        margin * 0.4,
        margin * 0.4,
        size - margin * 0.8,
        size - margin * 0.8
      );

      ctx.strokeStyle = "#8b5a2b";
      ctx.lineWidth = margin * 0.18;
      ctx.strokeRect(
        margin * 0.4,
        margin * 0.4,
        size - margin * 0.8,
        size - margin * 0.8
      );

      ctx.strokeStyle = "#a66b35";
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin, size - margin * 2, size - margin * 2);

      const center = size / 2;
      const centerRadiusOuter = margin * 0.4;
      const centerRadiusInner = margin * 0.24;

      ctx.beginPath();
      ctx.arc(center, center, centerRadiusOuter, 0, Math.PI * 2);
      ctx.strokeStyle = "#7a3b1e";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, centerRadiusInner, 0, Math.PI * 2);
      ctx.strokeStyle = "#b23a48";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const baseLineOffset = margin * 0.4;
      const baseCircleRadius = margin * 0.28;

      const basePositions = [
        { x: center, y: margin + baseLineOffset },
        { x: center, y: size - margin - baseLineOffset },
        { x: margin + baseLineOffset, y: center },
        { x: size - margin - baseLineOffset, y: center },
      ];

      ctx.strokeStyle = "#7a3b1e";
      ctx.lineWidth = 1.5;
      for (const pos of basePositions) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, baseCircleRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = "#a66b35";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(margin, center);
      ctx.lineTo(center - centerRadiusOuter, center);
      ctx.moveTo(center + centerRadiusOuter, center);
      ctx.lineTo(size - margin, center);
      ctx.moveTo(center, margin);
      ctx.lineTo(center, center - centerRadiusOuter);
      ctx.moveTo(center, center + centerRadiusOuter);
      ctx.lineTo(center, size - margin);
      ctx.stroke();

      drawPockets(ctx, gameState.pockets);
      drawPieces(ctx, gameState.pieces);
    },
    [drawPockets, drawPieces]
  );

  const drawAimingGuide = useCallback(
    (ctx: CanvasRenderingContext2D, gameState: CarromGameState) => {
      if (gameState.gameStatus !== "aiming" || !gameState.canShoot) return;

      const striker = gameState.pieces.find(
        (p) => p.kind === "striker" && !p.pocketed
      );
      if (!striker) return;

      const angle = gameState.strikerAngle;
      const power = gameState.strikerPower;
      const cueLength = 120;
      const cueDistance = 26 + (power / 100) * 40;

      const startX =
        striker.position.x + Math.cos(angle + Math.PI) * cueDistance;
      const startY =
        striker.position.y + Math.sin(angle + Math.PI) * cueDistance;
      const endX = startX + Math.cos(angle + Math.PI) * cueLength;
      const endY = startY + Math.sin(angle + Math.PI) * cueLength;

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "#ffeb3b");
      gradient.addColorStop(1, "#f57f17");

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.stroke();

      const aimLen = 180;
      const aimEndX = striker.position.x + Math.cos(angle) * aimLen;
      const aimEndY = striker.position.y + Math.sin(angle) * aimLen;

      ctx.beginPath();
      ctx.moveTo(striker.position.x, striker.position.y);
      ctx.lineTo(aimEndX, aimEndY);
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    },
    []
  );

  const renderFrame = useCallback(
    (ctx: CanvasRenderingContext2D, gameState: CarromGameState) => {
      drawBoard(ctx, gameState);
      drawAimingGuide(ctx, gameState);
    },
    [drawBoard, drawAimingGuide]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;

    const loop = () => {
      const s = stateRef.current;
      if (s) {
        renderFrame(ctx, s);
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [renderFrame]);

  const handleDown = (x: number, y: number) => {
    if (!state || !canvasRef.current) return;
    if (state.gameStatus !== "aiming" || !state.canShoot) return;
    if (state.gameMode === "computer" && state.currentPlayer === 2) return;

    const striker = state.pieces.find(
      (p) => p.kind === "striker" && !p.pocketed
    );
    if (!striker) return;

    const dx = x - striker.position.x;
    const dy = y - striker.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const aimRadius = striker.radius * 2.2;

    if (dist < aimRadius) {
      setIsAiming(true);
      setAimStart({ x, y });
    }
  };

  const handleMove = (x: number, y: number) => {
    if (!isAiming || !state || !engineRef.current || !aimStart) return;

    const striker = state.pieces.find(
      (p) => p.kind === "striker" && !p.pocketed
    );
    if (!striker) return;

    const dx = striker.position.x - x;
    const dy = striker.position.y - y;
    const angle = Math.atan2(dy, dx);

    const pull = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(100, Math.max(12, (pull / 140) * 100));

    engineRef.current.setStrikerAngle(angle);
    engineRef.current.setStrikerPower(power);
  };

  const endAim = () => {
    if (isAiming && engineRef.current && state) {
      engineRef.current.shoot();
    }
    setIsAiming(false);
    setAimStart(null);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleDown(x, y);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleMove(x, y);
  };

  const onMouseUp = () => {
    endAim();
  };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleDown(x, y);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleMove(x, y);
  };

  const onTouchEnd = () => {
    endAim();
  };

  const handleRestart = () => {
    router.push(`/games/carrom/play?mode=${mode}`);
    window.location.reload();
  };

  const handleQuit = () => {
    router.push("/games/carrom");
  };

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8CECF7]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
      </div>

      <div className="bg-black border-b border-gray-800/50 py-4 z-10">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
              Carrom
            </h1>
            <p className="text-gray-400 text-sm">
              {mode === "player" ? "Player vs Player" : "Player vs Computer"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Restart
            </button>
            <button
              onClick={handleQuit}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Quit
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div
            className={`flex-1 p-3 md:p-4 rounded-lg border ${
              state?.currentPlayer === 1
                ? "border-[#8CECF7] bg-[#8CECF7]/10"
                : "border-gray-800 bg-gray-900/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm md:text-lg">Player 1</h3>
                <p className="text-xs md:text-sm text-gray-400">White coins</p>
              </div>
              <div className="text-xl md:text-3xl font-bold text-[#AAFDBB]">
                {state?.scores[1] ?? 0}
              </div>
            </div>
          </div>

          <div className="px-4 text-center text-gray-500 font-semibold text-sm md:text-base">
            VS
          </div>

          <div
            className={`flex-1 p-3 md:p-4 rounded-lg border ${
              state?.currentPlayer === 2
                ? "border-[#8CECF7] bg-[#8CECF7]/10"
                : "border-gray-800 bg-gray-900/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm md:text-lg">
                  {mode === "computer" ? "Computer" : "Player 2"}
                </h3>
                <p className="text-xs md:text-sm text-gray-400">Black coins</p>
              </div>
              <div className="text-xl md:text-3xl font-bold text-[#6C85EA]">
                {state?.scores[2] ?? 0}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[700px] relative">
          {state?.fouls && state?.gameStatus === "aiming" && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 via-red-400 to-orange-400 text-white text-xs md:text-sm font-semibold shadow-lg">
              Foul: {state.fouls}
            </div>
          )}

          {state?.message &&
            state?.gameStatus === "aiming" &&
            !state?.fouls && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gray-900/90 text-gray-100 text-xs md:text-sm font-semibold shadow-lg border border-gray-700/70">
                {state.message}
              </div>
            )}

          {mode === "computer" &&
            state?.currentPlayer === 2 &&
            state?.gameStatus === "aiming" && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black text-xs md:text-sm font-semibold shadow-lg animate-pulse">
                Computer is aiming...
              </div>
            )}

          {!isInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm md:text-base z-10">
              Initializing carrom board...
            </div>
          )}

          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            className="w-full border border-[#a66b35] rounded-2xl shadow-2xl shadow-black/80 bg-black cursor-crosshair touch-none"
          />
        </div>

        {state?.gameStatus === "aiming" &&
          state?.canShoot &&
          !(mode === "computer" && state?.currentPlayer === 2) && (
            <div className="mt-4 text-gray-400 text-sm text-center max-w-md">
              Tap or click near the striker and drag back to aim. Release to
              strike.
            </div>
          )}
      </div>

      {state?.gameStatus === "gameOver" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 border-2 border-[#8CECF7] max-w-md w-full mx-4">
            <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
              Game Over
            </h2>
            <div className="text-center mb-6">
              <p className="text-xl mb-2">
                {state?.winner === 1
                  ? "Player 1 wins!"
                  : state?.winner === 2
                  ? mode === "computer"
                    ? "Computer wins!"
                    : "Player 2 wins!"
                  : "Draw"}
              </p>
              <p className="text-gray-400">
                Final score: {state?.scores[1] ?? 0} - {state?.scores[2] ?? 0}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={handleQuit}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-all"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
