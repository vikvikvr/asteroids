import Entity, { EntityOptions, EntitySnapshot } from './Entity';
import { v4 as uuidv4 } from 'uuid';

export type GameObjectType = 'ship' | 'asteroid' | 'bullet' | 'drop';

export interface GameObjectOptions extends Partial<EntityOptions> {
  type?: GameObjectType;
  hitBoxRadius?: number;
  duration?: number;
}

export interface GameObjectSnapshot extends EntitySnapshot {
  id: string;
  type: GameObjectType;
  hitBoxRadius: number;
  life: number;
  isExpired: boolean;
}

class GameObject extends Entity {
  // public
  public id: string;
  public type: GameObjectType;
  public hitBoxRadius: number;
  public life: number;
  public isExpired: boolean;
  // private
  private expiresAt: number;

  constructor(options: GameObjectOptions = {}) {
    super({ ...options });
    this.id = uuidv4();
    this.type = options.type || 'asteroid';
    this.hitBoxRadius = options.hitBoxRadius || 50;
    this.isExpired = false;
    this.life = 1;
    this.expiresAt = Date.now() + (options.duration || Infinity);
  }

  protected serialize(): GameObjectSnapshot {
    return {
      ...super.serialize(),
      id: this.id,
      type: this.type,
      hitBoxRadius: this.hitBoxRadius,
      life: this.life,
      isExpired: this.isExpired
    };
  }

  protected update(): void {
    super.update();
    this.isExpired = Date.now() > this.expiresAt;
  }
}

export default GameObject;
