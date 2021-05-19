import { GameTemperature } from './GameEngine';
import GameObject, { GameObjectOptions } from './GameObject';

// aliases
export type AsteroidSize = 0 | 1 | 2;

export type AsteroidSplit = null | 0 | 1;

// interfaces
export interface AsteroidOptions extends Omit<GameObjectOptions, 'type'> {
  size: AsteroidSize;
}

export const speeds = [5, 3, 1.5];
export const damages = [0.1, 0.15, 0.2];
export const hitBoxes = [25, 35, 45];
export const directionChangeTimes = [3_000, 4_000, 5_000];

class Asteroid extends GameObject {
  public size: AsteroidSize;
  public damage: number;
  public nextDirectionChangeAt: number;
  constructor(options: AsteroidOptions) {
    const sign = Math.random() > 0.5 ? 1 : -1;
    const size = options.size ?? 2;
    super({
      world: options.world,
      coords: options.coords,
      hitBoxRadius: hitBoxes[size],
      speed: speeds[size],
      type: 'asteroid',
      direction: options.direction ?? Math.random() * Math.PI * 2,
      rotationSpeed: options.rotationSpeed ?? (sign * Math.PI) / 50,
      angularSpeed: Math.PI / 3 / 40,
      hasTail: true,
      tailLength: 50
    });
    const toWait = directionChangeTimes[size] * Math.random();
    this.nextDirectionChangeAt = Date.now() + toWait;
    this.size = size;
    this.damage = damages[size];
  }

  public update(temperature: GameTemperature): void {
    super.update(temperature);
    const canChangeDirection =
      temperature !== 'low' && Date.now() > this.nextDirectionChangeAt;
    if (canChangeDirection) this.changeDirection(temperature);
  }

  public splitSize(): AsteroidSplit {
    if (this.size > 1) return 1;
    if (this.size > 0) return 0;
    return null;
  }

  private changeDirection(temperature: GameTemperature): void {
    const angleChange = Math.PI / 3;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const newDirection = this.direction + angleChange * sign;
    this.direction = newDirection;
    const waitMultiplier = temperature === 'low' ? 1 : 0.5;
    const timeToNextChange = directionChangeTimes[this.size] * waitMultiplier;
    this.nextDirectionChangeAt = Date.now() + timeToNextChange;
  }
}

export default Asteroid;
