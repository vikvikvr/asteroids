import { haveCollided, squareDistance, randomCoordsFarFrom, notDirection } from './geometry';
import { makeCollidable } from '../utils/test-utils';

const CONE_ANGLE = Math.PI / 3;

describe('geometry', () => {
  describe('haveCollided', () => {
    it('returns true for collisions', () => {
      let obj1 = makeCollidable(200, 200, 20);
      let obj2 = makeCollidable(240, 200, 30);
      expect(haveCollided(obj1, obj2)).toBe(true);
    });
    it('returns false otherwise', () => {
      let obj1 = makeCollidable(200, 200, 20);
      let obj2 = makeCollidable(300, 200, 30);
      expect(haveCollided(obj1, obj2)).toBe(false);
    });
  });
  describe('randomCoordsFarFrom', () => {
    let world = { width: 1000, height: 1000 };
    it('uses default hitBoxMult', () => {
      let obj = makeCollidable(0, 0, 50);
      let coords = randomCoordsFarFrom(obj, world);
      expect(squareDistance(obj.coords, coords)).toBeGreaterThan((2 * 50) ** 2);
    });
    it('allows custom hitBoxMult', () => {
      let obj = makeCollidable(0, 0, 50);
      let coords = randomCoordsFarFrom(obj, world, 5);
      expect(squareDistance(obj.coords, coords)).toBeGreaterThan((5 * 50) ** 2);
    });
    it('throws if too many tries', () => {
      let obj = makeCollidable(0, 0, 10_000);
      expect(() => randomCoordsFarFrom(obj, world)).toThrow();
    });
  });

  describe('notDirection', () => {
    it('avoids the region around 0 for a positive direction', () => {
      const direction = Math.PI / 2;
      for (let i = 0; i < 1000; i++) {
        const dir = notDirection(direction, CONE_ANGLE);
        expect(Math.abs(dir)).toBeGreaterThan(CONE_ANGLE / 2);
      }
    });
    it('avoids the region around PI for a negative direction', () => {
      const direction = -Math.PI / 2;
      for (let i = 0; i < 1000; i++) {
        const dir = notDirection(direction, CONE_ANGLE);
        expect(Math.abs(dir - Math.PI)).toBeGreaterThan(CONE_ANGLE / 2);
      }
    });
  });
});
