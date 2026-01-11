"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const renderLoopRef = useRef<number | null>(null);

  const gameMode = (searchParams.get("mode") as GameMode) || "player";

  // Initialize game
  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use a timeout to ensure the canvas is fully rendered
    const initTimeout = setTimeout(() => {
      const rect = canvas.getBoundingClientRect();
      const tableWidth = Math.min(800, rect.width || 800);
      const tableHeight = tableWidth * 0.5; // 2:1 ratio

      canvas.width = tableWidth;
      canvas.height = tableHeight;

      const engine = new PoolGameEngine(tableWidth, tableHeight, gameMode);
      engineRef.current = engine;

      engine.setStateChangeCallback((state) => {
        setGameState(state);
      });

      engine.startGame();
      const initialState = engine.getState();
      setGameState(initialState);
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
      if (renderLoopRef.current) {
        cancelAnimationFrame(renderLoopRef.current);
      }
    };
  }, [gameMode]);

  // Drawing functions
  const drawTable = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Table background
    ctx.fillStyle = "#0a5f38";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Table border
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Inner border
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  }, []);

  const drawPockets = useCallback(
    (ctx: CanvasRenderingContext2D, pockets: Pocket[]) => {
      pockets.forEach((pocket) => {
        // Outer shadow
        ctx.beginPath();
        ctx.arc(
          pocket.position.x,
          pocket.position.y,
          pocket.radius + 2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fill();

        // Pocket hole
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

        // Highlight
        ctx.beginPath();
        ctx.arc(
          pocket.position.x - 3,
          pocket.position.y - 3,
          pocket.radius / 3,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fill();
      });
    },
    []
  );

  const drawBall = useCallback((ctx: CanvasRenderingContext2D, ball: Ball) => {
    if (ball.pocketed) return;

    const { position, radius, color, type, number } = ball;

    // Ball shadow
    ctx.beginPath();
    ctx.arc(position.x + 2, position.y + 2, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();

    // Ball body
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Ball highlight
    const gradient = ctx.createRadialGradient(
      position.x - radius / 3,
      position.y - radius / 3,
      0,
      position.x - radius / 3,
      position.y - radius / 3,
      radius
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)");
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Ball outline
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw stripe for stripe balls
    if (type === "stripe" && number > 8) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(
        position.x - radius,
        position.y - radius / 3,
        radius * 2,
        (radius * 2) / 3
      );
      ctx.restore();
    }

    // Ball number
    if (type !== "cue") {
      const numberCircleRadius = radius * 0.5;
      ctx.beginPath();
      ctx.arc(position.x, position.y, numberCircleRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = `bold ${radius * 0.8}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(number.toString(), position.x, position.y);
    }
  }, []);

  const drawCue = useCallback(
    (ctx: CanvasRenderingContext2D, state: GameState) => {
      if (state.gameStatus !== "aiming" || !state.canShoot) return;

      const cueBall = state.balls.find((b) => b.type === "cue" && !b.pocketed);
      if (!cueBall) return;

      const angle = state.cueAngle;
      const power = state.cuePower;
      const cueLength = 150;
      const cueDistance = 30 + (100 - power) * 0.5; // Cue pulls back with power

      const startX = cueBall.position.x + Math.cos(angle) * cueDistance;
      const startY = cueBall.position.y + Math.sin(angle) * cueDistance;
      const endX = startX + Math.cos(angle) * cueLength;
      const endY = startY + Math.sin(angle) * cueLength;

      // Cue stick
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "#8B4513");
      gradient.addColorStop(0.7, "#D2691E");
      gradient.addColorStop(1, "#F4A460");

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();

      // Cue tip
      ctx.beginPath();
      ctx.arc(startX, startY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#4169E1";
      ctx.fill();

      // Aim line
      const aimLineLength = 200;
      const aimEndX = cueBall.position.x + Math.cos(angle) * aimLineLength;
      const aimEndY = cueBall.position.y + Math.sin(angle) * aimLineLength;

      ctx.beginPath();
      ctx.moveTo(cueBall.position.x, cueBall.position.y);
      ctx.lineTo(aimEndX, aimEndY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    []
  );

  const drawPowerBar = useCallback(
    (ctx: CanvasRenderingContext2D, state: GameState) => {
      if (state.gameStatus !== "aiming" || !state.canShoot) return;

      const barWidth = 200;
      const barHeight = 20;
      const barX = (canvasRef.current!.width - barWidth) / 2;
      const barY = canvasRef.current!.height - 40;

      // Background
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);

      // Bar outline
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Power fill
      const powerWidth = (state.cuePower / 100) * barWidth;
      const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      gradient.addColorStop(0, "#00FF00");
      gradient.addColorStop(0.5, "#FFFF00");
      gradient.addColorStop(1, "#FF0000");

      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, powerWidth, barHeight);

      // Label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("POWER", barX + barWidth / 2, barY - 10);
    },
    []
  );

  // Continuous render loop
  useEffect(() => {
    if (!gameState || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTable(ctx);
      drawPockets(ctx, gameState.pockets);

      // Draw all balls
      gameState.balls.forEach((ball) => {
        drawBall(ctx, ball);
      });

      drawCue(ctx, gameState);
      drawPowerBar(ctx, gameState);

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, drawTable, drawPockets, drawBall, drawCue, drawPowerBar]);

  // Mouse handlers for aiming and shooting
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      !gameState ||
      !canvasRef.current ||
      gameState.gameStatus !== "aiming" ||
      !gameState.canShoot
    ) {
      return;
    }

    if (gameState.gameMode === "computer" && gameState.currentPlayer === 2) {
      return;
    }

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
    if (!isAiming || !gameState || !canvasRef.current || !aimStart) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cueBall = gameState.balls.find(
      (b) => b.type === "cue" && !b.pocketed
    );
    if (!cueBall) return;

    const dx = x - cueBall.position.x;
    const dy = y - cueBall.position.y;
    const angle = Math.atan2(dy, dx);

    const pullBackX = x - cueBall.position.x;
    const pullBackY = y - cueBall.position.y;
    const pullBackDistance = Math.sqrt(
      pullBackX * pullBackX + pullBackY * pullBackY
    );
    const power = Math.min(100, Math.max(10, (pullBackDistance / 100) * 100));

    if (engineRef.current) {
      engineRef.current.setCueAngle(angle);
      engineRef.current.setCuePower(power);
    }
  };

  const handleMouseUp = () => {
    if (isAiming && engineRef.current && gameState) {
      engineRef.current.shoot();
    }
    setIsAiming(false);
    setAimStart(null);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (
      !gameState ||
      !canvasRef.current ||
      gameState.gameStatus !== "aiming" ||
      !gameState.canShoot
    ) {
      return;
    }

    if (gameState.gameMode === "computer" && gameState.currentPlayer === 2) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

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

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAiming || !gameState || !canvasRef.current || !aimStart) return;

    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const cueBall = gameState.balls.find(
      (b) => b.type === "cue" && !b.pocketed
    );
    if (!cueBall) return;

    const dx = x - cueBall.position.x;
    const dy = y - cueBall.position.y;
    const angle = Math.atan2(dy, dx);

    const pullBackX = x - cueBall.position.x;
    const pullBackY = y - cueBall.position.y;
    const pullBackDistance = Math.sqrt(
      pullBackX * pullBackX + pullBackY * pullBackY
    );
    const power = Math.min(100, Math.max(10, (pullBackDistance / 100) * 100));

    if (engineRef.current) {
      engineRef.current.setCueAngle(angle);
      engineRef.current.setCuePower(power);
    }
  };

  const handleTouchEnd = () => {
    if (isAiming && engineRef.current && gameState) {
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

  const handleQuit = () => {
    router.push("/games/pool");
  };

  // Show loading only if not mounted yet
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Initializing game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex flex-col">
      {/* Header */}
      <div className="bg-black border-b border-gray-800/50 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
              8-Ball Pool
            </h1>
            <p className="text-gray-400 text-sm">
              {gameMode === "player"
                ? "Player vs Player"
                : "Player vs Computer"}
            </p>
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
          <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
            {/* Player 1 */}
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

            {/* VS */}
            <div className="px-6 text-2xl font-bold text-gray-600">VS</div>

            {/* Player 2 */}
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
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="border-4 border-[#8B4513] rounded-lg shadow-2xl cursor-crosshair bg-[#0a5f38]"
            style={{ maxWidth: "100%", height: "auto" }}
          />

          {/* Status Messages */}
          {gameState && gameState.foul && gameState.gameStatus === "aiming" && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg">
              FOUL! Turn switched
            </div>
          )}

          {gameState && gameState.gameStatus === "shooting" && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white px-6 py-2 rounded-lg font-bold shadow-lg">
              Balls in motion...
            </div>
          )}

          {gameState &&
            gameMode === "computer" &&
            gameState.currentPlayer === 2 &&
            gameState.gameStatus === "aiming" && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg animate-pulse">
                Computer is thinking...
              </div>
            )}
        </div>

        {/* Instructions */}
        {gameState &&
          gameState.gameStatus === "aiming" &&
          gameState.canShoot &&
          !(gameMode === "computer" && gameState.currentPlayer === 2) && (
            <div className="mt-4 text-gray-400 text-sm text-center">
              Click and drag on the cue ball to aim. Pull back to set power,
              release to shoot.
            </div>
          )}
      </div>

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

      {/* Restart Confirmation Modal */}
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
                className="flex-1 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
              >
                Restart
              </button>
              <button
                onClick={() => setShowRestartModal(false)}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
