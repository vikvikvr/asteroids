import Ship from './Ship';
import Asteroid, { AsteroidsCount, AsteroidSize } from './Asteroid';
import { haveCollided, Rect, centerOf } from '../lib/geometry';
import * as ev from './Events';
import { remove, find, filter } from 'lodash';
import Spawner from './Spawner';
import { bulletHitScore } from './game-rules';
import Shard from './Shard';

export type GameStatus = 'playing' | 'lost' | 'idle';
export type GameTemperature = 'low' | 'high' | 'normal';

export interface GameState {
  score: number;
  level: number;
  ship: Ship;
  asteroids: Asteroid[];
  shards: Shard[];
  events: ev.TGameEvent[];
  temperature: GameTemperature;
}

class GameEngine {
  // public
  public state: GameState;
  public status: GameStatus = 'idle';
  public world: Rect;
  public spawner: Spawner;
  public levelDuration = 30_000;
  public highScore: number;
  // private
  private updateTimeout?: NodeJS.Timeout;
  private levelTimeout?: NodeJS.Timeout;
  constructor(world: Rect) {
    this.state = {
      asteroids: [],
      events: [],
      shards: [],
      ship: new Ship({ world, coords: centerOf(world) }),
      score: 0,
      level: 0,
      temperature: 'normal'
    };
    const bestScore = localStorage.getItem('asteroids-highscore') || '0';
    this.highScore = JSON.parse(bestScore) || 0;
    this.world = world;
    this.spawner = new Spawner(this.state, this.world);
    this.update = this.update.bind(this);
    this.updateLevel = this.updateLevel.bind(this);
  }

  public startLevel(): void {
    this.status = 'playing';
    this.updateLevel();
    this.updateTimeout = setInterval(this.update, 16);
    this.levelTimeout = setInterval(this.updateLevel, this.levelDuration);
  }

  private update(): void {
    this.state.ship.update(this.state.temperature);
    this.updateAsteroids();
    this.updateShards();
    this.checkCollisions();
    this.checkGameLost();
  }

  private countAsteroids(size: AsteroidSize): number {
    return filter(this.state.asteroids, { size }).length;
  }

  public hasAsteroid(id: string): boolean {
    return Boolean(find(this.state.asteroids, { id }));
  }

  public getAsteroidsCount(): AsteroidsCount {
    return {
      large: this.countAsteroids('large'),
      medium: this.countAsteroids('medium'),
      small: this.countAsteroids('small')
    };
  }

  private checkGameLost(): void {
    let { ship, score } = this.state;
    if (ship.life <= 0) {
      this.status = 'lost';
      localStorage.setItem('asteroids-highscore', score.toString());
      if (this.updateTimeout) {
        clearInterval(this.updateTimeout);
      }
      if (this.levelTimeout) {
        clearInterval(this.levelTimeout);
      }
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
    remove(this.state.shards, { isExpired: true });
  }

  private checkCollisions(): void {
    this.checkAsteroidBulletCollisions();
    this.checkAsteroidShipCollisions();
  }

  private checkAsteroidBulletCollisions(): void {
    let { asteroids, ship, events } = this.state;
    for (const asteroid of asteroids) {
      for (const bullet of ship.bullets) {
        if (haveCollided(asteroid, bullet)) {
          let event = new ev.BulletHit(
            bullet,
            asteroid,
            this.state.temperature === 'low'
          );
          this.createExplosionShards(asteroid);
          events.push(event);
          this.processBulletHit(event);
          this.assignScore(event);
        }
      }
    }
  }

  private checkAsteroidShipCollisions(): void {
    let { asteroids, ship, events } = this.state;
    for (const asteroid of asteroids) {
      if (haveCollided(asteroid, ship)) {
        let event = new ev.ShipHit(asteroid);
        this.createExplosionShards(asteroid);
        events.push(event);
        this.processShipHit(event);
      }
    }
  }

  private createExplosionShards(asteroid: Asteroid) {
    const shardsCountMap: Record<AsteroidSize, number> = {
      large: 30,
      medium: 20,
      small: 10
    };
    const shardsCount = shardsCountMap[asteroid.size];
    const colorMap: Record<GameTemperature, string[]> = {
      normal: ['#009688', '#00897b', '#00796b', '#00695c'],
      high: ['#f44336', '#e53935', '#d32f2f', '#c62828'],
      low: ['#2196f3', '#1e88e5', '#1976d2', '#1565c0']
    };
    const colorShades = colorMap[this.state.temperature];
    for (let i = 0; i < shardsCount; i++) {
      const colorIndex = Math.floor(Math.random() * 4);
      this.state.shards.push(
        new Shard({
          color: colorShades[colorIndex],
          size: asteroid.size,
          coords: asteroid.coords,
          world: this.world,
          duration: 350
        })
      );
    }
  }

  private processBulletHit(event: ev.BulletHit): void {
    let { asteroids, ship } = this.state;
    let asteroid = find(asteroids, { id: event.asteroidId });
    if (asteroid) {
      let nextSize = asteroid.splitSize();
      const shouldSplit = this.state.temperature !== 'low';
      if (shouldSplit && nextSize) {
        this.spawner.spawnAsteroid({
          count: 2,
          size: nextSize,
          coords: asteroid.coords,
          notDirection: this.state.ship.direction
        });
      }
      remove(asteroids, { id: event.asteroidId });
    } else {
      console.log('ship has collided with asteroid at previous update');
    }
    remove(ship.bullets, { id: event.bulletId });
  }

  private assignScore(event: ev.BulletHit): void {
    const scoreToAdd = bulletHitScore(event.size, this.state.temperature);
    this.state.score += scoreToAdd;
  }

  private updateLevel() {
    const spawnTime = this.levelDuration / 3;
    setTimeout(() => this.startFrozenStage(), spawnTime);
    setTimeout(() => this.startBurningStage(), spawnTime * 2);
    this.levelUp();
  }

  private levelUp() {
    this.state.temperature = 'normal';
    this.spawner.spawnAsteroid({ count: 30 + this.state.level });
    if (this.state.level > 0) {
      let event = new ev.GameEvent('LEVEL_UP', this.state.ship.coords);
      this.state.events.push(event);
    }
    this.state.level++;
  }

  private startBurningStage() {
    this.state.temperature = 'high';
    const event = new ev.GameEvent('BURN', this.state.ship.coords);
    this.state.events.push(event);
  }

  private startFrozenStage() {
    this.state.temperature = 'low';
    const event = new ev.GameEvent('FREEZE', this.state.ship.coords);
    this.state.events.push(event);
  }

  private processShipHit(event: ev.ShipHit): void {
    let { asteroids, ship } = this.state;
    remove(asteroids, { id: event.asteroidId });
    ship.life -= event.damage;
  }
}

export default GameEngine;
