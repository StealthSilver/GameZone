"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChessColor,
  ChessMode,
  ChessState,
  createInitialState,
  handleSquareClick,
  makeComputerMove,
} from "./ChessEngine";

interface ChessGameProps {
  mode: ChessMode;
  playerColor: ChessColor;
}

export const ChessGame: React.FC<ChessGameProps> = ({ mode, playerColor }) => {
  const [state, setState] = useState<ChessState>(() => createInitialState());

  const audioCtxRef = useRef<AudioContext | null>(null);

  const isComputerGame = mode === "computer";
  const isComputerTurn =
    isComputerGame &&
    state.currentTurn !== playerColor &&
    (state.status === "ongoing" || state.status === "check");

  const handleClick = (row: number, col: number) => {
    // Prevent the human from moving when it's the computer's turn
    if (isComputerTurn) return;
    setState((prev) => handleSquareClick(prev, row, col));
  };

  // Trigger a simple computer move whenever it's the computer's turn
  useEffect(() => {
    if (!isComputerTurn) return;

    const timeout = setTimeout(() => {
      setState((prev) => {
        // Re-check inside to avoid race conditions
        const computerTurn =
          mode === "computer" &&
          prev.currentTurn !== playerColor &&
          (prev.status === "ongoing" || prev.status === "check");
        if (!computerTurn) return prev;
        return makeComputerMove(prev);
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [isComputerTurn, mode, playerColor]);

  // --- Simple sound effects using Web Audio ---
  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  };

  const playMoveSound = () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(560, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.25);
  };

  const playCaptureSound = () => {
    // Slightly lower, fuller tone for captures
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "triangle";

    osc1.frequency.value = 260;
    osc2.frequency.value = 390;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  };

  const playCheckSound = () => {
    // Sharper, higher tone for check
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(960, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.start(now);
    osc.stop(now + 0.25);
  };

  const playCheckmateSound = () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.4);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.start(now);
    osc.stop(now + 0.5);
  };

  // Play sounds when lastMove changes
  useEffect(() => {
    const last = state.lastMove;
    if (!last) return;

    // Base move sound for any move
    playMoveSound();

    if (last.captured) {
      playCaptureSound();
    }
    if (last.gaveCheck && state.status !== "checkmate") {
      playCheckSound();
    }
  }, [state.lastMove, state.status]);

  // Dedicated sound when a checkmate occurs
  useEffect(() => {
    if (state.status === "checkmate") {
      playCheckmateSound();
    }
  }, [state.status]);

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

  // Position of the king that is currently in check (for highlighting)
  let checkedKing: { row: number; col: number } | null = null;
  if (state.status === "check" || state.status === "checkmate") {
    const colorInCheck = state.currentTurn;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c];
        if (p && p.type === "king" && p.color === colorInCheck) {
          checkedKing = { row: r, col: c };
          break;
        }
      }
      if (checkedKing) break;
    }
  }

  const lastMoveFrom = state.lastMove?.from;
  const lastMoveTo = state.lastMove?.to;

  const renderStatusText = () => {
    const turnLabel = state.currentTurn === "white" ? "White" : "Black";
    const opponentLabel = state.currentTurn === "white" ? "Black" : "White";

    if (state.status === "checkmate") {
      return `Checkmate! ${opponentLabel} wins.`;
    }
    if (state.status === "stalemate") {
      return "Stalemate – game drawn.";
    }
    if (state.status === "check") {
      return `${turnLabel} is in check.`;
    }
    return "Game in progress.";
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
          {Array.from({ length: 8 }, (_, vr) => vr).map((viewRow) =>
            Array.from({ length: 8 }, (_, vc) => vc).map((viewCol) => {
              const boardRow = playerColor === "white" ? viewRow : 7 - viewRow;
              const boardCol = playerColor === "white" ? viewCol : 7 - viewCol;

              const square = state.board[boardRow][boardCol];

              const isLight = (boardRow + boardCol) % 2 === 0;
              const isSelected =
                state.selected?.row === boardRow &&
                state.selected?.col === boardCol;
              const isMoveTarget = state.possibleMoves.some(
                (m) => m.row === boardRow && m.col === boardCol
              );
              const isCheckedKing =
                checkedKing?.row === boardRow && checkedKing?.col === boardCol;
              const isLastFrom =
                lastMoveFrom?.row === boardRow &&
                lastMoveFrom?.col === boardCol;
              const isLastTo =
                lastMoveTo?.row === boardRow && lastMoveTo?.col === boardCol;

              return (
                <button
                  key={`${viewRow}-${viewCol}`}
                  onClick={() => handleClick(boardRow, boardCol)}
                  className={`relative w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-sm border border-gray-800/40 transition-colors duration-150 ${
                    isLight ? "bg-[#1f2933]" : "bg-[#111827]"
                  } ${
                    isSelected
                      ? "ring-2 ring-[#8CECF7] ring-offset-2 ring-offset-gray-900"
                      : ""
                  } ${isMoveTarget ? "bg-[#0f172a] border-[#8CECF7]/60" : ""} ${
                    isCheckedKing
                      ? "bg-red-900/70 border-red-500 shadow-[0_0_15px_rgba(248,113,113,0.7)]"
                      : ""
                  } ${
                    isLastFrom
                      ? "chess-last-move-from"
                      : isLastTo
                      ? "chess-last-move-to"
                      : ""
                  } hover:border-[#8CECF7]/70`}
                >
                  {isMoveTarget && !square && (
                    <span className="absolute w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#8CECF7]/80" />
                  )}
                  <span
                    className={`transition-transform duration-150 ease-out ${
                      isLastTo ? "scale-110" : "scale-100"
                    }`}
                  >
                    {renderPiece(pieceToSymbol(square))}
                  </span>
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
          <span className="text-[10px] md:text-xs text-gray-500 text-right max-w-[10rem] md:max-w-xs">
            {renderStatusText()}
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
