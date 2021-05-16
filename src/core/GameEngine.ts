import Ship from './Ship';
import Asteroid, { AsteroidsCount, AsteroidSize } from './Asteroid';
import { haveCollided, Rect, Point, centerOf } from '../lib/geometry';
import * as ev from './Events';
import { remove, find, filter } from 'lodash';
import Drop from './Drop';
import Spawner from './Spawner';
import { bulletHitScore } from './game-rules';

export type GameStatus = 'playing' | 'lost' | 'idle';
export type GameTemperature = 'low' | 'high' | 'normal';

export interface GameState {
  score: number;
  level: number;
  ship: Ship;
  asteroids: Asteroid[];
  bonuses: Drop[];
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
  private gameOverCallback?: () => void;
  private updateTimeout?: NodeJS.Timeout;
  private levelTimeout?: NodeJS.Timeout;
  constructor(world: Rect) {
    this.state = {
      asteroids: [],
      bonuses: [],
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
    // this.spawner.spawnAsteroid({ count: 30 });
    // spawner.asteroidEvery(5_000, { count: 5 });
    this.updateTimeout = setInterval(this.update, 16);
    this.levelTimeout = setInterval(this.updateLevel, this.levelDuration);
  }

  public onGameOver(callback: () => void) {
    this.gameOverCallback = callback;
  }

  private update(): void {
    this.state.ship.update();
    this.state.ship.fire(this.state.temperature);
    this.updateAsteroids();
    this.updateBonuses();
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
      this.gameOverCallback?.();
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

  private updateBonuses(): void {
    for (const bonus of this.state.bonuses) {
      bonus.update();
    }
  }

  private checkCollisions(): void {
    this.checkAsteroidBulletCollisions();
    this.checkAsteroidShipCollisions();
    this.checkBonusShipCollisions();
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

  private checkBonusShipCollisions(): void {
    let { bonuses, ship, events } = this.state;
    for (const bonus of bonuses) {
      if (haveCollided(bonus, ship)) {
        let event = new ev.GotBonus(bonus);
        events.push(event);
        this.processGotBonus(event);
      }
    }
  }

  private processBulletHit(event: ev.BulletHit): void {
    let { asteroids, ship } = this.state;
    let asteroid = find(asteroids, { id: event.asteroidId });
    if (asteroid) {
      this.createLoot(asteroid.coords);
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
    const { spawner } = this;
    const { ship, level, events } = this.state;
    const spawnTime = this.levelDuration / 3;
    this.state.temperature = 'normal';
    setTimeout(() => this.startFrozenStage(), spawnTime);
    setTimeout(() => this.startBurningStage(), spawnTime * 2);
    spawner.spawnAsteroid({ count: 30 });
    if (level > 0) {
      ship.restoreLife();
      let event = new ev.GameEvent('LEVEL_UP', this.state.ship.coords);
      events.push(event);
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

  private processGotBonus(event: ev.GotBonus): void {
    let { ship, bonuses } = this.state;
    switch (event.bonusType) {
      case 'fix':
        ship.restoreLife();
        break;
      case 'freeze':
        this.state.temperature = 'low';
        // TODO: case when freeze is already active
        setTimeout(() => {
          this.state.temperature = 'normal';
        }, 5000);
        break;
    }
    remove(bonuses, { id: event.bonusId });
  }

  private createLoot(coords: Point): void {
    let dropRate = 1 / 20;
    let canDrop = Math.random() > 1 - dropRate;
    if (canDrop) {
      this.spawner.spawnBonus({ type: 'shield' });
    }
  }
}

export default GameEngine;
