"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FlappyBirdGameEngine, GameState } from "./FlappyBirdGameEngine";

export const FlappyBirdGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<FlappyBirdGameEngine | null>(null);
  const router = useRouter();

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasDoneCountdown, setHasDoneCountdown] = useState(false);

  const startCountdown = useCallback(() => {
    const engine = gameEngineRef.current;
    if (!engine) return;

    const state = engine.getState();
    // Only start from countdown state
    if (state !== "countdown") return;

    // If a countdown is already running, do nothing
    if (countdown !== null) return;

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
          setHasDoneCountdown(true);
        }
      }
    }, 1000);
  }, [countdown]);

  const handleCanvasClick = useCallback(() => {
    const engine = gameEngineRef.current;
    if (!engine) return;

    const state = engine.getState();

    // Only allow flapping during gameplay
    if (state === "playing") {
      engine.flap();
    }
  }, []);

  // Touch event handler for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Don't use e.preventDefault() here - causes passive listener warning
      // The touch-none class on canvas will prevent scrolling
      handleCanvasClick();
    },
    [handleCanvasClick],
  );

  const handlePause = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
    }
  }, []);

  const handleResume = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resume();
    }
  }, []);

  const handleStartGame = useCallback(() => {
    startCountdown();
  }, [startCountdown]);

  const handleRestart = useCallback(() => {
    if (gameEngineRef.current) {
      setScore(0);
      setCountdown(null);
      gameEngineRef.current.reset();
    }
  }, []);

  const handleQuit = useCallback(() => {
    router.push("/games");
  }, [router]);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const engine = gameEngineRef.current;
      if (!engine) return;

      const state = engine.getState();

      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (state === "playing") {
          engine.flap();
        }
      } else if (e.code === "KeyP") {
        // P to toggle pause
        if (state === "playing") {
          engine.pause();
        } else if (state === "paused") {
          engine.resume();
        }
      } else if (e.code === "Escape") {
        // Escape to go back to menu
        handleQuit();
      } else if (e.code === "KeyR") {
        // R to restart
        handleRestart();
      }
    },
    [handleQuit, handleRestart, startCountdown],
  );

  // Prevent body scrolling on mobile during gameplay
  useEffect(() => {
    // Prevent pull-to-refresh and overscroll on mobile
    const preventScroll = (e: TouchEvent) => {
      if (e.target instanceof HTMLCanvasElement) {
        e.preventDefault();
      }
    };

    // Add with passive: false to allow preventDefault
    document.addEventListener("touchstart", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("touchstart", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  // Initialize engine, sizing, and global listeners
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
        // Mobile sizing - optimize for smaller screens
        const maxHeight = Math.min(viewportHeight - 280, 550);
        const maxWidth = Math.min(viewportWidth - 32, 400);
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

    // Start the game (in waiting -> countdown state)
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
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, [handleKeyDown]);

  // Track best score locally
  useEffect(() => {
    if (gameState === "gameOver") {
      setBestScore((prev) => (score > prev ? score : prev));
    }
  }, [gameState, score]);

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-gray-800 py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
              Flappy Bird
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
              Tap to fly between the pipes
            </p>
          </div>
          <button
            onClick={handleQuit}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 active:bg-gray-800 transition-all duration-300 text-xs sm:text-sm"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-3 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-8 w-full max-w-5xl mx-auto">
          {/* Score Panel */}
          <div className="w-full max-w-sm lg:w-64 order-1 mx-auto lg:mx-0">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-6 border border-gray-800/50 backdrop-blur-sm">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                Score
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Current</div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
                    {score}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">Best</div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-[#8CECF7] to-[#6C85EA] bg-clip-text">
                    {bestScore}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="relative order-2 flex flex-col items-center gap-2 w-full max-w-sm sm:max-w-md md:max-w-lg touch-none">
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#8CECF7]/10 rounded-full blur-3xl" />
            </div>

            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onTouchStart={handleTouchStart}
              className="border-2 border-gray-800/50 rounded-lg shadow-2xl cursor-pointer w-full h-auto touch-none"
              style={{ maxWidth: "100%", height: "auto", maxHeight: "75vh" }}
            />

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text animate-pulse">
                  {countdown}
                </div>
              </div>
            )}

            {/* Start Game Button */}
            {gameState === "countdown" && countdown === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                <div className="text-center px-4">
                  <button
                    onClick={handleStartGame}
                    className="px-8 py-4 text-lg sm:text-xl font-bold bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black rounded-xl hover:shadow-2xl hover:shadow-[#8CECF7]/50 transition-all duration-300 active:scale-95 mb-4"
                  >
                    Start Game
                  </button>
                  <div className="text-gray-300 text-xs sm:text-sm">
                    <span className="lg:hidden">Tap screen to flap</span>
                    <span className="hidden lg:inline">
                      Click or press Space/↑ to flap
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === "gameOver" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center px-4 sm:px-6 py-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
                    Game Over!
                  </div>
                  <div className="text-base sm:text-lg md:text-2xl text-white mb-4">
                    Final Score: {score}
                  </div>
                  <button
                    onClick={handleRestart}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300 active:scale-95"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Pause Overlay */}
            {isPaused && gameState !== "gameOver" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center px-6 py-4">
                  <div className="text-3xl font-bold text-white mb-4">
                    Paused
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Press P or use the button to resume
                  </p>
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

          {/* Controls / Info Panel - Hidden on mobile */}
          <div className="hidden lg:block w-full max-w-sm lg:w-64 order-3 mx-auto lg:mx-0">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-800/50 backdrop-blur-sm">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                Controls
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Flap</span>
                  <span className="text-[#AAFDBB] font-mono">
                    Click / Space / ↑
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pause / Resume</span>
                  <span className="text-[#8CECF7] font-mono">P</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Restart</span>
                  <span className="text-[#8CECF7] font-mono">R</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Menu</span>
                  <span className="text-[#6C85EA] font-mono">ESC</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-6 space-y-2">
                {gameState !== "gameOver" && (
                  <button
                    onClick={isPaused ? handleResume : handlePause}
                    className="w-full px-4 py-2 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700/80 active:bg-gray-600/80 transition-all duration-300 border border-gray-700 text-xs sm:text-sm"
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                )}
                <button
                  onClick={handleRestart}
                  className="w-full px-4 py-2 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700/80 active:bg-gray-600/80 transition-all duration-300 border border-gray-700 text-xs sm:text-sm"
                >
                  Restart
                </button>
                <button
                  onClick={handleQuit}
                  className="w-full px-4 py-2 bg-gray-800/80 text-white rounded-lg border border-gray-700 hover:bg-gray-700/80 active:bg-gray-600/80 transition-all duration-300 text-xs sm:text-sm"
                >
                  Back to Games
                </button>
              </div>

              {/* Game Tips */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-800 text-xs text-gray-400 space-y-1 sm:space-y-1.5">
                <p>• Time your taps to pass through gaps</p>
                <p>• Quick taps work best on mobile</p>
                <p>• Avoid pipes and ground</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
