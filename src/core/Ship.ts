import GameObject, { GameObjectSnapshot } from './GameObject';
import { find, remove } from 'lodash';
import { EntityOptions } from './Entity';
import Bullet, { BulletSnapshot } from './Bullet';
import { DropType } from './Drop';

export type CargoMap = Record<DropType, number>;

const startingDirection = -Math.PI / 2;

export interface ShipSnapshot extends GameObjectSnapshot {
  bullets: BulletSnapshot[];
  fuel: number;
  ammo: number;
  cargo: CargoMap;
}

class Ship extends GameObject {
  // public
  public bullets: Bullet[] = [];
  public fuel = 1;
  public ammo = 100;
  public cargo: CargoMap = { ammo: 0, fix: 0, fuel: 0 };
  // private
  private rotationStep = Math.PI / 6;
  private startingDirection = startingDirection;
  private rightRotations = 0;
  private leftRotations = 0;
  private ACC_SPRINTS = 30;
  private DEC_SPRINTS = 15;
  private FUEL_CONSUMPTION = 1 / 3_000;
  private sprints = 0;
  // readonly
  readonly MAX_SPEED = 4;

  constructor(options: Partial<EntityOptions> = {}) {
    super({
      ...options,
      type: 'ship',
      hitBoxRadius: 30,
      direction: startingDirection,
      acceleration: 1 / 10,
      angularSpeed: Math.PI / 3 / 20
    });
  }

  public update(times = 1): void {
    for (let i = 0; i < times; i++) {
      super.update();
      remove(this.bullets, { isExpired: true });
      this.bullets.forEach((bullet) => bullet.update());
      this.consumeFuel();

      if (this.sprints > 0) {
        this.useSprintsToAccelerateForward();
      } else if (this.sprints < 0) {
        this.useSprintsToAccelerateBackwards();
      } else {
        this.decelerateBackToZero();
      }
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
      if (this.fuel > 0) {
        if (this.sprints > 0) {
          this.sprints += this.ACC_SPRINTS;
        } else {
          this.sprints = this.ACC_SPRINTS;
        }
      }
    }
  }

  public decelerate(times = 1): void {
    for (let i = 0; i < times; i++) {
      if (this.fuel > 0) {
        if (this.sprints < 0) {
          this.sprints += -this.DEC_SPRINTS;
        } else {
          this.sprints = -this.DEC_SPRINTS;
        }
      }
    }
  }

  public fire(): Bullet | null {
    if (!this.ammo) return null;

    let bullet = this.makeBullet();
    this.bullets.push(bullet);
    this.ammo--;

    return bullet;
  }

  public collectBonus(type: DropType): void {
    this.cargo[type]++;
  }

  public useBonus(type: DropType): boolean {
    if (!this.cargo[type]) return false;

    switch (type) {
      case 'ammo':
        if (this.ammo === 100) return false;
        this.ammo = 100;
        break;
      case 'fix':
        if (this.life === 1) return false;
        this.life = 1;
        break;
      case 'fuel':
        if (this.fuel === 1) return false;
        this.fuel = 1;
        break;
    }

    this.cargo[type]--;
    return true;
  }

  public serialize(): ShipSnapshot {
    return {
      ...super.serialize(),
      bullets: this.bullets.map((b) => b.serialize()),
      fuel: this.fuel,
      ammo: this.ammo,
      cargo: { ...this.cargo }
    };
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

  private consumeFuel() {
    if (this.speed !== 0) {
      this.fuel = this.fuel - this.FUEL_CONSUMPTION;
    }
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
      speed: Math.max(this.speed, 0) + 6
    });
  }
}

export default Ship;
