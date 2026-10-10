import assert from 'node:assert/strict';
import { GRID_COLS, GRID_ROWS } from '../src/game/constants';
import { generateGameMap } from '../src/game/mapGenerator';

function isReachable(grid: ReturnType<typeof generateGameMap>['grid'], start: { x: number; y: number }, target: { x: number; y: number }) {
  const queue = [start];
  const visited = new Set([start.x + ',' + start.y]);
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length) {
    const current = queue.shift()!;
    if (current.x === target.x && current.y === target.y) return true;
    for (const [dx, dy] of directions) {
      const x = current.x + dx, y = current.y + dy;
      if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) continue;
      const key = x + ',' + y;
      if (visited.has(key)) continue;
      const cell = grid[y][x];
      if (cell === 'BRICK_WALL' || cell === 'ROCK_WALL') continue;
      visited.add(key);
      queue.push({ x, y });
    }
  }
  return false;
}

for (const mode of ['single', 'multiplayer'] as const) {
  for (let run = 0; run < 200; run++) {
    const map = generateGameMap(mode);
    const { grid, keyLocation, cageLocation, chestLocation, hiddenPickups, trappedAnimals } = map;
    const target = mode === 'single' ? cageLocation : chestLocation;
    const expectedObjective = mode === 'single' ? 'CAGE' : 'CHEST';

    assert.equal(grid.length, GRID_ROWS, `${mode} run ${run}: row count`);
    assert(grid.every((row) => row.length === GRID_COLS), `${mode} run ${run}: column count`);
    assert(grid[0].every((cell) => cell === 'BRICK_WALL'), `${mode} run ${run}: top border`);
    assert(grid[GRID_ROWS - 1].every((cell) => cell === 'BRICK_WALL'), `${mode} run ${run}: bottom border`);
    assert(grid.every((row) => row[0] === 'BRICK_WALL' && row[GRID_COLS - 1] === 'BRICK_WALL'), `${mode} run ${run}: side borders`);
    assert.equal(grid[keyLocation.y][keyLocation.x], 'CRATE', `${mode} run ${run}: key must be inside a crate`);
    assert.equal(hiddenPickups.get(`${keyLocation.x},${keyLocation.y}`), 'KEY', `${mode} run ${run}: key pickup`);
    assert.equal(grid[target.y][target.x], expectedObjective, `${mode} run ${run}: correct objective`);
    assert(isReachable(grid, { x: 1, y: 1 }, keyLocation), `${mode} run ${run}: key route`);
    assert(isReachable(grid, keyLocation, target), `${mode} run ${run}: objective route`);

    const adjacent = [
      grid[target.y][target.x - 1], grid[target.y][target.x + 1],
      grid[target.y - 1][target.x], grid[target.y + 1][target.x],
    ];
    assert(adjacent.some((cell) => cell === 'EMPTY'), `${mode} run ${run}: objective must have an approach`);
    assert.equal(trappedAnimals.length, mode === 'single' ? 3 : 0, `${mode} run ${run}: animals belong to single-player only`);
  }
}
console.log('Map generation checks passed: 200 single-player maps and 200 multiplayer maps.');
