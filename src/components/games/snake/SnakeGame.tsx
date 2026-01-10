"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  SnakeGameEngine,
  GameState,
  SnakeSkin,
  FruitType,
  GameMode,
  GameStatus,
} from "./SnakeGameEngine";

// Snake skin color schemes
const snakeSkins = {
  classic: {
    name: "Classic",
    head: ["#AAFDBB", "#8CECF7", "#6C85EA"],
    body: ["#AAFDBB", "#8CECF7", "#6C85EA"],
  },
  ocean: {
    name: "Ocean",
    head: ["#00D4FF", "#0099CC", "#006699"],
    body: ["#00D4FF", "#0099CC", "#006699"],
  },
  fire: {
    name: "Fire",
    head: ["#FF6B35", "#FF4500", "#CC0000"],
    body: ["#FF6B35", "#FF4500", "#CC0000"],
  },
  forest: {
    name: "Forest",
    head: ["#90EE90", "#32CD32", "#228B22"],
    body: ["#90EE90", "#32CD32", "#228B22"],
  },
};

// Fruit types with colors
const fruitTypes = {
  apple: { name: "Apple", colors: ["#ff6b6b", "#ff0000"] },
  cherry: { name: "Cherry", colors: ["#ff1493", "#dc143c"] },
  orange: { name: "Orange", colors: ["#ffa500", "#ff8c00"] },
  grape: { name: "Grape", colors: ["#9370db", "#8b008b"] },
};

// Game modes
const gameModes = {
  easy: { name: "Easy", description: "Slow speed" },
  medium: { name: "Medium", description: "Normal speed" },
  hard: { name: "Hard", description: "Fast speed" },
};

interface SnakeGameProps {
  initialSkin?: SnakeSkin;
  initialFruit?: FruitType;
  initialMode?: GameMode;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({
  initialSkin = "classic",
  initialFruit = "apple",
  initialMode = "medium",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SnakeGameEngine | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousScoreRef = useRef<number>(0);
  const previousStatusRef = useRef<GameStatus>("idle");

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play eating sound
  const playEatSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Pleasant "pop" sound
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      400,
      ctx.currentTime + 0.1
    );

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, []);

  // Play crash sound
  const playCrashSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Harsh crash sound
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      50,
      ctx.currentTime + 0.3
    );

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }, []);

  // Initialize game engine
  useEffect(() => {
    engineRef.current = new SnakeGameEngine(20);
    const unsubscribe = engineRef.current.subscribe(setGameState);

    // Set initial customization
    engineRef.current.setSnakeSkin(initialSkin);
    engineRef.current.setFruitType(initialFruit);
    engineRef.current.setGameMode(initialMode);

    setGameState(engineRef.current.getState());

    return () => {
      unsubscribe();
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [initialSkin, initialFruit, initialMode]);

  // Detect score changes (eating food) and game over
  useEffect(() => {
    if (!gameState) return;

    // Check if score increased (food eaten)
    if (
      gameState.score > previousScoreRef.current &&
      gameState.status === "playing"
    ) {
      playEatSound();
    }
    previousScoreRef.current = gameState.score;

    // Check if game just ended
    if (
      gameState.status === "gameOver" &&
      previousStatusRef.current === "playing"
    ) {
      playCrashSound();
    }
    previousStatusRef.current = gameState.status;
  }, [gameState?.score, gameState?.status, playEatSound, playCrashSound]);

  // Start game loop
  const startGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    const loop = () => {
      if (engineRef.current) {
        const state = engineRef.current.getState();
        engineRef.current.update();

        // Adjust interval based on speed
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
        gameLoopRef.current = setInterval(loop, state.speed);
      }
    };

    if (engineRef.current) {
      const state = engineRef.current.getState();
      gameLoopRef.current = setInterval(loop, state.speed);
    }
  }, []);

  // Stop game loop
  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  // Handle game status changes
  useEffect(() => {
    if (!gameState) return;

    if (gameState.status === "playing") {
      startGameLoop();
    } else {
      stopGameLoop();
    }

    // Save score when game is over
    if (gameState.status === "gameOver" && gameState.score > 0) {
      saveScore(gameState.score);
    }

    return () => stopGameLoop();
  }, [gameState?.status, startGameLoop, stopGameLoop]);

  const saveScore = async (score: number) => {
    try {
      const gameMode = engineRef.current?.getState().gameMode || "medium";
      const response = await fetch("/api/users/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score, gameMode }),
      });

      const data = await response.json();

      if (response.ok && data.isNewHighScore) {
        console.log(
          "New high score saved!",
          data.highScore,
          "Mode:",
          data.gameMode
        );
      }
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      const state = engineRef.current.getState();

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          engineRef.current.setDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          engineRef.current.setDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          engineRef.current.setDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          engineRef.current.setDirection("RIGHT");
          break;
        case " ":
          e.preventDefault();
          if (state.status === "playing") {
            engineRef.current.pause();
          } else if (state.status === "paused") {
            engineRef.current.resume();
          }
          break;
        case "Enter":
          e.preventDefault();
          if (state.status === "idle" || state.status === "gameOver") {
            engineRef.current.start();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Render game on canvas
  useEffect(() => {
    if (!canvasRef.current || !gameState || !engineRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gridSize = engineRef.current.getGridSize();
    const cellSize = canvas.width / gridSize;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food with glow effect
    const food = gameState.food;
    const foodX = food.x * cellSize;
    const foodY = food.y * cellSize;

    // Get fruit colors based on selected type
    const fruitColors = fruitTypes[gameState.fruitType].colors;

    // Food glow
    const gradient = ctx.createRadialGradient(
      foodX + cellSize / 2,
      foodY + cellSize / 2,
      cellSize / 4,
      foodX + cellSize / 2,
      foodY + cellSize / 2,
      cellSize / 2
    );
    gradient.addColorStop(0, fruitColors[0]);
    gradient.addColorStop(1, fruitColors[1]);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      foodX + cellSize / 2,
      foodY + cellSize / 2,
      cellSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    const skinColors = snakeSkins[gameState.snakeSkin];
    gameState.snake.forEach((segment, index) => {
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;

      if (index === 0) {
        // Snake head with gradient
        const headGradient = ctx.createLinearGradient(
          x,
          y,
          x + cellSize,
          y + cellSize
        );
        headGradient.addColorStop(0, skinColors.head[0]);
        headGradient.addColorStop(0.5, skinColors.head[1]);
        headGradient.addColorStop(1, skinColors.head[2]);
        ctx.fillStyle = headGradient;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // Add eyes
        ctx.fillStyle = "#000000";
        const eyeSize = cellSize / 6;
        const eyeOffset = cellSize / 3;

        if (gameState.direction === "RIGHT") {
          ctx.fillRect(
            x + cellSize - eyeOffset,
            y + eyeOffset - eyeSize / 2,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            x + cellSize - eyeOffset,
            y + cellSize - eyeOffset - eyeSize / 2,
            eyeSize,
            eyeSize
          );
        } else if (gameState.direction === "LEFT") {
          ctx.fillRect(
            x + eyeOffset - eyeSize,
            y + eyeOffset - eyeSize / 2,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            x + eyeOffset - eyeSize,
            y + cellSize - eyeOffset - eyeSize / 2,
            eyeSize,
            eyeSize
          );
        } else if (gameState.direction === "UP") {
          ctx.fillRect(
            x + eyeOffset - eyeSize / 2,
            y + eyeOffset - eyeSize,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            x + cellSize - eyeOffset - eyeSize / 2,
            y + eyeOffset - eyeSize,
            eyeSize,
            eyeSize
          );
        } else if (gameState.direction === "DOWN") {
          ctx.fillRect(
            x + eyeOffset - eyeSize / 2,
            y + cellSize - eyeOffset,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            x + cellSize - eyeOffset - eyeSize / 2,
            y + cellSize - eyeOffset,
            eyeSize,
            eyeSize
          );
        }
      } else {
        // Snake body with gradient based on position
        const bodyOpacity = 1 - (index / gameState.snake.length) * 0.5;
        const bodyGradient = ctx.createLinearGradient(
          x,
          y,
          x + cellSize,
          y + cellSize
        );
        bodyGradient.addColorStop(
          0,
          `${skinColors.body[0]}${Math.floor(bodyOpacity * 255)
            .toString(16)
            .padStart(2, "0")}`
        );
        bodyGradient.addColorStop(
          0.5,
          `${skinColors.body[1]}${Math.floor(bodyOpacity * 255)
            .toString(16)
            .padStart(2, "0")}`
        );
        bodyGradient.addColorStop(
          1,
          `${skinColors.body[2]}${Math.floor(bodyOpacity * 255)
            .toString(16)
            .padStart(2, "0")}`
        );
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      }
    });
  }, [gameState]);

  // Handle button clicks with countdown
  const handleStart = () => {
    setCountdown(3);
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, start the game
      if (engineRef.current) {
        engineRef.current.start();
        setCountdown(null);
      }
    }
  }, [countdown]);

  const handlePause = () => {
    if (engineRef.current) {
      const state = engineRef.current.getState();
      if (state.status === "playing") {
        engineRef.current.pause();
      } else if (state.status === "paused") {
        engineRef.current.resume();
      }
    }
  };

  // Touch controls for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !engineRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 30) {
        engineRef.current.setDirection("RIGHT");
      } else if (deltaX < -30) {
        engineRef.current.setDirection("LEFT");
      }
    } else {
      // Vertical swipe
      if (deltaY > 30) {
        engineRef.current.setDirection("DOWN");
      } else if (deltaY < -30) {
        engineRef.current.setDirection("UP");
      }
    }

    setTouchStart(null);
  };

  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8CECF7]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Game Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
              Snake Game
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              {gameModes[gameState.gameMode].name} •{" "}
              {snakeSkins[gameState.snakeSkin].name} •{" "}
              {fruitTypes[gameState.fruitType].name}
            </p>
            <div className="flex justify-center gap-6 sm:gap-12">
              <div className="text-center">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Score</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text text-transparent">
                  {gameState.score}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">
                  High Score
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {gameState.highScore}
                </p>
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="relative mx-auto">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="border-2 border-gray-800/50 rounded-xl shadow-2xl shadow-[#8CECF7]/10 w-full h-auto touch-none bg-black"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />

            {/* Mobile Touch Controls */}
            {(gameState.status === "playing" ||
              gameState.status === "paused") && (
              <div className="sm:hidden mt-6 grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
                <div></div>
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (engineRef.current) engineRef.current.setDirection("UP");
                  }}
                  className="bg-gray-900/50 border-2 border-gray-800 text-white p-4 rounded-xl active:border-[#8CECF7] active:bg-[#8CECF7]/10 transition-all font-bold text-xl"
                >
                  ↑
                </button>
                <div></div>
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (engineRef.current)
                      engineRef.current.setDirection("LEFT");
                  }}
                  className="bg-gray-900/50 border-2 border-gray-800 text-white p-4 rounded-xl active:border-[#8CECF7] active:bg-[#8CECF7]/10 transition-all font-bold text-xl"
                >
                  ←
                </button>
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (gameState.status === "playing" && engineRef.current) {
                      engineRef.current.pause();
                    } else if (
                      gameState.status === "paused" &&
                      engineRef.current
                    ) {
                      engineRef.current.resume();
                    }
                  }}
                  className="bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black p-4 rounded-xl active:opacity-80 transition-opacity font-bold text-sm shadow-lg shadow-[#8CECF7]/20"
                >
                  {gameState.status === "paused" ? "▶" : "⏸"}
                </button>
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (engineRef.current)
                      engineRef.current.setDirection("RIGHT");
                  }}
                  className="bg-gray-900/50 border-2 border-gray-800 text-white p-4 rounded-xl active:border-[#8CECF7] active:bg-[#8CECF7]/10 transition-all font-bold text-xl"
                >
                  →
                </button>
                <div></div>
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (engineRef.current)
                      engineRef.current.setDirection("DOWN");
                  }}
                  className="bg-gray-900/50 border-2 border-gray-800 text-white p-4 rounded-xl active:border-[#8CECF7] active:bg-[#8CECF7]/10 transition-all font-bold text-xl"
                >
                  ↓
                </button>
                <div></div>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState.status === "gameOver" && (
              <div className="absolute inset-0 bg-black/90 flex flex-col rounded-xl backdrop-blur-sm">
                {countdown === null && (
                  <div className="flex justify-center gap-3 p-4">
                    <Link
                      href="/games/snake"
                      className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-all duration-300 text-sm font-medium"
                    >
                      Game Setup
                    </Link>
                    <Link
                      href="/games"
                      className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-all duration-300 text-sm font-medium"
                    >
                      Back to Games
                    </Link>
                  </div>
                )}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    {countdown !== null ? (
                      <div>
                        <h2 className="text-6xl sm:text-8xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text mb-4 animate-pulse">
                          {countdown === 0 ? "GO!" : countdown}
                        </h2>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                          Game Over!
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 mb-2">
                          Final Score: {gameState.score}
                        </p>
                        {gameState.score === gameState.highScore &&
                          gameState.score > 0 && (
                            <p className="text-base sm:text-lg bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text text-transparent font-bold mb-6">
                              New High Score!
                            </p>
                          )}
                        <button
                          onClick={handleStart}
                          className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black hover:shadow-lg hover:shadow-[#8CECF7]/50 hover:scale-105"
                        >
                          Play Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Idle/Start Overlay */}
            {gameState.status === "idle" && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-xl backdrop-blur-sm">
                <div className="text-center p-6">
                  {countdown !== null ? (
                    <div>
                      <h2 className="text-6xl sm:text-8xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text mb-4 animate-pulse">
                        {countdown === 0 ? "GO!" : countdown}
                      </h2>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                        Ready to Play?
                      </h2>
                      <p className="text-sm sm:text-base text-gray-400 mb-6">
                        <span className="hidden sm:inline">
                          Use arrow keys or WASD to control
                        </span>
                        <span className="sm:hidden">
                          Swipe or use buttons below
                        </span>
                      </p>
                      <button
                        onClick={handleStart}
                        className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black hover:shadow-lg hover:shadow-[#8CECF7]/50 hover:scale-105"
                      >
                        Start Game
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {gameState.status === "paused" && (
              <div className="absolute inset-0 bg-black/90 flex flex-col rounded-xl backdrop-blur-sm">
                <div className="flex justify-center gap-3 p-4">
                  <Link
                    href="/games/snake"
                    className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-all duration-300 text-sm font-medium"
                  >
                    Game Setup
                  </Link>
                  <Link
                    href="/games"
                    className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-all duration-300 text-sm font-medium"
                  >
                    Back to Games
                  </Link>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                      Paused
                    </h2>
                    <button
                      onClick={handlePause}
                      className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black hover:shadow-lg hover:shadow-[#8CECF7]/50 hover:scale-105"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => (window.location.href = "/games")}
              className="px-6 py-3 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-300"
            >
              Back to Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
