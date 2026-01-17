"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TetrisGameEngine, GameMode, GameState } from "./TetrisGameEngine";

interface TetrisGameProps {
  mode: GameMode;
}

export const TetrisGame: React.FC<TetrisGameProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<TetrisGameEngine | null>(null);
  const router = useRouter();

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [nextPiece, setNextPiece] = useState<any>(null);
  const [heldPiece, setHeldPiece] = useState<any>(null);

  // Update preview pieces
  useEffect(() => {
    const interval = setInterval(() => {
      const engine = gameEngineRef.current;
      if (!engine) return;

      setNextPiece(engine.getNextPiece());
      setHeldPiece(engine.getHeldPiece());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("tetrisHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    // Initialize game engine
    const engine = new TetrisGameEngine(canvas, mode);
    gameEngineRef.current = engine;

    // Seed preview immediately (useful on initial mobile render)
    setNextPiece(engine.getNextPiece());
    setHeldPiece(engine.getHeldPiece());

    const applyResponsiveSize = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (isDesktop) {
        // Desktop: Calculate board size that fits within viewport
        // Leave room for header/footer padding
        const maxAvailableHeight = viewportHeight - 120;

        // Side panels take up space, so account for them
        const sidePanelsWidth = 480; // ~240px each side
        const maxAvailableWidth = Math.max(
          240,
          viewportWidth - sidePanelsWidth - 100
        );

        // Calculate optimal block size based on available space
        // Board is 10 blocks wide, 20 blocks tall (aspect ratio 1:2)
        const blockSizeByHeight = Math.floor(maxAvailableHeight / 20);
        const blockSizeByWidth = Math.floor(maxAvailableWidth / 10);

        // Use the smaller of the two to ensure board fits
        const blockSize = Math.min(blockSizeByHeight, blockSizeByWidth, 32); // Cap at 32px per block

        engine.resize(blockSize);
      } else {
        // Mobile: More conservative sizing
        const maxAvailableHeight = viewportHeight - 280;
        const maxAvailableWidth = Math.min(viewportWidth - 48, 320);

        const blockSizeByHeight = Math.floor(maxAvailableHeight / 20);
        const blockSizeByWidth = Math.floor(maxAvailableWidth / 10);

        const blockSize = Math.min(blockSizeByHeight, blockSizeByWidth, 28);

        engine.resize(blockSize);
      }
    };

    applyResponsiveSize();

    // Set up callbacks
    engine.onScoreUpdate = (newScore) => {
      setScore(newScore);
      setHighScore((prev) => {
        if (newScore > prev) {
          localStorage.setItem("tetrisHighScore", newScore.toString());
          return newScore;
        }
        return prev;
      });
    };
    engine.onLevelUpdate = (newLevel) => setLevel(newLevel);
    engine.onLinesUpdate = (newLines) => setLines(newLines);
    engine.onGameStateChange = (state) => {
      setGameState(state);
      if (state === "paused") {
        setIsPaused(true);
      } else if (state === "playing") {
        setIsPaused(false);
      }
    };
    engine.onComboUpdate = (comboCount) => setCombo(comboCount);

    // Start game
    engine.start();

    window.addEventListener("resize", applyResponsiveSize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", applyResponsiveSize);
      engine.stop();
    };
  }, [mode]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameEngineRef.current || gameState === "gameOver") return;

      // Prevent default for game controls to avoid page scrolling
      if (
        ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowLeft":
          gameEngineRef.current.moveLeft();
          break;
        case "ArrowRight":
          gameEngineRef.current.moveRight();
          break;
        case "ArrowDown":
          gameEngineRef.current.moveDown();
          break;
        case "ArrowUp":
          gameEngineRef.current.rotate();
          break;
        case " ":
          gameEngineRef.current.hardDrop();
          break;
        case "c":
        case "C":
          gameEngineRef.current.holdPiece();
          break;
        case "p":
        case "P":
          handlePause();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  const handlePause = () => {
    if (!gameEngineRef.current || gameState === "gameOver") return;

    if (gameState === "paused") {
      gameEngineRef.current.resume();
      setIsPaused(false);
    } else if (gameState === "playing") {
      gameEngineRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleRestart = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.restart();
      setIsPaused(false);
      setGameState("playing");
    }
  };

  const handleExit = () => {
    router.push("/games/tetris");
  };

  // Helper function to render piece preview
  const renderPiecePreview = (piece: any, compact = false) => {
    if (!piece) return null;

    return (
      <div
        className="grid gap-0.5 sm:gap-1"
        style={{
          gridTemplateColumns: `repeat(${piece.shape[0].length}, ${
            compact ? 10 : 12
          }px)`,
          margin: "0 auto",
          width: "fit-content",
        }}
      >
        {piece.shape.map((row: number[], rowIdx: number) =>
          row.map((cell: number, colIdx: number) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`${
                compact ? "w-2.5 h-2.5" : "w-3 h-3"
              } sm:w-4 sm:h-4 rounded-sm`}
              style={{
                backgroundColor: cell ? piece.color : "transparent",
                border: cell ? "1px solid rgba(0,0,0,0.3)" : "none",
              }}
            />
          ))
        )}
      </div>
    );
  };

  // Touch controls for mobile
  const handleTouchMove = (direction: "left" | "right" | "down") => {
    if (!gameEngineRef.current || gameState !== "playing") return;

    switch (direction) {
      case "left":
        gameEngineRef.current.moveLeft();
        break;
      case "right":
        gameEngineRef.current.moveRight();
        break;
      case "down":
        gameEngineRef.current.moveDown();
        break;
    }
  };

  const handleTouchAction = (action: "rotate" | "drop" | "hold") => {
    if (!gameEngineRef.current || gameState !== "playing") return;

    switch (action) {
      case "rotate":
        gameEngineRef.current.rotate();
        break;
      case "drop":
        gameEngineRef.current.hardDrop();
        break;
      case "hold":
        gameEngineRef.current.holdPiece();
        break;
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-4 lg:py-8"
      style={{ fontFamily: "var(--font-oxanium)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 sm:w-64 sm:h-64 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 sm:w-96 sm:h-96 bg-[#8CECF7]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 mx-auto">
        {/* Main layout - desktop horizontal, mobile stacked */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 xl:gap-8">
          {/* Left Panel - Stats */}
          <div className="flex flex-col gap-2 xl:gap-3 w-full max-w-xs sm:max-w-sm lg:max-w-none lg:w-auto">
            {/* Score / High Score / Level / Lines (single row on small screens) */}
            <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-col">
              {/* Score */}
              <div className="bg-gray-900/50 rounded-xl p-2 sm:p-4 xl:p-6 border border-gray-800 sm:min-w-45">
                <h3 className="text-[10px] sm:text-xs xl:text-sm text-gray-400 mb-0.5 sm:mb-1 xl:mb-2">
                  Score
                </h3>
                <p className="text-base sm:text-2xl xl:text-3xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
                  {score}
                </p>
              </div>

              {/* High Score */}
              <div className="bg-gray-900/50 rounded-xl p-2 sm:p-4 xl:p-6 border border-gray-800">
                <h3 className="text-[10px] sm:text-xs xl:text-sm text-gray-400 mb-0.5 sm:mb-1 xl:mb-2">
                  High Score
                </h3>
                <p className="text-sm sm:text-xl xl:text-2xl font-bold text-yellow-400">
                  {highScore}
                </p>
              </div>

              {/* Level */}
              <div className="bg-gray-900/50 rounded-xl p-2 sm:p-4 xl:p-6 border border-gray-800">
                <h3 className="text-[10px] sm:text-xs xl:text-sm text-gray-400 mb-0.5 sm:mb-1 xl:mb-2">
                  Level
                </h3>
                <p className="text-base sm:text-2xl xl:text-3xl font-bold text-[#8CECF7]">
                  {level}
                </p>
              </div>

              {/* Lines */}
              <div className="bg-gray-900/50 rounded-xl p-2 sm:p-4 xl:p-6 border border-gray-800">
                <h3 className="text-[10px] sm:text-xs xl:text-sm text-gray-400 mb-0.5 sm:mb-1 xl:mb-2">
                  Lines
                </h3>
                <p className="text-base sm:text-2xl xl:text-3xl font-bold text-[#6C85EA]">
                  {lines}
                </p>
              </div>
            </div>

            {/* Combo */}
            {combo > 1 && (
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 xl:p-6 border border-orange-500 animate-pulse">
                <h3 className="text-xs xl:text-sm text-orange-400 mb-1 xl:mb-2">
                  Combo!
                </h3>
                <p className="text-2xl xl:text-3xl font-bold text-orange-300">
                  {combo}x
                </p>
              </div>
            )}
          </div>

          {/* Center - Canvas */}
          <div className="relative flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none">
            {/* Mobile (xs) previews above board */}
            <div className="sm:hidden w-full grid grid-cols-2 gap-2">
              <div className="bg-gray-900/50 rounded-xl p-2 border border-gray-800">
                <h3 className="text-xs font-semibold mb-1 text-transparent bg-gradient-to-r from-[#8CECF7] to-[#6C85EA] bg-clip-text">
                  Next
                </h3>
                <div className="bg-black/50 rounded-lg p-2 flex items-center justify-center">
                  {renderPiecePreview(nextPiece, true)}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-2 border border-gray-800">
                <h3 className="text-xs font-semibold mb-1 text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
                  Hold
                </h3>
                <div className="bg-black/50 rounded-lg p-2 flex items-center justify-center">
                  {heldPiece ? (
                    renderPiecePreview(heldPiece, true)
                  ) : (
                    <span className="text-gray-600 text-[10px]">Empty</span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border-2 xl:border-4 border-gray-800 rounded-xl shadow-2xl bg-black"
              />

              {/* Pause Overlay */}
              {isPaused && gameState === "playing" && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="text-center px-4">
                    <h2 className="text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
                      PAUSED
                    </h2>
                    <p className="text-base text-gray-400">
                      Press P or Resume button
                    </p>
                  </div>
                </div>
              )}

              {/* Game Over Overlay */}
              {gameState === "gameOver" && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <h2 className="text-5xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
                      Game Over
                    </h2>
                    <p className="text-2xl text-gray-300 mb-2">
                      Score: {score}
                    </p>
                    <p className="text-lg text-gray-400 mb-6">
                      Level {level} • {lines} Lines
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={handleRestart}
                        className="px-6 py-3 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300"
                      >
                        Play Again
                      </button>
                      <button
                        onClick={handleExit}
                        className="px-6 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-all duration-300"
                      >
                        Exit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile (xs) primary actions under board */}
            <div className="sm:hidden w-full grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTouchAction("rotate")}
                className="w-full px-2 py-2 bg-gray-900/70 border border-gray-700 rounded-xl text-xs font-semibold text-white hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
              >
                Rotate
              </button>
              <button
                onClick={() => handleTouchAction("drop")}
                className="w-full px-2 py-2 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-[#8CECF7]/40 active:scale-95 transition-all duration-200"
              >
                Hard Drop
              </button>
              <button
                onClick={() => handleTouchAction("hold")}
                className="w-full px-2 py-2 bg-gray-900/70 border border-gray-700 rounded-xl text-xs font-semibold text-white hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
              >
                Hold
              </button>
            </div>
          </div>

          {/* Right Panel - Preview & Controls */}
          <div className="flex flex-col gap-2 xl:gap-4 w-full max-w-xs sm:max-w-sm lg:max-w-none lg:w-auto">
            {/* Next Piece Preview */}
            <div
              className="hidden sm:block bg-gray-900/50 rounded-xl p-4 xl:p-6 border border-gray-800"
              style={{ minWidth: "180px" }}
            >
              <h3 className="text-sm xl:text-lg font-semibold mb-2 xl:mb-4 text-transparent bg-gradient-to-r from-[#8CECF7] to-[#6C85EA] bg-clip-text">
                Next Piece
              </h3>
              <div
                className="bg-black/50 rounded-lg p-3 xl:p-4 flex items-center justify-center"
                style={{ minHeight: "80px" }}
              >
                {renderPiecePreview(nextPiece)}
              </div>
            </div>

            {/* Held Piece Preview */}
            <div className="hidden sm:block bg-gray-900/50 rounded-xl p-4 xl:p-6 border border-gray-800">
              <h3 className="text-sm xl:text-lg font-semibold mb-2 xl:mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
                Hold (C)
              </h3>
              <div
                className="bg-black/50 rounded-lg p-3 xl:p-4 flex items-center justify-center"
                style={{ minHeight: "80px" }}
              >
                {heldPiece ? (
                  renderPiecePreview(heldPiece)
                ) : (
                  <span className="text-gray-600 text-xs xl:text-sm">
                    Empty
                  </span>
                )}
              </div>
            </div>

            {/* Game Controls */}
            <div className="hidden sm:block bg-gray-900/50 rounded-xl p-4 xl:p-6 border border-gray-800">
              <div className="space-y-2">
                <button
                  onClick={handlePause}
                  className="w-full px-3 xl:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm xl:text-base font-semibold rounded-lg transition-all duration-300"
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={handleRestart}
                  className="w-full px-3 xl:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm xl:text-base font-semibold rounded-lg transition-all duration-300"
                >
                  Restart
                </button>
                <button
                  onClick={handleExit}
                  className="w-full px-3 xl:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm xl:text-base font-semibold rounded-lg transition-all duration-300"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile touch controls */}
        <div className="mt-1 sm:mt-4 w-full lg:hidden flex flex-col items-center gap-2 sm:gap-4">
          {/* Primary actions */}
          <div className="hidden sm:flex flex-wrap justify-center gap-3 w-full max-w-sm">
            <button
              onClick={() => handleTouchAction("rotate")}
              className="flex-1 min-w-[90px] px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl text-sm font-semibold text-white hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
            >
              Rotate
            </button>
            <button
              onClick={() => handleTouchAction("drop")}
              className="flex-1 min-w-[90px] px-4 py-3 bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#8CECF7]/40 active:scale-95 transition-all duration-200"
            >
              Hard Drop
            </button>
            <button
              onClick={() => handleTouchAction("hold")}
              className="flex-1 min-w-[90px] px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl text-sm font-semibold text-white hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
            >
              Hold
            </button>
          </div>

          {/* Movement pad */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleTouchMove("left")}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900/70 border border-gray-700 rounded-xl text-lg sm:text-xl font-bold text-gray-100 hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
            >
              ←
            </button>
            <button
              onClick={() => handleTouchMove("down")}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900/70 border border-gray-700 rounded-xl text-lg sm:text-xl font-bold text-gray-100 hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
            >
              ↓
            </button>
            <button
              onClick={() => handleTouchMove("right")}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900/70 border border-gray-700 rounded-xl text-lg sm:text-xl font-bold text-gray-100 hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
            >
              →
            </button>
          </div>

          {/* Bottom controls (xs only) */}
          <div className="sm:hidden w-full max-w-sm">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handlePause}
                  className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all duration-300"
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={handleRestart}
                  className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all duration-300"
                >
                  Restart
                </button>
                <button
                  onClick={handleExit}
                  className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all duration-300"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
