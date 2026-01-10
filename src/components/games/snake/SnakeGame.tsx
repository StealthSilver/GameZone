"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SnakeGameEngine, Direction } from "./SnakeGameEngine";

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SnakeGameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const GRID_SIZE = 20;
  const TILE_SIZE = 25;

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = engine.getState();

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * TILE_SIZE, 0);
      ctx.lineTo(i * TILE_SIZE, GRID_SIZE * TILE_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * TILE_SIZE);
      ctx.lineTo(GRID_SIZE * TILE_SIZE, i * TILE_SIZE);
      ctx.stroke();
    }

    // Draw snake
    state.snake.forEach((segment, index) => {
      const gradient = ctx.createLinearGradient(
        segment.x * TILE_SIZE,
        segment.y * TILE_SIZE,
        (segment.x + 1) * TILE_SIZE,
        (segment.y + 1) * TILE_SIZE
      );

      if (index === 0) {
        // Head - brighter gradient
        gradient.addColorStop(0, "#AAFDBB");
        gradient.addColorStop(0.5, "#8CECF7");
        gradient.addColorStop(1, "#6C85EA");
      } else {
        // Body - dimmer gradient
        gradient.addColorStop(0, "#6BCCA0");
        gradient.addColorStop(0.5, "#5CB8D5");
        gradient.addColorStop(1, "#4A67C8");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(
        segment.x * TILE_SIZE + 1,
        segment.y * TILE_SIZE + 1,
        TILE_SIZE - 2,
        TILE_SIZE - 2
      );

      // Add shine effect on head
      if (index === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(
          segment.x * TILE_SIZE + 2,
          segment.y * TILE_SIZE + 2,
          TILE_SIZE - 10,
          TILE_SIZE - 10
        );
      }
    });

    // Draw fruit
    const fruit = state.fruit;
    const fruitGradient = ctx.createRadialGradient(
      fruit.x * TILE_SIZE + TILE_SIZE / 2,
      fruit.y * TILE_SIZE + TILE_SIZE / 2,
      2,
      fruit.x * TILE_SIZE + TILE_SIZE / 2,
      fruit.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2
    );
    fruitGradient.addColorStop(0, "#FF6B6B");
    fruitGradient.addColorStop(1, "#C92A2A");

    ctx.fillStyle = fruitGradient;
    ctx.beginPath();
    ctx.arc(
      fruit.x * TILE_SIZE + TILE_SIZE / 2,
      fruit.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Add shine to fruit
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(
      fruit.x * TILE_SIZE + TILE_SIZE / 3,
      fruit.y * TILE_SIZE + TILE_SIZE / 3,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, []);

  const updateGame = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const state = engine.getState();
    setScore(state.score);
    setHighScore(state.highScore);
    setGameOver(state.gameOver);
    setIsPaused(state.isPaused);

    drawGame();
  }, [drawGame]);

  const startGame = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new SnakeGameEngine(GRID_SIZE, TILE_SIZE);
    } else {
      engineRef.current.reset();
    }
    setGameStarted(true);
    setGameOver(false);
    setIsPaused(false);
    engineRef.current.start(updateGame);
    updateGame();
  }, [updateGame]);

  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || gameOver || !gameStarted) return;

    engine.togglePause();
    setIsPaused(engine.getState().isPaused);
  }, [gameOver, gameStarted]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine || !gameStarted) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          engine.changeDirection(Direction.UP);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          engine.changeDirection(Direction.DOWN);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          engine.changeDirection(Direction.LEFT);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          engine.changeDirection(Direction.RIGHT);
          break;
        case " ":
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, togglePause]);

  useEffect(() => {
    // Initialize engine and draw initial state
    if (!engineRef.current) {
      engineRef.current = new SnakeGameEngine(GRID_SIZE, TILE_SIZE);
      setHighScore(engineRef.current.getState().highScore);
    }
    drawGame();

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [drawGame]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-black px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="font-[family-name:var(--font-oxanium)] text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text mb-2">
            Snake Game
          </h1>
          <p className="font-[family-name:var(--font-oxanium)] text-gray-400 text-sm">
            Use Arrow Keys or WASD to control • Space to Pause
          </p>
        </div>

        {/* Score Board */}
        <div className="flex justify-between mb-4 gap-4">
          <div className="flex-1 bg-gradient-to-br from-gray-900/80 to-gray-950/80 rounded-lg p-4 border border-gray-800/50 backdrop-blur-sm">
            <p className="font-[family-name:var(--font-oxanium)] text-gray-400 text-sm mb-1">
              Score
            </p>
            <p className="font-[family-name:var(--font-oxanium)] text-3xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
              {score}
            </p>
          </div>
          <div className="flex-1 bg-gradient-to-br from-gray-900/80 to-gray-950/80 rounded-lg p-4 border border-gray-800/50 backdrop-blur-sm">
            <p className="font-[family-name:var(--font-oxanium)] text-gray-400 text-sm mb-1">
              High Score
            </p>
            <p className="font-[family-name:var(--font-oxanium)] text-3xl font-bold text-transparent bg-gradient-to-r from-[#8CECF7] to-[#6C85EA] bg-clip-text">
              {highScore}
            </p>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * TILE_SIZE}
            height={GRID_SIZE * TILE_SIZE}
            className="border-2 border-gray-800 rounded-lg w-full h-auto bg-[#0a0a0a] shadow-2xl shadow-[#8CECF7]/10"
          />

          {/* Overlays */}
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <p className="font-[family-name:var(--font-oxanium)] text-white text-xl mb-4">
                  Press Start to Play
                </p>
                <button
                  onClick={startGame}
                  className="font-[family-name:var(--font-oxanium)] px-8 py-3 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold text-lg rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-[#8CECF7]/50"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <p className="font-[family-name:var(--font-oxanium)] text-red-500 text-3xl font-bold mb-2">
                  Game Over!
                </p>
                <p className="font-[family-name:var(--font-oxanium)] text-white text-xl mb-4">
                  Final Score: {score}
                </p>
                <button
                  onClick={startGame}
                  className="font-[family-name:var(--font-oxanium)] px-8 py-3 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold text-lg rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-[#8CECF7]/50"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {isPaused && !gameOver && gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <p className="font-[family-name:var(--font-oxanium)] text-white text-3xl font-bold mb-2">
                  Paused
                </p>
                <p className="font-[family-name:var(--font-oxanium)] text-gray-400 text-sm">
                  Press Space to Resume
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {!gameStarted || gameOver ? (
            <button
              onClick={startGame}
              className="font-[family-name:var(--font-oxanium)] px-6 py-2 bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-[#8CECF7]/50"
            >
              {gameOver ? "Restart" : "Start Game"}
            </button>
          ) : (
            <button
              onClick={togglePause}
              className="font-[family-name:var(--font-oxanium)] px-6 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors duration-300 border border-gray-700"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
