import GameObject, { GameObjectOptions } from './GameObject';

type BulletOptions = Omit<
  GameObjectOptions,
  'type' | 'hitBoxRadius' | 'duration'
>;

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
}

export default Bullet;
