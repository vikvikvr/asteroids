/* eslint-disable no-unused-vars */
import { Point, Rect } from '../lib/geometry';
import { Temperature } from './GameEngine';
import GameObject from './GameObject';

export enum AsteroidSize {
  Small = 0,
  Medium = 1,
  Large = 2
}

export interface AsteroidOptions {
  size: AsteroidSize;
  world: Rect;
  coords: Point;
  direction: number;
  rotationSpeed?: number;
}

export const speeds = [5, 3, 1.5];
export const damages = [0.1, 0.15, 0.2];
export const hitBoxes = [25, 35, 45];
export const directionChangeTimes = [4_000, 5_000, 6_000];

class Asteroid extends GameObject {
  public size: AsteroidSize;
  public damage: number;
  public nextDirectionChangeAt: number;
  constructor(options: AsteroidOptions) {
    const sign = Math.random() > 0.5 ? 1 : -1;
    const size = options.size;
    super({
      world: options.world,
      coords: options.coords,
      hitBoxRadius: hitBoxes[size],
      speed: speeds[size],
      type: 'asteroid',
      direction: options.direction ?? Math.random() * Math.PI * 2,
      rotationSpeed: options.rotationSpeed ?? (sign * Math.PI) / 50,
      angularSpeed: Math.PI / 3 / 40,
      tailLength: 10
    });
    const toWait = directionChangeTimes[size] * Math.random();
    this.nextDirectionChangeAt = Date.now() + toWait;
    this.size = size;
    this.damage = damages[size];
  }

  public update(temperature: Temperature): void {
    super.update(temperature);
    const waitedEnough = Date.now() > this.nextDirectionChangeAt;
    const canChangeDirection = waitedEnough && temperature !== Temperature.Low;
    if (canChangeDirection) this.changeDirection(temperature);
  }

  public splitSize(): AsteroidSize | null {
    if (this.size === AsteroidSize.Large) return AsteroidSize.Medium;
    if (this.size === AsteroidSize.Medium) return AsteroidSize.Small;
    return null;
  }

  private changeDirection(temperature: Temperature): void {
    const angleChange = Math.PI / 3;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const newDirection = this.direction + angleChange * sign;
    this.direction = newDirection;
    const waitMultiplier = temperature === Temperature.Low ? 1 : 0.5;
    const timeToNextChange = directionChangeTimes[this.size] * waitMultiplier;
    this.nextDirectionChangeAt = Date.now() + timeToNextChange;
  }
}

export default Asteroid;
