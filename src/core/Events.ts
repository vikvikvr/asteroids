import { AsteroidSize, GameEventType, Point } from 'types';
import { v4 as uuidv4 } from 'uuid';
import Asteroid from './Asteroid';
import Bullet from './Bullet';

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
}

export class ShipHit extends GameEvent {
  // public
  public asteroidId: string;
  public damage: number;
  public size: AsteroidSize;
  // constructor
  constructor(asteroid: Asteroid) {
    super('SHIP_HIT', asteroid.coords);
    this.asteroidId = asteroid.id;
    this.damage = asteroid.damage;
    this.size = asteroid.size;
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
}
