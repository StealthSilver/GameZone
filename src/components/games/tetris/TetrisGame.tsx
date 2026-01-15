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
    if (!gameEngineRef.current) return;

    const interval = setInterval(() => {
      if (gameEngineRef.current) {
        setNextPiece(gameEngineRef.current.getNextPiece());
        setHeldPiece(gameEngineRef.current.getHeldPiece());
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("tetrisHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    // Initialize game engine
    const engine = new TetrisGameEngine(canvas, mode);
    gameEngineRef.current = engine;

    // Set up callbacks
    engine.onScoreUpdate = (newScore) => {
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("tetrisHighScore", newScore.toString());
      }
    };
    engine.onLevelUpdate = (newLevel) => setLevel(newLevel);
    engine.onLinesUpdate = (newLines) => setLines(newLines);
    engine.onGameStateChange = (state) => setGameState(state);
    engine.onComboUpdate = (comboCount) => setCombo(comboCount);

    // Start game
    engine.start();

    // Cleanup
    return () => {
      engine.stop();
    };
  }, [mode, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameEngineRef.current) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          gameEngineRef.current.moveLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          gameEngineRef.current.moveRight();
          break;
        case "ArrowDown":
          e.preventDefault();
          gameEngineRef.current.moveDown();
          break;
        case "ArrowUp":
          e.preventDefault();
          gameEngineRef.current.rotate();
          break;
        case " ":
          e.preventDefault();
          gameEngineRef.current.hardDrop();
          break;
        case "c":
        case "C":
          e.preventDefault();
          gameEngineRef.current.holdPiece();
          break;
        case "p":
        case "P":
          e.preventDefault();
          handlePause();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaused]);

  const handlePause = () => {
    if (!gameEngineRef.current) return;

    if (isPaused) {
      gameEngineRef.current.resume();
    } else {
      gameEngineRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.restart();
      setIsPaused(false);
    }
  };

  const handleExit = () => {
    router.push("/games/tetris");
  };

  // Helper function to render piece preview
  const renderPiecePreview = (piece: any) => {
    if (!piece) return null;

    return (
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${piece.shape[0].length}, 20px)`,
          margin: "0 auto",
          width: "fit-content",
        }}
      >
        {piece.shape.map((row: number[], rowIdx: number) =>
          row.map((cell: number, colIdx: number) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className="w-5 h-5 rounded-sm"
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

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8CECF7]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
        {/* Left Panel - Stats */}
        <div className="flex flex-col gap-4">
          {/* Score */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 min-w-[200px]">
            <h3 className="text-sm text-gray-400 mb-2">Score</h3>
            <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
              {score}
            </p>
          </div>

          {/* High Score */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-2">High Score</h3>
            <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
          </div>

          {/* Level */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-2">Level</h3>
            <p className="text-3xl font-bold text-[#8CECF7]">{level}</p>
          </div>

          {/* Lines */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-2">Lines</h3>
            <p className="text-3xl font-bold text-[#6C85EA]">{lines}</p>
          </div>

          {/* Combo */}
          {combo > 1 && (
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500 animate-pulse">
              <h3 className="text-sm text-orange-400 mb-2">Combo!</h3>
              <p className="text-3xl font-bold text-orange-300">{combo}x</p>
            </div>
          )}
        </div>

        {/* Center - Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={600}
            className="border-4 border-gray-800 rounded-xl shadow-2xl bg-black"
          />

          {/* Pause Overlay */}
          {isPaused && gameState === "playing" && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
                  PAUSED
                </h2>
                <p className="text-gray-400">Press P to continue</p>
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
                <p className="text-2xl text-gray-300 mb-2">Score: {score}</p>
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

        {/* Right Panel - Controls */}
        <div className="flex flex-col gap-4">
          {/* Next Piece Preview */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 min-w-[200px]">
            <h3 className="text-lg font-semibold mb-4 text-transparent bg-gradient-to-r from-[#8CECF7] to-[#6C85EA] bg-clip-text">
              Next Piece
            </h3>
            <div className="bg-black/50 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
              {renderPiecePreview(nextPiece)}
            </div>
          </div>

          {/* Held Piece Preview */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
              Hold (C)
            </h3>
            <div className="bg-black/50 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
              {heldPiece ? (
                renderPiecePreview(heldPiece)
              ) : (
                <span className="text-gray-600 text-sm">Empty</span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-transparent bg-gradient-to-r from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
              Controls
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
                  ←→
                </kbd>
                <span className="text-gray-300">Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
                  ↓
                </kbd>
                <span className="text-gray-300">Soft Drop</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
                  ↑
                </kbd>
                <span className="text-gray-300">Rotate</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-gray-800 rounded border border-gray-700">
                  Space
                </kbd>
                <span className="text-gray-300">Hard Drop</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
                  C
                </kbd>
                <span className="text-gray-300">Hold</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
                  P
                </kbd>
                <span className="text-gray-300">Pause</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={handlePause}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={handleRestart}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Restart
              </button>
              <button
                onClick={handleExit}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
