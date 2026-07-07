import Entity from './Entity';
import { v4 as uuidv4 } from 'uuid';
import { GameObjectOptions, GameObjectType, Point, Temperature } from 'types';

class GameObject extends Entity {
  // public
  public id: string;
  public type: GameObjectType;
  public hitBoxRadius: number;
  public life: number;
  public isExpired: boolean;
  public tailLength: number;
  // private
  private tailBuffer: Point[] = [];
  private tailHead = 0;
  private tailCountValue = 0;
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

  public get tailCount(): number {
    return this.tailCountValue;
  }

  // Returns the tail point at logical index i, ordered oldest (0) to newest.
  public tailAt(i: number): Point {
    return this.tailBuffer[(this.tailHead + i) % this.tailLength];
  }

  private updateTail(): void {
    const shouldUpdate = this.updatesCount % 2 === 0;
    if (!shouldUpdate) {
      return;
    }
    const point = { ...this.coords };
    if (this.tailCountValue < this.tailLength) {
      this.tailBuffer[this.tailCountValue] = point;
      this.tailCountValue++;
    } else {
      this.tailBuffer[this.tailHead] = point;
      this.tailHead = (this.tailHead + 1) % this.tailLength;
    }
  }
}

export default GameObject;
