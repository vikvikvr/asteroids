/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import Ship from './Ship';
import Asteroid from './Asteroid';
import { haveCollided, centerOf, randomIndex } from 'lib/geometry';
import * as ev from './Events';
import { remove, find } from 'lodash';
import Spawner from './Spawner';
import {
  bulletHitScore,
  comboMultiplier,
  COMBO_WINDOW_MS,
  getHighScore,
  saveHighScore
} from './game-rules';
import Shard from './Shard';
import {
  AsteroidSize,
  GameEventType,
  GameState,
  GameStatus,
  Point,
  Rect,
  Temperature
} from 'types';
import Bullet from './Bullet';

class GameEngine {
  // public
  public state: GameState;
  public status: GameStatus = 'idle';
  public world: Rect;
  public spawner: Spawner;
  public levelDuration = 30_000;
  public highScore: number;
  // private
  private levelTimeout?: NodeJS.Timeout;
  // constructor
  constructor(world: Rect) {
    this.state = {
      asteroids: [],
      events: [],
      shards: [],
      ship: new Ship({ world, coords: centerOf(world) }),
      score: 0,
      level: 0,
      temperature: Temperature.Normal,
      combo: { count: 0, multiplier: 1, expiresAt: 0 }
    };
    this.highScore = getHighScore();
    this.world = world;
    this.spawner = new Spawner(this.state, this.world);
  }

  public startLevel(): void {
    this.status = 'playing';
    this.updateLevel();
    this.levelTimeout = setInterval(
      this.updateLevel.bind(this),
      this.levelDuration
    );
  }

  public pause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  public update(): void {
    if (this.status !== 'playing') {
      return;
    }

    this.state.ship.update(this.state.temperature);
    this.updateAsteroids();
    this.updateShards();
    this.updateCombo();
    this.checkCollisions();
    this.checkGameLost();
  }

  private updateCombo(): void {
    const { combo } = this.state;
    if (combo.count > 0 && Date.now() > combo.expiresAt) {
      this.resetCombo();
    }
  }

  private registerComboHit(): void {
    const { combo } = this.state;
    combo.count++;
    combo.expiresAt = Date.now() + COMBO_WINDOW_MS;
    combo.multiplier = comboMultiplier(combo.count);
  }

  private resetCombo(): void {
    this.state.combo = { count: 0, multiplier: 1, expiresAt: 0 };
  }

  private checkGameLost(): void {
    const haveLost = this.state.ship.life <= 0;

    if (haveLost) {
      this.status = 'lost';
      saveHighScore(this.state.score, this.highScore);
      this.stopLevelingUp();
    }
  }

  private stopLevelingUp(): void {
    if (this.levelTimeout) {
      clearInterval(this.levelTimeout);
    }
  }

  private updateAsteroids(): void {
    const { temperature, asteroids } = this.state;

    for (const asteroid of asteroids) {
      asteroid.update(temperature);
    }
  }

  private updateShards(): void {
    for (const shard of this.state.shards) {
      shard.update();
    }

    remove(this.state.shards, 'isExpired');
  }

  private checkCollisions(): void {
    this.checkAsteroidBulletCollisions();
    this.checkAsteroidShipCollisions();
  }

  private checkAsteroidBulletCollisions(): void {
    for (const asteroid of this.state.asteroids) {
      for (const bullet of this.state.ship.bullets) {
        if (haveCollided(asteroid, bullet)) {
          this.processAsteroidBulletCollision(asteroid, bullet);
        }
      }
    }
  }

  private processAsteroidBulletCollision(
    asteroid: Asteroid,
    bullet: Bullet
  ): void {
    const event = new ev.BulletHit(
      bullet,
      asteroid,
      this.state.temperature === Temperature.Low
    );

    this.createExplosionShards(asteroid);
    this.state.events.push(event);
    this.processBulletHit(event);
    this.registerComboHit();
    this.assignScore(event);
  }

  private checkAsteroidShipCollisions(): void {
    for (const asteroid of this.state.asteroids) {
      if (haveCollided(asteroid, this.state.ship)) {
        this.processAsteroidShipCollision(asteroid);
      }
    }
  }

  private processAsteroidShipCollision(asteroid: Asteroid): void {
    const event = new ev.ShipHit(asteroid);
    this.createExplosionShards(asteroid);
    this.state.events.push(event);
    this.processShipHit(event);
  }

  private createExplosionShards(asteroid: Asteroid): void {
    const shardsCount = asteroid.size * 10 + 10;

    for (let i = 0; i < shardsCount; i++) {
      const shard = new Shard({
        colorIndex: randomIndex(4),
        size: asteroid.size,
        coords: asteroid.coords,
        world: this.world,
        temperature: this.state.temperature
      });

      this.state.shards.push(shard);
    }
  }

  private processBulletHit(event: ev.BulletHit): void {
    const { asteroids, ship, temperature } = this.state;

    const asteroid = find(asteroids, { id: event.asteroidId });

    if (asteroid) {
      const nextSize = asteroid.splitSize();
      const shouldSplit = temperature !== Temperature.Low;

      if (shouldSplit && nextSize !== null) {
        this.spawner.spawnAsteroid({
          count: 2,
          size: nextSize,
          coords: asteroid.coords,
          notDirection: ship.direction
        });
      }

      remove(asteroids, { id: event.asteroidId });
    }

    ship.removeBullet(event.bulletId, temperature);
  }

  private assignScore(event: ev.BulletHit): void {
    const scoreToAdd =
      bulletHitScore(event.size, this.state.temperature) *
      this.state.combo.multiplier;
    this.state.score += scoreToAdd;
  }

  private updateLevel(): void {
    if (this.status !== 'playing') {
      return;
    }

    const spawnTime = this.levelDuration / 3;
    setTimeout(this.startFrozenStage.bind(this), spawnTime);
    setTimeout(this.startBurningStage.bind(this), spawnTime * 2);
    this.levelUp();
  }

  private levelUp(): void {
    this.state.temperature = Temperature.Normal;
    const count = Math.floor(20 + this.state.level * 1.5);
    this.spawner.spawnAsteroid({ count, size: AsteroidSize.Large });

    if (this.state.level > 0) {
      this.addGameEvent('LEVEL_UP', this.state.ship.coords);
    }

    this.state.level++;
  }

  private addGameEvent(type: GameEventType, coords: Point): void {
    this.state.events.push(new ev.GameEvent(type, coords));
  }

  private startBurningStage(): void {
    if (this.status !== 'playing') {
      return;
    }

    this.state.temperature = Temperature.High;
    this.addGameEvent('BURN', this.state.ship.coords);
  }

  private startFrozenStage(): void {
    if (this.status !== 'playing') {
      return;
    }

    this.state.temperature = Temperature.Low;
    this.addGameEvent('FREEZE', this.state.ship.coords);
  }

  private processShipHit(event: ev.ShipHit): void {
    const { asteroids, ship } = this.state;

    remove(asteroids, { id: event.asteroidId });
    ship.life -= event.damage;
    this.resetCombo();
  }
}

export default GameEngine;
