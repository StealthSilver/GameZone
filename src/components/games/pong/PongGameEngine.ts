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
        paddleHit: 400,
        wallHit: 300,
        score: 600,
        win: 800,
        lose: 200,
      };

      oscillator.frequency.value = frequencies[name] || 300;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.15
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  }
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  speed: number;
}

export class PongGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: GameMode;
  private state: GameState = "playing";
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private sounds: SoundEffects;

  // Game objects
  private playerPaddle: Paddle;
  private aiPaddle: Paddle;
  private ball: Ball;

  // Game settings
  private paddleSpeed: number = 8;
  private aiSpeed: number;
  private maxScore: number = 11;
  private playerScore: number = 0;
  private aiScore: number = 0;

  // Input handling
  private keys: { [key: string]: boolean } = {};

  // Callbacks
  public onScoreUpdate: (playerScore: number, aiScore: number) => void =
    () => {};
  public onGameOver: (winner: "player" | "ai") => void = () => {};
  public onStateChange: (state: GameState) => void = () => {};

  constructor(canvas: HTMLCanvasElement, mode: GameMode) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.mode = mode;
    this.sounds = new SoundEffects();

    // Set AI speed based on difficulty
    switch (mode) {
      case "easy":
        this.aiSpeed = 2.5;
        break;
      case "medium":
        this.aiSpeed = 4;
        break;
      case "hard":
        this.aiSpeed = 5.5;
        break;
    }

    // Initialize game objects
    this.playerPaddle = {
      x: 20,
      y: this.canvas.height / 2 - 50,
      width: 10,
      height: 100,
      dy: 0,
    };

    this.aiPaddle = {
      x: this.canvas.width - 30,
      y: this.canvas.height / 2 - 50,
      width: 10,
      height: 100,
      dy: 0,
    };

    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      radius: 8,
      dx: 5,
      dy: 3,
      speed: 5,
    };

    this.setupEventListeners();
    this.resetBall();
  }

  private setupEventListeners(): void {
    // Keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key] = true;

      if (e.key === " " || e.key === "Escape") {
        e.preventDefault();
        if (e.key === " ") {
          this.togglePause();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  private resetBall(towardsPlayer: boolean = Math.random() > 0.5): void {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.speed = 5;

    // Random angle between -45 and 45 degrees
    const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
    const direction = towardsPlayer ? -1 : 1;

    this.ball.dx = direction * this.ball.speed * Math.cos(angle);
    this.ball.dy = this.ball.speed * Math.sin(angle);
  }

  private updatePaddles(): void {
    // Player paddle movement
    if (this.keys["ArrowUp"] || this.keys["w"] || this.keys["W"]) {
      this.playerPaddle.y -= this.paddleSpeed;
    }
    if (this.keys["ArrowDown"] || this.keys["s"] || this.keys["S"]) {
      this.playerPaddle.y += this.paddleSpeed;
    }

    // Keep player paddle in bounds
    this.playerPaddle.y = Math.max(
      0,
      Math.min(
        this.canvas.height - this.playerPaddle.height,
        this.playerPaddle.y
      )
    );

    // AI paddle movement
    const aiPaddleCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
    const ballY = this.ball.y;

    if (ballY < aiPaddleCenter - 20) {
      this.aiPaddle.y -= this.aiSpeed;
    } else if (ballY > aiPaddleCenter + 20) {
      this.aiPaddle.y += this.aiSpeed;
    }

    // Keep AI paddle in bounds
    this.aiPaddle.y = Math.max(
      0,
      Math.min(this.canvas.height - this.aiPaddle.height, this.aiPaddle.y)
    );
  }

  private updateBall(): void {
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Wall collision (top and bottom)
    if (
      this.ball.y - this.ball.radius <= 0 ||
      this.ball.y + this.ball.radius >= this.canvas.height
    ) {
      this.ball.dy = -this.ball.dy;
      this.sounds.play("wallHit");
    }

    // Player paddle collision
    if (
      this.ball.x - this.ball.radius <=
        this.playerPaddle.x + this.playerPaddle.width &&
      this.ball.x + this.ball.radius >= this.playerPaddle.x &&
      this.ball.y >= this.playerPaddle.y &&
      this.ball.y <= this.playerPaddle.y + this.playerPaddle.height
    ) {
      const hitPos =
        (this.ball.y - this.playerPaddle.y) / this.playerPaddle.height;
      const angle = ((hitPos - 0.5) * Math.PI) / 3; // Max 60 degree angle

      this.ball.speed += 0.5;
      this.ball.dx = this.ball.speed * Math.cos(angle);
      this.ball.dy = this.ball.speed * Math.sin(angle);

      // Ensure ball moves right
      if (this.ball.dx < 0) this.ball.dx = -this.ball.dx;

      this.sounds.play("paddleHit");
    }

    // AI paddle collision
    if (
      this.ball.x + this.ball.radius >= this.aiPaddle.x &&
      this.ball.x - this.ball.radius <= this.aiPaddle.x + this.aiPaddle.width &&
      this.ball.y >= this.aiPaddle.y &&
      this.ball.y <= this.aiPaddle.y + this.aiPaddle.height
    ) {
      const hitPos = (this.ball.y - this.aiPaddle.y) / this.aiPaddle.height;
      const angle = ((hitPos - 0.5) * Math.PI) / 3;

      this.ball.speed += 0.5;
      this.ball.dx = -this.ball.speed * Math.cos(angle);
      this.ball.dy = this.ball.speed * Math.sin(angle);

      // Ensure ball moves left
      if (this.ball.dx > 0) this.ball.dx = -this.ball.dx;

      this.sounds.play("paddleHit");
    }

    // Scoring
    if (this.ball.x - this.ball.radius <= 0) {
      // AI scores
      this.aiScore++;
      this.sounds.play("score");
      this.onScoreUpdate(this.playerScore, this.aiScore);
      this.checkGameOver();
      if (this.state === "playing") {
        this.resetBall(true);
      }
    } else if (this.ball.x + this.ball.radius >= this.canvas.width) {
      // Player scores
      this.playerScore++;
      this.sounds.play("score");
      this.onScoreUpdate(this.playerScore, this.aiScore);
      this.checkGameOver();
      if (this.state === "playing") {
        this.resetBall(false);
      }
    }
  }

  private checkGameOver(): void {
    if (this.playerScore >= this.maxScore) {
      this.state = "gameOver";
      this.sounds.play("win");
      this.onGameOver("player");
      this.onStateChange(this.state);
    } else if (this.aiScore >= this.maxScore) {
      this.state = "gameOver";
      this.sounds.play("lose");
      this.onGameOver("ai");
      this.onStateChange(this.state);
    }
  }

  private draw(): void {
    // Clear canvas
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw center line
    this.ctx.setLineDash([10, 10]);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw paddles with gradient
    const playerGradient = this.ctx.createLinearGradient(
      this.playerPaddle.x,
      this.playerPaddle.y,
      this.playerPaddle.x + this.playerPaddle.width,
      this.playerPaddle.y + this.playerPaddle.height
    );
    playerGradient.addColorStop(0, "#AAFDBB");
    playerGradient.addColorStop(1, "#8CECF7");

    this.ctx.fillStyle = playerGradient;
    this.ctx.fillRect(
      this.playerPaddle.x,
      this.playerPaddle.y,
      this.playerPaddle.width,
      this.playerPaddle.height
    );

    const aiGradient = this.ctx.createLinearGradient(
      this.aiPaddle.x,
      this.aiPaddle.y,
      this.aiPaddle.x + this.aiPaddle.width,
      this.aiPaddle.y + this.aiPaddle.height
    );
    aiGradient.addColorStop(0, "#6C85EA");
    aiGradient.addColorStop(1, "#8CECF7");

    this.ctx.fillStyle = aiGradient;
    this.ctx.fillRect(
      this.aiPaddle.x,
      this.aiPaddle.y,
      this.aiPaddle.width,
      this.aiPaddle.height
    );

    // Draw ball with glow effect
    const ballGradient = this.ctx.createRadialGradient(
      this.ball.x,
      this.ball.y,
      0,
      this.ball.x,
      this.ball.y,
      this.ball.radius * 2
    );
    ballGradient.addColorStop(0, "#FFFFFF");
    ballGradient.addColorStop(0.5, "#8CECF7");
    ballGradient.addColorStop(1, "rgba(140, 236, 247, 0)");

    this.ctx.fillStyle = ballGradient;
    this.ctx.beginPath();
    this.ctx.arc(
      this.ball.x,
      this.ball.y,
      this.ball.radius * 1.5,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw ball core
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private gameLoop = (currentTime: number): void => {
    if (this.state !== "playing") return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game state
    this.updatePaddles();
    this.updateBall();

    // Draw everything
    this.draw();

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  public start(): void {
    this.state = "playing";
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  public pause(): void {
    if (this.state === "playing") {
      this.state = "paused";
      this.onStateChange(this.state);
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }

  public resume(): void {
    if (this.state === "paused") {
      this.state = "playing";
      this.onStateChange(this.state);
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }

  public togglePause(): void {
    if (this.state === "playing") {
      this.pause();
    } else if (this.state === "paused") {
      this.resume();
    }
  }

  public reset(): void {
    this.playerScore = 0;
    this.aiScore = 0;
    this.state = "playing";
    this.resetBall();
    this.playerPaddle.y = this.canvas.height / 2 - 50;
    this.aiPaddle.y = this.canvas.height / 2 - 50;
    this.onScoreUpdate(this.playerScore, this.aiScore);
    this.onStateChange(this.state);
    this.start();
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;

    // Reposition paddles
    this.playerPaddle.y = Math.min(
      this.playerPaddle.y,
      this.canvas.height - this.playerPaddle.height
    );
    this.aiPaddle.x = this.canvas.width - 30;
    this.aiPaddle.y = Math.min(
      this.aiPaddle.y,
      this.canvas.height - this.aiPaddle.height
    );

    // Reposition ball if needed
    if (this.ball.x > this.canvas.width / 2) {
      this.ball.x = Math.min(this.ball.x, this.canvas.width - this.ball.radius);
    }
    this.ball.y = Math.min(
      Math.max(this.ball.y, this.ball.radius),
      this.canvas.height - this.ball.radius
    );

    this.draw();
  }

  public getState(): GameState {
    return this.state;
  }

  public getScores(): { player: number; ai: number } {
    return { player: this.playerScore, ai: this.aiScore };
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Remove event listeners if needed
  }
}
