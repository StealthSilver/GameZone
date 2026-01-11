"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PoolGameEngine,
  GameState,
  GameMode,
  Ball,
  Pocket,
} from "./PoolGameEngine";

export const PoolGame = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PoolGameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStart, setAimStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const gameMode = (searchParams.get("mode") as GameMode) || "player";

  // Initialize game
  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initGame = () => {
      // Force a layout by getting parent width
      const parent = canvas.parentElement;
      const parentWidth = parent ? parent.clientWidth : 800;
      const tableWidth = Math.min(800, parentWidth);
      const tableHeight = tableWidth * 0.5;

      console.log("Initializing canvas with parent width:", parentWidth);

      canvas.width = tableWidth;
      canvas.height = tableHeight;

      // Set explicit CSS size to match canvas dimensions
      canvas.style.width = `${tableWidth}px`;
      canvas.style.height = `${tableHeight}px`;

      console.log("Canvas initialized:", tableWidth, "x", tableHeight);

      const engine = new PoolGameEngine(tableWidth, tableHeight, gameMode);
      engineRef.current = engine;

      engine.setStateChangeCallback((state) => {
        setGameState(state);
      });

      engine.startGame();
      const initialState = engine.getState();
      setGameState(initialState);

      console.log("Game started with", initialState.balls.length, "balls");
    };

    const timer = setTimeout(initGame, 100);

    return () => {
      clearTimeout(timer);
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
    };
  }, [gameMode]); // Render loop
  useEffect(() => {
    if (!gameState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw table
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0a5f38";
      ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Draw pockets
      gameState.pockets.forEach((pocket) => {
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
      });

      // Draw balls
      gameState.balls.forEach((ball) => {
        if (ball.pocketed) return;

        // Ball body
        ctx.beginPath();
        ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ball number
        if (ball.type !== "cue") {
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(
            ball.position.x,
            ball.position.y,
            ball.radius * 0.5,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.fillStyle = "#000000";
          ctx.font = `bold ${ball.radius * 0.8}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            ball.number.toString(),
            ball.position.x,
            ball.position.y
          );
        }
      });

      // Draw cue stick
      if (gameState.gameStatus === "aiming" && gameState.canShoot) {
        const cueBall = gameState.balls.find(
          (b) => b.type === "cue" && !b.pocketed
        );
        if (cueBall) {
          const angle = gameState.cueAngle;
          const power = gameState.cuePower;
          const cueLength = 150;
          const cueDistance = 30 + (power / 100) * 50;

          const startX =
            cueBall.position.x + Math.cos(angle + Math.PI) * cueDistance;
          const startY =
            cueBall.position.y + Math.sin(angle + Math.PI) * cueDistance;
          const endX = startX + Math.cos(angle + Math.PI) * cueLength;
          const endY = startY + Math.sin(angle + Math.PI) * cueLength;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = "#8B4513";
          ctx.lineWidth = 6;
          ctx.lineCap = "round";
          ctx.stroke();

          // Aim line
          const aimEndX = cueBall.position.x + Math.cos(angle) * 200;
          const aimEndY = cueBall.position.y + Math.sin(angle) * 200;
          ctx.beginPath();
          ctx.moveTo(cueBall.position.x, cueBall.position.y);
          ctx.lineTo(aimEndX, aimEndY);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 10]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      !gameState ||
      !canvasRef.current ||
      gameState.gameStatus !== "aiming" ||
      !gameState.canShoot
    )
      return;
    if (gameState.gameMode === "computer" && gameState.currentPlayer === 2)
      return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cueBall = gameState.balls.find(
      (b) => b.type === "cue" && !b.pocketed
    );
    if (!cueBall) return;

    const dx = x - cueBall.position.x;
    const dy = y - cueBall.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < cueBall.radius + 20) {
      setIsAiming(true);
      setAimStart({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAiming || !gameState || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cueBall = gameState.balls.find(
      (b) => b.type === "cue" && !b.pocketed
    );
    if (!cueBall) return;

    const dx = cueBall.position.x - x;
    const dy = cueBall.position.y - y;
    const angle = Math.atan2(dy, dx);
    const pullBackDistance = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(100, Math.max(10, (pullBackDistance / 150) * 100));

    if (engineRef.current) {
      engineRef.current.setCueAngle(angle);
      engineRef.current.setCuePower(power);
    }
  };

  const handleMouseUp = () => {
    if (isAiming && engineRef.current) {
      engineRef.current.shoot();
    }
    setIsAiming(false);
    setAimStart(null);
  };

  const handleRestart = () => {
    setShowRestartModal(false);
    router.push(`/games/pool/play?mode=${gameMode}`);
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Initializing game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex flex-col">
      {/* Debug Panel */}
      {gameState && canvasRef.current && (
        <div className="fixed top-4 right-4 bg-red-900/90 p-4 rounded-lg text-xs z-50">
          <div>
            Canvas: {canvasRef.current.width}x{canvasRef.current.height}
          </div>
          <div>
            Display: {canvasRef.current.style.width} x{" "}
            {canvasRef.current.style.height}
          </div>
          <div>Balls: {gameState.balls.length}</div>
          <div>Pockets: {gameState.pockets.length}</div>
          <div>Status: {gameState.gameStatus}</div>
        </div>
      )}

      {/* Header */}
      <div className="bg-black border-b border-gray-800/50 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
              8-Ball Pool
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowRestartModal(true)}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Restart
            </button>
            <Link href="/games/pool">
              <button className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                Quit
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Score Board */}
        {gameState && (
          <div className="w-full max-w-4xl mb-4 flex justify-between items-center gap-4">
            <div
              className={`flex-1 p-4 rounded-lg border-2 ${
                gameState.currentPlayer === 1
                  ? "border-[#8CECF7] bg-[#8CECF7]/10"
                  : "border-gray-800 bg-gray-900/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Player 1</h3>
                  <p className="text-sm text-gray-400">
                    {gameState.player1Type
                      ? gameState.player1Type === "solid"
                        ? "Solids (1-7)"
                        : "Stripes (9-15)"
                      : "Not assigned"}
                  </p>
                </div>
                <div className="text-3xl font-bold text-[#AAFDBB]">
                  {gameState.player1Score}
                </div>
              </div>
            </div>

            <div className="px-6 text-2xl font-bold text-gray-600">VS</div>

            <div
              className={`flex-1 p-4 rounded-lg border-2 ${
                gameState.currentPlayer === 2
                  ? "border-[#8CECF7] bg-[#8CECF7]/10"
                  : "border-gray-800 bg-gray-900/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">
                    {gameMode === "computer" ? "Computer" : "Player 2"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {gameState.player2Type
                      ? gameState.player2Type === "solid"
                        ? "Solids (1-7)"
                        : "Stripes (9-15)"
                      : "Not assigned"}
                  </p>
                </div>
                <div className="text-3xl font-bold text-[#6C85EA]">
                  {gameState.player2Score}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Canvas */}
        <div className="relative max-w-4xl w-full flex justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="border-4 border-[#8B4513] rounded-lg shadow-2xl cursor-crosshair"
            style={{ display: "block", backgroundColor: "#0a5f38" }}
          />
        </div>

        {/* Instructions */}
        {gameState &&
          gameState.gameStatus === "aiming" &&
          gameState.canShoot && (
            <div className="mt-4 text-gray-400 text-sm text-center max-w-md">
              Click on the cue ball and drag away to aim. Pull farther to
              increase power.
            </div>
          )}
      </div>

      {/* Restart Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 border-2 border-gray-700 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-4">
              Restart Game?
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Are you sure you want to restart? Current progress will be lost.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Restart
              </button>
              <button
                onClick={() => setShowRestartModal(false)}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState && gameState.gameStatus === "gameOver" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 border-2 border-[#8CECF7] max-w-md w-full mx-4">
            <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
              Game Over!
            </h2>
            <div className="text-center mb-6">
              <p className="text-xl mb-2">
                {gameState.winner === 1
                  ? "Player 1 Wins!"
                  : gameMode === "computer"
                  ? "Computer Wins!"
                  : "Player 2 Wins!"}
              </p>
              <p className="text-gray-400">
                Final Score: {gameState.player1Score} - {gameState.player2Score}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold"
              >
                Play Again
              </button>
              <button
                onClick={() => router.push("/games/pool")}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-700 text-gray-300"
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
