import GameObject, {
  GameObjectOptions,
  GameObjectSnapshot
} from './GameObject';

// aliases
export type DropType = 'fix' | 'fuel' | 'ammo';

// constants
export const droppable: DropType[] = ['fix', 'fuel', 'ammo'];

// interfaces
export interface DropOptions
  extends Omit<GameObjectOptions, 'hitBoxRadius' | 'type'> {
  type: DropType;
}

export interface DropSnapshot extends GameObjectSnapshot {
  dropType: DropType;
}

class Drop extends GameObject {
  // public
  public dropType: DropType;
  // private
  private rotatingRight: boolean = true;
  private rotationCone: number = Math.PI / 12;
  // constructor
  constructor(options: DropOptions) {
    super({
      ...options,
      hitBoxRadius: 30,
      type: 'drop',
      rotationSpeed: Math.PI / 100
    });
    this.dropType = options.type;
  }

  public update() {
    super.update();
    if (this.rotatingRight) {
      if (this.orientation > this.rotationCone) {
        this.changeRotationDirection();
        this.rotatingRight = false;
      }
    } else {
      if (this.orientation < -this.rotationCone) {
        this.changeRotationDirection();
        this.rotatingRight = true;
      }
    }
  }

  public serialize(): DropSnapshot {
    return {
      ...super.serialize(),
      dropType: this.dropType
    };
  }
}

export default Drop;
