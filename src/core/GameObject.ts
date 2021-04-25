import Entity, { EntityOptions, EntitySnapshot } from './Entity';
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

export interface GameObjectSnapshot extends EntitySnapshot {
  id: string;
  type: GameObjectType;
  hitBoxRadius: number;
  life: number;
  isExpired: boolean;
  tail: Point[];
}

class GameObject extends Entity {
  // public
  public id: string;
  public type: GameObjectType;
  public hitBoxRadius: number;
  public life: number;
  public isExpired: boolean;
  public tail: Point[] = [];
  // private
  private expiresAt: number;
  private hasTail: boolean;
  private tailLength: number;
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

  protected serialize(): GameObjectSnapshot {
    return {
      ...super.serialize(),
      id: this.id,
      type: this.type,
      hitBoxRadius: this.hitBoxRadius,
      life: this.life,
      isExpired: this.isExpired,
      tail: this.tail
    };
  }

  protected update(): void {
    super.update();
    this.isExpired = Date.now() > this.expiresAt;
    if (this.hasTail) {
      if (this.tail.length === this.tailLength) {
        this.tail.shift();
      }
      this.tail.push({ ...this.coords });
    }
  }
}

export default GameObject;
