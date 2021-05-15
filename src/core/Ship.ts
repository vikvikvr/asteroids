import GameObject from './GameObject';
import { remove } from 'lodash';
import { EntityOptions } from './Entity';
import Bullet from './Bullet';
import { GameTemperature } from './GameEngine';

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
  readonly MAX_SPEED = 4;
  readonly SHIELD_DURATION = 7000;
  // constructor
  constructor(options: Partial<EntityOptions> = {}) {
    super({
      ...options,
      type: 'ship',
      hitBoxRadius: 30,
      direction: -Math.PI / 2,
      angularSpeed: Math.PI / 3 / 20,
      hasTail: true
    });
  }

  public update(): void {
    super.update();
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

  private updateBullets() {
    for (const bullet of this.bullets) {
      bullet.update();
    }
    remove(this.bullets, { isExpired: true });
  }

  private changeDirection(direction: 1 | -1) {
    const targetDirection = this.direction + this.rotationStep * direction;
    this.setTargetDirection(targetDirection);
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
