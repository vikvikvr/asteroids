# Gamification Ideas

Brainstorm of features to make the game more addictive, fast-paced, unpredictable, rewarding, and challenging. Grounded in the current systems described in [`game-rules.md`](game-rules.md) (temperature cycle, scoring, spawner, events). Not implemented — this is a planning doc, prioritized as a backlog.

Priority key: **P0** (highest impact / lowest effort, do first) → **P3** (nice-to-have, exploratory).

## P0 — Core loop tightening

- **Combo/streak multiplier.** Chain kills within a short window (e.g. 1.5s) without taking a hit to build a multiplier (x1 → x2 → x3...) applied to `game-rules.ts` base scores. Resets on ship hit or on the window expiring. Directly rewards fast, aggressive play and gives moment-to-moment tension — the single highest-leverage addictiveness lever for a score-based arcade game.
- **Near-miss bonus.** Award small score/meter bonus when a bullet or asteroid passes within a tight radius of the ship without colliding (detect via existing `haveCollided`-style distance check at a larger threshold). Cheap to add on top of existing collision math, reinforces risky-play-near-danger as a rewarding pattern instead of purely punishing it.
- **Screen-clearing panic button ("bomb").** One-use (or slowly-recharging) ability that destroys/pushes back all on-screen asteroids. Gives players a rewarding "out" during unpredictable overwhelming moments (e.g. High-temperature swarms), which increases willingness to take risks elsewhere.
- **Random mid-run events beyond weather.** The existing Normal/Low/High cycle is fully predictable (fixed 30s cadence). Add a chance (e.g. 10% per level) to instead roll a surprise micro-event — "asteroid storm" (spawn burst), "mirror world" (extra wraparound copies rendered), "shield charge" (temporary invincibility pickup) — so players can't fully memorize the level-timer rhythm. This is the most direct answer to "more unpredictable."

## P1 — Risk/reward & progression

- **Power-up drops.** Asteroids have a small chance to drop a pickup on destruction (spread shot, temporary shield, speed boost, score multiplier token, extra life). Ship must fly over it before it despawns (short lifespan, like `Shard` but collidable) — adds a risk decision (go grab it vs. stay safe) every destruction.
- **Multi-life / extra-life system.** Currently one hit past `life <= 0` ends the run outright with no lives buffer beyond the regen mechanic. Add discrete lives (e.g. 3) with brief invincibility + knockback on hit instead of instant loss-condition math, so a single mistake isn't always run-ending — makes runs longer and more replayable without trivializing damage.
- **Score-based difficulty instead of pure time-based.** `levelUp()` currently escalates purely on the 30s timer (`floor(20 + level * 1.5)` asteroids). Blend in score/kills-per-second as a secondary driver so skilled/fast players get harder waves sooner (unpredictability + fairness), rather than everyone hitting the same wall at the same second.
- **Daily/weekly seeded challenge run.** Seed the RNG (asteroid spawn directions, weather event rolls) from the date, so all players face an identical run once, with its own leaderboard entry in `localStorage` (or later a backend). Strong addictive hook for return visits ("come back tomorrow for a new seed").
- **Achievements/milestones.** Lightweight, `localStorage`-persisted list (first Large asteroid destroyed while at High temp, survive a full Low-temperature stage, 10x combo, etc.), surfaced via `GameEvent`-like popups. Reuses the existing event-notification pattern (`Events.ts`) rather than inventing new plumbing.

## P2 — Enemy variety & unpredictability

- **New asteroid archetypes** beyond Small/Medium/Large: a "splitter mine" that explodes into a ring of shards that *do* damage (unlike cosmetic `Shard`s today), a fast "hunter" asteroid that homes toward the ship instead of periodic ±60° direction shifts, or an armored asteroid requiring 2 hits.
- **Boss wave every N levels.** A single large, high-HP, pattern-based hazard (e.g. periodically fires slow projectiles, or splits into many mediums at once) as a set-piece every 5 levels, breaking up the otherwise uniform "N large asteroids spawn" pattern in `levelUp()`.
- **Temperature "shock" transitions.** Currently temperature changes are silent state flips; add a brief (~1s) transition hazard at each Low→Normal→High boundary (e.g. a burst of asteroid direction changes, or a temporary visibility/radar blackout) so players can't just wait out the weather passively.
- **Asteroid density scaling with combo.** Riskier reward loop: sustaining a combo could also increase local spawn density (more targets to keep the chain alive but more danger), directly coupling the P0 combo system to unpredictability.

## P3 — Meta-progression & long-tail hooks

- **Persistent unlockables across runs** (ship skins, alternate fire modes, starting perks) purchased with a currency earned per run, stored in `localStorage` alongside `asteroids-highscore`. Gives non-score-chasing players a reason to keep playing.
- **Leaderboard/ghost replay** — record the winning high-score run's inputs and render a translucent "ghost" ship on subsequent runs for players to race against. Pure client-side (no backend needed) since replay is just recorded `KeyController` input timestamps replayed through the same `GameEngine` update loop.
- **Adaptive rubber-banding for near-death saves** — if the player's `ship.life` crosses a low threshold, briefly reduce spawn rate/asteroid speed for a few seconds (invisible to the player) to avoid cheap unavoidable deaths, improving perceived fairness without changing displayed difficulty.
- **Time-attack / endless mode toggle** — separate mode selectable from the idle screen: fixed-duration time attack (score as much as possible in 2 minutes) vs. the current endless escalating mode, for shorter session commitments.

## Notes on fit with existing architecture

- Anything score/event-driven (combos, near-misses, achievements) fits naturally into `GameState.events` + `game-rules.ts` without touching rendering.
- Anything spawn/collision-driven (power-ups, new asteroid types, boss waves) extends `Spawner`/`GameObject` subclasses the same way `Shard` and `Asteroid` already work.
- Anything purely cosmetic/unpredictability-flavored (screen shock transitions, ghost replay rendering) belongs in `src/client`, matching the existing split where `Drawer` owns transient visual-only state.
- Whichever of these gets picked up, remember to update [`game-rules.md`](game-rules.md) per the maintenance note in `CLAUDE.md` once implemented.
