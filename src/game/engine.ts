import { soundManager } from '../audio/soundManager';
import {
  BOMB_FUSE_SECONDS,
  EXPLOSION_DURATION,
  GHOST_DURATION,
  GRID_COLS,
  GRID_ROWS,
  PLAYER_INVULNERABLE_DURATION,
  SHIELD_DURATION,
  SPEED_BOOST_DURATION,
  TILE_SIZE,
} from './constants';
import { generateGameMap } from './mapGenerator';
import {
  BombState,
  CellType,
  EnemyState,
  ExplosionCell,
  ExplosionState,
  FloatingText,
  GameMode,
  ItemPickup,
  PickupType,
  PlayerState,
  TrappedAnimal,
} from './types';

export class GameEngine {
  public grid: CellType[][] = [];
  public hiddenPickups = new Map<string, PickupType>();
  public pickups: ItemPickup[] = [];
  public players: PlayerState[] = [];
  public enemies: EnemyState[] = [];
  public bombs: BombState[] = [];
  public explosions: ExplosionState[] = [];
  public trappedAnimals: TrappedAnimal[] = [];
  public floatingTexts: FloatingText[] = [];

  public mode: GameMode = 'single';
  public isCageUnlocked = false;
  public isChestUnlocked = false;
  public cameraX = 0;
  public timeRemaining = 300; // 5 minutes
  public isGameOver = false;
  public isVictory = false;
  public winnerPlayerId: string | null = null;
  public cageLocation = { x: 29, y: 8 };
  public chestLocation = { x: 16, y: 8 };

  constructor() {}

  public initGame(config: {
    mode: GameMode;
    player1Name: string;
    player1Char: 'rambo_macho' | 'rambo_hembra' | 'exploradora';
    player2Name?: string;
    player2Char?: 'rambo_macho' | 'rambo_hembra' | 'exploradora';
  }) {
    this.mode = config.mode;
    this.isCageUnlocked = false;
    this.isChestUnlocked = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.winnerPlayerId = null;
    this.timeRemaining = 300;
    this.bombs = [];
    this.explosions = [];
    this.floatingTexts = [];

    const mapData = generateGameMap(config.mode);
    this.grid = mapData.grid;
    this.hiddenPickups = mapData.hiddenPickups;
    this.pickups = mapData.initialPickups;
    this.enemies = mapData.enemies;
    this.trappedAnimals = mapData.trappedAnimals;
    this.cageLocation = mapData.cageLocation;
    this.chestLocation = mapData.chestLocation;

    // Player 1
    const p1: PlayerState = {
      id: 'p1',
      name: config.player1Name,
      characterId: config.player1Char,
      gridX: 1,
      gridY: 1,
      x: 1,
      y: 1,
      targetGridX: 1,
      targetGridY: 1,
      direction: 'RIGHT',
      isMoving: false,
      lives: 3,
      maxLives: 5,
      score: 0,
      coins: 0,
      hasKey: false,
      speedMultiplier: 1.0,
      isGhost: false,
      ghostTimer: 0,
      hasShield: false,
      shieldTimer: 0,
      bombRange: 1,
      bombStock: 999,
      bombType: 'NORMAL',
      invulnerableTimer: 0,
      isDead: false,
    };

    this.players = [p1];

    if (config.mode === 'multiplayer') {
      const p2: PlayerState = {
        id: 'p2',
        name: config.player2Name || 'Jugador 2',
        characterId: config.player2Char || 'rambo_hembra',
        gridX: 31,
        gridY: 1,
        x: 31,
        y: 1,
        targetGridX: 31,
        targetGridY: 1,
        direction: 'LEFT',
        isMoving: false,
        lives: 3,
        maxLives: 5,
        score: 0,
        coins: 0,
        hasKey: false,
        speedMultiplier: 1.0,
        isGhost: false,
        ghostTimer: 0,
        hasShield: false,
        shieldTimer: 0,
        bombRange: 1,
        bombStock: 999,
        bombType: 'NORMAL',
        invulnerableTimer: 0,
        isDead: false,
      };
      this.players.push(p2);
    }

    this.cameraX = 0;
  }

  // --- PLAYER ACTIONS ---

  public movePlayer(playerId: string, dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || player.isDead || this.isGameOver || this.isVictory) return;

    player.direction = dir;
    let nextX = player.gridX;
    let nextY = player.gridY;

    if (dir === 'UP') nextY--;
    else if (dir === 'DOWN') nextY++;
    else if (dir === 'LEFT') nextX--;
    else if (dir === 'RIGHT') nextX++;

    if (this.canWalkOn(nextX, nextY, player)) {
      player.gridX = nextX;
      player.gridY = nextY;
      player.isMoving = true;
    }
  }

  private canWalkOn(x: number, y: number, player: PlayerState): boolean {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
    const cell = this.grid[y][x];

    // Solid blocks
    if (cell === 'BRICK_WALL' || cell === 'ROCK_WALL' || cell === 'CRATE') {
      return false;
    }

    // Single Player Cage
    if (cell === 'CAGE' && !this.isCageUnlocked) {
      // Check if player has key to open
      if (player.hasKey) {
        this.unlockCage(player);
        return false;
      }
      return false;
    }

    // Multiplayer Chest
    if (cell === 'CHEST' && !this.isChestUnlocked) {
      if (player.hasKey) {
        this.unlockChest(player);
        return false;
      }
      return false;
    }

    // Bombs block movement unless ghost
    if (!player.isGhost) {
      const hasBomb = this.bombs.some((b) => b.gridX === x && b.gridY === y);
      if (hasBomb) return false;
    }

    return true;
  }

  public placeBomb(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || player.isDead || this.isGameOver || this.isVictory) return;

    // Check if cell already has bomb
    const alreadyBomb = this.bombs.some(
      (b) => b.gridX === player.gridX && b.gridY === player.gridY
    );
    if (alreadyBomb) return;

    const isRemote = player.bombType === 'REMOTE';
    const bomb: BombState = {
      id: `bomb_${Date.now()}_${Math.random()}`,
      gridX: player.gridX,
      gridY: player.gridY,
      ownerId: player.id,
      range: player.bombRange,
      isRemote,
      timer: BOMB_FUSE_SECONDS,
      detonated: false,
      pulsate: 0,
    };

    this.bombs.push(bomb);
    soundManager.playPlaceBomb();

    // Consume powerup stock if not normal
    if (player.bombType !== 'NORMAL') {
      player.bombStock--;
      if (player.bombStock <= 0) {
        player.bombType = 'NORMAL';
        player.bombRange = 1;
      }
    }
  }

  public triggerRemoteBomb(playerId: string) {
    const remoteBombs = this.bombs.filter(
      (b) => b.ownerId === playerId && b.isRemote && !b.detonated
    );
    if (remoteBombs.length > 0) {
      remoteBombs.forEach((b) => {
        b.timer = 0.05; // Trigger immediate blast
      });
      soundManager.playClick();
    }
  }

  // --- GOAL ACTIONS ---

  private unlockCage(player: PlayerState) {
    this.isCageUnlocked = true;
    this.grid[this.cageLocation.y][this.cageLocation.x] = 'EMPTY';
    this.trappedAnimals.forEach((a) => (a.isRescued = true));
    player.score += 2500;
    this.addFloatingText('+2500 RESCATE!', this.cageLocation.x, this.cageLocation.y, '#facc15');
    soundManager.playCageRescueFanfare();
    this.isVictory = true;
    this.winnerPlayerId = player.id;
  }

  private unlockChest(player: PlayerState) {
    this.isChestUnlocked = true;
    this.grid[this.chestLocation.y][this.chestLocation.x] = 'EMPTY';
    player.score += 3000;
    this.addFloatingText('+3000 COPA!', this.chestLocation.x, this.chestLocation.y, '#facc15');
    soundManager.playCageRescueFanfare();
    this.isVictory = true;
    this.winnerPlayerId = player.id;
  }

  // --- UPDATE LOOP ---

  public update(deltaTime: number, viewportWidth: number) {
    if (this.isGameOver || this.isVictory) return;

    // Timer countdown
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.triggerGameOver('¡Tiempo agotado!');
      return;
    }

    // 1. Update Players
    this.updatePlayers(deltaTime);

    // 2. Update Bombs
    this.updateBombs(deltaTime);

    // 3. Update Explosions
    this.updateExplosions(deltaTime);

    // 4. Update Enemies (Foxes)
    this.updateEnemies(deltaTime);

    // 5. Check Pickups
    this.checkPickups();

    // 6. Update Floating Texts
    this.updateFloatingTexts(deltaTime);

    // 7. Update Camera tracking Player 1 smoothly
    if (this.players[0]) {
      const targetCam = this.players[0].x * TILE_SIZE - viewportWidth / 2;
      const maxCam = GRID_COLS * TILE_SIZE - viewportWidth;
      const clampedCam = Math.max(0, Math.min(maxCam, targetCam));
      // Smooth interpolation
      this.cameraX += (clampedCam - this.cameraX) * 0.12;
    }
  }

  private updatePlayers(deltaTime: number) {
    this.players.forEach((player) => {
      if (player.isDead) return;

      // Smooth coordinate movement towards target grid cell
      const baseSpeed = 4.2 * player.speedMultiplier;
      const dx = player.gridX - player.x;
      const dy = player.gridY - player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.01) {
        const step = baseSpeed * deltaTime;
        if (step >= dist) {
          player.x = player.gridX;
          player.y = player.gridY;
          player.isMoving = false;
        } else {
          player.x += (dx / dist) * step;
          player.y += (dy / dist) * step;
          player.isMoving = true;
        }
      } else {
        player.x = player.gridX;
        player.y = player.gridY;
        player.isMoving = false;
      }

      // Timers: Invulnerability, Shield, Ghost
      if (player.invulnerableTimer > 0) {
        player.invulnerableTimer -= deltaTime;
      }

      if (player.hasShield) {
        player.shieldTimer -= deltaTime;
        if (player.shieldTimer <= 0) {
          player.hasShield = false;
        }
      }

      if (player.isGhost) {
        player.ghostTimer -= deltaTime;
        if (player.ghostTimer <= 0) {
          player.isGhost = false;
        }
      }
    });
  }

  private updateBombs(deltaTime: number) {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      if (!bomb.isRemote) {
        bomb.timer -= deltaTime;
      }

      if (bomb.timer <= 0 && !bomb.detonated) {
        bomb.detonated = true;
        this.explodeBomb(bomb);
        this.bombs.splice(i, 1);
      }
    }
  }

  // CROSS EXPLOSION LOGIC (UP, DOWN, LEFT, RIGHT)
  private explodeBomb(bomb: BombState) {
    soundManager.playExplosion();

    const cells: ExplosionCell[] = [
      { gridX: bomb.gridX, gridY: bomb.gridY, isCenter: true, direction: 'CENTER' },
    ];

    const dirs: Array<{ dx: number; dy: number; dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' }> = [
      { dx: 0, dy: -1, dir: 'UP' },
      { dx: 0, dy: 1, dir: 'DOWN' },
      { dx: -1, dy: 0, dir: 'LEFT' },
      { dx: 1, dy: 0, dir: 'RIGHT' },
    ];

    dirs.forEach(({ dx, dy, dir }) => {
      for (let step = 1; step <= bomb.range; step++) {
        const tx = bomb.gridX + dx * step;
        const ty = bomb.gridY + dy * step;

        if (tx < 0 || tx >= GRID_COLS || ty < 0 || ty >= GRID_ROWS) break;

        const cell = this.grid[ty][tx];

        // Indestructible rock or brick perimeter -> blast stops immediately
        if (cell === 'ROCK_WALL' || cell === 'BRICK_WALL' || cell === 'CAGE' || cell === 'CHEST') {
          break;
        }

        // Destructible Crate -> DESTROY crate, but blast DOES NOT pass through
        if (cell === 'CRATE') {
          this.destroyCrate(tx, ty);
          cells.push({ gridX: tx, gridY: ty, isCenter: false, direction: dir });
          // CRITICAL RULE 20: Crate blocks propagation behind it
          break;
        }

        // Empty walkable cell
        cells.push({ gridX: tx, gridY: ty, isCenter: false, direction: dir });

        // Trigger any chain reaction bomb
        const chainedBomb = this.bombs.find((b) => b.gridX === tx && b.gridY === ty);
        if (chainedBomb && !chainedBomb.detonated) {
          chainedBomb.timer = 0.05;
        }
      }
    });

    const explosion: ExplosionState = {
      id: `exp_${Date.now()}_${Math.random()}`,
      cells,
      timer: EXPLOSION_DURATION,
    };
    this.explosions.push(explosion);

    // Apply blast damage to entities inside explosion cells
    this.applyExplosionDamage(cells, bomb.ownerId);
  }

  private destroyCrate(x: number, y: number) {
    this.grid[y][x] = 'EMPTY';
    soundManager.playCrateDestroy();

    // Check if hidden pickup inside
    const coordKey = `${x},${y}`;
    if (this.hiddenPickups.has(coordKey)) {
      const type = this.hiddenPickups.get(coordKey)!;
      this.pickups.push({
        id: `pickup_${Date.now()}_${Math.random()}`,
        gridX: x,
        gridY: y,
        type,
        bobOffset: Math.random() * Math.PI,
      });
      this.hiddenPickups.delete(coordKey);
    }

    // Add points to owner
    if (this.players[0]) {
      this.players[0].score += 50;
      this.addFloatingText('+50', x, y, '#fde047');
    }
  }

  private applyExplosionDamage(cells: ExplosionCell[], ownerId: string) {
    const owner = this.players.find((p) => p.id === ownerId);

    cells.forEach((cell) => {
      // 1. Damage Enemies
      this.enemies.forEach((enemy) => {
        if (!enemy.isDead && enemy.gridX === cell.gridX && enemy.gridY === cell.gridY) {
          enemy.isDead = true;
          enemy.deathTimer = 0.6;
          soundManager.playEnemyDefeat();
          if (owner) {
            owner.score += 300;
            this.addFloatingText('+300 ZORRO!', enemy.gridX, enemy.gridY, '#fb923c');
          }
        }
      });

      // 2. Damage Players (unless Shield or Ghost)
      this.players.forEach((player) => {
        if (
          !player.isDead &&
          player.gridX === cell.gridX &&
          player.gridY === cell.gridY
        ) {
          if (!player.hasShield && !player.isGhost && player.invulnerableTimer <= 0) {
            this.damagePlayer(player);
          }
        }
      });
    });
  }

  private damagePlayer(player: PlayerState) {
    player.lives--;
    player.invulnerableTimer = PLAYER_INVULNERABLE_DURATION;
    soundManager.playPlayerHurt();
    this.addFloatingText('-1 VIDA', player.gridX, player.gridY, '#ef4444');

    if (player.lives <= 0) {
      player.isDead = true;
      if (this.mode === 'single') {
        this.triggerGameOver('¡Te has quedado sin vidas!');
      } else {
        // In multiplayer, other player wins
        const otherPlayer = this.players.find((p) => p.id !== player.id);
        if (otherPlayer) {
          this.isVictory = true;
          this.winnerPlayerId = otherPlayer.id;
          soundManager.playCageRescueFanfare();
        }
      }
    }
  }

  private updateExplosions(deltaTime: number) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].timer -= deltaTime;
      if (this.explosions[i].timer <= 0) {
        this.explosions.splice(i, 1);
      }
    }
  }

  // ENEMY FOX MOVEMENT
  private updateEnemies(deltaTime: number) {
    this.enemies.forEach((enemy) => {
      if (enemy.isDead) {
        if (enemy.deathTimer > 0) {
          enemy.deathTimer -= deltaTime;
        }
        return;
      }

      // Move smoothly to target
      const speed = enemy.speed;
      const dx = enemy.targetGridX - enemy.x;
      const dy = enemy.targetGridY - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.02) {
        const step = speed * deltaTime;
        enemy.x += (dx / dist) * step;
        enemy.y += (dy / dist) * step;
      } else {
        enemy.x = enemy.targetGridX;
        enemy.y = enemy.targetGridY;
        enemy.gridX = enemy.targetGridX;
        enemy.gridY = enemy.targetGridY;

        // Choose next grid cell in corridor
        this.pickNextEnemyMove(enemy);
      }

      // Check collision with players
      this.players.forEach((player) => {
        if (!player.isDead && Math.hypot(player.x - enemy.x, player.y - enemy.y) < 0.6) {
          if (player.hasShield) {
            // Shield repels fox!
            this.addFloatingText('¡ESCUDO!', player.gridX, player.gridY, '#60a5fa');
          } else if (!player.isGhost && player.invulnerableTimer <= 0) {
            this.damagePlayer(player);
          }
        }
      });
    });

    // Remove dead foxes whose deathTimer expired
    this.enemies = this.enemies.filter((e) => !e.isDead || e.deathTimer > 0);
  }

  private pickNextEnemyMove(enemy: EnemyState) {
    const candidateDirs: Array<{ dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'; nx: number; ny: number }> = [
      { dir: 'UP', nx: enemy.gridX, ny: enemy.gridY - 1 },
      { dir: 'DOWN', nx: enemy.gridX, ny: enemy.gridY + 1 },
      { dir: 'LEFT', nx: enemy.gridX - 1, ny: enemy.gridY },
      { dir: 'RIGHT', nx: enemy.gridX + 1, ny: enemy.gridY },
    ];

    const validMoves = candidateDirs.filter(({ nx, ny }) => {
      if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) return false;
      const cell = this.grid[ny][nx];
      if (cell !== 'EMPTY') return false;
      // Cannot walk into active bombs
      if (this.bombs.some((b) => b.gridX === nx && b.gridY === ny)) return false;
      return true;
    });

    if (validMoves.length > 0) {
      // 70% chance to keep same direction if valid
      const forwardMove = validMoves.find((m) => m.dir === enemy.direction);
      if (forwardMove && Math.random() < 0.7) {
        enemy.targetGridX = forwardMove.nx;
        enemy.targetGridY = forwardMove.ny;
      } else {
        const chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
        enemy.direction = chosen.dir;
        enemy.targetGridX = chosen.nx;
        enemy.targetGridY = chosen.ny;
      }
    }
  }

  // PICKUPS COLLECTION
  private checkPickups() {
    this.players.forEach((player) => {
      if (player.isDead) return;

      for (let i = this.pickups.length - 1; i >= 0; i--) {
        const p = this.pickups[i];
        if (p.gridX === player.gridX && p.gridY === player.gridY) {
          this.applyPickup(player, p.type);
          this.pickups.splice(i, 1);
        }
      }
    });
  }

  private applyPickup(player: PlayerState, type: PickupType) {
    switch (type) {
      case 'KEY':
        player.hasKey = true;
        player.score += 500;
        soundManager.playKeyFound();
        this.addFloatingText('¡LLAVE DE ORO!', player.gridX, player.gridY, '#facc15');
        break;

      case 'COIN':
        player.coins++;
        player.score += 100;
        soundManager.playCollectCoin();
        this.addFloatingText('+100 MONEDA', player.gridX, player.gridY, '#fde047');
        break;

      case 'HEART':
        if (player.lives < player.maxLives) {
          player.lives++;
        }
        player.score += 50;
        soundManager.playCollectPowerUp();
        this.addFloatingText('+1 VIDA', player.gridX, player.gridY, '#ef4444');
        break;

      case 'POWERUP_DOUBLE_EGG':
        player.bombRange = 2;
        player.bombStock += 5;
        player.bombType = 'DOUBLE';
        player.score += 150;
        soundManager.playCollectPowerUp();
        this.addFloatingText('DOBLE HUEVO (x2)', player.gridX, player.gridY, '#ea580c');
        break;

      case 'POWERUP_TRIPLE_EGG':
        player.bombRange = 3;
        player.bombStock += 3;
        player.bombType = 'TRIPLE';
        player.score += 200;
        soundManager.playCollectPowerUp();
        this.addFloatingText('TRIPLE HUEVO (x3)', player.gridX, player.gridY, '#ea580c');
        break;

      case 'POWERUP_SPEED':
        player.speedMultiplier = 1.35;
        setTimeout(() => {
          player.speedMultiplier = 1.0;
        }, SPEED_BOOST_DURATION * 1000);
        player.score += 150;
        soundManager.playCollectPowerUp();
        this.addFloatingText('¡VELOCIDAD!', player.gridX, player.gridY, '#3b82f6');
        break;

      case 'POWERUP_SHIELD':
        player.hasShield = true;
        player.shieldTimer = SHIELD_DURATION;
        player.score += 150;
        soundManager.playCollectPowerUp();
        this.addFloatingText('¡ESCUDO!', player.gridX, player.gridY, '#2563eb');
        break;

      case 'POWERUP_GHOST':
        player.isGhost = true;
        player.ghostTimer = GHOST_DURATION;
        player.score += 150;
        soundManager.playCollectPowerUp();
        this.addFloatingText('¡FANTASMA!', player.gridX, player.gridY, '#8b5cf6');
        break;

      case 'POWERUP_REMOTE':
        player.bombType = 'REMOTE';
        player.bombStock += 4;
        player.score += 150;
        soundManager.playCollectPowerUp();
        this.addFloatingText('¡DETONADOR REMOTO!', player.gridX, player.gridY, '#16a34a');
        break;
    }
  }

  private addFloatingText(text: string, gx: number, gy: number, color: string) {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x: gx * TILE_SIZE + 24,
      y: gy * TILE_SIZE + 10,
      color,
      timer: 1.0,
    });
  }

  private updateFloatingTexts(deltaTime: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].timer -= deltaTime;
      if (this.floatingTexts[i].timer <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private triggerGameOver(reason: string) {
    this.isGameOver = true;
    soundManager.playGameOver();
  }
}
