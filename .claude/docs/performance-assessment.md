# Performance Assessment: Game Loop & Rendering

Date: 2026-07-07

Assessment of FPS-impacting issues in the game engine (`src/core`) and rendering layer (`src/client`).

## High impact

1. **Double-driven game loop** — `GameEngine.ts:52` runs a `setInterval(16ms)` update loop *alongside* p5's own `draw()` at 60fps (`Sketch.ts:21`). Two unsynced timers cause jitter, drift, and wasted work, and `setInterval` gets throttled in background tabs. Fix: drive updates from `p5.draw()` using `deltaTime`, drop the interval.

2. **O(n·m) asteroid–bullet collisions every frame** — `GameEngine.ts:111-119`. Nested loop over all asteroids × all bullets, recomputed every tick. Scales quadratically as asteroid count grows with level (`20 + level*1.5`). Fix: broad-phase bounding check or spatial grid before the narrow-phase `haveCollided`.

3. **Camera transform allocates 2+ objects per entity per frame** — `geometry.ts:122,149-165` (`drawableCoords`/`mostVisibleCoords`). With asteroids, tails, bullets, shards, and 200 stars, that's thousands of small object allocations/frame → GC pressure. Fix: mutate a reused scratch object instead of returning new literals.

4. **Per-shard/tail-point `push/translate/rotate/pop`** — `Drawer.ts:248-262`. Explosions spawn up to ~40 shards each, plus tail segments per moving object — heavy matrix-stack churn. Fix: compute x/y directly without matrix transforms for simple particles.

## Medium impact

5. **`withAlpha` builds a new RGBA string via `parseInt`×3 + template literal on every draw call** (`colors.ts:9-20`) — called per asteroid ring/shard/tail segment, thousands of times/sec. Fix: memoize by `(hexColor, alphaBucket)`.

6. **Lodash `remove()` used every frame for shards/animations/asteroids** (`GameEngine.ts:103,186,233`, `Drawer.ts:177`) — full-scan + splice with iteratee overhead. Fix: manual filter-in-place.

7. **`makePointMirros`** (9-point wraparound, `geometry.ts:19-43`) is only used at spawn time currently — fine, but worth confirming asteroids near world edges don't need wraparound-aware collision (`haveCollided` doesn't wrap), since that could be a correctness gap, not just perf.

8. **Tail arrays use `Array.shift()`** (`GameObject.ts:39-47`) — O(n) re-index per call; a ring buffer would be O(1).

## Low impact

9. `shapes.ts:22` calls `Date.now()` per concentric ring instead of once per asteroid.
10. `prettifyNumber` regex reformats every GUI frame even when score is unchanged.

## Priority order

Fix #1 (loop architecture) and #2 (collision complexity) first since they set the scaling ceiling; then tackle #3–#5 (allocation/string churn) for steady-state frame time improvements.
