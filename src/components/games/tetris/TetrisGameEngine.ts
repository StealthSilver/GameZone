export type GameMode = "easy" | "medium" | "hard";
export type GameState = "playing" | "paused" | "gameOver";

// Sound effects (safe no-op on unsupported environments)
class SoundEffects {
  private isSupported: boolean;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window === "undefined") {
      this.isSupported = false;
      return;
    }

    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    this.isSupported = Boolean(AudioContextClass);

    if (this.isSupported && AudioContextClass) {
      this.audioContext = new AudioContextClass();
    }
  }

  play(name: string): void {
    if (!this.isSupported || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

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

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.1
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (e) {
      // Silently fail if audio doesn't work
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
  private blockSize = 30;
  private logicalWidth = this.COLS * this.blockSize;
  private logicalHeight = this.ROWS * this.blockSize;
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

    // Ensure the canvas has a sensible initial size (can be overridden by resize()).
    this.resize(this.blockSize);

    // Set drop interval based on mode
    this.dropInterval = this.getDropInterval();

    // Initialize empty board
    this.board = Array.from({ length: this.ROWS }, () =>
      Array(this.COLS).fill(null)
    );
  }

  public resize(blockSize: number): void {
    const nextBlockSize = Math.max(16, Math.min(60, Math.floor(blockSize)));
    this.blockSize = nextBlockSize;
    this.logicalWidth = this.COLS * this.blockSize;
    this.logicalHeight = this.ROWS * this.blockSize;

    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    this.canvas.style.width = `${this.logicalWidth}px`;
    this.canvas.style.height = `${this.logicalHeight}px`;
    this.canvas.width = Math.floor(this.logicalWidth * dpr);
    this.canvas.height = Math.floor(this.logicalHeight * dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
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
    const now = Date.now();

    if (this.gameState === "playing") {
      const deltaTime = now - this.lastDropTime;

      if (deltaTime >= this.dropInterval) {
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
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

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
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 2;
    
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const cell = this.board[row][col];
        if (cell) {
          const x = col * this.blockSize;
          const y = row * this.blockSize;
          
          this.ctx.fillStyle = cell;
          this.ctx.fillRect(x, y, this.blockSize, this.blockSize);
          this.ctx.strokeRect(x, y, this.blockSize, this.blockSize);
        }
      }
    }
  }

  private drawPiece(piece: Piece): void {
    this.ctx.fillStyle = piece.color;
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 2;
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const x = (piece.x + col) * this.blockSize;
          const y = (piece.y + row) * this.blockSize;
          
          // Only draw if within visible board area
          if (piece.y + row >= 0) {
            this.ctx.fillRect(x, y, this.blockSize, this.blockSize);
            this.ctx.strokeRect(x, y, this.blockSize, this.blockSize);
          }
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

    // Only draw ghost if it's different from current position
    if (ghostY === piece.y) return;

    // Draw semi-transparent ghost
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = piece.color;
    this.ctx.strokeStyle = piece.color;
    this.ctx.lineWidth = 2;
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const x = (piece.x + col) * this.blockSize;
          const y = (ghostY + row) * this.blockSize;
          
          this.ctx.strokeRect(x, y, this.blockSize, this.blockSize);
        }
      }
    }
    
    this.ctx.restore();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = "#1a1a1a";
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let col = 0; col <= this.COLS; col++) {
      this.ctx.beginPath();
      this.ctx.moveTo(col * this.blockSize, 0);
      this.ctx.lineTo(col * this.blockSize, this.logicalHeight);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let row = 0; row <= this.ROWS; row++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, row * this.blockSize);
      this.ctx.lineTo(this.logicalWidth, row * this.blockSize);
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

          // Check boundaries
          if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) {
            return true;
          }

          // Allow pieces to be above the board during spawn
          if (newY < 0) {
            continue;
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

    // Don't rotate O piece (it's symmetrical)
    if (this.currentPiece.type === "O") {
      this.soundEffects.play("rotate");
      return;
    }

    // Create rotated shape (90 degrees clockwise)
    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece!.shape.map((row) => row[i]).reverse()
    );

    const previousShape = this.currentPiece.shape;
    this.currentPiece.shape = rotated;

    // Check if rotation is valid with wall kicks
    if (this.collides(this.currentPiece, 0, 0)) {
      // Try wall kicks (SRS - Super Rotation System inspired)
      const kicks = [
        { x: -1, y: 0 }, // Left
        { x: 1, y: 0 }, // Right
        { x: -2, y: 0 }, // Far left (for I piece)
        { x: 2, y: 0 }, // Far right (for I piece)
        { x: 0, y: -1 }, // Up
        { x: -1, y: -1 }, // Left-up
        { x: 1, y: -1 }, // Right-up
      ];

      let rotationSuccessful = false;
      for (const kick of kicks) {
        if (!this.collides(this.currentPiece, kick.x, kick.y)) {
          this.currentPiece.x += kick.x;
          this.currentPiece.y += kick.y;
          rotationSuccessful = true;
          break;
        }
      }

      // If no valid position, revert rotation
      if (!rotationSuccessful) {
        this.currentPiece.shape = previousShape;
        return;
      }
    }

    this.soundEffects.play("rotate");
  }

  public hardDrop(): void {
    if (!this.currentPiece || this.gameState !== "playing") return;

    let dropDistance = 0;
    while (!this.collides(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
      dropDistance++;
    }

    // Award bonus points for hard drop
    if (dropDistance > 0) {
      this.score += dropDistance * 2;
      this.onScoreUpdate?.(this.score);
    }

    this.soundEffects.play("hardDrop");
    this.lockPiece();
    this.clearLines();
    this.spawnNewPiece();
  }

  public holdPiece(): void {
    if (!this.currentPiece || this.gameState !== "playing" || !this.canHold)
      return;

    const resetPiece = (piece: Piece): Piece => {
      return {
        ...piece,
        shape: TETROMINOS[piece.type].shape.map((row) => [...row]),
        x: Math.floor(this.COLS / 2) - Math.floor(piece.shape[0].length / 2),
        y: 0,
      };
    };

    if (this.heldPiece === null) {
      // First time holding - store current and spawn next
      this.heldPiece = resetPiece(this.currentPiece);
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.getRandomTetromino();
    } else {
      // Swap current and held
      const temp = resetPiece(this.heldPiece);
      this.heldPiece = resetPiece(this.currentPiece);
      this.currentPiece = temp;
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
    const rowsToClear: number[] = [];

    // Find all completed rows
    for (let row = this.ROWS - 1; row >= 0; row--) {
      if (this.board[row].every((cell) => cell !== null)) {
        rowsToClear.push(row);
      }
    }

    const linesCleared = rowsToClear.length;

    if (linesCleared > 0) {
      // Clear completed rows
      for (const row of rowsToClear.sort((a, b) => b - a)) {
        this.board.splice(row, 1);
        this.board.unshift(Array(this.COLS).fill(null));
      }

      this.soundEffects.play("lineClear");
      
      // Update combo
      this.combo++;
      this.onComboUpdate?.(this.combo);

      // Calculate score with combo multiplier
      const basePoints = [0, 100, 300, 500, 800];
      const comboBonus = Math.min((this.combo - 1) * 50, 500);
      const linePoints = basePoints[linesCleared] || 0;
      this.score += (linePoints + comboBonus) * this.level;
      
      // Update lines
      this.lines += linesCleared;

      // Check for level up (every 10 lines)
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        // Increase drop speed with level
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
    if (!this.nextPiece) {
      this.nextPiece = this.getRandomTetromino();
    }

    this.currentPiece = this.nextPiece;
    this.nextPiece = this.getRandomTetromino();
    this.canHold = true; // Reset hold ability

    // Check if game over - piece spawns in collision
    if (this.currentPiece && this.collides(this.currentPiece, 0, 0)) {
      this.gameState = "gameOver";
      this.soundEffects.play("gameOver");
      this.onGameStateChange?.(this.gameState);
      this.stop();
    }
  }
}
