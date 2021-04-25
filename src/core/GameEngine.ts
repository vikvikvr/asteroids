import Ship, { ShipSnapshot } from './Ship';
import Asteroid, {
  AsteroidsCount,
  AsteroidSize,
  AsteroidSnapshot
} from './Asteroid';
import { haveCollided, Rect, Point, centerOf } from '../lib/geometry';
import * as ev from './Events';
import { remove, find, filter } from 'lodash';
import Drop, { DropSnapshot } from './Drop';
import Spawner, { SpawnerEtas } from './Spawner';

export type GameStatus = 'playing' | 'won' | 'lost' | 'idle';

export interface GameState {
  score: number;
  level: number;
  ship: Ship;
  asteroids: Asteroid[];
  bonuses: Drop[];
  events: ev.TGameEvent[];
  frozen: boolean;
}

export interface GameSnapshot {
  world: Rect;
  createdAt: number;
  status: GameStatus;
  etas: SpawnerEtas;
  ship: ShipSnapshot;
  asteroids: AsteroidSnapshot[];
  bonuses: DropSnapshot[];
  events: ev.GameEventSnapshot[];
  score: number;
  level: number;
  frozen: boolean;
}

class GameEngine {
  // public
  public state: GameState;
  public status: GameStatus = 'idle';
  public world: Rect;
  public spawner: Spawner;
  // private
  private gameOverCallback?: () => void;
  private gameWonCallback?: () => void;
  private snapshotTimeout?: NodeJS.Timeout;

  constructor(world: Rect) {
    this.state = {
      asteroids: [],
      bonuses: [],
      events: [],
      ship: new Ship({ world, coords: centerOf(world) }),
      score: 0,
      level: 1,
      frozen: false
    };
    this.world = world;
    this.spawner = new Spawner(this.state, this.world);
  }

  public startLevel(callback: (snapshot: any) => void): void {
    let { spawner } = this;
    this.status = 'playing';
    spawner.spawnAsteroid({ count: 30 });
    spawner.asteroidEvery(5_000, { count: 5 });
    this.snapshotTimeout = setInterval(() => {
      callback(this.createSnapshot());
    }, 16);
  }

  public onGameOver(callback: () => void) {
    this.gameOverCallback = callback;
  }

  public onGameWon(callback: () => void) {
    this.gameWonCallback = callback;
  }

  private update(): void {
    this.state.ship.update();
    this.updateAsteroids(this.state.frozen);
    this.updateBonuses();
    this.checkCollisions();
    this.updateLevel();
    this.checkGameWon();
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

  private createSnapshot(): GameSnapshot {
    this.update();
    let etas = this.spawner.getEtas();
    let { ship, asteroids, bonuses, events } = this.state;
    let snapshot = {
      score: this.state.score,
      level: this.state.level,
      world: this.world,
      createdAt: Date.now(),
      status: this.status,
      etas,
      ship: ship.serialize(),
      asteroids: asteroids.map((a) => a.serialize()),
      bonuses: bonuses.map((b) => b.serialize()),
      events: events.map((e) => e.serialize()),
      frozen: this.state.frozen
    };

    this.state.events = [];

    return snapshot;
  }

  private checkGameLost(): void {
    let { ship } = this.state;
    if (ship.life <= 0) {
      this.status = 'lost';
      if (this.snapshotTimeout) {
        clearInterval(this.snapshotTimeout);
      }
      this.gameOverCallback?.();
    }
  }

  private checkGameWon(): void {
    if (this.state.asteroids.length === 0) {
      this.status = 'won';
      if (this.snapshotTimeout) {
        clearInterval(this.snapshotTimeout);
      }
      this.gameWonCallback?.();
    }
  }

  private updateAsteroids(skip: boolean): void {
    if (skip) return;
    this.state.asteroids.forEach((asteroid) => {
      asteroid.update();
    });
  }

  private updateBonuses(): void {
    this.state.bonuses.forEach((bonus) => {
      bonus.update();
    });
  }

  private checkCollisions(): void {
    this.checkAsteroidBulletCollisions();
    this.checkAsteroidShipCollisions();
    this.checkBonusShipCollisions();
  }

  private checkAsteroidBulletCollisions(): void {
    let { asteroids, ship, events } = this.state;
    asteroids.forEach((asteroid) => {
      ship.bullets.forEach((bullet) => {
        if (haveCollided(asteroid, bullet)) {
          let event = new ev.BulletHit(bullet, asteroid, this.state.frozen);
          events.push(event);
          this.processBulletHit(event);
          this.assignScore(event);
        }
      });
    });
  }

  private checkAsteroidShipCollisions(): void {
    let { asteroids, ship, events } = this.state;
    asteroids.forEach((asteroid) => {
      if (haveCollided(asteroid, ship)) {
        let event = new ev.ShipHit(asteroid, ship.shielded);
        events.push(event);
        this.processShipHit(event);
        this.assignScore(event);
      }
    });
  }

  private checkBonusShipCollisions(): void {
    let { bonuses, ship, events } = this.state;
    bonuses.forEach((bonus) => {
      if (haveCollided(bonus, ship)) {
        let event = new ev.GotBonus(bonus);
        events.push(event);
        this.processGotBonus(event);
      }
    });
  }

  private processBulletHit(event: ev.BulletHit): void {
    let { asteroids, ship } = this.state;
    let asteroid = find(asteroids, { id: event.asteroidId });
    if (asteroid) {
      this.createLoot(asteroid.coords);
      let nextSize = asteroid.splitSize();
      if (nextSize && !this.state.frozen) {
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

  private assignScore(event: ev.GameEvent): void {
    const SCORES: Record<AsteroidSize, number> = {
      large: 50,
      medium: 100,
      small: 200
    };
    if (event instanceof ev.BulletHit) {
      if (this.state.frozen) {
        // also assign score for non-split asteroid
        if (event.size === 'large') {
          this.state.score +=
            SCORES.large + SCORES.medium * 2 + SCORES.small * 4;
        } else if (event.size === 'medium') {
          this.state.score += SCORES.medium + SCORES.small * 2;
        } else {
          this.state.score += SCORES.small;
        }
      } else {
        this.state.score += SCORES[event.size];
      }
    }
  }

  private updateLevel() {
    this.state.level = Math.floor(this.state.score / 2600) + 1;
  }

  private processShipHit(event: ev.ShipHit): void {
    let { asteroids, ship } = this.state;
    remove(asteroids, { id: event.asteroidId });
    if (!ship.shielded) ship.life -= event.damage;
  }

  private processGotBonus(event: ev.GotBonus): void {
    let { ship, bonuses } = this.state;
    switch (event.bonusType) {
      case 'fix':
        ship.restoreLife();
        break;
      case 'shield':
        ship.activateShield();
        break;
      case 'freeze':
        this.state.frozen = true;
        // TODO: case when freeze is already active
        setTimeout(() => {
          this.state.frozen = false;
        }, 5000);
        break;
    }
    remove(bonuses, { id: event.bonusId });
  }

  private createLoot(coords: Point): void {
    let dropRate = 1 / 20;
    let canDrop = Math.random() > 1 - dropRate;
    canDrop && this.spawner.spawnBonus({ coords });
    // console.log('create loot not implemented');
  }
}

export default GameEngine;
