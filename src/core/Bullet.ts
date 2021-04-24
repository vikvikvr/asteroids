import GameObject, {
  GameObjectOptions,
  GameObjectSnapshot
} from './GameObject';

type BulletOptions = Omit<
  GameObjectOptions,
  'type' | 'hitBoxRadius' | 'duration'
>;

export type BulletSnapshot = GameObjectSnapshot;

class Bullet extends GameObject {
  constructor(options: BulletOptions = {}) {
    super({
      ...options,
      type: 'bullet',
      hitBoxRadius: 3,
      duration: 2000
    });
  }

  public update() {
    super.update();
  }

  public serialize(): BulletSnapshot {
    return super.serialize();
  }
}

export default Bullet;
