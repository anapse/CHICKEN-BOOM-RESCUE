export type CellType = 'EMPTY' | 'BRICK_WALL' | 'ROCK_WALL' | 'CRATE' | 'CAGE' | 'CHEST';

export type PickupType =
  | 'NONE'
  | 'KEY'
  | 'COIN'
  | 'HEART'
  | 'POWERUP_DOUBLE_EGG'
  | 'POWERUP_TRIPLE_EGG'
  | 'POWERUP_SPEED'
  | 'POWERUP_GHOST'
  | 'POWERUP_SHIELD'
  | 'POWERUP_REMOTE';

export interface CharacterConfig {
  id: 'rambo_macho' | 'rambo_hembra' | 'exploradora';
  name: string;
  title: string;
  description: string;
  defense: number; // 1-5
  speed: number;   // 1-5
  strength: number;// 1-5
  color: string;
  avatarEmoji: string;
}

export interface PlayerState {
  id: string;
  name: string;
  characterId: 'rambo_macho' | 'rambo_hembra' | 'exploradora';
  gridX: number;
  gridY: number;
  x: number;
  y: number;
  targetGridX: number;
  targetGridY: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  isMoving: boolean;
  lives: number;       // default 3, max 5
  maxLives: number;    // 5
  score: number;
  coins: number;
  inventory: PickupType[];
  hasKey: boolean;
  speedMultiplier: number;
  speedBoostTimer: number;
  isGhost: boolean;
  ghostTimer: number;
  hasShield: boolean;
  shieldTimer: number;
  bombRange: number;   // 1, 2, or 3
  bombStock: number;   // consumable double/triple eggs or normal
  bombType: 'NORMAL' | 'DOUBLE' | 'TRIPLE' | 'REMOTE';
  invulnerableTimer: number;
  isDead: boolean;
}

export interface BombState {
  id: string;
  gridX: number;
  gridY: number;
  ownerId: string;
  range: number;
  isRemote: boolean;
  timer: number;       // ~2.0s
  detonated: boolean;
  pulsate: number;
}

export interface ExplosionCell {
  gridX: number;
  gridY: number;
  isCenter: boolean;
  direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'CENTER';
}

export interface ExplosionState {
  id: string;
  cells: ExplosionCell[];
  timer: number;       // 0.4s duration
}

export interface EnemyState {
  id: string;
  type: 'fox';
  gridX: number;
  gridY: number;
  x: number;
  y: number;
  targetGridX: number;
  targetGridY: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  isMoving: boolean;
  speed: number;
  isDead: boolean;
  deathTimer: number;
  animFrame: number;
}

export interface ItemPickup {
  id: string;
  gridX: number;
  gridY: number;
  type: PickupType;
  bobOffset: number;
}

export interface TrappedAnimal {
  id: string;
  name: string;
  type: 'piglet' | 'sheep' | 'bunny';
  isRescued: boolean;
  x: number;
  y: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  timer: number;
}

export type GameStatus =
  | 'menu'
  | 'name_input'
  | 'character_select'
  | 'playing'
  | 'paused'
  | 'victory'
  | 'gameover'
  | 'ranking'
  | 'contact'
  | 'how_to_play'
  | 'multiplayer_lobby'
  | 'admin'
  | 'sprite_debug';

export type GameMode = 'single' | 'multiplayer';
