import { Point, Rect } from '../lib/geometry';
import GameObject from './GameObject';

interface BulletOptions {
  world: Rect;
  coords: Point;
  direction: number;
  speed: number;
}

class Bullet extends GameObject {
  public piercesCount: number;
  constructor(options: BulletOptions) {
    super({
      ...options,
      type: 'bullet',
      hitBoxRadius: 3,
      duration: 1500,
      tailLength: 15
    });
    this.piercesCount = 0;
  }
}

export default Bullet;
