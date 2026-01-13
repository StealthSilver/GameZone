export type ChessColor = "white" | "black";
export type ChessMode = "player" | "computer";

export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

export type Piece = {
  type: PieceType;
  color: ChessColor;
  hasMoved?: boolean;
};

export type Square = Piece | null;

export type ChessBoard = Square[][]; // 8x8

export type GameStatus = "ongoing" | "check" | "checkmate" | "stalemate";

export interface ChessState {
  board: ChessBoard;
  currentTurn: ChessColor;
  status: GameStatus;
  selected: { row: number; col: number } | null;
  possibleMoves: { row: number; col: number }[];
}

type Position = { row: number; col: number };

type Move = {
  from: Position;
  to: Position;
};

// Basic initial board setup (no advanced rules yet)
export function createInitialBoard(): ChessBoard {
  const emptyRank: Square[] = Array(8).fill(null);

  const makeBackRank = (color: ChessColor): Square[] => [
    { type: "rook", color },
    { type: "knight", color },
    { type: "bishop", color },
    { type: "queen", color },
    { type: "king", color },
    { type: "bishop", color },
    { type: "knight", color },
    { type: "rook", color },
  ];

  const makePawns = (color: ChessColor): Square[] =>
    Array(8)
      .fill(null)
      .map(() => ({ type: "pawn", color }));

  return [
    makeBackRank("black"),
    makePawns("black"),
    [...emptyRank],
    [...emptyRank],
    [...emptyRank],
    [...emptyRank],
    makePawns("white"),
    makeBackRank("white"),
  ];
}

export function createInitialState(): ChessState {
  return {
    board: createInitialBoard(),
    currentTurn: "white",
    status: "ongoing",
    selected: null,
    possibleMoves: [],
  };
}

// --- Internal helpers ---

const inBounds = (row: number, col: number): boolean =>
  row >= 0 && row < 8 && col >= 0 && col < 8;

const cloneBoard = (board: ChessBoard): ChessBoard =>
  board.map((r) => r.slice());

const oppositeColor = (color: ChessColor): ChessColor =>
  color === "white" ? "black" : "white";

function findKing(board: ChessBoard, color: ChessColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king" && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

function isSquareAttacked(
  board: ChessBoard,
  row: number,
  col: number,
  byColor: ChessColor
): boolean {
  const enemy = byColor;

  // Pawn attacks
  const pawnDir = enemy === "white" ? -1 : 1;
  const pawnRows = row + pawnDir;
  for (const dc of [-1, 1]) {
    const c = col + dc;
    if (inBounds(pawnRows, c)) {
      const p = board[pawnRows][c];
      if (p && p.color === enemy && p.type === "pawn") return true;
    }
  }

  // Knight attacks
  const knightDeltas = [
    [2, 1],
    [1, 2],
    [-1, 2],
    [-2, 1],
    [-2, -1],
    [-1, -2],
    [1, -2],
    [2, -1],
  ];
  for (const [dr, dc] of knightDeltas) {
    const r = row + dr;
    const c = col + dc;
    if (!inBounds(r, c)) continue;
    const p = board[r][c];
    if (p && p.color === enemy && p.type === "knight") return true;
  }

  // Sliding pieces: rook/queen (orthogonal)
  const rookDirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const [dr, dc] of rookDirs) {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === enemy && (p.type === "rook" || p.type === "queen"))
          return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }

  // Sliding pieces: bishop/queen (diagonal)
  const bishopDirs = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (const [dr, dc] of bishopDirs) {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === enemy && (p.type === "bishop" || p.type === "queen"))
          return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }

  // King attacks (adjacent squares)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (!inBounds(r, c)) continue;
      const p = board[r][c];
      if (p && p.color === enemy && p.type === "king") return true;
    }
  }

  return false;
}

function isKingInCheck(board: ChessBoard, color: ChessColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false; // malformed board
  return isSquareAttacked(
    board,
    kingPos.row,
    kingPos.col,
    oppositeColor(color)
  );
}

function generatePseudoMovesForPiece(
  board: ChessBoard,
  from: Position,
  color: ChessColor
): Position[] {
  const { row, col } = from;
  const piece = board[row][col];
  if (!piece || piece.color !== color) return [];

  const moves: Position[] = [];

  switch (piece.type) {
    case "pawn": {
      const dir = color === "white" ? -1 : 1;
      const startRow = color === "white" ? 6 : 1;

      // Single forward
      const oneStepRow = row + dir;
      if (inBounds(oneStepRow, col) && !board[oneStepRow][col]) {
        moves.push({ row: oneStepRow, col });

        // Double forward from starting rank
        const twoStepRow = row + 2 * dir;
        if (
          row === startRow &&
          inBounds(twoStepRow, col) &&
          !board[twoStepRow][col]
        ) {
          moves.push({ row: twoStepRow, col });
        }
      }

      // Captures
      for (const dc of [-1, 1]) {
        const r = row + dir;
        const c = col + dc;
        if (!inBounds(r, c)) continue;
        const target = board[r][c];
        if (target && target.color !== color) {
          moves.push({ row: r, col: c });
        }
      }

      // En passant not implemented for simplicity
      break;
    }
    case "knight": {
      const deltas = [
        [2, 1],
        [1, 2],
        [-1, 2],
        [-2, 1],
        [-2, -1],
        [-1, -2],
        [1, -2],
        [2, -1],
      ];
      for (const [dr, dc] of deltas) {
        const r = row + dr;
        const c = col + dc;
        if (!inBounds(r, c)) continue;
        const target = board[r][c];
        if (!target || target.color !== color) moves.push({ row: r, col: c });
      }
      break;
    }
    case "bishop": {
      const dirs = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [dr, dc] of dirs) {
        let r = row + dr;
        let c = col + dc;
        while (inBounds(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ row: r, col: c });
          } else {
            if (target.color !== color) moves.push({ row: r, col: c });
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }
    case "rook": {
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dr, dc] of dirs) {
        let r = row + dr;
        let c = col + dc;
        while (inBounds(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ row: r, col: c });
          } else {
            if (target.color !== color) moves.push({ row: r, col: c });
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }
    case "queen": {
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [dr, dc] of dirs) {
        let r = row + dr;
        let c = col + dc;
        while (inBounds(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ row: r, col: c });
          } else {
            if (target.color !== color) moves.push({ row: r, col: c });
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }
    case "king": {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r = row + dr;
          const c = col + dc;
          if (!inBounds(r, c)) continue;
          const target = board[r][c];
          if (!target || target.color !== color) moves.push({ row: r, col: c });
        }
      }
      // Castling not implemented for simplicity
      break;
    }
  }

  return moves;
}

function generateLegalMovesForPiece(
  board: ChessBoard,
  from: Position,
  color: ChessColor
): Position[] {
  const pseudo = generatePseudoMovesForPiece(board, from, color);
  const legal: Position[] = [];

  for (const move of pseudo) {
    const newBoard = applyMoveOnBoard(board, { from, to: move });
    if (!isKingInCheck(newBoard, color)) {
      legal.push(move);
    }
  }

  return legal;
}

function applyMoveOnBoard(board: ChessBoard, move: Move): ChessBoard {
  const newBoard = cloneBoard(board);
  const piece = newBoard[move.from.row][move.from.col];
  if (!piece) return board;

  // Basic move and capture
  newBoard[move.to.row][move.to.col] = { ...piece, hasMoved: true };
  newBoard[move.from.row][move.from.col] = null;

  // Pawn promotion (auto-queen)
  const movedPiece = newBoard[move.to.row][move.to.col];
  if (
    movedPiece &&
    movedPiece.type === "pawn" &&
    (move.to.row === 0 || move.to.row === 7)
  ) {
    newBoard[move.to.row][move.to.col] = {
      ...movedPiece,
      type: "queen",
    };
  }

  return newBoard;
}

function getAllLegalMoves(board: ChessBoard, color: ChessColor): Move[] {
  const moves: Move[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) continue;
      const from: Position = { row, col };
      const legalTargets = generateLegalMovesForPiece(board, from, color);
      for (const to of legalTargets) {
        moves.push({ from, to });
      }
    }
  }
  return moves;
}

function getGameStatus(board: ChessBoard, colorToMove: ChessColor): GameStatus {
  const inCheck = isKingInCheck(board, colorToMove);
  const anyMoves = getAllLegalMoves(board, colorToMove).length > 0;

  if (inCheck && !anyMoves) return "checkmate";
  if (!inCheck && !anyMoves) return "stalemate";
  if (inCheck) return "check";
  return "ongoing";
}

function applyMoveAndUpdateState(state: ChessState, move: Move): ChessState {
  const boardAfter = applyMoveOnBoard(state.board, move);
  if (boardAfter === state.board) return state;

  const nextTurn = oppositeColor(state.currentTurn);
  const status = getGameStatus(boardAfter, nextTurn);

  return {
    ...state,
    board: boardAfter,
    currentTurn: nextTurn,
    status,
    selected: null,
    possibleMoves: [],
  };
}

// --- Public API used by components ---

export function handleSquareClick(
  state: ChessState,
  row: number,
  col: number
): ChessState {
  // Ignore clicks if game is over
  if (state.status === "checkmate" || state.status === "stalemate") {
    return state;
  }

  const clicked = state.board[row][col];

  // If no piece is currently selected, select a friendly piece and show its moves
  if (!state.selected) {
    if (clicked && clicked.color === state.currentTurn) {
      const from: Position = { row, col };
      const legalMoves = generateLegalMovesForPiece(
        state.board,
        from,
        state.currentTurn
      );
      return {
        ...state,
        selected: from,
        possibleMoves: legalMoves,
      };
    }
    return state;
  }

  const selected = state.selected;

  // Clicking another friendly piece changes selection
  if (clicked && clicked.color === state.currentTurn) {
    const from: Position = { row, col };
    const legalMoves = generateLegalMovesForPiece(
      state.board,
      from,
      state.currentTurn
    );
    return {
      ...state,
      selected: from,
      possibleMoves: legalMoves,
    };
  }

  // Attempt to move to one of the legal target squares
  const isLegalTarget = state.possibleMoves.some(
    (m) => m.row === row && m.col === col
  );

  if (!isLegalTarget) {
    // Clicking an illegal target just clears selection
    return {
      ...state,
      selected: null,
      possibleMoves: [],
    };
  }

  const move: Move = {
    from: selected,
    to: { row, col },
  };

  return applyMoveAndUpdateState(state, move);
}

// Simple computer player: choose a random legal move for the side to move.
export function makeComputerMove(state: ChessState): ChessState {
  if (state.status === "checkmate" || state.status === "stalemate") {
    return state;
  }

  const color = state.currentTurn;
  const moves = getAllLegalMoves(state.board, color);
  if (moves.length === 0) {
    // No moves: update status to reflect checkmate/stalemate if not already
    const status = getGameStatus(state.board, color);
    return { ...state, status };
  }

  const randomIndex = Math.floor(Math.random() * moves.length);
  const move = moves[randomIndex];
  return applyMoveAndUpdateState(state, move);
}
