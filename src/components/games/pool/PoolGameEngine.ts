// Pool Game Engine with realistic physics simulation

export type GameMode = "player" | "computer";
export type GameStatus =
  | "setup"
  | "playing"
  | "aiming"
  | "shooting"
  | "waiting"
  | "gameOver";
export type BallType = "cue" | "solid" | "stripe" | "eight";

export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  type: BallType;
  number: number;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  color: string;
  pocketed: boolean;
  isMoving: boolean;
}

export interface Pocket {
  position: Vector2D;
  radius: number;
}

export interface GameState {
  balls: Ball[];
  pockets: Pocket[];
  currentPlayer: 1 | 2;
  player1Type: "solid" | "stripe" | null;
  player2Type: "solid" | "stripe" | null;
  player1Score: number;
  player2Score: number;
  gameStatus: GameStatus;
  winner: number | null;
  foul: boolean;
  canShoot: boolean;
  cuePosition: Vector2D;
  cueAngle: number;
  cuePower: number;
  gameMode: GameMode;
  isAiming: boolean;
  validShot: boolean;
  firstContactType: BallType | null;
}

export class PoolGameEngine {
  private state: GameState;
  private readonly tableWidth: number;
  private readonly tableHeight: number;
  private readonly friction: number = 0.98;
  private readonly pocketRadius: number = 30;
  private readonly ballRadius: number = 18;
  private readonly maxPower: number = 28;
  private readonly minMovementSpeed: number = 0.03;
  private animationFrameId: number | null = null;
  private onStateChange: ((state: GameState) => void) | null = null;
  private onShot: (() => void) | null = null;
  private onPocket: ((ball: Ball) => void) | null = null;

  constructor(
    tableWidth: number = 1200,
    tableHeight: number = 600,
    gameMode: GameMode = "player"
  ) {
    this.tableWidth = tableWidth;
    this.tableHeight = tableHeight;

    // Initialize game state
    this.state = {
      balls: [],
      pockets: [],
      currentPlayer: 1,
      player1Type: null,
      player2Type: null,
      player1Score: 0,
      player2Score: 0,
      gameStatus: "setup",
      winner: null,
      foul: false,
      canShoot: true,
      cuePosition: { x: 0, y: 0 },
      cueAngle: 0,
      cuePower: 0,
      gameMode,
      isAiming: false,
      validShot: true,
      firstContactType: null,
    };

    this.initializePockets();
    this.initializeBalls();
  }

  private initializePockets(): void {
    const margin = 50; // Distance from edge - increased for larger table
    const pocketPositions: Vector2D[] = [
      { x: margin, y: margin }, // Top-left
      { x: this.tableWidth / 2, y: margin }, // Top-center
      { x: this.tableWidth - margin, y: margin }, // Top-right
      { x: margin, y: this.tableHeight - margin }, // Bottom-left
      { x: this.tableWidth / 2, y: this.tableHeight - margin }, // Bottom-center
      { x: this.tableWidth - margin, y: this.tableHeight - margin }, // Bottom-right
    ];

    this.state.pockets = pocketPositions.map((position) => ({
      position,
      radius: this.pocketRadius,
    }));
  }

  private initializeBalls(): void {
    const balls: Ball[] = [];

    // Cue ball (white)
    balls.push({
      id: 0,
      type: "cue",
      number: 0,
      position: { x: this.tableWidth * 0.25, y: this.tableHeight / 2 },
      velocity: { x: 0, y: 0 },
      radius: this.ballRadius,
      color: "#FFFFFF",
      pocketed: false,
      isMoving: false,
    });

    // Ball colors and arrangement
    const ballColors: { number: number; type: BallType; color: string }[] = [
      { number: 1, type: "solid", color: "#FCD200" }, // Yellow
      { number: 2, type: "solid", color: "#0051BA" }, // Blue
      { number: 3, type: "solid", color: "#C8102E" }, // Red
      { number: 4, type: "solid", color: "#7B3F00" }, // Purple/Brown
      { number: 5, type: "solid", color: "#FF6700" }, // Orange
      { number: 6, type: "solid", color: "#007A33" }, // Green
      { number: 7, type: "solid", color: "#8B0000" }, // Maroon
      { number: 8, type: "eight", color: "#000000" }, // Black (8-ball)
      { number: 9, type: "stripe", color: "#FCD200" }, // Yellow stripe
      { number: 10, type: "stripe", color: "#0051BA" }, // Blue stripe
      { number: 11, type: "stripe", color: "#C8102E" }, // Red stripe
      { number: 12, type: "stripe", color: "#7B3F00" }, // Purple stripe
      { number: 13, type: "stripe", color: "#FF6700" }, // Orange stripe
      { number: 14, type: "stripe", color: "#007A33" }, // Green stripe
      { number: 15, type: "stripe", color: "#8B0000" }, // Maroon stripe
    ];

    // Triangle rack position (right side of table)
    const rackX = this.tableWidth * 0.7;
    const rackY = this.tableHeight / 2;
    const ballSpacing = this.ballRadius * 2.1;

    // Standard 8-ball rack arrangement
    const rackPattern = [
      [0], // Row 1: 1 ball
      [1, 2], // Row 2: 2 balls
      [3, 4, 5], // Row 3: 3 balls (8-ball in middle)
      [6, 7, 8, 9], // Row 4: 4 balls
      [10, 11, 12, 13, 14], // Row 5: 5 balls
    ];

    let ballIndex = 0;
    rackPattern.forEach((row, rowIndex) => {
      const rowOffset = (rowIndex * ballSpacing * Math.sqrt(3)) / 2;
      const colStart = -(row.length - 1) * (ballSpacing / 2);

      row.forEach((_, colIndex) => {
        if (ballIndex < ballColors.length) {
          const ball = ballColors[ballIndex];
          balls.push({
            id: ball.number,
            type: ball.type,
            number: ball.number,
            position: {
              x: rackX + rowOffset,
              y: rackY + colStart + colIndex * ballSpacing,
            },
            velocity: { x: 0, y: 0 },
            radius: this.ballRadius,
            color: ball.color,
            pocketed: false,
            isMoving: false,
          });
          ballIndex++;
        }
      });
    });

    this.state.balls = balls;
    this.state.cuePosition = { ...balls[0].position };
  }

  public setStateChangeCallback(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  public setEventCallbacks(callbacks: {
    onShot?: () => void;
    onPocket?: (ball: Ball) => void;
  }): void {
    this.onShot = callbacks.onShot ?? null;
    this.onPocket = callbacks.onPocket ?? null;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public startGame(): void {
    this.state.gameStatus = "aiming";
    this.state.canShoot = true;
    this.state.isAiming = true;
    this.updateCuePosition();
    this.notifyStateChange();
  }

  private updateCuePosition(): void {
    const cueBall = this.state.balls.find(
      (b) => b.type === "cue" && !b.pocketed
    );
    if (cueBall) {
      this.state.cuePosition = { ...cueBall.position };
    }
  }

  public setCueAngle(angle: number): void {
    if (this.state.gameStatus === "aiming") {
      this.state.cueAngle = angle;
      this.state.isAiming = true;
      this.notifyStateChange();
    }
  }

  public setCuePower(power: number): void {
    if (this.state.gameStatus === "aiming") {
      this.state.cuePower = Math.max(0, Math.min(power, 100));
      this.state.isAiming = true;
      this.notifyStateChange();
    }
  }

  public shoot(): void {
    if (!this.state.canShoot || this.state.gameStatus !== "aiming") {
      return;
    }

    const cueBall = this.state.balls.find(
      (b) => b.type === "cue" && !b.pocketed
    );
    if (!cueBall) return;

    // Calculate velocity based on angle and power
    const power = (this.state.cuePower / 100) * this.maxPower;
    const angle = this.state.cueAngle;

    cueBall.velocity = {
      x: Math.cos(angle) * power,
      y: Math.sin(angle) * power,
    };
    cueBall.isMoving = true;

    if (this.onShot) {
      this.onShot();
    }

    this.state.gameStatus = "shooting";
    this.state.canShoot = false;
    this.state.validShot = false;
    this.state.firstContactType = null;
    this.state.foul = false;

    this.startPhysicsLoop();
    this.notifyStateChange();
  }

  private startPhysicsLoop(): void {
    if (this.animationFrameId !== null) return;

    const updatePhysics = () => {
      this.updateBalls();
      this.checkCollisions();
      this.checkPockets();

      const allStopped = this.state.balls.every(
        (ball) => !ball.isMoving || ball.pocketed
      );

      if (allStopped && this.state.gameStatus === "shooting") {
        this.endTurn();
        if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      } else {
        this.animationFrameId = requestAnimationFrame(updatePhysics);
      }

      this.notifyStateChange();
    };

    this.animationFrameId = requestAnimationFrame(updatePhysics);
  }

  private updateBalls(): void {
    const tablePadding = 50; // Keep balls away from edges - matches visual padding

    this.state.balls.forEach((ball) => {
      if (ball.pocketed || !ball.isMoving) return;

      // Apply friction
      ball.velocity.x *= this.friction;
      ball.velocity.y *= this.friction;

      // Update position
      ball.position.x += ball.velocity.x;
      ball.position.y += ball.velocity.y;

      // Wall collisions with bounce (accounting for table borders)
      if (ball.position.x - ball.radius < tablePadding) {
        ball.position.x = tablePadding + ball.radius;
        ball.velocity.x *= -0.8;
      } else if (
        ball.position.x + ball.radius >
        this.tableWidth - tablePadding
      ) {
        ball.position.x = this.tableWidth - tablePadding - ball.radius;
        ball.velocity.x *= -0.8;
      }

      if (ball.position.y - ball.radius < tablePadding) {
        ball.position.y = tablePadding + ball.radius;
        ball.velocity.y *= -0.8;
      } else if (
        ball.position.y + ball.radius >
        this.tableHeight - tablePadding
      ) {
        ball.position.y = this.tableHeight - tablePadding - ball.radius;
        ball.velocity.y *= -0.8;
      }

      // Stop ball if moving too slowly
      const speed = Math.sqrt(
        ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y
      );
      if (speed < this.minMovementSpeed) {
        ball.velocity = { x: 0, y: 0 };
        ball.isMoving = false;
      }
    });
  }

  private checkCollisions(): void {
    const activeBalls = this.state.balls.filter((b) => !b.pocketed);

    for (let i = 0; i < activeBalls.length; i++) {
      for (let j = i + 1; j < activeBalls.length; j++) {
        const ball1 = activeBalls[i];
        const ball2 = activeBalls[j];

        const dx = ball2.position.x - ball1.position.x;
        const dy = ball2.position.y - ball1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball1.radius + ball2.radius) {
          // Track first contact for rule validation
          if (ball1.type === "cue" && this.state.firstContactType === null) {
            this.state.firstContactType = ball2.type;
            this.state.validShot = true;
          } else if (
            ball2.type === "cue" &&
            this.state.firstContactType === null
          ) {
            this.state.firstContactType = ball1.type;
            this.state.validShot = true;
          }

          // Elastic collision
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          // Rotate velocities
          const vx1 = ball1.velocity.x * cos + ball1.velocity.y * sin;
          const vy1 = ball1.velocity.y * cos - ball1.velocity.x * sin;
          const vx2 = ball2.velocity.x * cos + ball2.velocity.y * sin;
          const vy2 = ball2.velocity.y * cos - ball2.velocity.x * sin;

          // Swap velocities (equal mass)
          const temp = vx1;
          const newVx1 = vx2;
          const newVx2 = temp;

          // Rotate back
          ball1.velocity.x = newVx1 * cos - vy1 * sin;
          ball1.velocity.y = vy1 * cos + newVx1 * sin;
          ball2.velocity.x = newVx2 * cos - vy2 * sin;
          ball2.velocity.y = vy2 * cos + newVx2 * sin;

          // Separate balls
          const overlap = ball1.radius + ball2.radius - distance;
          const separationX = (overlap / 2) * cos;
          const separationY = (overlap / 2) * sin;

          ball1.position.x -= separationX;
          ball1.position.y -= separationY;
          ball2.position.x += separationX;
          ball2.position.y += separationY;

          ball1.isMoving = true;
          ball2.isMoving = true;
        }
      }
    }
  }

  private checkPockets(): void {
    this.state.balls.forEach((ball) => {
      if (ball.pocketed) return;

      this.state.pockets.forEach((pocket) => {
        const dx = ball.position.x - pocket.position.x;
        const dy = ball.position.y - pocket.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < pocket.radius) {
          ball.pocketed = true;
          ball.isMoving = false;
          ball.velocity = { x: 0, y: 0 };

          if (this.onPocket) {
            this.onPocket(ball);
          }

          // Handle scoring
          if (ball.type === "cue") {
            this.state.foul = true;
          } else if (ball.type === "eight") {
            this.handleEightBallPocket();
          } else {
            this.handleBallPocket(ball);
          }
        }
      });
    });
  }

  private handleBallPocket(ball: Ball): void {
    const currentPlayerType =
      this.state.currentPlayer === 1
        ? this.state.player1Type
        : this.state.player2Type;

    // First ball pocketed determines player types
    if (!this.state.player1Type && !this.state.player2Type) {
      if (this.state.currentPlayer === 1) {
        this.state.player1Type = ball.type as "solid" | "stripe";
        this.state.player2Type = ball.type === "solid" ? "stripe" : "solid";
      } else {
        this.state.player2Type = ball.type as "solid" | "stripe";
        this.state.player1Type = ball.type === "solid" ? "stripe" : "solid";
      }
    }

    // Award point if correct type
    if (currentPlayerType === ball.type) {
      if (this.state.currentPlayer === 1) {
        this.state.player1Score++;
      } else {
        this.state.player2Score++;
      }
    } else {
      // Wrong ball type is a foul
      this.state.foul = true;
    }
  }

  private handleEightBallPocket(): void {
    const currentPlayerScore =
      this.state.currentPlayer === 1
        ? this.state.player1Score
        : this.state.player2Score;

    // Win if all player's balls are pocketed (7 balls)
    if (currentPlayerScore === 7) {
      this.state.winner = this.state.currentPlayer;
      this.state.gameStatus = "gameOver";
    } else {
      // Lose if 8-ball pocketed early
      this.state.winner = this.state.currentPlayer === 1 ? 2 : 1;
      this.state.gameStatus = "gameOver";
    }
  }

  private endTurn(): void {
    // Check if cue ball was pocketed
    const cueBall = this.state.balls.find((b) => b.type === "cue");
    if (cueBall?.pocketed) {
      this.state.foul = true;
      this.respawnCueBall();
    }

    // Check for valid shot (must hit a ball)
    if (!this.state.validShot && this.state.gameStatus !== "gameOver") {
      this.state.foul = true;
    }

    // Switch players if foul or no ball pocketed
    if (this.state.foul || !this.didPlayerScoreThisTurn()) {
      if (this.state.gameStatus !== "gameOver") {
        this.switchPlayer();
      }
    }

    // Check for win condition
    this.checkWinCondition();

    // Prepare for next turn
    if (this.state.gameStatus !== "gameOver") {
      this.state.gameStatus = "aiming";
      this.state.canShoot = true;
      this.state.cuePower = 0;

      // AI turn
      if (
        this.state.gameMode === "computer" &&
        this.state.currentPlayer === 2
      ) {
        setTimeout(() => this.makeAIMove(), 1000);
      }
    }

    this.notifyStateChange();
  }

  private didPlayerScoreThisTurn(): boolean {
    // This is a simplified check - in a full implementation,
    // you'd track score changes during the turn
    return false;
  }

  private switchPlayer(): void {
    this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
  }

  private respawnCueBall(): void {
    const cueBall = this.state.balls.find((b) => b.type === "cue");
    if (cueBall) {
      cueBall.pocketed = false;
      cueBall.position = { x: this.tableWidth * 0.25, y: this.tableHeight / 2 };
      cueBall.velocity = { x: 0, y: 0 };
      cueBall.isMoving = false;
      this.updateCuePosition();
    }
  }

  private checkWinCondition(): void {
    if (this.state.winner !== null) return;

    const player1Type = this.state.player1Type;
    const player2Type = this.state.player2Type;

    if (!player1Type || !player2Type) return;

    // Check if all of a player's balls are pocketed
    const player1BallsLeft = this.state.balls.filter(
      (b) => b.type === player1Type && !b.pocketed
    ).length;
    const player2BallsLeft = this.state.balls.filter(
      (b) => b.type === player2Type && !b.pocketed
    ).length;

    const eightBall = this.state.balls.find((b) => b.type === "eight");

    if (player1BallsLeft === 0 && eightBall && !eightBall.pocketed) {
      // Player 1 can now shoot the 8-ball
    }
    if (player2BallsLeft === 0 && eightBall && !eightBall.pocketed) {
      // Player 2 can now shoot the 8-ball
    }
  }

  private makeAIMove(): void {
    if (this.state.gameStatus !== "aiming" || this.state.currentPlayer !== 2) {
      return;
    }

    const cueBall = this.state.balls.find(
      (b) => b.type === "cue" && !b.pocketed
    );
    if (!cueBall) return;

    const targetType = this.state.player2Type;
    const targetBalls = this.state.balls.filter(
      (b) => b.type === targetType && !b.pocketed
    );

    if (targetBalls.length === 0) {
      const eightBall = this.state.balls.find(
        (b) => b.type === "eight" && !b.pocketed
      );
      if (eightBall) {
        targetBalls.push(eightBall);
      }
    }

    if (targetBalls.length > 0) {
      // Aim at first available target
      const target = targetBalls[0];
      const dx = target.position.x - cueBall.position.x;
      const dy = target.position.y - cueBall.position.y;
      const angle = Math.atan2(dy, dx);

      this.state.cueAngle = angle;
      this.state.cuePower = 50 + Math.random() * 30; // Random power between 50-80

      setTimeout(() => {
        this.shoot();
      }, 500);
    }
  }

  public cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public getTableDimensions(): { width: number; height: number } {
    return { width: this.tableWidth, height: this.tableHeight };
  }
}
