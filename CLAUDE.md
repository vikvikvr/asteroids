# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A front-end-only Asteroids clone built with TypeScript and rendered via p5.js (no React UI is actually rendered — see "Unused dependencies" below). Deployed to Netlify at https://asteroids-client.netlify.app/.

## Commands

```bash
npm install     # install dependencies
npm start       # run dev server (react-scripts/CRA)
npm test        # run Jest tests in watch mode (react-scripts test)
npm run build   # production build
npm run deploy  # publish build/ to gh-pages
```

To run a single test file: `npm test -- Ship.test.ts` (or any substring of the path). Tests live alongside `src/core/test/*.test.ts` and as `*.test.ts` files next to their source (e.g. `src/lib/geometry.test.ts`, `src/client/Drawer.test.ts`).

There is no separate lint command; ESLint config lives inline in `package.json` (`eslintConfig`) and runs as part of `react-scripts` tooling.

## Architecture

Imports are absolute from `src` (`tsconfig.json` sets `baseUrl: "src"`), e.g. `import GameEngine from 'core/GameEngine'` or `import { Point } from 'types'` — never relative paths across top-level folders.

### `src/core` — game logic (framework-agnostic, no p5/DOM dependency)

- **`Entity`** — base class: position, speed, direction, orientation, world-wrap-around (`teleportOffEdges`).
- **`GameObject extends Entity`** — adds id, hit box, life, expiry, and tail-trail tracking. Base class for everything drawable/collidable.
- **`Ship`, `Asteroid`, `Bullet`, `Shard`** — concrete `GameObject`s (ship, asteroids that split on hit, projectiles, explosion debris particles).
- **`GameEngine`** — the central state owner and update loop. Holds `GameState` (ship, asteroids, shards, events, score, level, temperature) and `status` (`idle | playing | lost`). `startLevel()` kicks off two intervals: a ~60fps `update()` loop (movement, collisions, expiry) and a level timer that escalates difficulty and cycles a "weather" system (`Temperature.Normal/Low/High` — asteroids freeze-in-place or speed up, affecting scoring via `game-rules.ts`).
- **`Spawner`** — creates asteroids at safe distances from the ship, optionally biased away from a given direction (used when splitting asteroids so debris doesn't spawn on top of the ship).
- **`Events.ts`** — `GameEvent` and subclasses (`ShipHit`, `BulletHit`) pushed onto `GameState.events` each frame; the client layer drains and reacts to these for animations/score popups/screen shake, then clears the array (`events.length = 0` in `Drawer`).
- **`game-rules.ts`** — scoring table and high-score persistence via `localStorage` (`asteroids-highscore`).

### `src/client` — p5.js rendering layer (reads `GameEngine.state`, never mutates game logic)

- **`Sketch.ts`** — p5 entry point (instantiated from `src/index.ts`). Owns the p5 lifecycle (`setup`/`draw`/`windowResized`), constructs one `GameEngine`, one `Drawer`, one `KeyController`, and calls `engine.startLevel()`.
- **`KeyController`** — maps raw keycodes to `Ship` methods (arrow keys to turn, space to decelerate/thrust).
- **`Drawer`** — draws every frame based on `engine.state`. Computes camera-relative screen coordinates (ship is always centered; `lib/geometry.drawableCoords` handles the wrap-around world so objects near an edge also render "mirrored" near the opposite edge). Also owns transient client-only visual state (`Animation`s, star field, screen shake) that has no place in `GameState` because it's purely cosmetic.
- **`shapes.ts` / `colors.ts` / `palette.ts` / `Animation.ts` / `animations.ts` / `GUI.ts`** — drawing primitives, color/temperature-aware palettes, and the score/level HUD.

### `src/lib/geometry.ts`

Pure math helpers shared by core and client: collision detection (`haveCollided`, torus-aware `minSquareDistance` for wraparound world), random spawn positions, and the screen-space projection used by `Drawer`.

### `src/types`

All interfaces, enums, and type aliases are centralized under `src/types` and re-exported from `src/types/index.ts`; import from `'types'` rather than deep paths.

## Notes

- `redux`, `redux-devtools-extension`, and `xstate` are listed in `package.json` but are not used anywhere in `src` except an unused scratch file (`src/utils/xstate.ts`) — leftovers from the CRA template/experimentation, not part of the active architecture. Likewise, no React components are rendered; `src/index.ts` mounts the p5 sketch directly onto `#root`.
- The game world wraps at its edges (`Entity.teleportOffEdges`) and collision/spawn math accounts for this by checking distances across the 8 mirrored copies of the world (`lib/geometry.ts`), not just direct distance.
