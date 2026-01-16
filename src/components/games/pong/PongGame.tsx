"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PongGameEngine, GameMode, GameState } from "./PongGameEngine";

interface PongGameProps {
  mode: GameMode;
}

export const PongGame: React.FC<PongGameProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<PongGameEngine | null>(null);
  const router = useRouter();

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game engine
    const engine = new PongGameEngine(canvas, mode);
    gameEngineRef.current = engine;

    const applyResponsiveSize = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (isDesktop) {
        // Desktop sizing
        const maxHeight = Math.min(viewportHeight - 200, 600);
        const maxWidth = Math.min(viewportWidth - 600, 800);
        engine.resize(maxWidth, maxHeight);
      } else {
        // Mobile sizing - smaller to fit with controls
        const maxHeight = Math.min(viewportHeight - 420, 380);
        const maxWidth = Math.min(viewportWidth - 48, 340);
        engine.resize(maxWidth, maxHeight);
      }
    };

    applyResponsiveSize();

    // Set up callbacks
    engine.onScoreUpdate = (player, ai) => {
      setPlayerScore(player);
      setAiScore(ai);
    };

    engine.onGameOver = (gameWinner) => {
      setWinner(gameWinner);
    };

    engine.onStateChange = (state) => {
      setGameState(state);
      setIsPaused(state === "paused");
    };

    // Start the game
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
      if (e.key === "Escape") {
        e.preventDefault();
        handleBackToSetup();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      engine.destroy();
    };
  }, [mode]);

  const handlePauseResume = () => {
    const engine = gameEngineRef.current;
    if (!engine) return;

    engine.togglePause();
  };

  const handleRestart = () => {
    const engine = gameEngineRef.current;
    if (!engine) return;

    setWinner(null);
    engine.reset();
  };

  const handleBackToSetup = () => {
    router.push("/games/pong");
  };

  const handleMoveUp = () => {
    const engine = gameEngineRef.current;
    if (!engine) return;
    engine.movePaddleUp();
  };

  const handleMoveDown = () => {
    const engine = gameEngineRef.current;
    if (!engine) return;
    engine.movePaddleDown();
  };

  const handleStopMove = () => {
    const engine = gameEngineRef.current;
    if (!engine) return;
    engine.stopPaddle();
  };

  const getDifficultyLabel = (mode: GameMode) => {
    switch (mode) {
      case "easy":
        return "Easy";
      case "medium":
        return "Medium";
      case "hard":
        return "Hard";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-gray-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
              Pong
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Difficulty: {getDifficultyLabel(mode)}
            </p>
          </div>
          <button
            onClick={handleBackToSetup}
            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-300 text-sm"
          >
            Back to Menu
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 w-full max-w-7xl">
          {/* Score Panel (Left on Desktop, Top on Mobile) */}
          <div className="w-full lg:w-auto order-1 lg:order-1">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 rounded-xl p-4 lg:p-6 border border-gray-800/50 backdrop-blur-sm">
              <h3 className="text-sm text-gray-400 mb-4 text-center">Score</h3>
              <div className="flex lg:flex-col items-center justify-around lg:justify-start gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">You</div>
                  <div className="text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
                    {playerScore}
                  </div>
                </div>
                <div className="text-2xl text-gray-600 lg:hidden">-</div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">AI</div>
                  <div className="text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-[#6C85EA] to-[#8CECF7] bg-clip-text">
                    {aiScore}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="relative order-2 lg:order-2 flex flex-col items-center gap-4">
            <canvas
              ref={canvasRef}
              className="border-2 border-gray-800/50 rounded-lg shadow-2xl"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />

            {/* Mobile Control Buttons */}
            <div className="flex lg:hidden gap-4 w-full max-w-sm justify-center">
              <button
                onTouchStart={handleMoveUp}
                onTouchEnd={handleStopMove}
                onMouseDown={handleMoveUp}
                onMouseUp={handleStopMove}
                onMouseLeave={handleStopMove}
                className="flex-1 px-8 py-6 bg-gradient-to-r from-[#AAFDBB]/20 to-[#8CECF7]/20 text-[#AAFDBB] rounded-xl hover:from-[#AAFDBB]/30 hover:to-[#8CECF7]/30 active:from-[#AAFDBB]/40 active:to-[#8CECF7]/40 transition-all duration-150 border-2 border-[#AAFDBB]/30 font-bold text-xl select-none"
              >
                ↑ UP
              </button>
              <button
                onTouchStart={handleMoveDown}
                onTouchEnd={handleStopMove}
                onMouseDown={handleMoveDown}
                onMouseUp={handleStopMove}
                onMouseLeave={handleStopMove}
                className="flex-1 px-8 py-6 bg-gradient-to-r from-[#8CECF7]/20 to-[#6C85EA]/20 text-[#8CECF7] rounded-xl hover:from-[#8CECF7]/30 hover:to-[#6C85EA]/30 active:from-[#8CECF7]/40 active:to-[#6C85EA]/40 transition-all duration-150 border-2 border-[#8CECF7]/30 font-bold text-xl select-none"
              >
                ↓ DOWN
              </button>
            </div>

            {/* Game Over Overlay */}
            {gameState === "gameOver" && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
                    {winner === "player" ? "You Win!" : "AI Wins!"}
                  </h2>
                  <p className="text-gray-400 mb-6 text-lg">
                    Final Score: {playerScore} - {aiScore}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleRestart}
                      className="px-6 py-3 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={handleBackToSetup}
                      className="px-6 py-3 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-300"
                    >
                      Change Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pause Overlay */}
            {isPaused && gameState !== "gameOver" && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
                    Paused
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Press Space or Resume to continue
                  </p>
                  <button
                    onClick={handlePauseResume}
                    className="px-6 py-3 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300"
                  >
                    Resume Game
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel (Right on Desktop, Bottom on Mobile) */}
          <div className="w-full lg:w-64 order-3 lg:order-3">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 rounded-xl p-4 lg:p-6 border border-gray-800/50 backdrop-blur-sm">
              <h3 className="text-sm text-gray-400 mb-4">Controls</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Move Up</span>
                  <span className="text-[#AAFDBB] font-mono">↑ / W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Move Down</span>
                  <span className="text-[#AAFDBB] font-mono">↓ / S</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pause</span>
                  <span className="text-[#8CECF7] font-mono">SPACE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Menu</span>
                  <span className="text-[#6C85EA] font-mono">ESC</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {gameState !== "gameOver" && (
                  <button
                    onClick={handlePauseResume}
                    className="w-full px-4 py-2 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700/80 transition-all duration-300 border border-gray-700"
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                )}
                <button
                  onClick={handleRestart}
                  className="w-full px-4 py-2 bg-gradient-to-r from-[#AAFDBB]/20 to-[#8CECF7]/20 text-[#8CECF7] rounded-lg hover:from-[#AAFDBB]/30 hover:to-[#8CECF7]/30 transition-all duration-300 border border-[#8CECF7]/30"
                >
                  Restart
                </button>
              </div>

              {/* Game Info */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-400 space-y-2">
                  <p>• First to 11 points wins</p>
                  <p>• Ball speeds up with each hit</p>
                  <p>• Aim for paddle edges for angles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
