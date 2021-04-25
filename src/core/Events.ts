import { v4 as uuidv4 } from 'uuid';
import { Point } from '../lib/geometry';
import Asteroid, { AsteroidDamage, AsteroidSize } from './Asteroid';
import Bullet from './Bullet';
import Drop, { DropType } from './Drop';

export type GameEventType = 'BULLET_HIT' | 'SHIP_HIT' | 'GOT_BONUS';

export type GameEventSnapshot =
  | GotBonusSnapshot
  | ShipHitSnapshot
  | BulletHitSnapshot;

export interface IGameEventSnapshot {
  type: GameEventType;
  id: string;
  coords: Point;
}

export interface GotBonusSnapshot extends IGameEventSnapshot {
  bonusType: DropType;
}

export interface ShipHitSnapshot extends IGameEventSnapshot {
  damage: AsteroidDamage;
  size: AsteroidSize;
  shielded: boolean;
}

export interface BulletHitSnapshot extends IGameEventSnapshot {
  size: AsteroidSize;
  shattered: boolean;
}

export type TGameEvent = ShipHit | BulletHit | GotBonus;

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

  protected serialize(): IGameEventSnapshot {
    return {
      type: this.type,
      id: this.id,
      coords: { ...this.coords }
    };
  }
}

export class ShipHit extends GameEvent {
  // public
  public asteroidId: string;
  public damage: AsteroidDamage;
  public size: AsteroidSize;
  public shielded: boolean;
  // constructor
  constructor(asteroid: Asteroid, shielded: boolean) {
    super('SHIP_HIT', asteroid.coords);
    this.asteroidId = asteroid.id;
    this.damage = asteroid.damage;
    this.size = asteroid.size;
    this.shielded = shielded;
  }

  public serialize(): ShipHitSnapshot {
    return {
      ...super.serialize(),
      damage: this.damage,
      size: this.size,
      shielded: this.shielded
    };
  }
}

export class BulletHit extends GameEvent {
  // public
  public bulletId: string;
  public asteroidId: string;
  public size: AsteroidSize;
  public shattered: boolean;
  // constructor
  constructor(bullet: Bullet, asteroid: Asteroid, shattered: boolean) {
    super('BULLET_HIT', bullet.coords);
    this.bulletId = bullet.id;
    this.asteroidId = asteroid.id;
    this.size = asteroid.size;
    this.shattered = shattered;
  }

  public serialize(): BulletHitSnapshot {
    return {
      ...super.serialize(),
      size: this.size,
      shattered: this.shattered
    };
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

  public serialize(): GotBonusSnapshot {
    return {
      ...super.serialize(),
      bonusType: this.bonusType
    };
  }
}
