/* eslint-disable no-unused-vars */
import GameObject from './GameObject';
import { remove } from 'lodash';
import Bullet from './Bullet';
import { Temperature } from './GameEngine';
import { circleFraction, Point, Rect } from 'lib/geometry';

enum BulletPosition {
  Center,
  Left,
  Right
}

export interface ShipOptions {
  world: Rect;
  coords: Point;
}

class Ship extends GameObject {
  // public
  public bullets: Bullet[] = [];
  // private
  private rotationStep = circleFraction(80);
  private accelerationStep = 1 / 4;
  private minTimeToFire = 200;
  private firedAt = -Infinity;
  private lifeRegenRate = 0.0005;
  // readonly
  readonly MAX_SPEED = 6;
  // constructor
  constructor(options: ShipOptions) {
    super({
      ...options,
      type: 'ship',
      hitBoxRadius: 30,
      direction: -circleFraction(4),
      angularSpeed: circleFraction(120),
      tailLength: 7
    });
  }

  public update(temperature: Temperature): void {
    super.update();
    this.fire(temperature);
    this.updateBullets();
    this.accelerate();
    this.restoreLife(temperature);
  }

  public turnLeft(): void {
    this.changeDirection(-1);
  }

  public turnRight(): void {
    this.changeDirection(1);
  }

  public accelerate(): void {
    const newSpeed = this.speed + this.accelerationStep;
    this.speed = Math.min(this.MAX_SPEED, newSpeed);
  }

  public decelerate(): void {
    const newSpeed = this.speed - this.accelerationStep * 2;
    this.speed = Math.max(0, newSpeed);
  }

  public fire(temperature: Temperature): void {
    const waitMultipliers = [2, 1, 0.5];
    const timeToWait = this.minTimeToFire * waitMultipliers[temperature];
    const canFire = Date.now() - this.firedAt > timeToWait;
    if (canFire) {
      this.fireBullets(temperature);
    }
  }

  private fireBullets(temperature: Temperature): void {
    this.firedAt = Date.now();
    let positions: BulletPosition[] = [BulletPosition.Center];
    if (temperature === Temperature.High) {
      positions = [BulletPosition.Left, BulletPosition.Right];
    }
    for (const position of positions) {
      const bullet = this.makeBullet(position);
      this.bullets.push(bullet);
    }
  }

  public restoreLife(temperature: Temperature): void {
    if (temperature === Temperature.Normal) {
      this.life = Math.min(this.life + this.lifeRegenRate, 1);
    }
  }

  private updateBullets(): void {
    for (const bullet of this.bullets) {
      bullet.update();
    }
    remove(this.bullets, 'isExpired');
  }

  private changeDirection(direction: 1 | -1): void {
    const targetDirection = this.direction + this.rotationStep * direction;
    this.direction = targetDirection;
  }

  private makeBullet(position: BulletPosition): Bullet {
    const { x, y } = this.coords;
    const deltaX = Math.cos(circleFraction(4, this.direction));
    const deltaY = Math.sin(circleFraction(4, this.direction));
    const offsets = [0, -20, 20];
    const coords = {
      x: x + offsets[position] * deltaX,
      y: y + offsets[position] * deltaY
    };
    return new Bullet({
      world: this.world,
      direction: this.direction,
      speed: Math.max(this.speed, 0) + 12,
      coords
    });
  }
}

export default Ship;
