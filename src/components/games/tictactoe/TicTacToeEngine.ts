export type Player = "X" | "O" | null;
export type Board = Player[];
export type GameMode = "player" | "computer";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  isDraw: boolean;
  winningLine: number[] | null;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export class TicTacToeEngine {
  private board: Board;
  private currentPlayer: Player;
  private gameMode: GameMode;
  private winner: Player;
  private winningLine: number[] | null;

  constructor(gameMode: GameMode) {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.gameMode = gameMode;
    this.winner = null;
    this.winningLine = null;
  }

  makeMove(index: number): boolean {
    if (this.board[index] || this.winner) {
      return false;
    }

    this.board[index] = this.currentPlayer;
    this.checkWinner();

    if (!this.winner && !this.isDraw()) {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }

    return true;
  }

  private checkWinner(): void {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        this.winner = this.board[a];
        this.winningLine = combination;
        return;
      }
    }
  }

  isDraw(): boolean {
    return !this.winner && this.board.every((cell) => cell !== null);
  }

  getComputerMove(): number {
    // Try to win
    const winMove = this.findWinningMove("O");
    if (winMove !== -1) return winMove;

    // Block player from winning
    const blockMove = this.findWinningMove("X");
    if (blockMove !== -1) return blockMove;

    // Take center if available
    if (!this.board[4]) return 4;

    // Take a corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((i) => !this.board[i]);
    if (availableCorners.length > 0) {
      return availableCorners[
        Math.floor(Math.random() * availableCorners.length)
      ];
    }

    // Take any available space
    const availableMoves = this.board
      .map((cell, index) => (cell === null ? index : -1))
      .filter((index) => index !== -1);

    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  private findWinningMove(player: Player): number {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      const line = [this.board[a], this.board[b], this.board[c]];

      if (
        line.filter((cell) => cell === player).length === 2 &&
        line.includes(null)
      ) {
        if (this.board[a] === null) return a;
        if (this.board[b] === null) return b;
        if (this.board[c] === null) return c;
      }
    }
    return -1;
  }

  getState(): GameState {
    return {
      board: [...this.board],
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      isDraw: this.isDraw(),
      winningLine: this.winningLine,
    };
  }

  reset(): void {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.winner = null;
    this.winningLine = null;
  }
}
