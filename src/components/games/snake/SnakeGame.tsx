"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  SnakeGameEngine,
  GameState,
  SnakeSkin,
  FruitType,
  GameMode,
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

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SnakeGameEngine | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Initialize game engine
  useEffect(() => {
    engineRef.current = new SnakeGameEngine(20);
    const unsubscribe = engineRef.current.subscribe(setGameState);
    setGameState(engineRef.current.getState());

    return () => {
      unsubscribe();
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

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
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-black p-4">
      <div className="w-full max-w-4xl">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link href="/">
            <button className="font-[family-name:var(--font-oxanium)] px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </Link>
        </div>

        {/* Game Header */}
        <div className="mb-6 text-center">
          <h1 className="font-[family-name:var(--font-oxanium)] text-4xl md:text-5xl font-bold text-white mb-2">
            Snake Game
          </h1>
          <p className="font-[family-name:var(--font-oxanium)] text-sm text-gray-400 mb-3">
            Mode:{" "}
            <span className="text-white font-semibold">
              {gameModes[gameState.gameMode].name}
            </span>
          </p>
          <div className="flex justify-center gap-8 font-[family-name:var(--font-oxanium)]">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Score</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text text-transparent">
                {gameState.score}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">
                High Score ({gameModes[gameState.gameMode].name})
              </p>
              <p className="text-2xl font-bold text-white">
                {gameState.highScore}
              </p>
            </div>
          </div>
        </div>

        {/* Skin Selection */}
        <div className="mb-6 space-y-4">
          {/* Game Mode Selection */}
          <div className="text-center">
            <h3 className="font-[family-name:var(--font-oxanium)] text-lg font-semibold text-white mb-3">
              Difficulty
            </h3>
            <div className="flex justify-center gap-3 flex-wrap">
              {(Object.keys(gameModes) as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => engineRef.current?.setGameMode(mode)}
                  disabled={gameState.status === "playing"}
                  className={`px-6 py-2 rounded-lg font-[family-name:var(--font-oxanium)] font-semibold transition-all ${
                    gameState.gameMode === mode
                      ? "bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black scale-105"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  } ${
                    gameState.status === "playing"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div>{gameModes[mode].name}</div>
                  <div className="text-xs opacity-75">
                    {gameModes[mode].description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Snake Skin Selection */}
          <div className="text-center">
            <h3 className="font-[family-name:var(--font-oxanium)] text-lg font-semibold text-white mb-3">
              Snake Skin
            </h3>
            <div className="flex justify-center gap-3 flex-wrap">
              {(Object.keys(snakeSkins) as SnakeSkin[]).map((skin) => (
                <button
                  key={skin}
                  onClick={() => engineRef.current?.setSnakeSkin(skin)}
                  disabled={gameState.status === "playing"}
                  className={`px-4 py-2 rounded-lg font-[family-name:var(--font-oxanium)] font-semibold transition-all ${
                    gameState.snakeSkin === skin
                      ? "bg-gradient-to-r from-white to-gray-200 text-black scale-105"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  } ${
                    gameState.status === "playing"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  style={{
                    background:
                      gameState.snakeSkin === skin
                        ? `linear-gradient(to right, ${snakeSkins[skin].head[0]}, ${snakeSkins[skin].head[2]})`
                        : undefined,
                  }}
                >
                  {snakeSkins[skin].name}
                </button>
              ))}
            </div>
          </div>

          {/* Fruit Type Selection */}
          <div className="text-center">
            <h3 className="font-[family-name:var(--font-oxanium)] text-lg font-semibold text-white mb-3">
              Fruit Type
            </h3>
            <div className="flex justify-center gap-3 flex-wrap">
              {(Object.keys(fruitTypes) as FruitType[]).map((fruit) => (
                <button
                  key={fruit}
                  onClick={() => engineRef.current?.setFruitType(fruit)}
                  disabled={gameState.status === "playing"}
                  className={`px-4 py-2 rounded-lg font-[family-name:var(--font-oxanium)] font-semibold transition-all ${
                    gameState.fruitType === fruit
                      ? "text-black scale-105"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  } ${
                    gameState.status === "playing"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  style={{
                    background:
                      gameState.fruitType === fruit
                        ? `linear-gradient(to right, ${fruitTypes[fruit].colors[0]}, ${fruitTypes[fruit].colors[1]})`
                        : undefined,
                  }}
                >
                  {fruitTypes[fruit].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative mx-auto" style={{ maxWidth: "600px" }}>
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="border-2 border-gray-800 rounded-lg shadow-2xl w-full h-auto"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {/* Game Over Overlay */}
          {gameState.status === "gameOver" && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="text-center font-[family-name:var(--font-oxanium)]">
                {countdown !== null ? (
                  <div>
                    <h2 className="text-8xl font-bold text-white mb-4 animate-pulse">
                      {countdown === 0 ? "GO!" : countdown}
                    </h2>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold text-white mb-4">
                      Game Over!
                    </h2>
                    <p className="text-xl text-gray-300 mb-2">
                      Final Score: {gameState.score}
                    </p>
                    {gameState.score === gameState.highScore &&
                      gameState.score > 0 && (
                        <p className="text-lg text-yellow-400 mb-6">
                          🎉 New High Score! 🎉
                        </p>
                      )}
                    <button
                      onClick={handleStart}
                      className="px-8 py-3 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:scale-105 transition-transform"
                    >
                      Play Again
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Idle/Start Overlay */}
          {gameState.status === "idle" && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="text-center font-[family-name:var(--font-oxanium)] p-6">
                {countdown !== null ? (
                  <div>
                    <h2 className="text-8xl font-bold text-white mb-4 animate-pulse">
                      {countdown === 0 ? "GO!" : countdown}
                    </h2>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold text-white mb-2">
                      Ready to Play?
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Use arrow keys or WASD to control the snake
                    </p>
                    <button
                      onClick={handleStart}
                      className="px-8 py-3 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:scale-105 transition-transform mb-4"
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
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="text-center font-[family-name:var(--font-oxanium)]">
                <h2 className="text-4xl font-bold text-white mb-6">Paused</h2>
                <button
                  onClick={handlePause}
                  className="px-8 py-3 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:scale-105 transition-transform"
                >
                  Resume
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="mt-6 flex justify-center gap-4 font-[family-name:var(--font-oxanium)]">
          {gameState.status === "playing" && (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Pause
            </button>
          )}
          {gameState.status === "paused" && (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:scale-105 transition-transform"
            >
              Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
