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
  private isMobile: boolean = false;

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

    // Detect if mobile
    this.isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    // Set responsive speeds based on screen size
    const speedMultiplier = this.isMobile ? 0.6 : 1;
    const aiSpeedMultiplier = this.isMobile ? 0.5 : 1;

    // Set AI speed based on difficulty and screen size
    switch (mode) {
      case "easy":
        this.aiSpeed = 2.5 * aiSpeedMultiplier;
        break;
      case "medium":
        this.aiSpeed = 4 * aiSpeedMultiplier;
        break;
      case "hard":
        this.aiSpeed = 5.5 * aiSpeedMultiplier;
        break;
    }

    // Responsive paddle dimensions
    const paddleWidth = this.isMobile ? 8 : 10;
    const paddleHeight = this.isMobile ? 70 : 100;
    const paddleOffset = this.isMobile ? 15 : 20;

    // Responsive ball properties
    const ballRadius = this.isMobile ? 6 : 8;
    const ballSpeed = this.isMobile ? 3.5 : 5;

    // Set paddle speed
    this.paddleSpeed = this.isMobile ? 5 : 8;

    // Initialize game objects
    this.playerPaddle = {
      x: paddleOffset,
      y: this.canvas.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      dy: 0,
    };

    this.aiPaddle = {
      x: this.canvas.width - paddleOffset - paddleWidth,
      y: this.canvas.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      dy: 0,
    };

    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      radius: ballRadius,
      dx: ballSpeed * speedMultiplier,
      dy: 3 * speedMultiplier,
      speed: ballSpeed * speedMultiplier,
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

    // Reset speed with mobile consideration
    const baseSpeed = this.isMobile ? 3.5 : 5;
    this.ball.speed = baseSpeed;

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

      // Smaller speed increment on mobile
      const speedIncrement = this.isMobile ? 0.3 : 0.5;
      this.ball.speed += speedIncrement;
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

      // Smaller speed increment on mobile
      const speedIncrement = this.isMobile ? 0.3 : 0.5;
      this.ball.speed += speedIncrement;
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
    this.playerPaddle.y = this.canvas.height / 2 - this.playerPaddle.height / 2;
    this.aiPaddle.y = this.canvas.height / 2 - this.aiPaddle.height / 2;
    this.onScoreUpdate(this.playerScore, this.aiScore);
    this.onStateChange(this.state);
    this.start();
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;

    // Update mobile status
    const wasMobile = this.isMobile;
    this.isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    // If screen size category changed, update game properties
    if (wasMobile !== this.isMobile) {
      // Update paddle dimensions
      const paddleWidth = this.isMobile ? 8 : 10;
      const paddleHeight = this.isMobile ? 70 : 100;
      const paddleOffset = this.isMobile ? 15 : 20;

      this.playerPaddle.width = paddleWidth;
      this.playerPaddle.height = paddleHeight;
      this.playerPaddle.x = paddleOffset;

      this.aiPaddle.width = paddleWidth;
      this.aiPaddle.height = paddleHeight;
      this.aiPaddle.x = this.canvas.width - paddleOffset - paddleWidth;

      // Update ball size
      this.ball.radius = this.isMobile ? 6 : 8;

      // Update speeds
      this.paddleSpeed = this.isMobile ? 5 : 8;

      const speedMultiplier = this.isMobile ? 0.6 : 1;
      const aiSpeedMultiplier = this.isMobile ? 0.5 : 1;

      switch (this.mode) {
        case "easy":
          this.aiSpeed = 2.5 * aiSpeedMultiplier;
          break;
        case "medium":
          this.aiSpeed = 4 * aiSpeedMultiplier;
          break;
        case "hard":
          this.aiSpeed = 5.5 * aiSpeedMultiplier;
          break;
      }
    } else {
      // Just reposition with existing dimensions
      const paddleOffset = this.isMobile ? 15 : 20;
      this.playerPaddle.x = paddleOffset;
      this.aiPaddle.x = this.canvas.width - paddleOffset - this.aiPaddle.width;
    }

    // Reposition paddles vertically
    this.playerPaddle.y = Math.min(
      this.playerPaddle.y,
      this.canvas.height - this.playerPaddle.height
    );
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

  // Mobile control methods
  public movePaddleUp(): void {
    this.keys["ArrowUp"] = true;
  }

  public movePaddleDown(): void {
    this.keys["ArrowDown"] = true;
  }

  public stopPaddle(): void {
    this.keys["ArrowUp"] = false;
    this.keys["ArrowDown"] = false;
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Remove event listeners if needed
  }
}
