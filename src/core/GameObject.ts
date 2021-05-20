import Entity, { EntityOptions } from './Entity';
import { v4 as uuidv4 } from 'uuid';
import { Point } from '../lib/geometry';
import { Temperature } from './GameEngine';

export type GameObjectType = 'ship' | 'asteroid' | 'bullet' | 'shard';

export interface GameObjectOptions extends EntityOptions {
  type: GameObjectType;
  hitBoxRadius: number;
  duration?: number;
  tailLength?: number;
}

class GameObject extends Entity {
  // public
  public id: string;
  public type: GameObjectType;
  public hitBoxRadius: number;
  public life: number;
  public isExpired: boolean;
  public tail: Point[] = [];
  public tailLength: number;
  // private
  private updatesCount: number;
  private expiresAt: number;
  // constructor
  constructor(options: GameObjectOptions) {
    super(options);
    this.id = uuidv4();
    this.type = options.type;
    this.hitBoxRadius = options.hitBoxRadius;
    this.isExpired = false;
    this.life = 1;
    this.expiresAt = Date.now() + (options.duration || Infinity);
    this.tailLength = options.tailLength || 0;
    this.updatesCount = 0;
  }

  public update(temperature = Temperature.Normal): void {
    super.update(temperature);
    this.isExpired = Date.now() > this.expiresAt;
    if (this.tailLength) {
      this.updateTail();
    }
    this.updatesCount++;
  }

  private updateTail(): void {
    const shouldUpdate = this.updatesCount % 2 === 0;
    if (shouldUpdate) {
      if (this.tail.length === this.tailLength) {
        this.tail.shift();
      }
      this.tail.push({ ...this.coords });
    }
  }
}

export default GameObject;
