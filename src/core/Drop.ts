import GameObject, { GameObjectOptions } from './GameObject';

// aliases
export type DropType = 'fix' | 'freeze' | 'shield';

// constants
export const droppable: DropType[] = ['fix', 'freeze', 'shield'];

// interfaces
export interface DropOptions
  extends Omit<GameObjectOptions, 'hitBoxRadius' | 'type'> {
  type: DropType;
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
    this.oscillate();
  }

  private oscillate() {
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
}

export default Drop;
