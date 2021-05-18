import { GameTemperature } from './GameEngine';
import GameObject, { GameObjectOptions } from './GameObject';

// aliases
export type AsteroidSize = 'large' | 'medium' | 'small';
export type AsteroidDamage = 0.2 | 0.15 | 0.1;
export type AsteroidHitBox = 40 | 30 | 20;
export type AsteroidSpeed = 1.5 | 3 | 5;
export type AsteroidsCount = Record<AsteroidSize, number>;

// interfaces
export interface AsteroidOptions extends Omit<GameObjectOptions, 'type'> {
  size?: AsteroidSize;
}

// constants
export const sizes: AsteroidSize[] = ['large', 'medium', 'small'];

export const speeds: Record<AsteroidSize, AsteroidSpeed> = {
  large: 1.5,
  medium: 3,
  small: 5
};

export const hitBoxes: Record<AsteroidSize, AsteroidHitBox> = {
  large: 40,
  medium: 30,
  small: 20
};

export const damages: Record<AsteroidSize, AsteroidDamage> = {
  large: 0.2,
  medium: 0.15,
  small: 0.1
};

export const directionChangeTimes: Record<AsteroidSize, number> = {
  large: 5_000,
  medium: 4_000,
  small: 3_000
};

class Asteroid extends GameObject {
  public size: AsteroidSize;
  public damage: AsteroidDamage;
  public nextDirectionChangeAt: number;
  constructor(options: AsteroidOptions = {}) {
    let sign = Math.random() > 0.5 ? 1 : -1;
    let size = options.size || 'large';
    super({
      world: options.world,
      coords: options.coords,
      hitBoxRadius: hitBoxes[size],
      speed: speeds[size],
      type: 'asteroid',
      direction: options.direction || Math.random() * Math.PI * 2,
      rotationSpeed: options.rotationSpeed || (sign * Math.PI) / 50,
      angularSpeed: Math.PI / 3 / 40,
      hasTail: true,
      tailLength: 50
    });
    this.nextDirectionChangeAt =
      Date.now() + directionChangeTimes[size] * Math.random();
    this.size = size;
    this.damage = damages[size];
  }

  public update(temperature: GameTemperature) {
    super.update(temperature);
    const canChangeDirection =
      temperature !== 'low' && Date.now() > this.nextDirectionChangeAt;
    if (canChangeDirection) this.changeDirection(temperature);
  }

  public splitSize(): AsteroidSize | null {
    if (this.size === 'large') return 'medium';
    if (this.size === 'medium') return 'small';
    return null;
  }

  private changeDirection(temperature: GameTemperature): void {
    const angleChange = Math.PI / 3;
    let sign = Math.random() > 0.5 ? 1 : -1;
    let newDirection = this.direction + angleChange * sign;
    this.direction = newDirection;
    const timeToNextChange =
      directionChangeTimes[this.size] * (temperature !== 'low' ? 0.5 : 1);
    this.nextDirectionChangeAt = Date.now() + timeToNextChange;
  }
}

export default Asteroid;
