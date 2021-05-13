import Ship from './Ship';
import Asteroid, { AsteroidsCount, AsteroidSize } from './Asteroid';
import { haveCollided, Rect, Point, centerOf } from '../lib/geometry';
import * as ev from './Events';
import { remove, find, filter } from 'lodash';
import Drop from './Drop';
import Spawner, { SpawnerEtas } from './Spawner';
import { bulletHitScore } from './game-rules';

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

class GameEngine {
  // public
  public state: GameState;
  public status: GameStatus = 'idle';
  public world: Rect;
  public spawner: Spawner;
  // private
  private gameOverCallback?: () => void;
  private gameWonCallback?: () => void;
  private updateTimeout?: NodeJS.Timeout;

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

  public startLevel(): void {
    let { spawner } = this;
    this.status = 'playing';
    spawner.spawnAsteroid({ count: 30 });
    spawner.asteroidEvery(5_000, { count: 5 });
    this.updateTimeout = setInterval(() => {
      this.update();
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

  private checkGameLost(): void {
    let { ship } = this.state;
    if (ship.life <= 0) {
      this.status = 'lost';
      if (this.updateTimeout) {
        clearInterval(this.updateTimeout);
      }
      this.gameOverCallback?.();
    }
  }

  private checkGameWon(): void {
    if (!this.state.asteroids.length) {
      this.status = 'won';
      if (this.updateTimeout) {
        clearInterval(this.updateTimeout);
      }
      this.gameWonCallback?.();
    }
  }

  private updateAsteroids(skip: boolean): void {
    if (skip) return;
    for (const asteroid of this.state.asteroids) {
      asteroid.update();
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
          let event = new ev.BulletHit(bullet, asteroid, this.state.frozen);
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
        let event = new ev.ShipHit(asteroid, ship.shielded);
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

  private assignScore(event: ev.BulletHit): void {
    const scoreToAdd = bulletHitScore(event.size, this.state.frozen);
    this.state.score += scoreToAdd;
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
    if (canDrop) {
      this.spawner.spawnBonus({ coords });
    }
  }
}

export default GameEngine;
