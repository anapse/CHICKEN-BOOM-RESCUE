import type { SpriteSheetLayout } from './SpriteManager';

/**
 * Source-of-truth asset paths and only those frame grids currently supported by
 * the asset filenames/spec. Unknown grids remain undefined until the PNG is inspected.
 */
export const SPRITE_ASSETS = {
  menuBackground: { src: './sprites/fondomenu.png', role: 'menu-background' },
  gameBackground: { src: './sprites/fondojuego.png', role: 'game-ground-texture' },
  logo: { src: './sprites/logo.png', role: 'menu-logo' },
  pollitoRambo: { src: './sprites/Hoja de sprites del pollito comando.png', role: 'playable-character', layout: undefined as SpriteSheetLayout | undefined },
  pollitaRambo: {
    src: './sprites/pollita-movimiento-4x4-transparente.png',
    role: 'playable-character',
    // Filename indicates 4×4; verify exact cell edges before final animation wiring.
    layout: { columns: 4, rows: 4 } satisfies SpriteSheetLayout,
  },
  gallinitaExploradora: { src: './sprites/Sprite de explorador pollo animado.png', role: 'playable-character', layout: undefined as SpriteSheetLayout | undefined },
  foxEnemy: { src: './sprites/Hoja de sprites del zorro bandido.png', role: 'enemy', layout: undefined as SpriteSheetLayout | undefined },
  animalSheet: { src: './sprites/Cuadrícula de animales felices y tristes.png', role: 'rescue-animals', layout: undefined as SpriteSheetLayout | undefined },
  iconSheet: { src: './sprites/Hoja de iconos de juego brillantes.png', role: 'ui-powerup-icons', layout: undefined as SpriteSheetLayout | undefined },
  coinRewardSheet: { src: './sprites/Hoja de sprites de monedas y explosiones.png', role: 'rewards-and-effects', layout: undefined as SpriteSheetLayout | undefined },
  crossExplosion: {
    src: './sprites/explosion-cruz-4x4-fondo-transparente.png',
    role: 'explosion-effect',
    // Filename indicates 4×4; verify exact cell edges and each frame's meaning first.
    layout: { columns: 4, rows: 4 } satisfies SpriteSheetLayout,
  },
  woodStoneTiles: { src: './sprites/Baldosa de madera y piedra.png', role: 'terrain-tiles', layout: undefined as SpriteSheetLayout | undefined },
} as const;
