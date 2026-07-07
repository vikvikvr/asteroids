# Scalability Assessment: Domain-Oriented Restructuring

Date: 2026-07-07

Assessment of the current file organization (`src/`) against a domain/entity-oriented split, per request to make the codebase "more scalable" and replace type-of-file grouping (`interfaces/interfaces.ts`) with entity-of-file grouping (`interfaces/graphics.ts`).

## Current structure

```
src/
  core/     game logic (Entity, GameObject, Ship, Asteroid, Bullet, Shard, GameEngine, Spawner, Events, game-rules)
  client/   p5 rendering (Sketch, Drawer, GUI, shapes, colors, palette, Animation, animations, KeyController)
  lib/      geometry.ts — pure math shared by core+client
  types/    interfaces/{interfaces,options}.ts, enums.ts, types.ts — grouped by *kind of declaration*, not by domain
  utils/    Interpolator, test-utils
```

Total: ~2,380 lines across 30 files. This is a small codebase — worth stating up front, because it caps how much structural investment pays off.

## The real problem: `src/types` is grouped by declaration kind, not domain

This is the concrete pain point named in the request. `interfaces.ts` mixes `GameState` (game domain), `Point`/`Rect`/`Collidable` (geometry domain), and `DrawableObject`/`Star` (graphics domain) in one file, split only by comment banners (`// **** Game ****`). Same for `options.ts` (entity options, draw options, physics options all in one file). Anyone touching "how does a Ship report its hitbox" has to open a file named after a data-shape category, not the concept they're working on — and both files already read via manual `// ****` section banners, which is a structural split trying to happen inside one file.

**Recommendation: split `types/interfaces/` and merge `options` into the same domain files**, e.g.:

```
types/
  game.ts        # GameState, GameStatus, GameObjectType, TGameEvent, GameEventType
  geometry.ts    # Point, Rect, Collidable
  graphics.ts    # DrawableObject, Star, RGB, DrawGameObjectOptions
  entities.ts    # EntityOptions, GameObjectOptions, AsteroidOptions, ShipOptions,
                 # BulletOptions, ShardOptions, AsteroidSpawnOptions
  enums.ts       # BulletPosition, AsteroidSize, Temperature (already domain-pure, keep as-is)
  physics.ts     # InterpolatorOptions
  index.ts       # re-exports (unchanged contract: `import { X } from 'types'`)
```

This is a mechanical, low-risk move — cut along the existing `// ****` banners, update the barrel file, no behavior change. It directly satisfies "split files by entities instead of types" without touching anything else. I'd do this regardless of any larger restructuring decision below.

## The larger question: should `core`/`client` become per-entity domains?

E.g. `src/domains/ship/{Ship.ts, Ship.test.ts, types.ts}`, `src/domains/asteroid/{Asteroid.ts, Spawner.ts, ...}`, etc., replacing the `core`/`client`/`types` split entirely.

**I'd advise against this for the current size.** Reasons:

1. **The core/client boundary is load-bearing, not incidental.** CLAUDE.md is explicit that `core` has no p5/DOM dependency and `client` reads-but-never-mutates `core`. That's an architectural rule (testability, framework independence), not a filing convenience. A per-domain layout (`domains/ship/` containing both logic and drawing) would either erase that boundary or require re-inventing it as a second axis (`domains/ship/logic/`, `domains/ship/render/`) — more nesting than the current 2,380-line codebase justifies.
2. **Most "domains" here are thin.** `Bullet.ts` is 18 lines, `Shard.ts` is 38. Giving each its own folder with its own `types.ts`/`index.ts` turns single files into 3-4 file folders for no navigational win — you'd trade "which file" for "which folder, then which file."
3. **Cross-entity coupling is the norm, not the exception.** `GameEngine.ts` (233 lines) already touches Ship, Asteroid, Bullet, Shard, Spawner, Events, and game-rules together — it's inherently a cross-domain orchestrator. `Drawer.ts` (361 lines) does the same on the render side. Neither has an obvious single-domain home, so a domain-first split would still need a `core/engine`-style catch-all, undercutting the premise.
4. **Test colocation is already domain-shaped.** `core/test/*.test.ts` files are one per entity (`Ship.test.ts`, `Asteroid.test.ts`, ...) — the domain grouping already exists at the test level; it's the `types` folder that lags behind.

## Recommended path

1. **Do the `types/` split above now** — it's exactly what was asked for, mechanical, and low-risk.
2. **Leave `core`/`client`/`lib` as the top-level axis.** It encodes a real architectural constraint (framework-agnostic logic vs. p5 rendering) that a domain-first layout would have to reconstruct anyway.
3. **If entity files grow** (e.g. Ship or Asteroid start acquiring their own sub-behaviors, or a new entity type is added with its own options/events/tests), promote *that one entity* to a folder (`core/ship/{Ship.ts, ShipOptions.ts, Ship.test.ts}`) at that point, rather than restructuring everything preemptively. This keeps the reorganization proportional to actual file growth instead of speculative.
4. **Revisit only if the project scope changes materially** — e.g. adding multiplayer, a level editor, or persisted game modes would introduce genuinely separable domains (networking, editor, persistence) where a `src/domains/*` split would pay for itself. Nothing in the current scope suggests that yet.

## Fix-it-now checklist (if the `types/` split is approved)

- [ ] Create `types/game.ts`, `types/geometry.ts`, `types/graphics.ts`, `types/entities.ts`, `types/physics.ts`
- [ ] Move declarations per the mapping above; keep imports between them (e.g. `entities.ts` importing `Point`/`Rect` from `geometry.ts`) explicit rather than going through the barrel
- [ ] Update `types/index.ts` to re-export all new files
- [ ] Delete `types/interfaces/` and `types/options.ts` (folder becomes redundant)
- [ ] Run `npm test` and `npm run build` to confirm the `import { X } from 'types'` contract is unaffected — no call sites outside `types/` should need to change
