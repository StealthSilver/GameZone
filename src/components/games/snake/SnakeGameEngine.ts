export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export interface GameState {
  snake: Position[];
  fruit: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
  highScore: number;
}

export class SnakeGameEngine {
  private gridSize: number;
  private tileSize: number;
  private gameState: GameState;
  private gameLoop: number | null = null;
  private speed: number;
  private baseSpeed: number = 150;

  constructor(gridSize: number = 20, tileSize: number = 20) {
    this.gridSize = gridSize;
    this.tileSize = tileSize;
    this.speed = this.baseSpeed;
    this.gameState = this.initializeGame();
  }

  private initializeGame(): GameState {
    const centerX = Math.floor(this.gridSize / 2);
    const centerY = Math.floor(this.gridSize / 2);

    const highScore = this.loadHighScore();

    return {
      snake: [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY },
      ],
      fruit: this.generateFruit([
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY },
      ]),
      direction: Direction.RIGHT,
      nextDirection: Direction.RIGHT,
      score: 0,
      gameOver: false,
      isPaused: false,
      highScore,
    };
  }

  private generateFruit(snake: Position[]): Position {
    let fruit: Position;
    let isOnSnake: boolean;

    do {
      fruit = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize),
      };
      isOnSnake = snake.some(
        (segment) => segment.x === fruit.x && segment.y === fruit.y
      );
    } while (isOnSnake);

    return fruit;
  }

  private loadHighScore(): number {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snakeHighScore");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  }

  private saveHighScore(score: number): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("snakeHighScore", score.toString());
    }
  }

  public getState(): GameState {
    return { ...this.gameState };
  }

  public changeDirection(newDirection: Direction): void {
    // Prevent reversing into itself
    const opposites: Record<Direction, Direction> = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT,
    };

    if (opposites[newDirection] !== this.gameState.direction) {
      this.gameState.nextDirection = newDirection;
    }
  }

  private moveSnake(): void {
    if (this.gameState.gameOver || this.gameState.isPaused) return;

    // Update direction
    this.gameState.direction = this.gameState.nextDirection;

    const head = { ...this.gameState.snake[0] };

    // Move head based on direction
    switch (this.gameState.direction) {
      case Direction.UP:
        head.y -= 1;
        break;
      case Direction.DOWN:
        head.y += 1;
        break;
      case Direction.LEFT:
        head.x -= 1;
        break;
      case Direction.RIGHT:
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
      this.endGame();
      return;
    }

    // Check self collision
    if (
      this.gameState.snake.some(
        (segment) => segment.x === head.x && segment.y === head.y
      )
    ) {
      this.endGame();
      return;
    }

    // Add new head
    this.gameState.snake.unshift(head);

    // Check if fruit is eaten
    if (
      head.x === this.gameState.fruit.x &&
      head.y === this.gameState.fruit.y
    ) {
      this.gameState.score += 10;

      // Update high score
      if (this.gameState.score > this.gameState.highScore) {
        this.gameState.highScore = this.gameState.score;
        this.saveHighScore(this.gameState.highScore);
      }

      // Generate new fruit
      this.gameState.fruit = this.generateFruit(this.gameState.snake);

      // Increase speed gradually
      this.speed = Math.max(50, this.baseSpeed - this.gameState.score / 2);
    } else {
      // Remove tail if no fruit eaten
      this.gameState.snake.pop();
    }
  }

  private endGame(): void {
    this.gameState.gameOver = true;
    if (this.gameLoop !== null) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  public start(onUpdate: () => void): void {
    if (this.gameLoop !== null) return;

    const gameStep = () => {
      this.moveSnake();
      onUpdate();
    };

    this.gameLoop = window.setInterval(gameStep, this.speed);
  }

  public pause(): void {
    this.gameState.isPaused = true;
  }

  public resume(): void {
    this.gameState.isPaused = false;
  }

  public togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  public reset(): void {
    if (this.gameLoop !== null) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    this.speed = this.baseSpeed;
    this.gameState = this.initializeGame();
  }

  public stop(): void {
    if (this.gameLoop !== null) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  public getGridSize(): number {
    return this.gridSize;
  }

  public getTileSize(): number {
    return this.tileSize;
  }
}
