export type GameMode = "easy" | "medium" | "hard";
export type GameState = "playing" | "paused" | "gameOver";

// Sound effects (safe no-op on unsupported environments)
class SoundEffects {
  private isSupported: boolean;

  constructor() {
    if (typeof window === "undefined") {
      this.isSupported = false;
      return;
    }

    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    this.isSupported = Boolean(AudioContextClass);
  }

  play(name: string): void {
    if (!this.isSupported) return;

    try {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const frequencies: { [key: string]: number } = {
        move: 300,
        rotate: 400,
        lock: 200,
        lineClear: 600,
        hardDrop: 150,
        gameOver: 100,
        hold: 500,
      };

      oscillator.frequency.value = frequencies[name] || 300;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Silently fail if audio doesn't work
      console.warn("Could not play sound:", name);
    }
  }
}

// Tetromino shapes
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00FFFF", // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0000FF", // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#FFA500", // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#FFFF00", // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00FF00", // Green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#800080", // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#FF0000", // Red
  },
};

type TetrominoType = keyof typeof TETROMINOS;

interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

export class TetrisGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: GameMode;
  private gameState: GameState = "playing";
  private soundEffects: SoundEffects;

  // Game board
  private readonly COLS = 10;
  private readonly ROWS = 20;
  private readonly BLOCK_SIZE = 30;
  private board: (string | null)[][];

  // Current piece
  private currentPiece: Piece | null = null;
  private nextPiece: Piece | null = null;
  private heldPiece: Piece | null = null;
  private canHold = true;

  // Game stats
  private score = 0;
  private level = 1;
  private lines = 0;
  private combo = 0;

  // Game loop
  private animationId: number | null = null;
  private lastDropTime = 0;
  private dropInterval = 1000; // milliseconds

  // Callbacks
  public onScoreUpdate?: (score: number) => void;
  public onLevelUpdate?: (level: number) => void;
  public onLinesUpdate?: (lines: number) => void;
  public onGameStateChange?: (state: GameState) => void;
  public onComboUpdate?: (combo: number) => void;

  constructor(canvas: HTMLCanvasElement, mode: GameMode) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    this.ctx = ctx;
    this.mode = mode;
    this.soundEffects = new SoundEffects();

    // Set drop interval based on mode
    this.dropInterval = this.getDropInterval();

    // Initialize empty board
    this.board = Array.from({ length: this.ROWS }, () =>
      Array(this.COLS).fill(null)
    );
  }

  private getDropInterval(): number {
    switch (this.mode) {
      case "easy":
        return 1000;
      case "medium":
        return 700;
      case "hard":
        return 400;
      default:
        return 700;
    }
  }

  private getRandomTetromino(): Piece {
    const types = Object.keys(TETROMINOS) as TetrominoType[];
    const type = types[Math.floor(Math.random() * types.length)];
    const tetromino = TETROMINOS[type];

    return {
      type,
      shape: tetromino.shape.map((row) => [...row]),
      x: Math.floor(this.COLS / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0,
      color: tetromino.color,
    };
  }

  public start(): void {
    this.currentPiece = this.getRandomTetromino();
    this.nextPiece = this.getRandomTetromino();
    this.lastDropTime = Date.now();
    this.gameLoop();
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public pause(): void {
    this.gameState = "paused";
    this.onGameStateChange?.(this.gameState);
  }

  public resume(): void {
    this.gameState = "playing";
    this.lastDropTime = Date.now();
    this.onGameStateChange?.(this.gameState);
  }

  public restart(): void {
    this.board = Array.from({ length: this.ROWS }, () =>
      Array(this.COLS).fill(null)
    );
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.combo = 0;
    this.gameState = "playing";
    this.currentPiece = this.getRandomTetromino();
    this.nextPiece = this.getRandomTetromino();
    this.heldPiece = null;
    this.canHold = true;
    this.lastDropTime = Date.now();

    this.onScoreUpdate?.(this.score);
    this.onLevelUpdate?.(this.level);
    this.onLinesUpdate?.(this.lines);
    this.onGameStateChange?.(this.gameState);
    this.onComboUpdate?.(this.combo);
  }

  private gameLoop = (): void => {
    if (this.gameState === "playing") {
      const now = Date.now();
      const deltaTime = now - this.lastDropTime;

      if (deltaTime > this.dropInterval) {
        this.moveDown();
        this.lastDropTime = now;
      }
    }

    this.draw();
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private draw(): void {
    // Clear canvas
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw board
    this.drawBoard();

    // Draw ghost piece (where piece will land)
    if (this.currentPiece) {
      this.drawGhostPiece(this.currentPiece);
    }

    // Draw current piece
    if (this.currentPiece) {
      this.drawPiece(this.currentPiece);
    }

    // Draw grid
    this.drawGrid();
  }

  private drawBoard(): void {
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (this.board[row][col]) {
          this.ctx.fillStyle = this.board[row][col] as string;
          this.ctx.fillRect(
            col * this.BLOCK_SIZE,
            row * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );
          // Add border
          this.ctx.strokeStyle = "#000000";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            col * this.BLOCK_SIZE,
            row * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );
        }
      }
    }
  }

  private drawPiece(piece: Piece): void {
    this.ctx.fillStyle = piece.color;
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          this.ctx.fillRect(
            (piece.x + col) * this.BLOCK_SIZE,
            (piece.y + row) * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );
          // Add border
          this.ctx.strokeStyle = "#000000";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            (piece.x + col) * this.BLOCK_SIZE,
            (piece.y + row) * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );
        }
      }
    }
  }

  private drawGhostPiece(piece: Piece): void {
    // Find where piece would land
    let ghostY = piece.y;
    while (!this.collides({ ...piece, y: ghostY + 1 }, 0, 0)) {
      ghostY++;
    }

    // Draw semi-transparent ghost
    this.ctx.globalAlpha = 0.2;
    this.ctx.fillStyle = piece.color;
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          this.ctx.fillRect(
            (piece.x + col) * this.BLOCK_SIZE,
            (ghostY + row) * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );
          this.ctx.strokeStyle = piece.color;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            (piece.x + col) * this.BLOCK_SIZE,
            (ghostY + row) * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );
        }
      }
    }
    this.ctx.globalAlpha = 1.0;
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = "#1a1a1a";
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let col = 0; col <= this.COLS; col++) {
      this.ctx.beginPath();
      this.ctx.moveTo(col * this.BLOCK_SIZE, 0);
      this.ctx.lineTo(col * this.BLOCK_SIZE, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let row = 0; row <= this.ROWS; row++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, row * this.BLOCK_SIZE);
      this.ctx.lineTo(this.canvas.width, row * this.BLOCK_SIZE);
      this.ctx.stroke();
    }
  }

  // Getter methods for UI
  public getNextPiece(): Piece | null {
    return this.nextPiece;
  }

  public getHeldPiece(): Piece | null {
    return this.heldPiece;
  }

  private collides(piece: Piece, offsetX = 0, offsetY = 0): boolean {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = piece.x + col + offsetX;
          const newY = piece.y + row + offsetY;

          // Check boundaries - left, right, top, and bottom
          if (newX < 0 || newX >= this.COLS || newY < 0 || newY >= this.ROWS) {
            return true;
          }

          // Check collision with board
          if (this.board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public moveLeft(): void {
    if (!this.currentPiece || this.gameState !== "playing") return;

    if (!this.collides(this.currentPiece, -1, 0)) {
      this.currentPiece.x--;
      this.soundEffects.play("move");
    }
  }

  public moveRight(): void {
    if (!this.currentPiece || this.gameState !== "playing") return;

    if (!this.collides(this.currentPiece, 1, 0)) {
      this.currentPiece.x++;
      this.soundEffects.play("move");
    }
  }

  public moveDown(): void {
    if (!this.currentPiece || this.gameState !== "playing") return;

    if (!this.collides(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
    } else {
      this.lockPiece();
      this.clearLines();
      this.spawnNewPiece();
    }
  }

  public rotate(): void {
    if (!this.currentPiece || this.gameState !== "playing") return;

    // Create rotated shape
    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece!.shape.map((row) => row[i]).reverse()
    );

    const previousShape = this.currentPiece.shape;
    this.currentPiece.shape = rotated;

    // Check if rotation is valid
    if (this.collides(this.currentPiece, 0, 0)) {
      // Try wall kicks
      const kicks = [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
      ];

      let valid = false;
      for (const kick of kicks) {
        if (!this.collides(this.currentPiece, kick.x, kick.y)) {
          this.currentPiece.x += kick.x;
          this.currentPiece.y += kick.y;
          valid = true;
          break;
        }
      }

      // If no valid position, revert rotation
      if (!valid) {
        this.currentPiece.shape = previousShape;
      } else {
        this.soundEffects.play("rotate");
      }
    } else {
      this.soundEffects.play("rotate");
    }
  }

  public hardDrop(): void {
    if (!this.currentPiece || this.gameState !== "playing") return;

    while (!this.collides(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
    }

    this.soundEffects.play("hardDrop");
    this.lockPiece();
    this.clearLines();
    this.spawnNewPiece();
  }

  public holdPiece(): void {
    if (!this.currentPiece || this.gameState !== "playing" || !this.canHold)
      return;

    if (this.heldPiece === null) {
      // First time holding
      this.heldPiece = {
        ...this.currentPiece,
        x:
          Math.floor(this.COLS / 2) -
          Math.floor(this.currentPiece.shape[0].length / 2),
        y: 0,
      };
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.getRandomTetromino();
    } else {
      // Swap current and held
      const temp = this.heldPiece;
      this.heldPiece = {
        ...this.currentPiece,
        x:
          Math.floor(this.COLS / 2) -
          Math.floor(this.currentPiece.shape[0].length / 2),
        y: 0,
      };
      this.currentPiece = {
        ...temp,
        x: Math.floor(this.COLS / 2) - Math.floor(temp.shape[0].length / 2),
        y: 0,
      };
    }

    this.soundEffects.play("hold");
    this.canHold = false;
  }

  private lockPiece(): void {
    if (!this.currentPiece) return;

    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const boardY = this.currentPiece.y + row;
          const boardX = this.currentPiece.x + col;

          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.color;
          }
        }
      }
    }
    this.soundEffects.play("lock");
  }

  private clearLines(): void {
    let linesCleared = 0;
    const rowsToClear: number[] = [];

    // Find all completed rows
    for (let row = this.ROWS - 1; row >= 0; row--) {
      if (this.board[row].every((cell) => cell !== null)) {
        rowsToClear.push(row);
      }
    }

    // Clear completed rows from bottom to top
    for (const row of rowsToClear) {
      this.board.splice(row, 1);
      this.board.unshift(Array(this.COLS).fill(null));
      linesCleared++;
    }

    if (linesCleared > 0) {
      this.soundEffects.play("lineClear");
      // Update combo
      this.combo++;
      this.onComboUpdate?.(this.combo);

      // Update score with combo multiplier
      const points = [0, 100, 300, 500, 800];
      const comboBonus = Math.min(this.combo * 50, 500);
      this.score += (points[linesCleared] + comboBonus) * this.level;
      this.lines += linesCleared;

      // Update level
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.dropInterval = Math.max(
          100,
          this.getDropInterval() - (this.level - 1) * 50
        );
        this.onLevelUpdate?.(this.level);
      }

      this.onScoreUpdate?.(this.score);
      this.onLinesUpdate?.(this.lines);
    } else {
      // Reset combo if no lines cleared
      if (this.combo > 0) {
        this.combo = 0;
        this.onComboUpdate?.(this.combo);
      }
    }
  }

  private spawnNewPiece(): void {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.getRandomTetromino();
    this.canHold = true; // Reset hold ability

    // Check if game over
    if (this.currentPiece && this.collides(this.currentPiece, 0, 0)) {
      this.gameState = "gameOver";
      this.soundEffects.play("gameOver");
      this.onGameStateChange?.(this.gameState);
    }
  }
}
