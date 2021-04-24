import { Collidable, Point, Rect } from '../lib/geometry';
import Bullet from '../core/Bullet';

function makeCollidable(
  x: number,
  y: number,
  hitBoxRadius: number
): Collidable {
  return {
    coords: { x, y },
    hitBoxRadius
  };
}

function makeBullet(world: Rect, coords: Point) {
  return new Bullet({
    world,
    coords
  });
}

export { makeCollidable, makeBullet };
