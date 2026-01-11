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
  const gameStateRef = useRef<GameState | null>(null);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStart, setAimStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [mounted] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  const gameMode = (searchParams.get("mode") as GameMode) || "player";

  // Initialize Web Audio context (runs once on mount)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const AudioCtx =
      (
        window as unknown as {
          AudioContext?: typeof AudioContext;
          webkitAudioContext?: typeof AudioContext;
        }
      ).AudioContext ||
      (
        window as unknown as {
          AudioContext?: typeof AudioContext;
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      audioContextRef.current = new AudioCtx();
    } catch {
      audioContextRef.current = null;
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const playShotSound = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(750, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      320,
      ctx.currentTime + 0.12
    );

    gainNode.gain.setValueAtTime(0.45, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.12);
  }, []);

  const playPocketSound = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(220, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      90,
      ctx.currentTime + 0.18
    );

    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.18);
  }, []);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initTimeout = setTimeout(() => {
      const rect = canvas.getBoundingClientRect();
      const tableWidth = Math.min(1200, rect.width || 1200);
      const tableHeight = tableWidth * 0.5; // 2:1 ratio

      canvas.width = tableWidth;
      canvas.height = tableHeight;

      canvas.style.width = `${tableWidth}px`;
      canvas.style.height = `${tableHeight}px`;

      const engine = new PoolGameEngine(tableWidth, tableHeight, gameMode);
      engineRef.current = engine;

      engine.setStateChangeCallback((state) => {
        gameStateRef.current = state;
        setGameState(state);
      });

      engine.setEventCallbacks({
        onShot: () => {
          playShotSound();
        },
        onPocket: () => {
          playPocketSound();
        },
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
    };
  }, [gameMode, playShotSound, playPocketSound]);

  const drawTable = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Table background
    ctx.fillStyle = "#0a5f38";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Table border (wood)
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Playing surface
    ctx.fillStyle = "#0a5f38";
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner border decoration
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 3;
    ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);

    // Center line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);
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
      const cueDistance = 30 + (power / 100) * 50;

      const startX =
        cueBall.position.x + Math.cos(angle + Math.PI) * cueDistance;
      const startY =
        cueBall.position.y + Math.sin(angle + Math.PI) * cueDistance;
      const endX = startX + Math.cos(angle + Math.PI) * cueLength;
      const endY = startY + Math.sin(angle + Math.PI) * cueLength;

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "#4169E1");
      gradient.addColorStop(0.2, "#8B4513");
      gradient.addColorStop(0.7, "#D2691E");
      gradient.addColorStop(1, "#F4A460");

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(startX, startY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#4169E1";
      ctx.fill();

      const aimLineLength = 200;
      const aimEndX = cueBall.position.x + Math.cos(angle) * aimLineLength;
      const aimEndY = cueBall.position.y + Math.sin(angle) * aimLineLength;

      ctx.beginPath();
      ctx.moveTo(cueBall.position.x, cueBall.position.y);
      ctx.lineTo(aimEndX, aimEndY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    []
  );

  const drawPowerBar = useCallback(
    (ctx: CanvasRenderingContext2D, state: GameState) => {
      if (state.gameStatus !== "aiming" || !state.canShoot) return;

      const barWidth = 220;
      const barHeight = 22;
      const barX = (canvasRef.current!.width - barWidth) / 2;
      const barY = canvasRef.current!.height - 50;

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      const powerWidth = (state.cuePower / 100) * barWidth;
      const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      gradient.addColorStop(0, "#00FF00");
      gradient.addColorStop(0.5, "#FFFF00");
      gradient.addColorStop(1, "#FF0000");

      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, powerWidth, barHeight);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("POWER", barX + barWidth / 2, barY - 10);
    },
    []
  );

  const renderFrame = useCallback(
    (ctx: CanvasRenderingContext2D, state: GameState) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTable(ctx);
      drawPockets(ctx, state.pockets);

      state.balls.forEach((ball) => {
        drawBall(ctx, ball);
      });

      drawCue(ctx, state);
      drawPowerBar(ctx, state);
    },
    [drawTable, drawPockets, drawBall, drawCue, drawPowerBar]
  );

  // Continuous render loop (decoupled from React state for smoothness)
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const render = () => {
      const state = gameStateRef.current;
      if (state) {
        renderFrame(ctx, state);
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [renderFrame]);

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Initializing game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8CECF7]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
      </div>

      {/* Debug Info */}
      {gameState && (
        <div className="fixed top-2 left-2 bg-black/80 text-white p-2 text-xs z-50 rounded">
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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
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
        <div className="relative" style={{ maxWidth: "1200px", width: "100%" }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="border-4 border-[#8B4513] rounded-2xl shadow-2xl shadow-black/80 cursor-crosshair bg-[#0a5f38] w-full transition-transform duration-300 hover:scale-[1.01]"
            style={{ display: "block" }}
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
            <div className="mt-4 text-gray-400 text-sm text-center max-w-md">
              Click on the cue ball and drag in the opposite direction to aim.
              Pull farther to increase power, then release to shoot.
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
