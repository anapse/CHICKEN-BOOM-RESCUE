import { EXPLOSION_DURATION, GRID_COLS, GRID_ROWS, TILE_SIZE } from './constants';
import { SpriteManager, spriteManager } from './SpriteManager';
import { SPRITE_ASSETS } from './spriteAssets';
import {
  BombState,
  CellType,
  EnemyState,
  ExplosionState,
  FloatingText,
  ItemPickup,
  PlayerState,
  TrappedAnimal,
} from './types';

// All sprite/image loads are delegated to the centralized manager.
function getAssetImage(path: string): HTMLImageElement | null {
  return spriteManager.getImage(path);
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private animTimer = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(params: {
    grid: CellType[][];
    players: PlayerState[];
    enemies: EnemyState[];
    bombs: BombState[];
    explosions: ExplosionState[];
    pickups: ItemPickup[];
    trappedAnimals: TrappedAnimal[];
    floatingTexts: FloatingText[];
    cameraX: number;
    viewportWidth: number;
    viewportHeight: number;
    hasKey: boolean;
    isCageUnlocked: boolean;
    deltaTime: number;
  }) {
    const {
      grid,
      players,
      enemies,
      bombs,
      explosions,
      pickups,
      trappedAnimals,
      floatingTexts,
      cameraX,
      viewportWidth,
      viewportHeight,
      hasKey,
      isCageUnlocked,
      deltaTime,
    } = params;

    this.animTimer += deltaTime;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    // Background fills the whole screen, including behind the HUD and the
    // lower power-up area. It is deliberately not translated with the camera.
    this.renderGround(
      Math.ceil(viewportWidth / TILE_SIZE),
      Math.ceil(viewportHeight / TILE_SIZE),
    );

    // Reserve space for the top HUD and the lower controls without cutting off
    // the perimeter. Scale the complete map uniformly so all 17 rows fit.
    const sidePadding = 12;
    const topPadding = 88;
    const bottomPadding = 72;
    const playWidth = Math.max(1, viewportWidth - sidePadding * 2);
    const playHeight = Math.max(1, viewportHeight - topPadding - bottomPadding);
    const mapWidth = GRID_COLS * TILE_SIZE;
    const mapHeight = GRID_ROWS * TILE_SIZE;
    const mapScale = Math.min(playWidth / mapWidth, playHeight / mapHeight);
    const scaledMapWidth = mapWidth * mapScale;
    const mapLeft = sidePadding + (playWidth - scaledMapWidth) / 2;

    // Keep the entire map, its walls, collisions, pickups and characters in
    // the same coordinate system. Only the renderer's presentation is scaled.
    ctx.save();
    ctx.beginPath();
    ctx.rect(sidePadding, topPadding, playWidth, playHeight);
    ctx.clip();
    ctx.translate(mapLeft - cameraX * mapScale, topPadding);
    ctx.scale(mapScale, mapScale);

    // 2. Render Grid Cells (Walls, Crates, Cages, Chests)
    this.renderGrid(grid, isCageUnlocked, hasKey);

    // 3. Render Pickups / Power-Ups
    this.renderPickups(pickups);

    // 4. Render Bombs
    this.renderBombs(bombs);

    // 5. Render Trapped / Rescued Animals
    this.renderAnimals(trappedAnimals, isCageUnlocked);

    // 6. Render Enemies (Foxes)
    this.renderEnemies(enemies);

    // 7. Render Players
    players.forEach((player) => {
      this.renderPlayer(player);
    });

    // 8. Render Explosions (Cross + shape)
    this.renderExplosions(explosions);

    // 9. Render Floating Texts (+100, +500, KEY!)
    this.renderFloatingTexts(floatingTexts);
    ctx.restore();

    ctx.restore();
  }

  // LUSH FARM/ISLAND GROUND
  private renderGround(cols: number, rows: number) {
    const ctx = this.ctx;
    const totalW = cols * TILE_SIZE;
    const totalH = rows * TILE_SIZE;

    // Check if user has uploaded fondojuego.png to public/sprites/
    const bgImg = getAssetImage(SPRITE_ASSETS.gameBackground.src) || getAssetImage('./fondojuego.png');
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      // Repeat texture across the 3 screens
      const pat = ctx.createPattern(bgImg, 'repeat');
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, totalW, totalH);
        return;
      }
    }

    // Base lush green
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(0, 0, totalW, totalH);

    // Procedural organic soil & grass patches
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const hash = (c * 37 + r * 19) % 100;

        // Subtle grass checkerboard
        if ((c + r) % 2 === 0) {
          ctx.fillStyle = '#4d7c0f';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        }

        // Earthy dirt path patch
        if (hash < 18) {
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE * 0.375, 0, Math.PI * 2);
          ctx.fill();
        }

        // Little daisy flowers
        if (hash > 86) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + 16, y + 16, 3, 0, Math.PI * 2);
          ctx.arc(x + 22, y + 16, 3, 0, Math.PI * 2);
          ctx.arc(x + 19, y + 13, 3, 0, Math.PI * 2);
          ctx.arc(x + 19, y + 19, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(x + 19, y + 16, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Grass blades
        if (hash > 40 && hash < 55) {
          ctx.strokeStyle = '#365314';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 30, y + 36);
          ctx.lineTo(x + 32, y + 26);
          ctx.moveTo(x + 33, y + 36);
          ctx.lineTo(x + 38, y + 28);
          ctx.stroke();
        }
      }
    }
  }

  // GRID OBJECTS (Bricks, Rocks, Crates, Cages, Chest)
  private renderGrid(grid: CellType[][], isCageUnlocked: boolean, hasKey: boolean) {
    const ctx = this.ctx;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (cell === 'BRICK_WALL') {
          this.drawBrickWall(px, py, x, y, grid[0].length);
        } else if (cell === 'ROCK_WALL') {
          this.drawRockWall(px, py, x, y);
        } else if (cell === 'CRATE') {
          this.drawWoodenCrate(px, py);
        } else if (cell === 'CAGE') {
          this.drawAnimalCage(px, py, isCageUnlocked, hasKey);
        } else if (cell === 'CHEST') {
          this.drawTrophyChest(px, py);
        }
      }
    }
  }

  // Shared wood/stone atlas: left half is the wooden crate, right half is stone wall.
  // The supplied PNG is 1774×887, split into two 887×887 panels.
  private drawBrickWall(x: number, y: number, gridX: number, gridY: number, gridWidth: number) {
    const ctx = this.ctx;
    const sprite = getAssetImage(SPRITE_ASSETS.woodStoneTiles.src);
    if (!sprite || !sprite.complete || sprite.naturalWidth <= 0) return;

    // Perimeter-only orientation:
    // left border = 90° clockwise; right border = 90° counter-clockwise;
    // top border = 180°; bottom border = original orientation.
    let rotation = 0;
    if (gridX === 0) rotation = Math.PI / 2;
    else if (gridX === gridWidth - 1) rotation = -Math.PI / 2;
    else if (gridY === 0) rotation = Math.PI;

    if (rotation !== 0) {
      ctx.save();
      ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
      ctx.rotate(rotation);
      const drawSize = TILE_SIZE * 1.42;
      ctx.drawImage(
        sprite,
        887, 0, 887, 887,
        -drawSize / 2, -drawSize / 2, drawSize, drawSize,
      );
      ctx.restore();
      return;
    }

    spriteManager.draw(ctx, SPRITE_ASSETS.woodStoneTiles.src, {
      x, y, width: TILE_SIZE, height: TILE_SIZE,
      sourceRect: { x: 887, y: 0, width: 887, height: 887 },
    });
  }

  private drawRockWall(x: number, y: number, _gx: number, _gy: number) {
    // Interior stone obstacles keep their original orientation.
    spriteManager.draw(this.ctx, SPRITE_ASSETS.woodStoneTiles.src, {
      x, y, width: TILE_SIZE, height: TILE_SIZE,
      sourceRect: { x: 887, y: 0, width: 887, height: 887 },
    });
  }

  private drawWoodenCrate(x: number, y: number) {
    spriteManager.draw(this.ctx, SPRITE_ASSETS.woodStoneTiles.src, {
      x, y, width: TILE_SIZE, height: TILE_SIZE,
      sourceRect: { x: 0, y: 0, width: 887, height: 887 },
    });
  }

  // 4. ANIMAL CAGE (Single Player Goal)
  private drawAnimalCage(x: number, y: number, isUnlocked: boolean, hasKey: boolean) {
    const ctx = this.ctx;

    // Floor of cage
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 2, y + 10, TILE_SIZE - 4, TILE_SIZE - 12);

    if (isUnlocked) {
      // Open broken bars and celebration glow
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.beginPath();
      ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE * 0.46, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 3;
      // Bent bars
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 12);
      ctx.lineTo(x + 2, y + 42);
      ctx.moveTo(x + 42, y + 12);
      ctx.lineTo(x + 46, y + 42);
      ctx.stroke();
    } else {
      // Closed bars
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 3;
      for (let barX = x + 8; barX <= x + TILE_SIZE - 8; barX += 8) {
        ctx.beginPath();
        ctx.moveTo(barX, y + 10);
        ctx.lineTo(barX, y + TILE_SIZE - 4);
        ctx.stroke();
      }

      // Wooden Roof
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(x, y + 12);
      ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE * 0.04);
      ctx.lineTo(x + TILE_SIZE, y + 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Padlock in center
      ctx.fillStyle = hasKey ? '#facc15' : '#71717a';
      ctx.beginPath();
      ctx.roundRect(x + 18, y + 22, 12, 10, 2);
      ctx.fill();

      // Lock loop
      ctx.strokeStyle = hasKey ? '#eab308' : '#a1a1aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE * 0.46, TILE_SIZE * 0.083, Math.PI, 0);
      ctx.stroke();

      if (hasKey) {
        // Glowing keyhole
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE * 0.54, TILE_SIZE * 0.031, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 5. TROPHY CHEST (Multiplayer Goal)
  private drawTrophyChest(x: number, y: number) {
    const ctx = this.ctx;

    // Glowing aura
    ctx.fillStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE * 0.44, 0, Math.PI * 2);
    ctx.fill();

    // Chest box
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 16, 36, 26, 5);
    ctx.fill();

    // Gold bands
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 12, y + 16, 5, 26);
    ctx.fillRect(x + 31, y + 16, 5, 26);

    // Glowing Golden Trophy atop
    const float = Math.sin(this.animTimer * 4) * 3;
    const tx = x + TILE_SIZE / 2;
    const ty = y + 10 + float;

    ctx.fillStyle = '#facc15';
    // Trophy cup bowl
    ctx.beginPath();
    ctx.arc(tx, ty, 8, 0, Math.PI, false);
    ctx.lineTo(tx + 4, ty + 6);
    ctx.lineTo(tx - 4, ty + 6);
    ctx.closePath();
    ctx.fill();

    // Trophy handles
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tx - 8, ty - 2, 3.5, 0, Math.PI * 2);
    ctx.arc(tx + 8, ty - 2, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    // Trophy base
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(tx - 6, ty + 6, 12, 3);
  }

  // 6. PICKUPS & POWER-UPS
  private renderPickups(pickups: ItemPickup[]) {
    const ctx = this.ctx;

    pickups.forEach((item) => {
      const px = item.gridX * TILE_SIZE + TILE_SIZE / 2;
      const bob = Math.sin(this.animTimer * 5 + item.bobOffset) * 4;
      const py = item.gridY * TILE_SIZE + TILE_SIZE / 2 + bob;

      // Glow behind pickup
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.fill();

      switch (item.type) {
        case 'KEY':
          this.drawKeyPickup(px, py);
          break;
        case 'COIN':
          this.drawCoinPickup(px, py);
          break;
        case 'HEART':
          this.drawHeartPickup(px, py);
          break;
        case 'POWERUP_DOUBLE_EGG':
          this.drawEggPowerupPickup(px, py, 2);
          break;
        case 'POWERUP_TRIPLE_EGG':
          this.drawEggPowerupPickup(px, py, 3);
          break;
        case 'POWERUP_SPEED':
          this.drawSpeedBootPickup(px, py);
          break;
        case 'POWERUP_SHIELD':
          this.drawShieldPickup(px, py);
          break;
        case 'POWERUP_GHOST':
          this.drawGhostPickup(px, py);
          break;
        case 'POWERUP_REMOTE':
          this.drawRemotePickup(px, py);
          break;
      }
    });
  }

  private drawKeyPickup(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2;

    // Key ring
    ctx.beginPath();
    ctx.arc(x - 5, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Key stem
    ctx.fillRect(x, y - 2, 12, 4);
    ctx.strokeRect(x, y - 2, 12, 4);

    // Key teeth
    ctx.fillRect(x + 7, y + 2, 3, 4);
    ctx.fillRect(x + 11, y + 2, 3, 5);
  }

  private drawCoinPickup(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x, y);
  }

  private drawHeartPickup(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.bezierCurveTo(x, y, x - 9, y - 9, x - 9, y);
    ctx.bezierCurveTo(x - 9, y + 6, x, y + 10, x, y + 12);
    ctx.bezierCurveTo(x, y + 10, x + 9, y + 6, x + 9, y);
    ctx.bezierCurveTo(x + 9, y - 9, x, y, x, y + 4);
    ctx.fill();
  }

  private drawEggPowerupPickup(x: number, y: number, count: number) {
    const ctx = this.ctx;
    // Larger pickup badge and egg for better readability on the enlarged grid.
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(x - 20, y - 20, 40, 40, 9);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x - 6, y, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`x${count}`, x + 9, y);
  }

  private drawSpeedBootPickup(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(x - 13, y - 13, 26, 26, 6);
    ctx.fill();

    // Boot
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6, y - 6, 6, 12);
    ctx.fillRect(x - 6, y + 1, 12, 6);
    // Speed lines
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 3);
    ctx.lineTo(x - 4, y - 3);
    ctx.moveTo(x - 10, y + 2);
    ctx.lineTo(x - 4, y + 2);
    ctx.stroke();
  }

  private drawShieldPickup(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(x - 13, y - 13, 26, 26, 6);
    ctx.fill();

    // Shield crest
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 7);
    ctx.lineTo(x + 6, y - 7);
    ctx.lineTo(x + 6, y + 2);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x - 6, y + 2);
    ctx.closePath();
    ctx.fill();
  }

  private drawGhostPickup(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.roundRect(x - 13, y - 13, 26, 26, 6);
    ctx.fill();

    // Cute ghost shape
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y - 2, 7, Math.PI, 0);
    ctx.lineTo(x + 7, y + 6);
    ctx.lineTo(x + 4, y + 4);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x - 4, y + 4);
    ctx.lineTo(x - 7, y + 6);
    ctx.closePath();
    ctx.fill();
  }

  private drawRemotePickup(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(x - 13, y - 13, 26, 26, 6);
    ctx.fill();

    // Remote detonator
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 6, y - 4, 12, 12);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 4);
    ctx.lineTo(x - 3, y - 9);
    ctx.stroke();

    // Red button
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y + 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. BOMBS (EGG WITH BURNING FUSE)
  private renderBombs(bombs: BombState[]) {
    const ctx = this.ctx;

    bombs.forEach((bomb) => {
      const bx = bomb.gridX * TILE_SIZE + TILE_SIZE / 2;
      const by = bomb.gridY * TILE_SIZE + TILE_SIZE / 2;
      const urgency = 1 - bomb.timer / 2.0;
      const pulseRate = urgency > 0.6 ? 25 : 12;
      const pulse = 1 + Math.sin(this.animTimer * pulseRate) * (0.035 + urgency * 0.045);

      // Use the real bomb-with-fuse icon from the provided icon sheet.
      // Source image is 1448×1086; the first bomb icon occupies the upper-left area.
      // Keep it compact within a 96px tile instead of drawing a giant procedural egg.
      const bombSize = TILE_SIZE * 0.9;
      spriteManager.draw(ctx, SPRITE_ASSETS.iconSheet.src, {
        x: bx - (bombSize * pulse) / 2,
        y: by - (bombSize * pulse) / 2,
        width: bombSize * pulse,
        height: bombSize * pulse,
        sourceRect: { x: 28, y: 38, width: 330, height: 372 },
      });
    });
  }

  // 8. EXPLOSIONS (STRICTLY CROSS + SHAPE)
  private renderExplosions(explosions: ExplosionState[]) {
    const ctx = this.ctx;

    explosions.forEach((exp) => {
      const progress = 1 - exp.timer / EXPLOSION_DURATION; // 0 -> 1

      exp.cells.forEach((cell) => {
        const cx = cell.gridX * TILE_SIZE + TILE_SIZE / 2;
        const cy = cell.gridY * TILE_SIZE + TILE_SIZE / 2;

        ctx.save();
        ctx.translate(cx, cy);

        // Core burst radius
        const maxR = TILE_SIZE / 2;
        const currentR = Math.sin(progress * Math.PI) * maxR;

        // Outer red-orange fire blast
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, currentR * 1.05, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright yellow flame
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, currentR * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Center white core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, currentR * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Cross blast flames direction flare
        if (!cell.isCenter) {
          ctx.fillStyle = '#f97316';
          const flareLen = (1 - progress) * 14;
          if (cell.direction === 'UP') {
            ctx.fillRect(-6, -24, 12, flareLen);
          } else if (cell.direction === 'DOWN') {
            ctx.fillRect(-6, 12, 12, flareLen);
          } else if (cell.direction === 'LEFT') {
            ctx.fillRect(-24, -6, flareLen, 12);
          } else if (cell.direction === 'RIGHT') {
            ctx.fillRect(12, -6, flareLen, 12);
          }
        }

        // Flying ember sparks
        for (let s = 0; s < 4; s++) {
          const angle = (s * Math.PI) / 2 + progress * 2;
          const dist = currentR * 0.9;
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(Math.cos(angle) * dist, Math.sin(angle) * dist, 2.5, 2.5);
        }

        ctx.restore();
      });
    });
  }

  // 9. FOX ENEMIES (Anthropomorphic cartoon foxes)
  private renderEnemies(enemies: EnemyState[]) {
    const ctx = this.ctx;
    const foxPath = SPRITE_ASSETS.foxEnemy.src;
    const layout = { columns: 4, rows: 4 };

    enemies.forEach((enemy) => {
      const x = enemy.x * TILE_SIZE;
      const y = enemy.y * TILE_SIZE;
      const fade = enemy.isDead ? Math.max(0, 1 - enemy.deathTimer / 0.6) : 1;
      ctx.save();
      ctx.globalAlpha *= fade;
      if (enemy.isDead) {
        ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        ctx.rotate(enemy.deathTimer * 12);
        ctx.translate(-(x + TILE_SIZE / 2), -(y + TILE_SIZE / 2));
      }
      // Use the provided fox animation sheet, not the large reference illustration.
      // Verified from the uploaded fox sheet: row 1 front/down, row 2 back/up,
      // row 3 profile facing left, row 4 profile facing right.
      const directionRow: Record<string, number> = { DOWN: 0, UP: 1, LEFT: 2, RIGHT: 3 };
      const direction = directionRow[enemy.direction] ?? 0;
      const walkFrame = SpriteManager.frameAt(this.animTimer, layout.columns, 7);
      const frame = direction * layout.columns + walkFrame;
      spriteManager.draw(ctx, foxPath, {
        x: x - TILE_SIZE * 0.35,
        y: y - TILE_SIZE * 0.45,
        width: TILE_SIZE * 1.7,
        height: TILE_SIZE * 1.7,
        frame,
        layout,
      });
      ctx.restore();
    });
  }

  private renderPlayer(player: PlayerState) {
    const ctx = this.ctx;
    const x = player.x * TILE_SIZE;
    const y = player.y * TILE_SIZE;
    const characterPath = player.characterId === 'rambo_hembra'
      ? SPRITE_ASSETS.pollitaRambo.src
      : player.characterId === 'exploradora'
        ? SPRITE_ASSETS.gallinitaExploradora.src
        : SPRITE_ASSETS.pollitoRambo.src;
    // The supplied sheets are handled as sprite sheets, never as standalone images.
    const layout = { columns: 4, rows: 4 };

    ctx.save();
    if (player.invulnerableTimer > 0 && Math.floor(this.animTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    if (player.isGhost) ctx.globalAlpha *= 0.45;
    // Verified on all three uploaded chicken sheets: front/down, back/up,
    // profile facing left, profile facing right. Do not reuse the wrong row order.
    const directionRow: Record<string, number> = { DOWN: 0, UP: 1, LEFT: 2, RIGHT: 3 };
    const direction = directionRow[player.direction] ?? 0;
    const walkFrame = player.isMoving
      ? SpriteManager.frameAt(this.animTimer, layout.columns, 9)
      : 0;
    const frame = direction * layout.columns + walkFrame;
    // Pollita's source sheet has less transparent padding than Pollito Rambo,
    // so use a per-sheet visual scale to keep both characters the same apparent size.
    const characterScale = player.characterId === 'rambo_hembra' ? 1.35 : 1.7;
    const renderSize = TILE_SIZE * characterScale;
    spriteManager.draw(ctx, characterPath, {
      x: x + (TILE_SIZE - renderSize) / 2,
      y: y + TILE_SIZE - renderSize,
      width: renderSize,
      height: renderSize,
      frame,
      layout,
    });
    ctx.restore();
  }

  // 11. TRAPPED / RESCUED ANIMALS (PIGLET, SHEEP, BUNNY)
  private renderAnimals(animals: TrappedAnimal[], isCageUnlocked: boolean) {
    const ctx = this.ctx;

    animals.forEach((animal, idx) => {
      const ax = animal.x * TILE_SIZE + TILE_SIZE / 2;
      let ay = animal.y * TILE_SIZE + 28;

      if (isCageUnlocked) {
        // Jumping in joy!
        const hop = Math.abs(Math.sin(this.animTimer * 10 + idx * 1.5)) * 12;
        ay -= hop;
      }

      ctx.save();
      ctx.translate(ax, ay);

      if (animal.type === 'piglet') {
        // Cute pink piglet
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        // Snout
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.ellipse(0, 2, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.beginPath();
        ctx.arc(-6, -7, 3, 0, Math.PI * 2);
        ctx.arc(6, -7, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (animal.type === 'sheep') {
        // Fluffy white sheep
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.arc(-5, -4, 5, 0, Math.PI * 2);
        ctx.arc(5, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        // Face
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(0, 2, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Bunny
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, 2, 8, 0, Math.PI * 2);
        ctx.fill();
        // Long ears
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(-5, -12, 3, 10);
        ctx.fillRect(2, -12, 3, 10);
      }

      ctx.restore();
    });
  }

  // 12. FLOATING TEXTS (+100, KEY!, ESCUDO!)
  private renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;

    texts.forEach((ft) => {
      const alpha = Math.max(0, 1 - ft.timer / 1.0);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '900 16px "Fredoka", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#1c0e04';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';

      const y = ft.y - (1 - ft.timer / 1.0) * 25;
      ctx.strokeText(ft.text, ft.x, y);
      ctx.fillText(ft.text, ft.x, y);
      ctx.restore();
    });
  }
}
