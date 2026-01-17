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
  private gravity: number = 0.6;
  private flapStrength: number = -10;

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

  // Bird image
  private birdImage: HTMLImageElement | null = null;
  private imageLoaded: boolean = false;

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

    // Load bird image
    if (typeof window !== "undefined") {
      this.birdImage = new Image();
      this.birdImage.src = "/flappy.png";
      this.birdImage.onload = () => {
        this.imageLoaded = true;
      };
    }
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

    if (this.state !== "gameOver") {
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
    // Clear canvas
    this.ctx.fillStyle = "#87CEEB"; // Sky blue background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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

    if (this.imageLoaded && this.birdImage) {
      // Draw bird image
      const size = this.bird.radius * 2;
      this.ctx.drawImage(this.birdImage, -size / 2, -size / 2, size, size);
    } else {
      // Fallback: draw yellow circle
      this.ctx.fillStyle = "#FFD700";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Eye
      this.ctx.fillStyle = "#000";
      this.ctx.beginPath();
      this.ctx.arc(5, -5, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private drawPipes(): void {
    for (const pipe of this.pipes) {
      // Top pipe
      this.ctx.fillStyle = "#2ECC40";
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);

      // Top pipe cap
      this.ctx.fillStyle = "#27A832";
      this.ctx.fillRect(
        pipe.x - 5,
        pipe.topHeight - 20,
        this.pipeWidth + 10,
        20
      );

      // Bottom pipe
      const bottomY = pipe.topHeight + pipe.gap;
      this.ctx.fillStyle = "#2ECC40";
      this.ctx.fillRect(
        pipe.x,
        bottomY,
        this.pipeWidth,
        this.canvas.height - bottomY
      );

      // Bottom pipe cap
      this.ctx.fillStyle = "#27A832";
      this.ctx.fillRect(pipe.x - 5, bottomY, this.pipeWidth + 10, 20);

      // Pipe border
      this.ctx.strokeStyle = "#1E8C2F";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      this.ctx.strokeRect(
        pipe.x,
        bottomY,
        this.pipeWidth,
        this.canvas.height - bottomY
      );
    }
  }

  private drawGround(): void {
    const groundHeight = 20;
    this.ctx.fillStyle = "#DEB887";
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
