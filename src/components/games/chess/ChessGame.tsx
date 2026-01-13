"use client";

import React, { useState } from "react";
import {
  ChessColor,
  ChessMode,
  ChessState,
  createInitialState,
  handleSquareClick,
} from "./ChessEngine";

interface ChessGameProps {
  mode: ChessMode;
  playerColor: ChessColor;
}

export const ChessGame: React.FC<ChessGameProps> = ({ mode, playerColor }) => {
  const [state, setState] = useState<ChessState>(() => createInitialState());

  const handleClick = (row: number, col: number) => {
    setState((prev) => handleSquareClick(prev, row, col));
  };

  const renderPiece = (pieceSymbol: string | null) => {
    if (!pieceSymbol) return null;
    return <span className="text-xl md:text-2xl">{pieceSymbol}</span>;
  };

  const pieceToSymbol = (piece: ChessState["board"][number][number]) => {
    if (!piece) return null;
    const isWhite = piece.color === "white";
    switch (piece.type) {
      case "king":
        return isWhite ? "♔" : "♚";
      case "queen":
        return isWhite ? "♕" : "♛";
      case "rook":
        return isWhite ? "♖" : "♜";
      case "bishop":
        return isWhite ? "♗" : "♝";
      case "knight":
        return isWhite ? "♘" : "♞";
      case "pawn":
        return isWhite ? "♙" : "♟︎";
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-[family-name:var(--font-oxanium)] px-4 py-8">
      <h1 className="text-3xl md:text-5xl font-bold mb-2 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
        Chess
      </h1>
      <p className="text-gray-400 mb-6 text-sm md:text-base">
        Mode:{" "}
        <span className="text-[#8CECF7]">
          {mode === "player" ? "VS Player" : "VS Computer"}
        </span>{" "}
        · You play as{" "}
        <span className="text-[#AAFDBB] capitalize">{playerColor}</span>
      </p>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-8 gap-1 md:gap-1.5">
          {state.board.map((row, rIndex) =>
            row.map((square, cIndex) => {
              const isLight = (rIndex + cIndex) % 2 === 0;
              return (
                <button
                  key={`${rIndex}-${cIndex}`}
                  onClick={() => handleClick(rIndex, cIndex)}
                  className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-sm border border-gray-800/40 transition-colors duration-150 ${
                    isLight ? "bg-[#1f2933]" : "bg-[#111827]"
                  } hover:border-[#8CECF7]/70`}
                >
                  {renderPiece(pieceToSymbol(square))}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs md:text-sm text-gray-400">
          <span>
            Turn:{" "}
            <span className="text-[#8CECF7] capitalize">
              {state.currentTurn}
            </span>
          </span>
          <span className="uppercase tracking-wide text-[10px] md:text-xs">
            Basic demo rules – full chess logic coming soon
          </span>
        </div>
      </div>

      <button
        onClick={() => setState(createInitialState())}
        className="mt-6 px-5 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-all duration-200 text-sm"
      >
        Reset Board
      </button>

      <button
        onClick={() => (window.location.href = "/games")}
        className="mt-3 px-5 py-2.5 rounded-lg border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300 transition-all duration-200 text-xs md:text-sm"
      >
        Back to Games
      </button>
    </div>
  );
};
