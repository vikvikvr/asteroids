import GameObject from './GameObject';
import { remove } from 'lodash';
import { EntityOptions } from './Entity';
import Bullet from './Bullet';
import { GameTemperature } from './GameEngine';

type BulletPosition = 'center' | 'left' | 'right';

class Ship extends GameObject {
  // public
  public bullets: Bullet[] = [];
  // private
  private rotationStep = Math.PI / 40;
  private accelerationStep = 1 / 5;
  private minTimeToFire = 200;
  private firedAt = -Infinity;
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
      tailLength: 20
    });
  }

  public update(temperature: GameTemperature): void {
    super.update('normal');
    this.fire(temperature);
    this.updateBullets();
    this.accelerate();
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

  public fire(temperature: GameTemperature): void {
    const tempMultiplierMap: Record<GameTemperature, number> = {
      low: 2,
      normal: 1,
      high: 0.5
    };
    const timeToWait = this.minTimeToFire * tempMultiplierMap[temperature];
    const canFire = Date.now() - this.firedAt > timeToWait;
    if (canFire) {
      this.firedAt = Date.now();
      if (temperature !== 'high') {
        const bullet = this.makeBullet('center');
        this.bullets.push(bullet);
      } else {
        const bullet1 = this.makeBullet('left');
        this.bullets.push(bullet1);
        const bullet2 = this.makeBullet('right');
        this.bullets.push(bullet2);
      }
    }
  }

  public restoreLife() {
    this.life = 1;
  }

  private updateBullets() {
    for (const bullet of this.bullets) {
      bullet.update();
    }
    remove(this.bullets, { isExpired: true });
  }

  private changeDirection(direction: 1 | -1) {
    const targetDirection = this.direction + this.rotationStep * direction;
    this.direction = targetDirection;
  }

  private makeBullet(position: BulletPosition): Bullet {
    const { x, y } = this.coords;
    const offsetX: Record<BulletPosition, number> = {
      left: -20 * Math.cos(this.direction + Math.PI / 2),
      center: 0,
      right: 20 * Math.cos(this.direction + Math.PI / 2)
    };
    const offsetY: Record<BulletPosition, number> = {
      left: -20 * Math.sin(this.direction + Math.PI / 2),
      center: 0,
      right: 20 * Math.sin(this.direction + Math.PI / 2)
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
