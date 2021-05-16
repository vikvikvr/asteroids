import Ship from './Ship';
import Asteroid, { AsteroidsCount, AsteroidSize } from './Asteroid';
import { haveCollided, Rect, centerOf } from '../lib/geometry';
import * as ev from './Events';
import { remove, find, filter } from 'lodash';
import Spawner from './Spawner';
import { bulletHitScore } from './game-rules';

export type GameStatus = 'playing' | 'lost' | 'idle';
export type GameTemperature = 'low' | 'high' | 'normal';

export interface GameState {
  score: number;
  level: number;
  ship: Ship;
  asteroids: Asteroid[];
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
  // private
  private updateTimeout?: NodeJS.Timeout;
  private levelTimeout?: NodeJS.Timeout;
  constructor(world: Rect) {
    this.state = {
      asteroids: [],
      events: [],
      ship: new Ship({ world, coords: centerOf(world) }),
      score: 0,
      level: 0,
      temperature: 'normal'
    };
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
    this.state.ship.update();
    this.state.ship.fire(this.state.temperature);
    this.updateAsteroids();
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
    let { ship } = this.state;
    if (ship.life <= 0) {
      this.status = 'lost';
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
    const speedMultiplierMap: Record<GameTemperature, number> = {
      normal: 1,
      low: 0.05,
      high: 2
    };
    for (const asteroid of asteroids) {
      asteroid.update(speedMultiplierMap[temperature]);
    }
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
        events.push(event);
        this.processShipHit(event);
      }
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
    this.spawner.spawnAsteroid({ count: 30 });
    if (this.state.level > 0) {
      this.state.ship.restoreLife();
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
