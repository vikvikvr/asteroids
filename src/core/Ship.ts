import GameObject, { GameObjectSnapshot } from './GameObject';
import { find, remove } from 'lodash';
import { EntityOptions } from './Entity';
import Bullet, { BulletSnapshot } from './Bullet';
import { DropType } from './Drop';

export type CargoMap = Record<DropType, number>;

export interface ShipSnapshot extends GameObjectSnapshot {
  bullets: BulletSnapshot[];
  shielded: boolean;
}

class Ship extends GameObject {
  // public
  public bullets: Bullet[] = [];
  public shielded: boolean = false;
  // private
  private rotationStep = Math.PI / 24;
  private accelerationStep = 1 / 5;
  private minTimeToFire = 200;
  private firedAt = -Infinity;
  // readonly
  readonly MAX_SPEED = 6;
  readonly SHIELD_DURATION = 7000;
  // constructor
  constructor(options: Partial<EntityOptions> = {}) {
    super({
      ...options,
      type: 'ship',
      hitBoxRadius: 30,
      direction: -Math.PI / 2,
      acceleration: 1 / 10,
      angularSpeed: Math.PI / 3 / 20,
      hasTail: true
    });
  }

  public update(): void {
    super.update();
    remove(this.bullets, { isExpired: true });
    for (const bullet of this.bullets) {
      bullet.update();
    }
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
    const newSpeed = this.speed - this.accelerationStep;
    this.speed = Math.max(-this.MAX_SPEED, newSpeed);
  }

  public fire(): void {
    const canFire = Date.now() - this.firedAt > this.minTimeToFire;
    if (canFire) {
      this.firedAt = Date.now();
      const bullet = this.makeBullet();
      this.bullets.push(bullet);
    }
  }

  public restoreLife() {
    this.life = 1;
  }

  public activateShield() {
    this.shielded = true;
    setTimeout(() => {
      this.shielded = false;
    }, this.SHIELD_DURATION);
  }

  public serialize(): ShipSnapshot {
    return {
      ...super.serialize(),
      bullets: this.bullets.map((b) => b.serialize()),
      shielded: this.shielded
    };
  }

  private changeDirection(direction: 1 | -1) {
    const targetDirection = this.direction + this.rotationStep * direction;
    this.setTargetDirection(targetDirection);
  }

  private hasBullet(id: string): boolean {
    return Boolean(find(this.bullets, { id }));
  }

  private makeBullet(): Bullet {
    return new Bullet({
      world: this.world,
      direction: this.direction,
      coords: this.coords,
      speed: Math.max(this.speed, 0) + 12
    });
  }
}

export default Ship;
