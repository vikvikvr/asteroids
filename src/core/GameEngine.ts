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
import Bullet from './Bullet';

export type GameStatus = 'playing' | 'won' | 'lost' | 'idle';

export type LevelOptions = {
  startAsteroids: number;
  asteroidSpawner: {
    every: number;
    amount: number;
  };
  bonusSpawner: {
    every: number;
  };
};

export interface GameState {
  ship: Ship;
  asteroids: Asteroid[];
  bonuses: Drop[];
  events: ev.GameEvent[];
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
      ship: new Ship({ world, coords: centerOf(world) })
    };
    this.world = world;
    this.spawner = new Spawner(this.state, this.world);
  }

  public startLevel(callback: (snapshot: any) => void): void {
    let { spawner } = this;
    this.status = 'playing';
    spawner.spawnAsteroid({ count: 30 });
    spawner.asteroidEvery(5_000, { count: 6 });
    spawner.bonusEvery(3_000, { type: 'ammo' });
    spawner.bonusEvery(3_000, { type: 'fix' });
    spawner.bonusEvery(3_000, { type: 'fuel' });
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
    this.updateAsteroids();
    this.updateBonuses();
    this.checkCollisions();
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
      world: this.world,
      createdAt: Date.now(),
      status: this.status,
      etas,
      ship: ship.serialize(),
      asteroids: asteroids.map((a) => a.serialize()),
      bonuses: bonuses.map((b) => b.serialize()),
      events: events.map((e) => e.serialize())
    };

    // let serializedSnapshot = JSON.parse(JSON.stringify(snapshot));
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
      if (this.gameOverCallback) {
        this.gameOverCallback();
      } else {
        console.log('game over without a callback');
      }
    }
  }

  private checkGameWon(): void {
    if (this.state.asteroids.length === 0) {
      this.status = 'won';
      if (this.snapshotTimeout) {
        clearInterval(this.snapshotTimeout);
      }
      if (this.gameWonCallback) {
        this.gameWonCallback();
      } else {
        console.log('game won without a callback');
      }
    }
  }

  private updateAsteroids(): void {
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
    let { asteroids, ship, events, bonuses } = this.state;
    asteroids.forEach((asteroid) => {
      ship.bullets.forEach((bullet) => {
        if (haveCollided(asteroid, bullet)) {
          let event = new ev.BulletHit(bullet, asteroid);
          events.push(event);
          this.processBulletHit(event);
        }
      });
      if (haveCollided(asteroid, ship)) {
        let event = new ev.ShipHit(asteroid);
        events.push(event);
        this.processShipHit(event);
      }
    });
    bonuses.forEach((bonus) => {
      if (haveCollided(bonus, ship)) {
        let event = new ev.GotBonus(bonus);
        events.push(event);
        this.processGotBonus(event);
      }
    });
  }

  // private processEvents(): void {
  //   this.state.events.forEach((event) => {
  //     if (event instanceof ev.BulletHit) {
  //       this.processBulletHit(event);
  //     } else if (event instanceof ev.ShipHit) {
  //       this.processShipHit(event);
  //     } else if (event instanceof ev.GotBonus) {
  //       this.processGotBonus(event);
  //     } else {
  //       console.log('invalid event', event);
  //     }
  //   });
  //   this.state.events = [];
  // }

  private processBulletHit(event: ev.BulletHit): void {
    let { asteroids, ship } = this.state;
    let asteroid = find(asteroids, { id: event.asteroidId });
    if (asteroid) {
      this.createLoot(asteroid.coords);
      let nextSize = asteroid.splitSize();
      if (nextSize) {
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

  private processShipHit(event: ev.ShipHit): void {
    let { asteroids, ship } = this.state;
    remove(asteroids, { id: event.asteroidId });
    ship.life -= event.damage;
  }

  private processGotBonus(event: ev.GotBonus): void {
    let { ship, bonuses } = this.state;
    ship.collectBonus(event.bonusType);
    remove(bonuses, { id: event.bonusId });
  }

  private createLoot(coords: Point): void {
    // console.log('create loot not implemented');
  }
}

export default GameEngine;
