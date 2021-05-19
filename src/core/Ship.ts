import GameObject from './GameObject';
import { remove } from 'lodash';
import { EntityOptions } from './Entity';
import Bullet from './Bullet';
import { Temperature } from './GameEngine';

type BulletPosition = 'center' | 'left' | 'right';

class Ship extends GameObject {
  // public
  public bullets: Bullet[] = [];
  // private
  private rotationStep = Math.PI / 40;
  private accelerationStep = 1 / 5;
  private minTimeToFire = 200;
  private firedAt = -Infinity;
  private lifeRegenRate = 0.0005;
  // readonly
  readonly MAX_SPEED = 4;
  // constructor
  constructor(options: Partial<EntityOptions> = {}) {
    super({
      ...options,
      type: 'ship',
      hitBoxRadius: 30,
      direction: -Math.PI / 2,
      angularSpeed: Math.PI / 3 / 20,
      hasTail: true,
      tailLength: 20,
      life: 1
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
    let positions: BulletPosition[] = ['center'];
    if (temperature === Temperature.High) {
      positions = ['left', 'right'];
    }
    for (const pos of positions) {
      const bullet = this.makeBullet(pos);
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
    const deltaX = Math.cos(this.direction + Math.PI / 2);
    const deltaY = Math.sin(this.direction + Math.PI / 2);
    type OffsetMap = Record<BulletPosition, number>;
    const offsetX: OffsetMap = {
      left: -20 * deltaX,
      center: 0,
      right: 20 * deltaX
    };
    const offsetY: OffsetMap = {
      left: -20 * deltaY,
      center: 0,
      right: 20 * deltaY
    };
    return new Bullet({
      world: this.world,
      direction: this.direction,
      coords: {
        x: x + offsetX[position],
        y: y + offsetY[position]
      },
      speed: Math.max(this.speed, 0) + 12
    });
  }
}

export default Ship;
