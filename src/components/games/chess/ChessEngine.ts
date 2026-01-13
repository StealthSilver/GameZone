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

export type GameStatus =
  | "ongoing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "drawRepetition"
  | "drawInsufficient";

export interface ChessState {
  board: ChessBoard;
  currentTurn: ChessColor;
  status: GameStatus;
  selected: { row: number; col: number } | null;
  possibleMoves: { row: number; col: number }[];
  // Tracks how many times a position has occurred (for repetition draws)
  positionCounts: Record<string, number>;
  lastMove?: {
    from: Position;
    to: Position;
    captured: Piece | null;
    gaveCheck: boolean;
    movedPieceType: PieceType;
    promotion?: boolean;
  };
}

// Difficulty: 1 (easiest) to 10 (hardest)
export type ChessDifficulty = number;

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
  const board = createInitialBoard();
  const positionKey = getPositionKey(board, "white");
  return {
    board,
    currentTurn: "white",
    status: "ongoing",
    selected: null,
    possibleMoves: [],
    positionCounts: {
      [positionKey]: 1,
    },
  };
}

// --- Internal helpers ---

const inBounds = (row: number, col: number): boolean =>
  row >= 0 && row < 8 && col >= 0 && col < 8;

const cloneBoard = (board: ChessBoard): ChessBoard =>
  board.map((r) => r.slice());

const oppositeColor = (color: ChessColor): ChessColor =>
  color === "white" ? "black" : "white";

// Serialize a position (board + side to move) for repetition tracking.
function getPositionKey(board: ChessBoard, currentTurn: ChessColor): string {
  let key = currentTurn === "white" ? "w|" : "b|";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p) {
        key += ".";
      } else {
        let base: string;
        switch (p.type) {
          case "pawn":
            base = "p";
            break;
          case "knight":
            base = "n";
            break;
          case "bishop":
            base = "b";
            break;
          case "rook":
            base = "r";
            break;
          case "queen":
            base = "q";
            break;
          case "king":
            base = "k";
            break;
        }
        const char = p.color === "white" ? base.toUpperCase() : base;
        const moved = p.hasMoved ? "1" : "0";
        key += char + moved;
      }
      key += ",";
    }
  }
  return key;
}

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
  const pawnRow = row - pawnDir; // pawns stand one step behind the attacked square
  for (const dc of [-1, 1]) {
    const c = col + dc;
    if (inBounds(pawnRow, c)) {
      const p = board[pawnRow][c];
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
      // Castling
      const startRow = color === "white" ? 7 : 0;
      if (row === startRow && !piece.hasMoved && !isKingInCheck(board, color)) {
        const enemy = oppositeColor(color);

        // King-side castling (short)
        if (!board[row][5] && !board[row][6]) {
          const rook = board[row][7];
          if (
            rook &&
            rook.type === "rook" &&
            rook.color === color &&
            !rook.hasMoved &&
            !isSquareAttacked(board, row, 5, enemy) &&
            !isSquareAttacked(board, row, 6, enemy)
          ) {
            moves.push({ row, col: 6 });
          }
        }

        // Queen-side castling (long)
        if (!board[row][1] && !board[row][2] && !board[row][3]) {
          const rook = board[row][0];
          if (
            rook &&
            rook.type === "rook" &&
            rook.color === color &&
            !rook.hasMoved &&
            !isSquareAttacked(board, row, 2, enemy) &&
            !isSquareAttacked(board, row, 3, enemy)
          ) {
            moves.push({ row, col: 2 });
          }
        }
      }
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

  const fromRow = move.from.row;
  const fromCol = move.from.col;
  const toRow = move.to.row;
  const toCol = move.to.col;

  // Handle castling: king moves two squares horizontally and rook hops over.
  if (piece.type === "king" && Math.abs(toCol - fromCol) === 2) {
    // Move king
    newBoard[toRow][toCol] = { ...piece, hasMoved: true };
    newBoard[fromRow][fromCol] = null;

    // Move rook on the appropriate side
    if (toCol === 6) {
      // King-side
      const rook = newBoard[fromRow][7];
      if (rook && rook.type === "rook" && rook.color === piece.color) {
        newBoard[fromRow][5] = { ...rook, hasMoved: true };
        newBoard[fromRow][7] = null;
      }
    } else if (toCol === 2) {
      // Queen-side
      const rook = newBoard[fromRow][0];
      if (rook && rook.type === "rook" && rook.color === piece.color) {
        newBoard[fromRow][3] = { ...rook, hasMoved: true };
        newBoard[fromRow][0] = null;
      }
    }

    return newBoard;
  }

  // Handle en passant capture: pawn moves diagonally to an empty square
  if (piece.type === "pawn" && fromCol !== toCol && !newBoard[toRow][toCol]) {
    const dir = piece.color === "white" ? -1 : 1;
    const capturedRow = toRow - dir;
    const capturedCol = toCol;
    const capturedPawn = newBoard[capturedRow]?.[capturedCol];
    if (
      capturedPawn &&
      capturedPawn.type === "pawn" &&
      capturedPawn.color !== piece.color
    ) {
      newBoard[capturedRow][capturedCol] = null;
    }
  }

  // Basic move and capture
  newBoard[toRow][toCol] = { ...piece, hasMoved: true };
  newBoard[fromRow][fromCol] = null;

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

  if (hasInsufficientMaterial(board)) return "drawInsufficient";

  if (inCheck && !anyMoves) return "checkmate";
  if (!inCheck && !anyMoves) return "stalemate";
  if (inCheck) return "check";
  return "ongoing";
}

// Detect positions where neither side has sufficient material to checkmate.
function hasInsufficientMaterial(board: ChessBoard): boolean {
  type MinorInfo = { color: ChessColor; type: PieceType; squareColor: number };

  const minors: MinorInfo[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p) continue;

      if (p.type === "pawn" || p.type === "rook" || p.type === "queen") {
        return false; // Pawns, rooks, or queens give sufficient mating potential
      }

      if (p.type === "bishop" || p.type === "knight") {
        minors.push({
          color: p.color,
          type: p.type,
          squareColor: (row + col) % 2,
        });
      }
    }
  }

  const whiteMinors = minors.filter((m) => m.color === "white");
  const blackMinors = minors.filter((m) => m.color === "black");

  // King vs King
  if (whiteMinors.length === 0 && blackMinors.length === 0) {
    return true;
  }

  // King + minor vs King
  if (
    whiteMinors.length === 1 &&
    (whiteMinors[0].type === "bishop" || whiteMinors[0].type === "knight") &&
    blackMinors.length === 0
  ) {
    return true;
  }
  if (
    blackMinors.length === 1 &&
    (blackMinors[0].type === "bishop" || blackMinors[0].type === "knight") &&
    whiteMinors.length === 0
  ) {
    return true;
  }

  // King + bishop vs King + bishop (same color squares)
  if (
    whiteMinors.length === 1 &&
    blackMinors.length === 1 &&
    whiteMinors[0].type === "bishop" &&
    blackMinors[0].type === "bishop" &&
    whiteMinors[0].squareColor === blackMinors[0].squareColor
  ) {
    return true;
  }

  return false;
}

function applyMoveAndUpdateState(state: ChessState, move: Move): ChessState {
  const movingPiece = state.board[move.from.row][move.from.col] || null;
  const captured = state.board[move.to.row][move.to.col] || null;
  const boardAfter = applyMoveOnBoard(state.board, move);
  if (boardAfter === state.board) return state;

  const nextTurn = oppositeColor(state.currentTurn);
  // If a king was captured, treat this as an immediate checkmate.
  let status: GameStatus;
  let gaveCheck = false;

  if (captured && captured.type === "king") {
    status = "checkmate";
    gaveCheck = true;
  } else {
    status = getGameStatus(boardAfter, nextTurn);
    gaveCheck = status === "check" || status === "checkmate";
  }

  const promotionOccurred =
    movingPiece?.type === "pawn" && (move.to.row === 0 || move.to.row === 7);

  // Update repetition tracking for the new position
  const positionKey = getPositionKey(boardAfter, nextTurn);
  const positionCounts = { ...(state.positionCounts || {}) };
  positionCounts[positionKey] = (positionCounts[positionKey] || 0) + 1;

  let finalStatus: GameStatus = status;
  if (finalStatus !== "checkmate" && positionCounts[positionKey] >= 3) {
    finalStatus = "drawRepetition";
  }

  return {
    ...state,
    board: boardAfter,
    currentTurn: nextTurn,
    status: finalStatus,
    selected: null,
    possibleMoves: [],
    lastMove: {
      from: move.from,
      to: move.to,
      captured,
      gaveCheck,
      movedPieceType: movingPiece ? movingPiece.type : "pawn",
      promotion: promotionOccurred || undefined,
    },
    positionCounts,
  };
}

// Allow the UI to change the piece type of a just-promoted pawn
// (e.g. queen, rook, bishop, knight) after the move has been made.
export function applyPromotionChoice(
  state: ChessState,
  newType: Exclude<PieceType, "pawn" | "king">
): ChessState {
  const last = state.lastMove;
  if (!last || !last.promotion) return state;

  const { row, col } = last.to;
  const piece = state.board[row][col];
  if (!piece) return state;

  // Update the board with the chosen promotion piece while preserving color.
  const newBoard: ChessBoard = state.board.map((r, rIdx) =>
    r.map((sq, cIdx) => {
      if (rIdx === row && cIdx === col && sq) {
        return { ...sq, type: newType };
      }
      return sq;
    })
  );

  return {
    ...state,
    board: newBoard,
    lastMove: {
      ...state.lastMove!,
      movedPieceType: newType,
    },
  };
}

// --- Evaluation and search for computer moves ---

function evaluateBoard(board: ChessBoard, perspective: ChessColor): number {
  // Simple material + tiny mobility evaluation.
  const pieceValues: Record<PieceType, number> = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000,
  };

  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p) continue;
      const value = pieceValues[p.type];
      score += p.color === perspective ? value : -value;
    }
  }

  // Mobility (number of legal moves) as a small term.
  const myMoves = getAllLegalMoves(board, perspective).length;
  const oppMoves = getAllLegalMoves(board, oppositeColor(perspective)).length;
  score += (myMoves - oppMoves) * 5;

  return score;
}

function negamax(
  board: ChessBoard,
  depth: number,
  colorToMove: ChessColor,
  perspective: ChessColor,
  alpha: number,
  beta: number
): number {
  const status = getGameStatus(board, colorToMove);
  if (status === "checkmate") {
    // If it's checkmate and it's our turn, we lost; if it's opponent's turn, we won.
    const losing = colorToMove === perspective;
    const mateScore = 100000;
    return losing ? -mateScore : mateScore;
  }
  if (status === "stalemate" || status === "drawInsufficient") {
    return 0;
  }

  if (depth === 0) {
    return evaluateBoard(board, perspective);
  }

  const moves = getAllLegalMoves(board, colorToMove);
  if (moves.length === 0) {
    return 0;
  }

  let best = -Infinity;

  for (const move of moves) {
    const newBoard = applyMoveOnBoard(board, move);
    const value = -negamax(
      newBoard,
      depth - 1,
      oppositeColor(colorToMove),
      perspective,
      -beta,
      -alpha
    );
    if (value > best) {
      best = value;
    }
    if (best > alpha) {
      alpha = best;
    }
    if (alpha >= beta) {
      break; // alpha-beta cutoff
    }
  }

  return best;
}

function pickComputerMove(
  board: ChessBoard,
  color: ChessColor,
  difficulty: ChessDifficulty
): Move | null {
  const moves = getAllLegalMoves(board, color);
  if (moves.length === 0) return null;

  // Always take an immediate checkmate in one move if available.
  const opponentColor = oppositeColor(color);
  for (const move of moves) {
    const newBoard = applyMoveOnBoard(board, move);
    const statusAfter = getGameStatus(newBoard, opponentColor);
    if (statusAfter === "checkmate") {
      return move;
    }
  }

  // Map difficulty (1-10) to search depth (1-4) and randomness.
  const clamped = Math.max(1, Math.min(10, difficulty));
  let depth: number;
  if (clamped <= 3) depth = 1;
  else if (clamped <= 6) depth = 2;
  else if (clamped <= 8) depth = 3;
  else depth = 4;

  // Randomness factor: higher on easy, lower on hard.
  const randomness = (11 - clamped) / 10; // 1.0 at level 1 -> 0.1 at level 10

  // Occasionally pick a random move on easier levels.
  if (Math.random() < randomness * 0.4) {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  // Search for best move using negamax.
  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of moves) {
    const newBoard = applyMoveOnBoard(board, move);
    const score = -negamax(
      newBoard,
      depth - 1,
      oppositeColor(color),
      color,
      -Infinity,
      Infinity
    );

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  // If multiple moves tie, choose one at random for variety.
  const idx = Math.floor(Math.random() * bestMoves.length);
  return bestMoves[idx];
}

// --- Public API used by components ---

export function handleSquareClick(
  state: ChessState,
  row: number,
  col: number
): ChessState {
  // Ignore clicks if game is over
  if (
    state.status === "checkmate" ||
    state.status === "stalemate" ||
    state.status === "drawRepetition" ||
    state.status === "drawInsufficient"
  ) {
    return state;
  }

  const clicked = state.board[row][col];

  // If no piece is currently selected, select a friendly piece and show its moves
  if (!state.selected) {
    if (clicked && clicked.color === state.currentTurn) {
      const from: Position = { row, col };
      let legalMoves = generateLegalMovesForPiece(
        state.board,
        from,
        state.currentTurn
      );

      // En passant: add capture squares for pawns based on the last move
      const piece = state.board[row][col];
      const last = state.lastMove;
      if (
        piece &&
        piece.type === "pawn" &&
        last &&
        last.movedPieceType === "pawn"
      ) {
        const fromRow = last.from.row;
        const toRow = last.to.row;
        const fromCol = last.from.col;
        const toCol = last.to.col;

        // Opponent just moved a pawn two squares forward next to our pawn
        const movedPawn = state.board[toRow][toCol];
        if (
          movedPawn &&
          movedPawn.color !== piece.color &&
          fromCol === toCol &&
          Math.abs(toRow - fromRow) === 2 &&
          row === toRow &&
          Math.abs(col - toCol) === 1
        ) {
          const dir = piece.color === "white" ? -1 : 1;
          const targetRow = row + dir;
          const targetCol = toCol;
          if (
            inBounds(targetRow, targetCol) &&
            !state.board[targetRow][targetCol]
          ) {
            const testBoard = applyMoveOnBoard(state.board, {
              from,
              to: { row: targetRow, col: targetCol },
            });
            if (!isKingInCheck(testBoard, piece.color)) {
              legalMoves = [...legalMoves, { row: targetRow, col: targetCol }];
            }
          }
        }
      }
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
    let legalMoves = generateLegalMovesForPiece(
      state.board,
      from,
      state.currentTurn
    );

    // En passant possibilities when switching to a different pawn
    const piece = state.board[row][col];
    const last = state.lastMove;
    if (
      piece &&
      piece.type === "pawn" &&
      last &&
      last.movedPieceType === "pawn"
    ) {
      const fromRow = last.from.row;
      const toRow = last.to.row;
      const fromCol = last.from.col;
      const toCol = last.to.col;

      const movedPawn = state.board[toRow][toCol];
      if (
        movedPawn &&
        movedPawn.color !== piece.color &&
        fromCol === toCol &&
        Math.abs(toRow - fromRow) === 2 &&
        row === toRow &&
        Math.abs(col - toCol) === 1
      ) {
        const dir = piece.color === "white" ? -1 : 1;
        const targetRow = row + dir;
        const targetCol = toCol;
        if (
          inBounds(targetRow, targetCol) &&
          !state.board[targetRow][targetCol]
        ) {
          const testBoard = applyMoveOnBoard(state.board, {
            from,
            to: { row: targetRow, col: targetCol },
          });
          if (!isKingInCheck(testBoard, piece.color)) {
            legalMoves = [...legalMoves, { row: targetRow, col: targetCol }];
          }
        }
      }
    }
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

// Computer player using a simple engine with difficulty.
export function makeComputerMove(
  state: ChessState,
  difficulty: ChessDifficulty = 1
): ChessState {
  if (
    state.status === "checkmate" ||
    state.status === "stalemate" ||
    state.status === "drawRepetition" ||
    state.status === "drawInsufficient"
  ) {
    return state;
  }

  const color = state.currentTurn;
  const move = pickComputerMove(state.board, color, difficulty);
  if (!move) {
    // No moves: update status to reflect checkmate/stalemate if not already
    const status = getGameStatus(state.board, color);
    return { ...state, status };
  }
  return applyMoveAndUpdateState(state, move);
}
