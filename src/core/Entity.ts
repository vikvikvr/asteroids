import { Point, Rect } from '../lib/geometry';
import { Temperature } from './GameEngine';

export type EntityOptions = {
  world: Rect;
  coords: Point;
  speed: number;
  acceleration: number;
  direction: number;
  angularSpeed: number;
  orientation: number;
  rotationSpeed: number;
  interpolationSteps: number;
};

class Entity {
  // public
  public coords: Point;
  public speed: number;
  public acceleration: number;
  public orientation: number;
  public direction: number;
  public world: Rect;
  public rotationSpeed: number;

  constructor(options: Partial<EntityOptions> = {}) {
    this.world = options.world || { width: 1000, height: 1000 };
    this.coords = { x: options?.coords?.x || 0, y: options?.coords?.y || 0 };
    this.speed = options.speed || 0;
    this.acceleration = options.acceleration || 0;
    this.direction = options.direction || 0;
    this.orientation = options.orientation || 0;
    this.rotationSpeed = options.rotationSpeed || 0;
  }

  protected changeRotationDirection() {
    this.rotationSpeed *= -1;
  }

  protected update(temperature: Temperature): void {
    const speedMultipliers = [0.05, 1, 2];
    const speedMultiplier = speedMultipliers[temperature];
    this.updatePosition(speedMultiplier);
    const rotSpeed = this.rotationSpeed * (speedMultiplier > 1 ? 2 : 1);
    this.orientation += rotSpeed * speedMultiplier;
  }

  private updatePosition(speedMultiplier = 1): void {
    const speed = this.speed * speedMultiplier;
    this.coords.x += Math.cos(this.direction) * speed;
    this.coords.y += Math.sin(this.direction) * speed;
    this.teleportOffEdges();
  }

  private teleportOffEdges(): void {
    if (this.coords.x > this.world.width) this.coords.x -= this.world.width;
    if (this.coords.x < 0) this.coords.x += this.world.width;
    if (this.coords.y > this.world.height) this.coords.y -= this.world.height;
    if (this.coords.y < 0) this.coords.y += this.world.height;
  }
}

export default Entity;
