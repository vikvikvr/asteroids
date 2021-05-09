import GameObject, { GameObjectSnapshot } from './GameObject';
import { find, remove } from 'lodash';
import { EntityOptions } from './Entity';
import Bullet, { BulletSnapshot } from './Bullet';
import { DropType } from './Drop';

export type CargoMap = Record<DropType, number>;

const startingDirection = -Math.PI / 2;

export interface ShipSnapshot extends GameObjectSnapshot {
  bullets: BulletSnapshot[];
  shielded: boolean;
}

class Ship extends GameObject {
  // public
  public bullets: Bullet[] = [];
  public shielded: boolean = false;
  // private
  private rotationStep = Math.PI / 6;
  private startingDirection = startingDirection;
  private rightRotations = 0;
  private leftRotations = 0;
  private ACC_SPRINTS = 30;
  private DEC_SPRINTS = 15;
  private sprints = 0;
  // readonly
  readonly MAX_SPEED = 4;
  readonly SHIELD_DURATION = 7000;
  // constructor
  constructor(options: Partial<EntityOptions> = {}) {
    super({
      ...options,
      type: 'ship',
      hitBoxRadius: 30,
      direction: startingDirection,
      acceleration: 1 / 10,
      angularSpeed: Math.PI / 3 / 20,
      hasTail: true
    });
  }

  public update(times = 1): void {
    for (let i = 0; i < times; i++) {
      super.update();
      remove(this.bullets, { isExpired: true });
      for (const bullet of this.bullets) {
        bullet.update();
      }
      this.modifySpeed();
    }
  }

  public turnLeft(): void {
    this.setTargetDirection(this.getComputedDirection() - this.rotationStep);
    this.leftRotations++;
  }

  public turnRight(): void {
    this.setTargetDirection(this.getComputedDirection() + this.rotationStep);
    this.rightRotations++;
  }

  public accelerate(times = 1): void {
    for (let i = 0; i < times; i++) {
      if (this.sprints > 0) {
        this.sprints += this.ACC_SPRINTS;
      } else {
        this.sprints = this.ACC_SPRINTS;
      }
    }
  }

  public decelerate(times = 1): void {
    for (let i = 0; i < times; i++) {
      if (this.sprints < 0) {
        this.sprints += -this.DEC_SPRINTS;
      } else {
        this.sprints = -this.DEC_SPRINTS;
      }
    }
  }

  public fire(): Bullet {
    let bullet = this.makeBullet();
    this.bullets.push(bullet);
    return bullet;
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

  private modifySpeed() {
    if (this.sprints > 0) {
      this.useSprintsToAccelerateForward();
    } else if (this.sprints < 0) {
      this.useSprintsToAccelerateBackwards();
    } else {
      this.decelerateBackToZero();
    }
  }

  private hasBullet(id: string): boolean {
    return Boolean(find(this.bullets, { id }));
  }

  private decelerateBackToZero(): void {
    let mult: number;
    if (this.speed > 0) {
      mult = Math.abs(this.MAX_SPEED - this.speed) / 2;
      this.speed = Math.max(this.speed - this.acceleration * mult, 0);
    } else if (this.speed < 0) {
      mult = Math.abs(-this.MAX_SPEED - this.speed) / 2;
      this.speed = Math.min(this.speed + this.acceleration * mult, 0);
    }
  }

  private useSprintsToAccelerateForward(): void {
    let mult = (Math.abs(this.MAX_SPEED - this.speed) / 2) ** 2;
    this.speed += this.acceleration * mult;
    this.sprints--;
  }

  private useSprintsToAccelerateBackwards(): void {
    let mult = Math.abs(-this.MAX_SPEED - this.speed) / 2;
    this.speed -= this.acceleration * mult;
    this.sprints++;
  }

  private getComputedDirection(): number {
    let steps = (-this.leftRotations + this.rightRotations) * this.rotationStep;
    return this.startingDirection + steps;
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
