import { GRID_COLS, GRID_ROWS } from './constants';
import { CellType, EnemyState, ItemPickup, PickupType, TrappedAnimal } from './types';

export interface GeneratedMap {
  grid: CellType[][];
  hiddenPickups: Map<string, PickupType>; // key: `${x},${y}`
  initialPickups: ItemPickup[];
  enemies: EnemyState[];
  trappedAnimals: TrappedAnimal[];
  keyLocation: { x: number; y: number };
  cageLocation: { x: number; y: number };
  chestLocation: { x: number; y: number };
}

/** Clear only indestructible rocks along a deterministic route. Crates remain
 * destructible, so this guarantees a route without bypassing the crate mechanic. */
function carveRockCorridor(
  grid: CellType[][],
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  let x = from.x;
  let y = from.y;
  const clearRock = (cx: number, cy: number) => {
    if (grid[cy]?.[cx] === 'ROCK_WALL') grid[cy][cx] = 'EMPTY';
  };

  while (x !== to.x) {
    x += Math.sign(to.x - x);
    clearRock(x, y);
  }
  while (y !== to.y) {
    y += Math.sign(to.y - y);
    clearRock(x, y);
  }
}

function clearObjectiveApproach(
  grid: CellType[][],
  safeCells: Set<string>,
  objective: { x: number; y: number },
) {
  const neighbors = [
    { x: objective.x - 1, y: objective.y },
    { x: objective.x + 1, y: objective.y },
    { x: objective.x, y: objective.y - 1 },
    { x: objective.x, y: objective.y + 1 },
  ];
  for (const cell of neighbors) {
    if (cell.x <= 0 || cell.x >= GRID_COLS - 1 || cell.y <= 0 || cell.y >= GRID_ROWS - 1) continue;
    grid[cell.y][cell.x] = 'EMPTY';
    safeCells.add(`${cell.x},${cell.y}`);
  }
}

export function generateGameMap(mode: 'single' | 'multiplayer' = 'single'): GeneratedMap {
  // Initialize grid with EMPTY
  const grid: CellType[][] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    const row: CellType[] = [];
    for (let x = 0; x < GRID_COLS; x++) {
      row.push('EMPTY');
    }
    grid.push(row);
  }

  // 1. Perimeter border of SOLID BRICK
  for (let x = 0; x < GRID_COLS; x++) {
    grid[0][x] = 'BRICK_WALL';
    grid[GRID_ROWS - 1][x] = 'BRICK_WALL';
  }
  for (let y = 0; y < GRID_ROWS; y++) {
    grid[y][0] = 'BRICK_WALL';
    grid[y][GRID_COLS - 1] = 'BRICK_WALL';
  }

  // 2. Internal Rock Walls (Indestructible maze pillars like classic Bomberman on even x/even y)
  for (let y = 2; y < GRID_ROWS - 2; y += 2) {
    for (let x = 2; x < GRID_COLS - 2; x += 2) {
      grid[y][x] = 'ROCK_WALL';
    }
  }

  // Add occasional organic rock clusters for visual variety
  for (let i = 0; i < 16; i++) {
    const rx = Math.floor(Math.random() * (GRID_COLS - 6)) + 3;
    const ry = Math.floor(Math.random() * (GRID_ROWS - 4)) + 2;
    // Don't block key spawn areas
    if (rx > 3 && rx < GRID_COLS - 4 && grid[ry][rx] === 'EMPTY') {
      if (Math.random() < 0.35) {
        grid[ry][rx] = 'ROCK_WALL';
      }
    }
  }

  // Safe zones for player spawn (Player 1 starts at x: 1, y: 1)
  const safeCells = new Set<string>([
    '1,1', '1,2', '2,1', // P1 spawn & immediate exit
    '1,15', '1,14', '2,15', // Alternate corner
  ]);

  if (mode === 'multiplayer') {
    // Player 2 starts at bottom-left or top-right
    safeCells.add('31,1');
    safeCells.add('31,2');
    safeCells.add('30,1');
  }

  // Fixed Objectives:
  // Screen 1: cols 0-10
  // Screen 2: cols 11-21 -> Central Chest Location
  // Screen 3: cols 22-32 -> Final Cage Location
  const cageLocation = { x: 29, y: 8 };
  const chestLocation = { x: 16, y: 8 };

  if (mode === 'single') {
    grid[cageLocation.y][cageLocation.x] = 'CAGE';
    clearObjectiveApproach(grid, safeCells, cageLocation);
  } else {
    grid[chestLocation.y][chestLocation.x] = 'CHEST';
    clearObjectiveApproach(grid, safeCells, chestLocation);
  }

  // 3. Wooden Crates (Destructible obstacles)
  const candidateCrateCells: Array<{ x: number; y: number }> = [];
  for (let y = 1; y < GRID_ROWS - 1; y++) {
    for (let x = 1; x < GRID_COLS - 1; x++) {
      const key = `${x},${y}`;
      if (grid[y][x] === 'EMPTY' && !safeCells.has(key)) {
        // High density of crates (approx 55% chance)
        if (Math.random() < 0.55) {
          grid[y][x] = 'CRATE';
          candidateCrateCells.push({ x, y });
        }
      }
    }
  }

  // 4. Distribute Hidden Items inside Crates
  const hiddenPickups = new Map<string, PickupType>();

  // Ensure at least 1 crate has the KEY!
  let keyLocation = { x: 10, y: 5 };
  if (candidateCrateCells.length > 0) {
    // Choose a crate that is reasonably far (e.g. in screen 2 or screen 1 deep)
    const midOrDeepCrates = candidateCrateCells.filter(c => c.x >= 7 && c.x <= 24);
    const chosenCrate = midOrDeepCrates.length > 0
      ? midOrDeepCrates[Math.floor(Math.random() * midOrDeepCrates.length)]
      : candidateCrateCells[Math.floor(Math.random() * candidateCrateCells.length)];

    keyLocation = { x: chosenCrate.x, y: chosenCrate.y };
    hiddenPickups.set(`${chosenCrate.x},${chosenCrate.y}`, 'KEY');
  } else {
    // Defensive fallback: always place a destructible crate containing the key.
    keyLocation = { x: 10, y: 5 };
    grid[keyLocation.y][keyLocation.x] = 'CRATE';
    candidateCrateCells.push(keyLocation);
    hiddenPickups.set(`${keyLocation.x},${keyLocation.y}`, 'KEY');
  }

  // Guarantee a traversable route from spawn to the key crate and then to the
  // mode-specific objective. Crates still block until destroyed; only rocks are cleared.
  const objective = mode === 'single' ? cageLocation : chestLocation;
  carveRockCorridor(grid, { x: 1, y: 1 }, keyLocation);
  carveRockCorridor(grid, keyLocation, objective);

  // Other pickups inside crates
  candidateCrateCells.forEach(c => {
    const coordKey = `${c.x},${c.y}`;
    if (coordKey === `${keyLocation.x},${keyLocation.y}`) return;

    const r = Math.random();
    if (r < 0.12) {
      hiddenPickups.set(coordKey, 'COIN');
    } else if (r < 0.18) {
      hiddenPickups.set(coordKey, 'POWERUP_DOUBLE_EGG');
    } else if (r < 0.23) {
      hiddenPickups.set(coordKey, 'POWERUP_TRIPLE_EGG');
    } else if (r < 0.29) {
      hiddenPickups.set(coordKey, 'POWERUP_SPEED');
    } else if (r < 0.34) {
      hiddenPickups.set(coordKey, 'POWERUP_SHIELD');
    } else if (r < 0.38) {
      hiddenPickups.set(coordKey, 'POWERUP_GHOST');
    } else if (r < 0.42) {
      hiddenPickups.set(coordKey, 'POWERUP_REMOTE');
    } else if (r < 0.46) {
      hiddenPickups.set(coordKey, 'HEART');
    }
  });

  // 5. Spawn Enemies (Anthropomorphic Foxes)
  // Foxes are distributed across screen 1, 2, and 3
  const enemies: EnemyState[] = [];
  const emptyWalkableCells: Array<{ x: number; y: number }> = [];

  for (let y = 1; y < GRID_ROWS - 1; y++) {
    for (let x = 4; x < GRID_COLS - 2; x++) {
      if (grid[y][x] === 'EMPTY' && !safeCells.has(`${x},${y}`)) {
        emptyWalkableCells.push({ x, y });
      }
    }
  }

  // Spawn 6 to 9 foxes
  const foxCount = 7;
  for (let i = 0; i < foxCount && emptyWalkableCells.length > 0; i++) {
    const idx = Math.floor(Math.random() * emptyWalkableCells.length);
    const pos = emptyWalkableCells.splice(idx, 1)[0];
    const dirs: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    enemies.push({
      id: `fox_${i + 1}`,
      type: 'fox',
      gridX: pos.x,
      gridY: pos.y,
      x: pos.x,
      y: pos.y,
      targetGridX: pos.x,
      targetGridY: pos.y,
      direction: dirs[Math.floor(Math.random() * dirs.length)],
      isMoving: false,
      speed: 1.25,
      isDead: false,
      deathTimer: 0,
      animFrame: 0,
    });
  }

  // 6. Trapped animals belong only to the single-player cage objective.
  // Multiplayer uses the central chest/trophy and must not show a stray cage group.
  const trappedAnimals: TrappedAnimal[] = mode === 'single' ? [
    { id: 'piglet', name: 'Chanchito Barnie', type: 'piglet', isRescued: false, x: cageLocation.x, y: cageLocation.y },
    { id: 'sheep', name: 'Ovejita Lana', type: 'sheep', isRescued: false, x: cageLocation.x + 0.3, y: cageLocation.y },
    { id: 'bunny', name: 'Conejito Saltón', type: 'bunny', isRescued: false, x: cageLocation.x - 0.3, y: cageLocation.y },
  ] : [];

  return {
    grid,
    hiddenPickups,
    initialPickups: [],
    enemies,
    trappedAnimals,
    keyLocation,
    cageLocation,
    chestLocation,
  };
}
