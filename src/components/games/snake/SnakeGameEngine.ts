export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Position = { x: number; y: number };
export type GameStatus = "idle" | "playing" | "paused" | "gameOver";
export type SnakeSkin = "classic" | "ocean" | "fire" | "forest";
export type FruitType = "apple" | "cherry" | "orange" | "grape";
export type GameMode = "easy" | "medium" | "hard";

// Speed configurations for each difficulty
export const GAME_MODE_SPEEDS = {
  easy: { initial: 200, minimum: 100 },
  medium: { initial: 150, minimum: 70 },
  hard: { initial: 100, minimum: 40 },
};

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  highScore: number;
  status: GameStatus;
  speed: number;
  snakeSkin: SnakeSkin;
  fruitType: FruitType;
  gameMode: GameMode;
}

export class SnakeGameEngine {
  private gridSize: number;
  private state: GameState;
  private listeners: Set<(state: GameState) => void>;

  constructor(gridSize: number = 20) {
    this.gridSize = gridSize;
    this.listeners = new Set();

    // Load high scores from localStorage if available
    const savedHighScores =
      typeof window !== "undefined"
        ? {
            easy: parseInt(
              localStorage.getItem("snakeHighScore_easy") || "0",
              10
            ),
            medium: parseInt(
              localStorage.getItem("snakeHighScore_medium") || "0",
              10
            ),
            hard: parseInt(
              localStorage.getItem("snakeHighScore_hard") || "0",
              10
            ),
          }
        : { easy: 0, medium: 0, hard: 0 };

    this.state = {
      snake: [{ x: 10, y: 10 }],
      food: this.generateFood([{ x: 10, y: 10 }]),
      direction: "RIGHT",
      nextDirection: "RIGHT",
      score: 0,
      highScore: savedHighScores.medium,
      status: "idle",
      speed: GAME_MODE_SPEEDS.medium.initial,
      snakeSkin: "classic",
      fruitType: "apple",
      gameMode: "medium",
    };
  }

  // Subscribe to state changes
  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of state change
  private notify(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  // Get current game state
  getState(): GameState {
    return { ...this.state };
  }

  // Start or restart the game
  start(): void {
    const modeSpeed = GAME_MODE_SPEEDS[this.state.gameMode];
    this.state = {
      snake: [{ x: 10, y: 10 }],
      food: this.generateFood([{ x: 10, y: 10 }]),
      direction: "RIGHT",
      nextDirection: "RIGHT",
      score: 0,
      highScore: this.state.highScore,
      status: "playing",
      speed: modeSpeed.initial,
      snakeSkin: this.state.snakeSkin,
      fruitType: this.state.fruitType,
      gameMode: this.state.gameMode,
    };
    this.notify();
  }

  // Pause the game
  pause(): void {
    if (this.state.status === "playing") {
      this.state.status = "paused";
      this.notify();
    }
  }

  // Resume the game
  resume(): void {
    if (this.state.status === "paused") {
      this.state.status = "playing";
      this.notify();
    }
  }

  // Set the next direction (with validation to prevent 180-degree turns)
  setDirection(direction: Direction): void {
    if (this.state.status !== "playing") return;

    const opposites: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    // Prevent 180-degree turns
    if (opposites[direction] !== this.state.direction) {
      this.state.nextDirection = direction;
    }
  }

  // Main game update loop
  update(): boolean {
    if (this.state.status !== "playing") return false;

    // Update direction
    this.state.direction = this.state.nextDirection;

    // Calculate new head position
    const head = { ...this.state.snake[0] };

    switch (this.state.direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= this.gridSize ||
      head.y < 0 ||
      head.y >= this.gridSize
    ) {
      this.gameOver();
      return false;
    }

    // Check self collision
    if (this.checkCollision(head, this.state.snake)) {
      this.gameOver();
      return false;
    }

    // Add new head
    this.state.snake.unshift(head);

    // Check food collision
    if (head.x === this.state.food.x && head.y === this.state.food.y) {
      this.eatFood();
    } else {
      // Remove tail if no food eaten
      this.state.snake.pop();
    }

    this.notify();
    return true;
  }

  // Handle food consumption
  private eatFood(): void {
    this.state.score += 10;

    // Update high score
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `snakeHighScore_${this.state.gameMode}`,
          this.state.highScore.toString()
        );
      }
    }

    // Increase speed slightly based on game mode minimum
    const modeSpeed = GAME_MODE_SPEEDS[this.state.gameMode];
    this.state.speed = Math.max(modeSpeed.minimum, this.state.speed - 2);

    // Generate new food
    this.state.food = this.generateFood(this.state.snake);
  }

  // Generate food at random position (not on snake)
  private generateFood(snake: Position[]): Position {
    let food: Position;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      food = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize),
      };
      attempts++;
    } while (this.checkCollision(food, snake) && attempts < maxAttempts);

    return food;
  }

  // Check if position collides with any snake segment
  private checkCollision(position: Position, snake: Position[]): boolean {
    return snake.some(
      (segment) => segment.x === position.x && segment.y === position.y
    );
  }

  // Handle game over
  private gameOver(): void {
    this.state.status = "gameOver";
    this.notify();
  }

  // Get grid size
  getGridSize(): number {
    return this.gridSize;
  }

  // Set snake skin
  setSnakeSkin(skin: SnakeSkin): void {
    this.state.snakeSkin = skin;
    this.notify();
  }

  // Set fruit type
  setFruitType(fruit: FruitType): void {
    this.state.fruitType = fruit;
    this.notify();
  }

  // Set game mode
  setGameMode(mode: GameMode): void {
    this.state.gameMode = mode;
    const modeSpeed = GAME_MODE_SPEEDS[mode];
    this.state.speed = modeSpeed.initial;

    // Load high score for this mode
    if (typeof window !== "undefined") {
      const savedHighScore = parseInt(
        localStorage.getItem(`snakeHighScore_${mode}`) || "0",
        10
      );
      this.state.highScore = savedHighScore;
    }

    this.notify();
  }
}
