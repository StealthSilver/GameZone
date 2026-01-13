"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TicTacToeEngine, GameMode, GameState } from "./TicTacToeEngine";

interface TicTacToeGameProps {
  mode: GameMode;
}

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ mode }) => {
  const router = useRouter();
  const [gameEngine] = useState(() => new TicTacToeEngine(mode));
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  // Audio refs for sound effects
  const audioXRef = useRef<HTMLAudioElement | null>(null);
  const audioORef = useRef<HTMLAudioElement | null>(null);

  type ExtendedWindow = typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };

  // Initialize audio on mount
  useEffect(() => {
    audioXRef.current = new Audio();
    audioORef.current = new Audio();

    const extendedWindow = window as ExtendedWindow;
    const AudioContextClass =
      window.AudioContext || extendedWindow.webkitAudioContext;
    if (!AudioContextClass) return;

    // Create sound for X (higher pitched beep)
    const audioContextX = new AudioContextClass();
    const oscillatorX = audioContextX.createOscillator();
    const gainNodeX = audioContextX.createGain();

    oscillatorX.connect(gainNodeX);
    gainNodeX.connect(audioContextX.destination);

    oscillatorX.frequency.value = 800;
    oscillatorX.type = "sine";
    gainNodeX.gain.setValueAtTime(0.3, audioContextX.currentTime);
    gainNodeX.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextX.currentTime + 0.1
    );

    // Create sound for O (lower pitched beep)
    const audioContextO = new AudioContextClass();
    const oscillatorO = audioContextO.createOscillator();
    const gainNodeO = audioContextO.createGain();

    oscillatorO.connect(gainNodeO);
    gainNodeO.connect(audioContextO.destination);

    oscillatorO.frequency.value = 400;
    oscillatorO.type = "sine";
    gainNodeO.gain.setValueAtTime(0.3, audioContextO.currentTime);
    gainNodeO.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextO.currentTime + 0.15
    );
  }, []);

  const playSound = useCallback((player: "X" | "O") => {
    try {
      const extendedWindow = window as ExtendedWindow;
      const AudioContextClass =
        window.AudioContext || extendedWindow.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (player === "X") {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      } else {
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.15
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
      }
    } catch (error) {
      console.log("Audio playback failed:", error);
    }
  }, []);

  const handleCellClick = useCallback(
    (index: number) => {
      if (gameState.winner || gameState.isDraw || isComputerThinking) {
        return;
      }

      // Prevent computer's turn in vs computer mode
      if (mode === "computer" && gameState.currentPlayer === "O") {
        return;
      }

      const currentPlayerBeforeMove = gameState.currentPlayer;
      const moveMade = gameEngine.makeMove(index);
      if (moveMade && currentPlayerBeforeMove) {
        playSound(currentPlayerBeforeMove);
        setGameState(gameEngine.getState());
      }
    },
    [gameEngine, gameState, mode, isComputerThinking, playSound]
  );

  const handleReset = useCallback(() => {
    gameEngine.reset();
    setGameState(gameEngine.getState());
  }, [gameEngine]);

  const handleBackToSetup = () => {
    router.push("/games/tictactoe");
  };

  // Computer move effect
  useEffect(() => {
    if (
      mode === "computer" &&
      gameState.currentPlayer === "O" &&
      !gameState.winner &&
      !gameState.isDraw
    ) {
      setTimeout(() => {
        setIsComputerThinking(true);
      }, 0);
      const timer = setTimeout(() => {
        const computerMove = gameEngine.getComputerMove();
        gameEngine.makeMove(computerMove);
        playSound("O");
        setGameState(gameEngine.getState());
        setIsComputerThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameState, mode, gameEngine, playSound]);

  const renderCell = (index: number) => {
    const value = gameState.board[index];
    const isWinningCell = gameState.winningLine?.includes(index);

    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        disabled={!!value || !!gameState.winner || gameState.isDraw}
        className={`aspect-square rounded-xl border-2 transition-all duration-300 flex items-center justify-center text-5xl md:text-6xl font-bold ${
          isWinningCell
            ? "border-[#8CECF7] bg-[#8CECF7]/20 shadow-lg shadow-[#8CECF7]/50"
            : value
            ? "border-gray-700 bg-gray-800/50"
            : "border-gray-700 bg-gray-900/50 hover:border-[#8CECF7] hover:bg-gray-800/70 cursor-pointer"
        } ${
          !value && !gameState.winner && !gameState.isDraw
            ? "hover:scale-105"
            : ""
        }`}
      >
        {value === "X" && (
          <span className="text-transparent bg-gradient-to-br from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
            ✕
          </span>
        )}
        {value === "O" && (
          <span className="text-transparent bg-gradient-to-br from-[#6C85EA] to-[#8CECF7] bg-clip-text">
            ◯
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-oxanium)] py-8 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8CECF7]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#AAFDBB]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
            Tic Tac Toe
          </h1>
          <p className="text-gray-400">
            {mode === "player" ? "VS Player" : "VS Computer"}
          </p>
        </div>

        {/* Game Status */}
        <div className="mb-8 text-center">
          {gameState.winner ? (
            <div className="text-2xl md:text-3xl font-bold">
              <span
                className={`text-transparent bg-gradient-to-br ${
                  gameState.winner === "X"
                    ? "from-[#AAFDBB] to-[#8CECF7]"
                    : "from-[#6C85EA] to-[#8CECF7]"
                } bg-clip-text`}
              >
                Player {gameState.winner} Wins!
              </span>
            </div>
          ) : gameState.isDraw ? (
            <div className="text-2xl md:text-3xl font-bold text-gray-300">
              It&apos;s a Draw!
            </div>
          ) : (
            <div className="text-xl md:text-2xl">
              Current Turn:{" "}
              <span
                className={`font-bold text-transparent bg-gradient-to-br ${
                  gameState.currentPlayer === "X"
                    ? "from-[#AAFDBB] to-[#8CECF7]"
                    : "from-[#6C85EA] to-[#8CECF7]"
                } bg-clip-text`}
              >
                {gameState.currentPlayer}
              </span>
              {isComputerThinking && (
                <span className="ml-2 text-gray-400">(Thinking...)</span>
              )}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 max-w-md mx-auto">
          {gameState.board.map((_, index) => renderCell(index))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-bold hover:shadow-lg hover:shadow-[#8CECF7]/50 transition-all duration-300 hover:scale-105"
          >
            New Game
          </button>
          <button
            onClick={handleBackToSetup}
            className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-300"
          >
            Change Mode
          </button>
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center gap-8 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <span className="text-3xl text-transparent bg-gradient-to-br from-[#AAFDBB] to-[#8CECF7] bg-clip-text">
              ✕
            </span>
            <span className="text-gray-400">Player X</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-transparent bg-gradient-to-br from-[#6C85EA] to-[#8CECF7] bg-clip-text">
              ◯
            </span>
            <span className="text-gray-400">
              {mode === "player" ? "Player O" : "Computer"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
