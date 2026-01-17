export type GameState =
  | "waiting"
  | "countdown"
  | "playing"
  | "paused"
  | "gameOver";

// Sound effects
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
        flap: 500,
        score: 800,
        hit: 200,
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

interface Bird {
  x: number;
  y: number;
  velocity: number;
  radius: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  gap: number;
  passed: boolean;
}

export class FlappyBirdGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState = "waiting";
  private animationId: number | null = null;
  private sounds: SoundEffects;

  // Bird properties
  private bird: Bird;
  private gravity: number = 0.45;
  private flapStrength: number = -9;

  // Pipe properties
  private pipes: Pipe[] = [];
  private pipeWidth: number = 60;
  private pipeGap: number = 180;
  private pipeSpeed: number = 3;
  private pipeSpawnInterval: number = 90; // frames
  private frameCount: number = 0;

  // Score
  private score: number = 0;

  // Callbacks
  public onScoreUpdate: ((score: number) => void) | null = null;
  public onGameOver: (() => void) | null = null;
  public onStateChange: ((state: GameState) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get canvas context");
    }
    this.ctx = context;
    this.sounds = new SoundEffects();

    // Initialize bird
    this.bird = {
      x: this.canvas.width * 0.25,
      y: this.canvas.height / 2,
      velocity: 0,
      radius: 20,
    };
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;

    // Reset bird position relative to new canvas size
    this.bird.x = this.canvas.width * 0.25;
    if (this.state === "waiting" || this.state === "countdown") {
      this.bird.y = this.canvas.height / 2;
      this.bird.velocity = 0;
    }

    // Adjust pipe layout based on canvas size so the game
    // scales nicely on both mobile and desktop.
    const baseGap = this.canvas.height * 0.26;
    this.pipeGap = Math.max(140, Math.min(baseGap, 260));

    const widthRatio = this.canvas.width / 360;
    this.pipeWidth = Math.max(48, Math.min(80, Math.floor(56 * widthRatio)));

    const speedRatio = this.canvas.width / 480;
    this.pipeSpeed = Math.max(2.2, Math.min(5, 3 * speedRatio));
  }

  public start(): void {
    if (this.state === "waiting") {
      this.setState("countdown");
      this.gameLoop();
    }
  }

  public startPlaying(): void {
    if (this.state === "countdown") {
      this.setState("playing");
      this.pipes = [];
      this.score = 0;
      this.frameCount = 0;
      this.bird.velocity = 0;
      if (this.onScoreUpdate) {
        this.onScoreUpdate(this.score);
      }
    }
  }

  public flap(): void {
    if (this.state === "playing") {
      this.bird.velocity = this.flapStrength;
      this.sounds.play("flap");
    }
  }

  public pause(): void {
    if (this.state === "playing") {
      this.setState("paused");
    }
  }

  public resume(): void {
    if (this.state === "paused") {
      this.setState("playing");
      this.gameLoop();
    }
  }

  public reset(): void {
    this.pipes = [];
    this.score = 0;
    this.frameCount = 0;
    this.bird.y = this.canvas.height / 2;
    this.bird.velocity = 0;
    this.setState("countdown");
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }

    // Restart the game loop after a reset so the
    // countdown screen and subsequent gameplay render correctly
    if (this.animationId === null) {
      this.gameLoop();
    } else {
      // Ensure any previous loop is effectively replaced
      this.gameLoop();
    }
  }

  public destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private setState(newState: GameState): void {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(newState);
    }
  }

  private gameLoop = (): void => {
    if (this.state === "paused" || this.state === "gameOver") {
      return;
    }

    this.update();
    this.draw();

    if (this.state === "playing" || this.state === "countdown") {
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  };

  private update(): void {
    if (this.state !== "playing") {
      return;
    }

    this.frameCount++;

    // Update bird
    this.bird.velocity += this.gravity;
    this.bird.y += this.bird.velocity;

    // Check collision with top/bottom
    if (
      this.bird.y - this.bird.radius < 0 ||
      this.bird.y + this.bird.radius > this.canvas.height
    ) {
      this.endGame();
      return;
    }

    // Spawn pipes
    if (this.frameCount % this.pipeSpawnInterval === 0) {
      this.spawnPipe();
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      // Check collision with pipe
      if (this.checkCollision(pipe)) {
        this.endGame();
        return;
      }

      // Check if passed pipe
      if (
        !pipe.passed &&
        pipe.x + this.pipeWidth < this.bird.x - this.bird.radius
      ) {
        pipe.passed = true;
        this.score++;
        this.sounds.play("score");
        if (this.onScoreUpdate) {
          this.onScoreUpdate(this.score);
        }
      }

      // Remove off-screen pipes
      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  private spawnPipe(): void {
    const minHeight = 50;
    const maxHeight = this.canvas.height - this.pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    this.pipes.push({
      x: this.canvas.width,
      topHeight,
      gap: this.pipeGap,
      passed: false,
    });
  }

  private checkCollision(pipe: Pipe): boolean {
    const birdLeft = this.bird.x - this.bird.radius;
    const birdRight = this.bird.x + this.bird.radius;
    const birdTop = this.bird.y - this.bird.radius;
    const birdBottom = this.bird.y + this.bird.radius;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + this.pipeWidth;

    // Check if bird is within pipe's x range
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Check if bird hits top or bottom pipe
      if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + pipe.gap) {
        return true;
      }
    }

    return false;
  }

  private endGame(): void {
    this.setState("gameOver");
    this.sounds.play("hit");
    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  private draw(): void {
    // Background: dark, subtle gradient to match the
    // overall site and Tetris aesthetic.
    const bgGradient = this.ctx.createLinearGradient(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    bgGradient.addColorStop(0, "#020617");
    bgGradient.addColorStop(0.45, "#020617");
    bgGradient.addColorStop(1, "#0b1120");

    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Very subtle vertical scan lines for a retro grid feel
    this.ctx.strokeStyle = "rgba(15,23,42,0.6)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 24) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + 0.5, 0);
      this.ctx.lineTo(x + 0.5, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw pipes
    this.drawPipes();

    // Draw bird
    this.drawBird();

    // Draw ground
    this.drawGround();
  }

  private drawBird(): void {
    this.ctx.save();
    this.ctx.translate(this.bird.x, this.bird.y);

    // Rotate bird based on velocity
    const rotation = Math.min(Math.max(this.bird.velocity * 0.05, -0.5), 0.5);
    this.ctx.rotate(rotation);

    // Custom bird made of blocky shapes and gradients so it
    // visually fits with the neon/tetris-style UI.
    const size = this.bird.radius * 2;
    const half = size / 2;
    const block = size / 3;

    const bodyGradient = this.ctx.createLinearGradient(-half, 0, half, 0);
    bodyGradient.addColorStop(0, "#AAFDBB");
    bodyGradient.addColorStop(0.5, "#8CECF7");
    bodyGradient.addColorStop(1, "#6C85EA");

    // Main body
    this.ctx.fillStyle = bodyGradient;
    this.ctx.fillRect(-half, -half, size, size);

    // Body outline
    this.ctx.strokeStyle = "rgba(15,23,42,0.9)";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(-half + 1, -half + 1, size - 2, size - 2);

    // Wing (a darker block on the side)
    this.ctx.fillStyle = "#0f172a";
    this.ctx.fillRect(-block * 0.8, 0, block, block * 0.9);

    // Beak (small bright block at the front)
    this.ctx.fillStyle = "#F97316";
    this.ctx.fillRect(
      half - block * 0.35,
      -block * 0.25,
      block * 0.6,
      block * 0.5
    );

    // Eye
    this.ctx.fillStyle = "#e5e7eb";
    this.ctx.beginPath();
    this.ctx.arc(block * 0.4, -block * 0.4, block * 0.2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#020617";
    this.ctx.beginPath();
    this.ctx.arc(block * 0.45, -block * 0.4, block * 0.1, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawPipes(): void {
    for (const pipe of this.pipes) {
      const bottomY = pipe.topHeight + pipe.gap;

      // Neon gradient for pipes to match the site palette.
      const pipeGradient = this.ctx.createLinearGradient(
        pipe.x,
        0,
        pipe.x + this.pipeWidth,
        0
      );
      pipeGradient.addColorStop(0, "#AAFDBB");
      pipeGradient.addColorStop(0.5, "#8CECF7");
      pipeGradient.addColorStop(1, "#6C85EA");

      this.ctx.fillStyle = pipeGradient;

      // Top pipe column
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);

      // Bottom pipe column
      this.ctx.fillRect(
        pipe.x,
        bottomY,
        this.pipeWidth,
        this.canvas.height - bottomY
      );

      // Outer border to give a crisp, tetris-like block look
      this.ctx.strokeStyle = "rgba(15,23,42,0.95)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        pipe.x + 0.5,
        0.5,
        this.pipeWidth - 1,
        pipe.topHeight - 1
      );
      this.ctx.strokeRect(
        pipe.x + 0.5,
        bottomY + 0.5,
        this.pipeWidth - 1,
        this.canvas.height - bottomY - 1
      );

      // Subtle horizontal segments to make the pipes feel
      // like stacked blocks instead of a single tube.
      this.ctx.strokeStyle = "rgba(15,23,42,0.6)";
      for (let y = 24; y < pipe.topHeight; y += 24) {
        this.ctx.beginPath();
        this.ctx.moveTo(pipe.x + 3, y + 0.5);
        this.ctx.lineTo(pipe.x + this.pipeWidth - 3, y + 0.5);
        this.ctx.stroke();
      }
      for (let y = bottomY + 24; y < this.canvas.height; y += 24) {
        this.ctx.beginPath();
        this.ctx.moveTo(pipe.x + 3, y + 0.5);
        this.ctx.lineTo(pipe.x + this.pipeWidth - 3, y + 0.5);
        this.ctx.stroke();
      }
    }
  }

  private drawGround(): void {
    const groundHeight = Math.max(20, Math.floor(this.canvas.height * 0.06));

    const groundGradient = this.ctx.createLinearGradient(
      0,
      this.canvas.height - groundHeight,
      this.canvas.width,
      this.canvas.height
    );
    groundGradient.addColorStop(0, "#020617");
    groundGradient.addColorStop(1, "#111827");

    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(
      0,
      this.canvas.height - groundHeight,
      this.canvas.width,
      groundHeight
    );
  }

  public getState(): GameState {
    return this.state;
  }

  public getScore(): number {
    return this.score;
  }
}
