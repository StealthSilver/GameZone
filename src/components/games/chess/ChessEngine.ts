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

// Placeholder move logic: allows selecting and moving a piece to any empty square.
// You will replace this with real chess rules later.
export function handleSquareClick(
  state: ChessState,
  row: number,
  col: number
): ChessState {
  const clicked = state.board[row][col];

  // Select friendly piece
  if (clicked && clicked.color === state.currentTurn) {
    return {
      ...state,
      selected: { row, col },
      possibleMoves: [],
    };
  }

  // Move selected piece to empty square (very naive)
  if (state.selected && !clicked) {
    const { row: sr, col: sc } = state.selected;
    const boardCopy = state.board.map((r) => r.slice());
    boardCopy[row][col] = boardCopy[sr][sc];
    boardCopy[sr][sc] = null;

    return {
      ...state,
      board: boardCopy,
      currentTurn: state.currentTurn === "white" ? "black" : "white",
      selected: null,
      possibleMoves: [],
    };
  }

  return state;
}
