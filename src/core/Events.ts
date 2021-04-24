import { v4 as uuidv4 } from 'uuid';
import { Point } from '../lib/geometry';
import Asteroid, { AsteroidDamage } from './Asteroid';
import Bullet from './Bullet';
import Drop, { DropType } from './Drop';

export type GameEventType = 'BULLET_HIT' | 'SHIP_HIT' | 'GOT_BONUS';

export interface GameEventSnapshot {
  type: GameEventType;
  id: string;
  coords: Point;
}

export class GameEvent {
  // public
  public type: GameEventType;
  public id: string;
  public coords: Point;
  // constructor
  constructor(type: GameEventType, coords: Point) {
    this.type = type;
    this.id = uuidv4();
    this.coords = { ...coords };
  }

  public serialize(): GameEventSnapshot {
    return {
      type: this.type,
      id: this.id,
      coords: { ...this.coords }
    };
  }
}

export class ShipHit extends GameEvent {
  public asteroidId: string;
  public damage: AsteroidDamage;
  constructor(asteroid: Asteroid) {
    super('SHIP_HIT', asteroid.coords);
    this.asteroidId = asteroid.id;
    this.damage = asteroid.damage;
  }
}

export class BulletHit extends GameEvent {
  public bulletId: string;
  public asteroidId: string;
  constructor(bullet: Bullet, asteroid: Asteroid) {
    super('BULLET_HIT', bullet.coords);
    this.bulletId = bullet.id;
    this.asteroidId = asteroid.id;
  }
}

export class GotBonus extends GameEvent {
  public bonusId: string;
  public bonusType: DropType;
  constructor(bonus: Drop) {
    super('GOT_BONUS', bonus.coords);
    this.bonusId = bonus.id;
    this.bonusType = bonus.dropType;
  }
}
