# Sprite integration audit

This is a source/code audit, not a claim that the PNGs have been visually inspected.

## Confirmed present in `public/sprites/`

See [SPRITE-INVENTORY.md](./SPRITE-INVENTORY.md). In particular, `logo.png` and `fondojuego.png` exist and should be reused.

## Current renderer still requests separate files that are absent from the sprite folder

The current renderer contains these direct paths:
- `sprites/ladrillo.png` and `ladrillo.png` — perimeter brick tile.
- `sprites/roca1.png`, `roca2.png`, `roca3.png`, `roca.png`, and `roca.png` — indestructible rock variants.
- `sprites/caja.png` and `caja.png` — destructible wooden crate.

Those individual files are not present in the verified `public/sprites/` directory. They may be obtainable as crops from `Baldosa de madera y piedra.png`, but the sheet must be visually inspected and its exact crop rectangles recorded before wiring it in.

## Visuals still drawn procedurally in renderer.ts

Code currently draws fallback shapes for the player, fox, rescued animals, cage, trophy chest, pickups, bombs and explosions. This is existing code, not confirmed sprite integration. The master prompt says not to invent substitute art when required source art is missing; replace these paths only when a matching existing sprite and verified crop are identified. Keep game rules untouched during visual replacement.

## Assets that need visual inspection before integration

- `Hoja de sprites del pollito comando.png`: cell layout, directions, idle/walk frames.
- `pollita-movimiento-4x4-transparente.png`: confirm the 4×4 cells are equal and map directional frames.
- `Sprite de explorador pollo animado.png`: frame layout and direction order.
- `Hoja de sprites del zorro bandido.png`: enemy directions, walk/death states.
- `Cuadrícula de animales felices y tristes.png`: identify species, happy/sad state and crop bounds.
- `Hoja de iconos de juego brillantes.png`: map icons to existing power-up IDs without changing gameplay.
- `Hoja de sprites de monedas y explosiones.png`: separate coin/reward frames from effect frames.
- `explosion-cruz-4x4-fondo-transparente.png`: confirm cells, transparency, center/end/cap semantics and frame order.
- `Baldosa de madera y piedra.png`: map ground/wood/stone tiles; do not assume a uniform grid until checked.
- Four timestamped `Imagen de ChatGPT ...png` files: classify as references or runtime assets; do not integrate blindly.

## Rules for implementation

1. Use `SpriteManager` for image loading/cache/status/crop/frame timing.
2. Keep the original PNGs unchanged.
3. Do not use a full sprite sheet squashed into a character-sized box.
4. Do not set unknown grid dimensions by guess.
5. Do not let visual animation alter the engine's collision or damage timing.
6. Keep the zorro as an enemy only; playable selection is limited to Pollito Rambo, Pollita Rambo and Gallinita Exploradora.
7. Run `npm run lint` and `npm run build` before merge.

## Additional verified missing files

- `public/sonidos/musica_menu.mp3` — requested menu music file is not present in the public tree.
- `public/sonidos/musica_juego.mp3` — requested gameplay music file is not present in the public tree.

`src/audio/soundManager.ts` attempts to load those two files and falls back to synthesized Web Audio music if loading fails. This is existing behavior; the master prompt's no-substitute rule needs a decision before replacing/removing that fallback. No audio files were fabricated.

## Map and audio fixes added in this branch

- Objective approach cells are cleared and a route is carved by removing only indestructible rocks from the route; destructible crates remain in place.
- The key is guaranteed to be in a crate.
- Multiplayer maps no longer spawn the three single-player rescue animals without their cage.
- `scripts/check-map-generation.ts` checks 200 random maps per mode. CI runs this check before production build.
- `src/audio/soundManager.ts` invalidates stale audio promises to prevent an old music request from starting a second track after the user changes/stops music.
