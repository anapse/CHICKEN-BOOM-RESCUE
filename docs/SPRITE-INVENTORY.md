# Sprite inventory — Chicken Boom Rescue

Inventory of the existing files in `public/sprites/`. Names and file presence are verified against the repository tree. Pixel dimensions, per-pixel alpha, frame bounds and actual cell spacing still need a local image inspection pass; they are intentionally not guessed here.

| File | Intended use | Grid/crop status | Integration status |
|---|---|---|---|
| `Baldosa de madera y piedra.png` | Terrain/floor tiles, wood and stone decoration | Unverified: identify each tile boundary before cropping | Pending crop map |
| `Cuadrícula de animales felices y tristes.png` | Rescued/trapped farm animals | Unverified: identify species, states and cell bounds | Pending |
| `Hoja de iconos de juego brillantes.png` | UI/power-up icon source | Unverified: identify each icon and its exact bounds | Pending |
| `Hoja de sprites de monedas y explosiones.png` | Coins/reward and explosion art | Unverified: separate reward frames from effect frames | Pending |
| `Hoja de sprites del pollito comando.png` | Pollito Rambo playable character | Unverified: frame directions and animation order | Pending |
| `Hoja de sprites del zorro bandido.png` | Fox enemy animation | Unverified: frame directions and animation order | Pending |
| `Imagen de ChatGPT 10 oct 2026, 15_49_43.png` | Unclassified reference/source image | Must identify content before runtime use | Reference only |
| `Imagen de ChatGPT 10 oct 2026, 15_49_56.png` | Unclassified reference/source image | Must identify content before runtime use | Reference only |
| `Imagen de ChatGPT 10 oct 2026, 15_50_04.png` | Unclassified reference/source image | Must identify content before runtime use | Reference only |
| `Imagen de ChatGPT 10 oct 2026, 15_50_11.png` | Unclassified reference/source image | Must identify content before runtime use | Reference only |
| `Sprite de explorador pollo animado.png` | Gallinita exploradora playable character | Unverified: frame directions and animation order | Pending |
| `explosion-cruz-4x4-fondo-transparente.png` | Cross-explosion visual frames | Filename indicates 4×4; verify equal cells and transparent pixels before drawing | Crop API available; not yet wired to gameplay effects |
| `fondojuego.png` | Gameplay ground/background texture | Whole image; tiling suitability needs visual check | Renderer already references it |
| `fondomenu.png` | Main-menu background | Whole image | Start screen already references it |
| `logo.png` | Main-menu logo | Whole image | Start screen already references it |
| `pollita-movimiento-4x4-transparente.png` | Pollita Rambo movement animation | Filename indicates 4×4; verify exact frame boundaries before use | Crop API available; not yet wired to character renderer |

## Rules for the next integration pass

- Do not regenerate, redraw, resize destructively, or overwrite source art.
- Do not assign a grid to a sheet based only on its filename unless it is then verified against the image.
- Keep reference images out of runtime until their role is identified.
- Use `SpriteManager` for load/cache/crop/frame timing and load failures.
- Keep collision, damage, map logic, bombs, scoring and rescue rules in the game engine.
- If a required sprite is missing, report the exact path instead of inventing replacement art.
- Keep source images unchanged; use crop coordinates as metadata.

## Visual inspection tool

A browser-based inspector is available in the app at `?sprite-debug=1`. It displays all original PNGs, reports natural dimensions, overlays an adjustable rows/columns grid and allows copying the proposed grid report. The grid overlay is for inspection only and does not alter the source files or automatically certify frame boundaries.
