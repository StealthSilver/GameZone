export type GameMode = "player" | "computer";

export type PlayerId = 1 | 2;

export type PieceColor = "white" | "black" | "red" | "striker";

export type PieceKind = "coin" | "queen" | "striker";

export interface Vector2D {
  x: number;
  y: number;
}

export interface Pocket {
  position: Vector2D;
  radius: number;
}

export interface Piece {
  id: number;
  kind: PieceKind;
  color: PieceColor;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  pocketed: boolean;
  isMoving: boolean;
}

export type GameStatus = "aiming" | "shooting" | "resolving" | "gameOver";

export interface CarromGameState {
  pieces: Piece[];
  pockets: Pocket[];
  currentPlayer: PlayerId;
  scores: Record<PlayerId, number>;
  fouls: string | null;
  message: string | null;
  gameStatus: GameStatus;
  gameMode: GameMode;
  strikerAngle: number;
  strikerPower: number;
  canShoot: boolean;
  winner: PlayerId | null;
  queenOwner: PlayerId | null;
}

export class CarromGameEngine {
  private state: CarromGameState;
  private readonly size: number;
  private readonly margin: number;
  private readonly coinRadius: number;
  private readonly strikerRadius: number;
  private readonly friction: number = 0.985;
  private readonly minSpeed: number = 0.05;
  private readonly maxPower: number = 26;
  private readonly pocketRadius: number;
  private readonly pocketCaptureRadius: number;
  private animationFrameId: number | null = null;
  private onStateChange: ((state: CarromGameState) => void) | null = null;
  private pocketedThisTurn: Set<number> = new Set();
  private turnPocketedWhite = 0;
  private turnPocketedBlack = 0;
  private turnPocketedQueen = false;
  private turnPocketedStriker = false;

  constructor(size: number = 600, gameMode: GameMode = "player") {
    this.size = size;
    this.margin = size * 0.08;
    const baseCoinRadius = 14;
    const scale = size / 600;
    this.coinRadius = baseCoinRadius * scale;
    this.strikerRadius = this.coinRadius * 1.2;
    this.pocketRadius = this.coinRadius * 1.7;
    this.pocketCaptureRadius = this.pocketRadius * 1.6;

    const pieces: Piece[] = [];

    const center: Vector2D = { x: size / 2, y: size / 2 };

    pieces.push({
      id: 0,
      kind: "queen",
      color: "red",
      position: { ...center },
      velocity: { x: 0, y: 0 },
      radius: this.coinRadius,
      pocketed: false,
      isMoving: false,
    });

    const totalCoins = 18;
    const ringRadius = this.coinRadius * 3.4;
    for (let i = 0; i < totalCoins; i++) {
      const angle = (i / totalCoins) * Math.PI * 2;
      const color: PieceColor = i % 2 === 0 ? "white" : "black";
      pieces.push({
        id: i + 1,
        kind: "coin",
        color,
        position: {
          x: center.x + Math.cos(angle) * ringRadius,
          y: center.y + Math.sin(angle) * ringRadius,
        },
        velocity: { x: 0, y: 0 },
        radius: this.coinRadius,
        pocketed: false,
        isMoving: false,
      });
    }

    const strikerId = totalCoins + 1;
    pieces.push({
      id: strikerId,
      kind: "striker",
      color: "striker",
      position: this.getStrikerStartPosition(1),
      velocity: { x: 0, y: 0 },
      radius: this.strikerRadius,
      pocketed: false,
      isMoving: false,
    });

    const pockets: Pocket[] = this.createPockets();

    this.state = {
      pieces,
      pockets,
      currentPlayer: 1,
      scores: { 1: 0, 2: 0 },
      fouls: null,
      message: null,
      gameStatus: "aiming",
      gameMode,
      strikerAngle: -Math.PI / 2,
      strikerPower: 0,
      canShoot: true,
      winner: null,
      queenOwner: null,
    };
  }

  private createPockets(): Pocket[] {
    const offset = this.margin + this.pocketRadius * 0.5;
    return [
      { position: { x: offset, y: offset }, radius: this.pocketRadius },
      {
        position: { x: this.size - offset, y: offset },
        radius: this.pocketRadius,
      },
      {
        position: { x: offset, y: this.size - offset },
        radius: this.pocketRadius,
      },
      {
        position: { x: this.size - offset, y: this.size - offset },
        radius: this.pocketRadius,
      },
    ];
  }

  private getStrikerStartPosition(player: PlayerId): Vector2D {
    const y = player === 1 ? this.size - this.margin * 1.6 : this.margin * 1.6;
    return { x: this.size / 2, y };
  }

  public setStateChangeCallback(callback: (state: CarromGameState) => void) {
    this.onStateChange = callback;
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      const cloned: CarromGameState = {
        ...this.state,
        pieces: this.state.pieces.map((p) => ({ ...p })),
        pockets: this.state.pockets.map((p) => ({
          position: { ...p.position },
          radius: p.radius,
        })),
      };
      this.onStateChange(cloned);
    }
  }

  public getState(): CarromGameState {
    const cloned: CarromGameState = {
      ...this.state,
      pieces: this.state.pieces.map((p) => ({ ...p })),
      pockets: this.state.pockets.map((p) => ({
        position: { ...p.position },
        radius: p.radius,
      })),
    };
    return cloned;
  }

  public setStrikerAngle(angle: number) {
    if (this.state.gameStatus !== "aiming") return;
    this.state.strikerAngle = angle;
    this.notifyStateChange();
  }

  public setStrikerPower(power: number) {
    if (this.state.gameStatus !== "aiming") return;
    const clamped = Math.max(0, Math.min(100, power));
    this.state.strikerPower = clamped;
    this.notifyStateChange();
  }

  private getStriker(): Piece | undefined {
    return this.state.pieces.find((p) => p.kind === "striker");
  }

  public shoot() {
    if (!this.state.canShoot || this.state.gameStatus !== "aiming") return;
    const striker = this.getStriker();
    if (!striker || striker.pocketed) return;

    const power = (this.state.strikerPower / 100) * this.maxPower;
    const angle = this.state.strikerAngle;

    striker.velocity = {
      x: Math.cos(angle) * power,
      y: Math.sin(angle) * power,
    };
    striker.isMoving = true;

    this.state.gameStatus = "shooting";
    this.state.canShoot = false;
    this.state.fouls = null;
    this.state.message = null;

    this.pocketedThisTurn.clear();
    this.turnPocketedWhite = 0;
    this.turnPocketedBlack = 0;
    this.turnPocketedQueen = false;
    this.turnPocketedStriker = false;

    this.startPhysicsLoop();
    this.notifyStateChange();
  }

  private startPhysicsLoop() {
    if (this.animationFrameId !== null) return;

    const update = () => {
      this.updatePieces();
      this.checkCollisions();
      this.checkPockets();

      const allStopped = this.state.pieces.every(
        (p) => !p.isMoving || p.pocketed
      );

      if (allStopped && this.state.gameStatus === "shooting") {
        this.finishTurn();
        if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      } else {
        this.animationFrameId = requestAnimationFrame(update);
      }

      this.notifyStateChange();
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  private updatePieces() {
    for (const piece of this.state.pieces) {
      if (piece.pocketed || !piece.isMoving) continue;

      piece.velocity.x *= this.friction;
      piece.velocity.y *= this.friction;
      piece.position.x += piece.velocity.x;
      piece.position.y += piece.velocity.y;

      const minX = this.margin + piece.radius;
      const maxX = this.size - this.margin - piece.radius;
      const minY = this.margin + piece.radius;
      const maxY = this.size - this.margin - piece.radius;

      if (piece.position.x < minX) {
        piece.position.x = minX;
        piece.velocity.x *= -0.9;
      } else if (piece.position.x > maxX) {
        piece.position.x = maxX;
        piece.velocity.x *= -0.9;
      }

      if (piece.position.y < minY) {
        piece.position.y = minY;
        piece.velocity.y *= -0.9;
      } else if (piece.position.y > maxY) {
        piece.position.y = maxY;
        piece.velocity.y *= -0.9;
      }

      const speed = Math.sqrt(
        piece.velocity.x * piece.velocity.x +
          piece.velocity.y * piece.velocity.y
      );
      if (speed < this.minSpeed) {
        piece.velocity.x = 0;
        piece.velocity.y = 0;
        piece.isMoving = false;
      }
    }
  }

  private checkCollisions() {
    const active = this.state.pieces.filter((p) => !p.pocketed);

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i];
        const b = active[j];

        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius;

        if (dist === 0 || dist >= minDist) continue;

        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        const vaX = a.velocity.x * cos + a.velocity.y * sin;
        const vaY = a.velocity.y * cos - a.velocity.x * sin;
        const vbX = b.velocity.x * cos + b.velocity.y * sin;
        const vbY = b.velocity.y * cos - b.velocity.x * sin;

        const newVaX = vbX;
        const newVbX = vaX;

        a.velocity.x = newVaX * cos - vaY * sin;
        a.velocity.y = vaY * cos + newVaX * sin;
        b.velocity.x = newVbX * cos - vbY * sin;
        b.velocity.y = vbY * cos + newVbX * sin;

        const overlap = minDist - dist;
        const separationX = (overlap / 2) * cos;
        const separationY = (overlap / 2) * sin;

        a.position.x -= separationX;
        a.position.y -= separationY;
        b.position.x += separationX;
        b.position.y += separationY;

        a.isMoving = true;
        b.isMoving = true;
      }
    }
  }

  private checkPockets() {
    for (const piece of this.state.pieces) {
      if (piece.pocketed) continue;

      for (const pocket of this.state.pockets) {
        const dx = piece.position.x - pocket.position.x;
        const dy = piece.position.y - pocket.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.pocketCaptureRadius) {
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const pull =
            ((this.pocketCaptureRadius - dist) / this.pocketCaptureRadius) *
            0.4;
          piece.velocity.x -= nx * pull;
          piece.velocity.y -= ny * pull;
          piece.isMoving = true;
        }

        const innerRadius = this.pocketRadius * 0.8;
        if (dist < innerRadius) {
          piece.pocketed = true;
          piece.isMoving = false;
          piece.velocity = { x: 0, y: 0 };
          piece.position = { ...pocket.position };
          this.pocketedThisTurn.add(piece.id);

          if (piece.kind === "coin") {
            if (piece.color === "white") this.turnPocketedWhite++;
            if (piece.color === "black") this.turnPocketedBlack++;
          } else if (piece.kind === "queen") {
            this.turnPocketedQueen = true;
          } else if (piece.kind === "striker") {
            this.turnPocketedStriker = true;
          }

          break;
        }
      }
    }
  }

  private finishTurn() {
    this.state.gameStatus = "resolving";

    const player = this.state.currentPlayer;
    const opponent: PlayerId = player === 1 ? 2 : 1;

    const WHITE_VALUE = 20;
    const BLACK_VALUE = 10;
    const QUEEN_VALUE = 50;
    const STRIKER_PENALTY = 10;

    // All players can pocket any coin/queen; points go to
    // whoever took the shot this turn (currentPlayer).
    let delta = 0;

    if (this.turnPocketedWhite > 0) {
      delta += this.turnPocketedWhite * WHITE_VALUE;
    }

    if (this.turnPocketedBlack > 0) {
      delta += this.turnPocketedBlack * BLACK_VALUE;
    }

    this.state.message = null;

    if (this.turnPocketedQueen) {
      delta += QUEEN_VALUE;
      this.state.message = "Queen pocketed!";
    }

    this.state.fouls = null;

    if (this.turnPocketedStriker) {
      delta -= STRIKER_PENALTY;
      this.state.fouls = `Striker pocketed (-${STRIKER_PENALTY})`;
    }

    this.state.scores[player] = Math.max(0, this.state.scores[player] + delta);

    const remainingCoins = this.state.pieces.filter(
      (p) => (p.kind === "coin" || p.kind === "queen") && !p.pocketed
    ).length;

    if (remainingCoins === 0) {
      if (this.state.scores[1] > this.state.scores[2]) {
        this.state.winner = 1;
      } else if (this.state.scores[2] > this.state.scores[1]) {
        this.state.winner = 2;
      } else {
        this.state.winner = null;
      }
      this.state.gameStatus = "gameOver";
      this.notifyStateChange();
      return;
    }

    const pocketedScoringPiece =
      this.turnPocketedWhite > 0 ||
      this.turnPocketedBlack > 0 ||
      this.turnPocketedQueen;

    const keepTurn = pocketedScoringPiece && !this.turnPocketedStriker;

    if (!keepTurn) {
      this.state.currentPlayer = opponent;
    }

    const striker = this.getStriker();
    if (striker) {
      striker.pocketed = false;
      striker.velocity = { x: 0, y: 0 };
      striker.isMoving = false;
      striker.position = this.getStrikerStartPosition(this.state.currentPlayer);
    }

    if (this.state.winner === null) {
      this.state.gameStatus = "aiming";
      this.state.canShoot = true;
      this.state.strikerPower = 0;
    }

    const { gameMode, currentPlayer, gameStatus } = this.state;

    if (
      gameMode === "computer" &&
      currentPlayer === 2 &&
      gameStatus === "aiming"
    ) {
      setTimeout(() => this.makeComputerMove(), 700);
    }
  }

  private makeComputerMove() {
    if (this.state.gameStatus !== "aiming" || this.state.currentPlayer !== 2)
      return;

    const striker = this.getStriker();
    if (!striker || striker.pocketed) return;

    // In the new rules, the computer can target any coin or the queen.
    const targets = this.state.pieces.filter(
      (p) => (p.kind === "coin" || p.kind === "queen") && !p.pocketed
    );

    let best: Piece | null = null;
    let bestDist = Infinity;

    for (const t of targets) {
      const dx = t.position.x - striker.position.x;
      const dy = t.position.y - striker.position.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) {
        bestDist = d;
        best = t;
      }
    }

    if (!best) {
      const anyPiece = this.state.pieces.find(
        (p) => (p.kind === "coin" || p.kind === "queen") && !p.pocketed
      );
      if (!anyPiece) return;
      best = anyPiece;
    }

    const dx = best.position.x - striker.position.x;
    const dy = best.position.y - striker.position.y;
    const angle = Math.atan2(dy, dx);

    this.state.strikerAngle = angle;
    this.state.strikerPower = 70;
    this.notifyStateChange();

    setTimeout(() => {
      this.shoot();
    }, 400);
  }

  public cleanup() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
