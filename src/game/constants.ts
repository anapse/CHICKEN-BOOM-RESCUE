import { CharacterConfig } from './types';

export const TILE_SIZE = 96; // Double every map cell and render each tile sprite at 200% scale.
export const SCREEN_COLS = 11;
export const TOTAL_SCREENS = 3;
export const GRID_COLS = SCREEN_COLS * TOTAL_SCREENS; // 33 columns
export const GRID_ROWS = 17; // 17 rows

export const DEFAULT_GAME_TIME_SECONDS = 300; // 5 minutes
export const BOMB_FUSE_SECONDS = 2.0;
export const EXPLOSION_DURATION = 0.45;
export const SHIELD_DURATION = 8.0;
export const GHOST_DURATION = 10.0;
export const SPEED_BOOST_DURATION = 10.0;
export const PLAYER_INVULNERABLE_DURATION = 1.8;

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'rambo_macho',
    name: 'Pollito Rambo',
    title: 'Héroe de la Granja',
    description: 'Valiente y aguerrido. Equipado con su clásica bandana roja y cartuchera. Ideal para el combate explosivo directo.',
    defense: 3,
    speed: 3,
    strength: 4,
    color: '#ef4444',
    avatarEmoji: '🐔',
  },
  {
    id: 'rambo_hembra',
    name: 'Pollita Comando',
    title: 'Furia Plumífera',
    description: 'Ágil, decidida y con gran reflejo táctico. Capaz de sortear trampas y colocar bombas a toda velocidad.',
    defense: 3,
    speed: 4,
    strength: 3,
    color: '#ec4899',
    avatarEmoji: '🐥',
  },
  {
    id: 'exploradora',
    name: 'Gallinita Scout',
    title: 'Ojo Avizor',
    description: 'Curiosa, previsora y equipada con lentes y brújula. Mayor resistencia a impactos y excelente rastreo de llaves.',
    defense: 4,
    speed: 4,
    strength: 2,
    color: '#eab308',
    avatarEmoji: '🐣',
  },
];

export const CONTACT_EMAIL = 'anapsep_video@hotmail.com';
