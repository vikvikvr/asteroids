import Entity, { EntityOptions } from './Entity';
import { v4 as uuidv4 } from 'uuid';
import { Point } from '../lib/geometry';

export type GameObjectType = 'ship' | 'asteroid' | 'bullet' | 'drop';

export interface GameObjectOptions extends Partial<EntityOptions> {
  type?: GameObjectType;
  hitBoxRadius?: number;
  duration?: number;
  hasTail?: boolean;
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
  public hasTail: boolean;
  public tailLength: number;
  // private
  private expiresAt: number;
  // constructor
  constructor(options: GameObjectOptions = {}) {
    super({ ...options });
    this.id = uuidv4();
    this.type = options.type || 'asteroid';
    this.hitBoxRadius = options.hitBoxRadius || 50;
    this.isExpired = false;
    this.life = 1;
    this.expiresAt = Date.now() + (options.duration || Infinity);
    this.hasTail = options.hasTail || false;
    this.tailLength = options.tailLength || 20;
  }

  public update(speedMultiplier = 1): void {
    super.update(speedMultiplier);
    this.isExpired = Date.now() > this.expiresAt;
    if (this.hasTail) {
      this.updateTail();
    }
  }

  private updateTail() {
    if (this.tail.length === this.tailLength) {
      this.tail.shift();
    }
    this.tail.push({ ...this.coords });
  }
}

export default GameObject;
