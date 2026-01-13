"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChessColor,
  ChessMode,
  ChessState,
  createInitialState,
  handleSquareClick,
  makeComputerMove,
  applyPromotionChoice,
} from "./ChessEngine";

interface ChessGameProps {
  mode: ChessMode;
  playerColor: ChessColor;
  difficulty?: number; // 1 (easy) - 10 (hard)
}

export const ChessGame: React.FC<ChessGameProps> = ({
  mode,
  playerColor,
  difficulty = 1,
}) => {
  const [state, setState] = useState<ChessState>(() => createInitialState());

  const [pendingPromotion, setPendingPromotion] = useState<{
    row: number;
    col: number;
    color: ChessColor;
  } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const isComputerGame = mode === "computer";
  const isComputerTurn =
    isComputerGame &&
    state.currentTurn !== playerColor &&
    (state.status === "ongoing" || state.status === "check");

  const handleClick = (row: number, col: number) => {
    // If we're waiting for a promotion choice, ignore board clicks
    if (pendingPromotion) return;
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
        return makeComputerMove(prev, difficulty);
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

  // Detect when a pawn promotion has just occurred and open the chooser.
  useEffect(() => {
    const last = state.lastMove;
    if (!last || !last.promotion) {
      return;
    }

    const { to } = last;
    const piece = state.board[to.row][to.col];
    if (!piece) return;

    setPendingPromotion({ row: to.row, col: to.col, color: piece.color });
  }, [state.lastMove, state.board]);

  const handlePromotionSelect = (
    choice: "queen" | "rook" | "bishop" | "knight"
  ) => {
    setState((prev) => applyPromotionChoice(prev, choice));
    setPendingPromotion(null);
  };

  const handleCancelPromotion = () => {
    // Default to queen if user dismisses the dialog for any reason.
    setState((prev) => applyPromotionChoice(prev, "queen"));
    setPendingPromotion(null);
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
        // Swapped visual colors: engine "white" pieces use black glyphs and vice versa
        return isWhite ? "♚" : "♔";
      case "queen":
        return isWhite ? "♛" : "♕";
      case "rook":
        return isWhite ? "♜" : "♖";
      case "bishop":
        return isWhite ? "♝" : "♗";
      case "knight":
        return isWhite ? "♞" : "♘";
      case "pawn":
        return isWhite ? "♟︎" : "♙";
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
      return "Stalemate  game drawn.";
    }
    if (state.status === "drawRepetition") {
      return "Draw by repetition.";
    }
    if (state.status === "drawInsufficient") {
      return "Draw  insufficient material.";
    }
    if (state.status === "check") {
      return `${turnLabel} is in check.`;
    }
    return "Game in progress.";
  };

  const isGameOver =
    state.status === "checkmate" ||
    state.status === "stalemate" ||
    state.status === "drawRepetition" ||
    state.status === "drawInsufficient";

  const winningColor: ChessColor | null =
    state.status === "checkmate"
      ? state.currentTurn === "white"
        ? "black"
        : "white"
      : null;

  const isDraw =
    state.status === "stalemate" ||
    state.status === "drawRepetition" ||
    state.status === "drawInsufficient";

  const playerWon =
    winningColor !== null &&
    mode === "computer" &&
    winningColor === playerColor;

  const resultTitle = (() => {
    if (state.status === "checkmate") {
      if (mode === "computer") {
        return playerWon ? "You Win!" : "You Lose";
      }
      return winningColor === "white" ? "White Wins" : "Black Wins";
    }
    if (isDraw) {
      return "Draw";
    }
    return "";
  })();

  const resultSubtitle = (() => {
    switch (state.status) {
      case "checkmate":
        if (mode === "computer") {
          return playerWon
            ? "You delivered checkmate."
            : "You were checkmated.";
        }
        return `${
          winningColor === "white" ? "White" : "Black"
        } delivered checkmate.`;
      case "stalemate":
        return "Stalemate  no legal moves and king is not in check.";
      case "drawRepetition":
        return "The same position occurred three times.";
      case "drawInsufficient":
        return "Neither side has enough material to force checkmate.";
      default:
        return "";
    }
  })();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start font-[family-name:var(--font-oxanium)] px-4 py-8">
      <div className="w-full max-w-4xl flex flex-col items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
          Chess
        </h1>
        <p className="text-gray-400 text-sm md:text-base text-center">
          Mode:{" "}
          <span className="text-[#8CECF7]">
            {mode === "player" ? "VS Player" : "VS Computer"}
          </span>{" "}
          · You play as{" "}
          <span className="text-[#AAFDBB] capitalize">{playerColor}</span>
          {mode === "computer" && (
            <>
              {" "}
              · Level <span className="text-[#8CECF7]">{difficulty}</span>
            </>
          )}
        </p>

        <div className="mt-4 bg-gray-900/50 border border-gray-800/80 rounded-2xl p-4 shadow-lg w-full flex flex-col items-center">
          <div className="grid grid-cols-8 gap-1 md:gap-1.5">
            {Array.from({ length: 8 }, (_, vr) => vr).map((viewRow) =>
              Array.from({ length: 8 }, (_, vc) => vc).map((viewCol) => {
                const boardRow =
                  playerColor === "white" ? viewRow : 7 - viewRow;
                const boardCol =
                  playerColor === "white" ? viewCol : 7 - viewCol;

                const square = state.board[boardRow][boardCol];

                const isLight = (boardRow + boardCol) % 2 === 0;
                const isSelected =
                  state.selected?.row === boardRow &&
                  state.selected?.col === boardCol;
                const isMoveTarget = state.possibleMoves.some(
                  (m) => m.row === boardRow && m.col === boardCol
                );
                const isCheckedKing =
                  checkedKing?.row === boardRow &&
                  checkedKing?.col === boardCol;
                const isLastFrom =
                  lastMoveFrom?.row === boardRow &&
                  lastMoveFrom?.col === boardCol;
                const isLastTo =
                  lastMoveTo?.row === boardRow && lastMoveTo?.col === boardCol;

                return (
                  <button
                    key={`${viewRow}-${viewCol}`}
                    onClick={() => handleClick(boardRow, boardCol)}
                    className={`relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-sm border border-gray-800/40 transition-colors duration-150 ${
                      isLight ? "bg-[#1f2933]" : "bg-[#111827]"
                    } ${
                      isSelected
                        ? "ring-2 ring-[#8CECF7] ring-offset-2 ring-offset-gray-900"
                        : ""
                    } ${
                      isMoveTarget ? "bg-[#0f172a] border-[#8CECF7]/60" : ""
                    } ${
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

          <div className="mt-4 flex items-center justify-between w-full text-xs md:text-sm text-gray-400">
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

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setState(createInitialState())}
            className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-all duration-200 text-sm"
          >
            Reset Board
          </button>

          <button
            onClick={() => (window.location.href = "/games")}
            className="px-5 py-2.5 rounded-lg border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300 transition-all duration-200 text-xs md:text-sm"
          >
            Back to Games
          </button>
        </div>

        {isGameOver && resultTitle && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl px-6 py-6 md:px-8 md:py-7 w-full max-w-md shadow-[0_0_40px_rgba(148,163,184,0.6)]">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-transparent bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] bg-clip-text">
                {resultTitle}
              </h2>
              {resultSubtitle && (
                <p className="text-xs md:text-sm text-gray-300 text-center mb-5">
                  {resultSubtitle}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  onClick={() => setState(createInitialState())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] text-black font-semibold text-sm md:text-base hover:shadow-lg hover:shadow-[#8CECF7]/40 transition-all"
                >
                  Play Again
                </button>
                <button
                  onClick={() => (window.location.href = "/games")}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm md:text-base hover:border-gray-500 hover:text-white transition-all"
                >
                  Back to Games
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingPromotion && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl px-6 py-5 w-full max-w-sm shadow-xl">
              <h2 className="text-lg md:text-xl font-semibold mb-2 text-center">
                Pawn Promotion
              </h2>
              <p className="text-xs md:text-sm text-gray-400 mb-4 text-center">
                Choose a piece to promote your pawn to.
              </p>
              <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
                <button
                  onClick={() => handlePromotionSelect("queen")}
                  className="px-2 py-2 rounded-lg border border-gray-700 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-colors"
                >
                  Queen
                </button>
                <button
                  onClick={() => handlePromotionSelect("rook")}
                  className="px-2 py-2 rounded-lg border border-gray-700 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-colors"
                >
                  Rook
                </button>
                <button
                  onClick={() => handlePromotionSelect("bishop")}
                  className="px-2 py-2 rounded-lg border border-gray-700 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-colors"
                >
                  Bishop
                </button>
                <button
                  onClick={() => handlePromotionSelect("knight")}
                  className="px-2 py-2 rounded-lg border border-gray-700 hover:border-[#8CECF7] hover:text-[#8CECF7] transition-colors"
                >
                  Knight
                </button>
              </div>
              <button
                onClick={handleCancelPromotion}
                className="w-full px-3 py-2 rounded-lg text-xs md:text-sm border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
              >
                Cancel (keep as Queen)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
