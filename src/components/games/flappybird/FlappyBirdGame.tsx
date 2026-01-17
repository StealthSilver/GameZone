"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FlappyBirdGameEngine, GameState } from "./FlappyBirdGameEngine";

export const FlappyBirdGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<FlappyBirdGameEngine | null>(null);
  const router = useRouter();

  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game engine
    const engine = new FlappyBirdGameEngine(canvas);
    gameEngineRef.current = engine;

    const applyResponsiveSize = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (isDesktop) {
        // Desktop sizing
        const maxHeight = Math.min(viewportHeight - 200, 600);
        const maxWidth = Math.min(viewportWidth - 600, 400);
        engine.resize(maxWidth, maxHeight);
      } else {
        // Mobile sizing
        const maxHeight = Math.min(viewportHeight - 420, 500);
        const maxWidth = Math.min(viewportWidth - 48, 340);
        engine.resize(maxWidth, maxHeight);
      }
    };

    applyResponsiveSize();

    // Set up callbacks
    engine.onScoreUpdate = (newScore) => {
      setScore(newScore);
    };

    engine.onGameOver = () => {
      // Game over handled by state change
    };

    engine.onStateChange = (state) => {
      setGameState(state);
      setIsPaused(state === "paused");
    };

    // Start the game (in waiting state)
    engine.start();

    // Handle window resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        applyResponsiveSize();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (gameEngineRef.current) {
          if (gameEngineRef.current.getState() === "countdown") {
            startCountdown();
          } else {
            gameEngineRef.current.flap();
          }
        }
      } else if (e.code === "Escape") {
        if (gameEngineRef.current?.getState() === "playing") {
          gameEngineRef.current.pause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  const startCountdown = () => {
    if (gameState !== "countdown") return;

    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        clearInterval(countdownInterval);
        if (gameEngineRef.current) {
          gameEngineRef.current.startPlaying();
        }
      }
    }, 1000);
  };

  const handleCanvasClick = () => {
    if (!gameEngineRef.current) return;

    if (gameState === "countdown") {
      startCountdown();
    } else if (gameState === "playing") {
      gameEngineRef.current.flap();
    }
  };

  const handlePause = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
    }
  };

  const handleResume = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resume();
    }
  };

  const handleRestart = () => {
    if (gameEngineRef.current) {
      setScore(0);
      setCountdown(null);
      gameEngineRef.current.reset();
    }
  };

  const handleQuit = () => {
    router.push("/games");
  };

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8CECF7]/10 rounded-full blur-3xl" />
      </div>

      {/* Game Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Score Display */}
        <div className="mb-4 text-center">
          <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
            {score}
          </div>
          <div className="text-gray-400 text-sm">Score</div>
        </div>

        {/* Canvas Container */}
        <div className="relative mb-6">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="border-4 border-gray-800 rounded-lg shadow-2xl cursor-pointer"
          />

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {/* Click to Start Overlay */}
          {gameState === "countdown" && countdown === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  Click to Start
                </div>
                <div className="text-gray-300 text-sm">
                  Tap or press Space to flap
                </div>
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === "gameOver" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-500 mb-4">
                  Game Over!
                </div>
                <div className="text-2xl text-white mb-6">
                  Final Score: {score}
                </div>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-6">Paused</div>
                <button
                  onClick={handleResume}
                  className="px-6 py-3 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300"
                >
                  Resume
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 flex-wrap justify-center">
          {gameState === "playing" && (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors duration-300"
            >
              Pause
            </button>
          )}
          {(gameState === "gameOver" || gameState === "paused") && (
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300"
            >
              Restart
            </button>
          )}
          <button
            onClick={handleQuit}
            className="px-6 py-3 bg-red-900/50 text-white rounded-lg border border-red-800 hover:bg-red-900/70 transition-colors duration-300"
          >
            Quit
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-400 text-sm max-w-md">
          <p className="mb-2">
            <span className="text-[#8CECF7]">Click</span> or press{" "}
            <span className="text-[#8CECF7]">Space/↑</span> to flap
          </p>
          <p>Navigate through the pipes without hitting them!</p>
        </div>
      </div>
    </div>
  );
};
