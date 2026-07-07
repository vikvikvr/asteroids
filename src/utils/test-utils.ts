import { Collidable, Point } from 'types';

export function makeCollidable(
  x: number,
  y: number,
  hitBoxRadius: number
): Collidable {
  return { coords: { x, y } as Point, hitBoxRadius };
}
