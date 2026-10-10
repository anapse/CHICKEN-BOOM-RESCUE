import { EXPLOSION_DURATION, GRID_COLS, GRID_ROWS, TILE_SIZE } from './constants';
import { spriteManager } from './SpriteManager';
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

    // Camera transform: shift by cameraX
    ctx.translate(-cameraX, 0);

    // 1. Render Ground Background
    this.renderGround(GRID_COLS, GRID_ROWS);

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
  }

  // LUSH FARM/ISLAND GROUND
  private renderGround(cols: number, rows: number) {
    const ctx = this.ctx;
    const totalW = cols * TILE_SIZE;
    const totalH = rows * TILE_SIZE;

    // Check if user has uploaded fondojuego.png to public/sprites/
    const bgImg = getAssetImage('./sprites/fondojuego.png') || getAssetImage('./fondojuego.png');
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
          ctx.arc(x + 24, y + 24, 18, 0, Math.PI * 2);
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
          this.drawBrickWall(px, py);
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

  // 1. SOLID BRICK PERIMETER WALL
  private drawBrickWall(x: number, y: number) {
    const ctx = this.ctx;
    const sprite = getAssetImage('./sprites/ladrillo.png') || getAssetImage('./ladrillo.png');
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, x, y, TILE_SIZE, TILE_SIZE);
      return;
    }

    ctx.fillStyle = '#7c2d12'; // Rich brick red
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Bevel highlights & shadow
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y, TILE_SIZE, 4);
    ctx.fillRect(x, y, 4, TILE_SIZE);

    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
    ctx.fillRect(x + TILE_SIZE - 4, y, 4, TILE_SIZE);

    // Mortar lines
    ctx.fillStyle = '#292524';
    ctx.fillRect(x, y + 15, TILE_SIZE, 2);
    ctx.fillRect(x, y + 31, TILE_SIZE, 2);

    ctx.fillRect(x + 24, y, 2, 15);
    ctx.fillRect(x + 12, y + 17, 2, 14);
    ctx.fillRect(x + 36, y + 17, 2, 14);
    ctx.fillRect(x + 24, y + 33, 2, 15);
  }

  // 2. INDIVIDUAL ROCK SPRITE WALLS (indestructible stone maze)
  private drawRockWall(x: number, y: number, gx: number, gy: number) {
    const ctx = this.ctx;
    const variation = (gx * 13 + gy * 7) % 3;

    const rockSprite = getAssetImage(`./sprites/roca${variation + 1}.png`) || getAssetImage('./sprites/roca.png') || getAssetImage('./roca.png');
    if (rockSprite && rockSprite.complete && rockSprite.naturalWidth > 0) {
      ctx.drawImage(rockSprite, x, y, TILE_SIZE, TILE_SIZE);
      return;
    }

    // Rock base
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, 8);
    ctx.fill();

    // 3D stone bevel
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, TILE_SIZE - 6, 8, 4);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + TILE_SIZE - 10, TILE_SIZE - 8, 7, 3);
    ctx.fill();

    // Stone cracks & highlights
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (variation === 0) {
      ctx.moveTo(x + 12, y + 8);
      ctx.lineTo(x + 20, y + 22);
      ctx.lineTo(x + 16, y + 38);
      ctx.moveTo(x + 20, y + 22);
      ctx.lineTo(x + 34, y + 28);
    } else if (variation === 1) {
      ctx.moveTo(x + 34, y + 10);
      ctx.lineTo(x + 24, y + 24);
      ctx.lineTo(x + 30, y + 40);
    } else {
      ctx.moveTo(x + 10, y + 24);
      ctx.lineTo(x + 38, y + 22);
      ctx.moveTo(x + 24, y + 10);
      ctx.lineTo(x + 26, y + 38);
    }
    ctx.stroke();

    // Little moss touch
    ctx.fillStyle = '#65a30d';
    ctx.beginPath();
    ctx.arc(x + 10, y + 38, 4, 0, Math.PI * 2);
    ctx.arc(x + 38, y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. WOODEN CRATE (Destructible)
  private drawWoodenCrate(x: number, y: number) {
    const ctx = this.ctx;
    const crateSprite = getAssetImage('./sprites/caja.png') || getAssetImage('./caja.png');
    if (crateSprite && crateSprite.complete && crateSprite.naturalWidth > 0) {
      ctx.drawImage(crateSprite, x, y, TILE_SIZE, TILE_SIZE);
      return;
    }

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + TILE_SIZE - 6, TILE_SIZE - 8, 6, 3);
    ctx.fill();

    // Wood body
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6, 6);
    ctx.fill();

    // Inner panel
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(x + 7, y + 7, TILE_SIZE - 14, TILE_SIZE - 14, 4);
    ctx.fill();

    // Wooden Cross Bracing (X)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 8);
    ctx.lineTo(x + TILE_SIZE - 8, y + TILE_SIZE - 8);
    ctx.moveTo(x + TILE_SIZE - 8, y + 8);
    ctx.lineTo(x + 8, y + TILE_SIZE - 8);
    ctx.stroke();

    // Border frame
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);

    // Corner metal rivets
    ctx.fillStyle = '#fef08a';
    const corners = [
      [x + 7, y + 7],
      [x + TILE_SIZE - 7, y + 7],
      [x + 7, y + TILE_SIZE - 7],
      [x + TILE_SIZE - 7, y + TILE_SIZE - 7],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.arc(x + 24, y + 24, 28, 0, Math.PI * 2);
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
      ctx.lineTo(x + 24, y + 2);
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
      ctx.arc(x + 24, y + 22, 4, Math.PI, 0);
      ctx.stroke();

      if (hasKey) {
        // Glowing keyhole
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 24, y + 26, 1.5, 0, Math.PI * 2);
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
    ctx.arc(x + 24, y + 24, 26, 0, Math.PI * 2);
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
    const tx = x + 24;
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
      const px = item.gridX * TILE_SIZE + 24;
      const bob = Math.sin(this.animTimer * 5 + item.bobOffset) * 4;
      const py = item.gridY * TILE_SIZE + 24 + bob;

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
    // Badge background
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(x - 14, y - 14, 28, 28, 6);
    ctx.fill();

    // Mini egg
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x - 4, y, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Number text
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`x${count}`, x + 6, y);
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
      const bx = bomb.gridX * TILE_SIZE + 24;
      const by = bomb.gridY * TILE_SIZE + 26;

      // Pulsate scale right before detonation
      const urgency = 1 - bomb.timer / 2.0;
      const pulseRate = urgency > 0.6 ? 25 : 12;
      const scale = 1 + Math.sin(this.animTimer * pulseRate) * (0.08 + urgency * 0.12);

      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(scale, scale);

      // Egg shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Egg Body (White/Cream cartoon egg)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 2, 13, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Egg shading
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(3, 4, 9, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Red Polka Dots (matching the reference art "huevos con mecha")
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-5, -3, 3.5, 0, Math.PI * 2);
      ctx.arc(4, 5, 4, 0, Math.PI * 2);
      ctx.arc(-3, 10, 3, 0, Math.PI * 2);
      ctx.arc(6, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Outer outline
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 2, 13, 16, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Metal fuse collar
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-3, -16, 6, 4);

      // Curved fuse rope
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.quadraticCurveTo(8, -20, 6, -26);
      ctx.stroke();

      // Burning Sparkle / Flame
      const sparkFlicker = Math.random() * 3;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(6, -26, 4 + sparkFlicker, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(6, -26, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // If remote, draw antenna glow
      if (bomb.isRemote) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(0, 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // 8. EXPLOSIONS (STRICTLY CROSS + SHAPE)
  private renderExplosions(explosions: ExplosionState[]) {
    const ctx = this.ctx;

    explosions.forEach((exp) => {
      const progress = 1 - exp.timer / EXPLOSION_DURATION; // 0 -> 1

      exp.cells.forEach((cell) => {
        const cx = cell.gridX * TILE_SIZE + 24;
        const cy = cell.gridY * TILE_SIZE + 24;

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

    enemies.forEach((enemy) => {
      const ex = enemy.x * TILE_SIZE + 24;
      const ey = enemy.y * TILE_SIZE + 26;

      ctx.save();
      ctx.translate(ex, ey);

      if (enemy.isDead) {
        // Death spin & poof
        const fade = Math.max(0, 1 - enemy.deathTimer / 0.6);
        ctx.rotate(enemy.deathTimer * 12);
        ctx.scale(fade, fade);
        ctx.globalAlpha = fade;
      }

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy Fox Tail (waving)
      const tailWiggle = Math.sin(this.animTimer * 8) * 4;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(-12 + tailWiggle, 4, 8, 14, -0.6, 0, Math.PI * 2);
      ctx.fill();
      // White tail tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-16 + tailWiggle, -2, 4, 6, -0.6, 0, Math.PI * 2);
      ctx.fill();

      // Bipedal Legs & little black boots
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-7, 10, 5, 6);
      ctx.fillRect(2, 10, 5, 6);

      // Body (Orange with white chest fur)
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, 4, 11, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // White chest
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 4, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fox Head
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, -7, 12, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pointy Ears
      // Left ear
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-11, -12);
      ctx.lineTo(-8, -23);
      ctx.lineTo(-2, -15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1e293b'; // dark ear tip
      ctx.beginPath();
      ctx.moveTo(-9, -17);
      ctx.lineTo(-8, -23);
      ctx.lineTo(-5, -19);
      ctx.closePath();
      ctx.fill();

      // Right ear
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(11, -12);
      ctx.lineTo(8, -23);
      ctx.lineTo(2, -15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(9, -17);
      ctx.lineTo(8, -23);
      ctx.lineTo(5, -19);
      ctx.closePath();
      ctx.fill();

      // White Muzzle / cheeks
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-9, -5);
      ctx.lineTo(0, 0);
      ctx.lineTo(9, -5);
      ctx.lineTo(0, -1);
      ctx.closePath();
      ctx.fill();

      // Black cute nose
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, -2, 2.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cheeky sly eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(-5, -8, 2, 3, 0.15, 0, Math.PI * 2);
      ctx.ellipse(5, -8, 2, 3, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -9, 1, 1);
      ctx.fillRect(4, -9, 1, 1);

      ctx.restore();
    });
  }

  // 10. PLAYER CHARACTERS (POLLITO RAMBO / POLLITA / EXPLORADORA)
  private renderPlayer(player: PlayerState) {
    const ctx = this.ctx;
    const px = player.x * TILE_SIZE + 24;
    const py = player.y * TILE_SIZE + 26;

    ctx.save();
    ctx.translate(px, py);

    // Invulnerability flash
    if (player.invulnerableTimer > 0) {
      const flash = Math.floor(this.animTimer * 20) % 2 === 0;
      if (flash) ctx.globalAlpha = 0.4;
    }

    // Ghost transparency
    if (player.isGhost) {
      ctx.globalAlpha = 0.45;
      // Ghostly purple-cyan aura
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield Aura
    if (player.hasShield) {
      const shieldPulse = Math.sin(this.animTimer * 8) * 3;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 22 + shieldPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Little orange chick feet
    const walkBob = player.isMoving ? Math.sin(this.animTimer * 16) * 2 : 0;
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-8, 11 + walkBob, 6, 4);
    ctx.fillRect(2, 11 - walkBob, 6, 4);

    // Chubby White Chick Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 2, 13, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Little wings
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(-12, 3, 4, 7, 0.3, 0, Math.PI * 2);
    ctx.ellipse(12, 3, 4, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Character Accessories:
    if (player.characterId === 'rambo_macho') {
      // 1. Macho Rambo: Military ammo bandolier belt
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-11, -4);
      ctx.lineTo(9, 10);
      ctx.lineTo(12, 8);
      ctx.lineTo(-8, -6);
      ctx.closePath();
      ctx.fill();
      // Ammo cartridges
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-3, 0, 3, 5);
      ctx.fillRect(2, 4, 3, 5);

      // RED RAMBO BANDANA around forehead
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-12, -10, 24, 6, 2);
      ctx.fill();
      // Bandana tails fluttering behind
      const bandWave = Math.sin(this.animTimer * 10) * 3;
      ctx.beginPath();
      ctx.moveTo(-11, -8);
      ctx.lineTo(-20 + bandWave, -12);
      ctx.lineTo(-18 + bandWave, -4);
      ctx.closePath();
      ctx.fill();
    } else if (player.characterId === 'rambo_hembra') {
      // 2. Pollita Comando: Pink/Magenta bandana & tactical collar
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.roundRect(-12, -10, 24, 6, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-11, -8);
      ctx.lineTo(-19, -11);
      ctx.lineTo(-17, -4);
      ctx.closePath();
      ctx.fill();
    } else {
      // 3. Gallinita Exploradora: Safari hat & Glasses
      ctx.fillStyle = '#b45309';
      // Hat brim
      ctx.beginPath();
      ctx.ellipse(0, -10, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hat dome
      ctx.beginPath();
      ctx.arc(0, -12, 9, Math.PI, 0);
      ctx.fill();

      // Glasses
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(-9, -4, 7, 6);
      ctx.strokeRect(2, -4, 7, 6);
      ctx.beginPath();
      ctx.moveTo(-2, -1);
      ctx.lineTo(2, -1);
      ctx.stroke();
    }

    // Yellow Beak
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Expressive Eyes with determined eyebrows
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-5, -3, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -4, 1.2, 1.2);
    ctx.fillRect(4, -4, 1.2, 1.2);

    // Red chicken comb atop head
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -13, 3.5, 0, Math.PI * 2);
    ctx.arc(4, -12, 3, 0, Math.PI * 2);
    ctx.arc(-4, -12, 3, 0, Math.PI * 2);
    ctx.fill();

    // Red beard wattle under beak
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 6, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 11. TRAPPED / RESCUED ANIMALS (PIGLET, SHEEP, BUNNY)
  private renderAnimals(animals: TrappedAnimal[], isCageUnlocked: boolean) {
    const ctx = this.ctx;

    animals.forEach((animal, idx) => {
      const ax = animal.x * TILE_SIZE + 24;
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
