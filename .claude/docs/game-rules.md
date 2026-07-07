# Game Rules

Derived from `src/core` business logic and `src/lib/geometry.ts`. Excludes rendering/UI (`src/client`) — this describes *what* happens, not how it's drawn. Keep this file in sync with the code (see maintenance note in `CLAUDE.md`).

## Ship (`src/core/Ship.ts`)

- Hit box radius: `30`. Starts facing up (`-90°`).
- Turning: `turnLeft()`/`turnRight()` rotate direction by `2π/80` (4.5°) per call.
- Thrust: `accelerate()` is called every `update()` tick, adding `0.25` speed up to `MAX_SPEED = 6` — the ship is always accelerating unless input calls `decelerate()`, which subtracts `0.5` speed (floored at 0).
- Firing cooldown: base `200ms`, multiplied by temperature: **Low ×2 (400ms)**, **Normal ×1 (200ms)**, **High ×0.5 (100ms)**.
  - Normal/Low fire 1 bullet from center. **High fires 2 bullets** (offset left/right).
  - Bullet speed = `max(ship.speed, 0) + 12`.
- Life: starts at `1`, reduced by the colliding asteroid's `damage` on ship hit. Regenerates only at **Normal** temperature, `0.0005`/tick, capped at 1. No regen at Low/High, no invincibility frames.
- Death: when `life <= 0`, game status becomes `'lost'`.
- Bullet piercing: at **Low** temperature only, a bullet survives its first asteroid hit (pierces once) instead of being removed.

## Asteroid (`src/core/Asteroid.ts`)

Sizes: `Small=0, Medium=1, Large=2` (small is fastest/weakest damage/smallest hitbox).

| Size | Speed | Ship damage | Hit box | Direction-change interval |
|---|---|---|---|---|
| Small | 5 | 0.1 | 25 | ~6,000ms |
| Medium | 3 | 0.15 | 35 | ~8,000ms |
| Large | 1.5 | 0.2 | 45 | ~10,000ms |

- Spawns with random direction and a random-signed rotation speed (`±2π/100`).
- Periodically (per the interval above, halved when temperature ≠ Low) shifts direction by ±60°, unless temperature is **Low** — in which case direction changes are suppressed entirely (the "freeze" effect).
- Splitting on bullet hit: Large → Medium, Small has no further split. Splitting does **not** happen at Low temperature (asteroid is destroyed outright instead — see scoring).
- Splitting does **not** occur on ship collision (asteroid is simply destroyed).

## Bullet (`src/core/Bullet.ts`)

- Hit box radius `3`, lifespan `1,500ms` after which it expires.
- `piercesCount` starts at 0; incremented once under Low-temperature pierce rule (see Ship).

## Shard (`src/core/Shard.ts`)

- Pure cosmetic debris, created whenever an asteroid is destroyed (bullet or ship hit): count = `size * 10 + 10` (10/20/30 for Small/Medium/Large).
- Random lifespan 100–300ms; never participates in collision checks — removed only on expiry.

## GameEngine (`src/core/GameEngine.ts`) — loop & progression

- `status`: `'idle' | 'playing' | 'lost'`. Starts idle; `startLevel()` → playing; `ship.life <= 0` → lost (high score saved, level timer cleared). No automatic return to idle (that's external/UI-driven).
- `update()` is a no-op unless `status === 'playing'`; otherwise updates ship/asteroids/shards, checks collisions, checks loss.
- **Level timer**: `startLevel()` schedules `updateLevel()` on a repeating **30,000ms** interval.
- **`updateLevel()`** (fires every 30s):
  - schedules "frozen stage" (Temperature.Low) at **+10,000ms**
  - schedules "burning stage" (Temperature.High) at **+20,000ms**
  - calls `levelUp()` immediately, which resets temperature to Normal, spawns `floor(20 + level * 1.5)` new Large asteroids (escalating count = difficulty), pushes a `LEVEL_UP` event (skipped on the very first level), and increments `level`.
- **Temperature ("weather") cycle**, repeating every level (30s): Normal (0–10s) → Low/frozen (10–20s) → High/burning (20–30s).
  - Speed multiplier by temperature: Low `×0.05` (near-frozen), Normal `×1`, High `×2` (applies to all entities; rotation is also doubled at High).
  - Low: no asteroid direction changes, double fire cooldown, bullets pierce once, no splitting on bullet hit, no ship life regen.
  - High: half fire cooldown, ship fires 2 bullets, double bullet-hit score.
- **Collisions**: bullet-vs-asteroid spawns shards, pushes `BulletHit` event, removes asteroid, splits into 2 smaller asteroids (biased away from ship's facing direction) unless Low temperature or already Small, removes/pierces the bullet, adds score. Asteroid-vs-ship spawns shards, pushes `ShipHit` event, removes the asteroid, reduces ship life by asteroid damage (no split).

## Spawner (`src/core/Spawner.ts`)

- Fresh-level spawns pick random coordinates whose torus-aware distance from the ship exceeds `ship.hitBoxRadius * 5` (150 units), retrying up to 100 times.
- Split-asteroid spawns use the destroyed asteroid's coordinates directly, with direction biased more than 30° (half of a 60° cone) away from the ship's current facing direction, so fragments don't immediately fly at the ship.

## Events (`src/core/Events.ts`)

`GameState.events` is a write-only notification side-channel from core's perspective — `BULLET_HIT`, `SHIP_HIT`, `FREEZE`, `BURN`, `LEVEL_UP` are pushed but never drained here (draining/reacting is a client-layer concern, e.g. animations/sound). They don't themselves affect score or state beyond what `GameEngine` already applies directly.

## Scoring & persistence (`src/core/game-rules.ts`)

Base scores by size: **Small 200, Medium 100, Large 50**.

- **Normal**: base score for the destroyed size.
- **High**: base score × 2 (Small 400, Medium 200, Large 100).
- **Low** ("shattered" — since splitting is suppressed, the score front-loads what the fragments would have been worth): Large → 1050 (`50 + 100*2 + 200*4`), Medium → 500 (`100 + 200*2`), Small → 200.

Final awarded score is `bulletHitScore(size, temperature) * combo.multiplier` (see Combo below).

High score persists in `localStorage` under key `asteroids-highscore`, updated only when the run's score exceeds the stored value, on game-over.

## Combo/streak multiplier (`src/core/game-rules.ts`, `GameEngine`)

- `GameState.combo` = `{ count, multiplier, expiresAt }`, starts at `{ 0, 1, 0 }`.
- Every bullet-asteroid kill increments `combo.count` and resets `combo.expiresAt` to `Date.now() + COMBO_WINDOW_MS` (**1,500ms**).
- If `Date.now()` passes `combo.expiresAt` without a new kill (checked once per `update()` tick), the combo resets to `{ 0, 1, 0 }`. It also resets immediately on any ship hit.
- `multiplier` is derived from `count` via fixed thresholds: **x1** (0–2 kills), **x2** (3–5), **x3** (6–9), **x4** (10–14), **x5** (15+) — see `comboMultiplier()`.
- The multiplier applies to every bullet-hit score award (including Low-temperature "shattered" payouts and High-temperature doubled payouts), so it compounds with temperature bonuses.

## World wraparound

- `Entity.teleportOffEdges()`: any entity crossing a world boundary wraps to the opposite edge — applies to ship, asteroids, bullets, shards every tick.
- Frame-to-frame collision checks (`haveCollided`) use plain (non-wrapped) distance — collisions are **not** detected "through" the wrap edge in real time.
- Spawn-safety (`randomCoordsFarFrom`, used by Spawner) *does* treat the world as a torus, checking distance against all 9 mirrored copies of the world, so a new asteroid can't spawn suspiciously close to the ship just because they're near opposite wrapped edges.
