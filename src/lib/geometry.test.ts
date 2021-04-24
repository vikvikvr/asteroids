import {
  haveCollided,
  distance,
  randomCoordsFarFrom,
  notDirection
} from './geometry';
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
      expect(distance(obj.coords, coords)).toBeGreaterThan(2 * 50);
    });
    it('allows custom hitBoxMult', () => {
      let obj = makeCollidable(0, 0, 50);
      let coords = randomCoordsFarFrom(obj, world, 5);
      expect(distance(obj.coords, coords)).toBeGreaterThan(5 * 50);
    });
    it('throws if too many tries', () => {
      let obj = makeCollidable(0, 0, 10_000);
      expect(() => randomCoordsFarFrom(obj, world)).toThrow();
    });
  });

  describe('not angle', () => {
    var result: number;
    const unwanted = Math.PI / 2;

    var random: jest.Mock<number> = jest.fn();
    it('should return a good lower value', () => {
      random.mockReturnValueOnce(0);
      result = notDirection(unwanted, CONE_ANGLE, random);
      expect(result).toBe(0);
    });
    it('should return a good higher value', () => {
      random.mockReturnValueOnce(0.5);
      result = notDirection(unwanted, CONE_ANGLE, random);
      expect(result).toBe(Math.PI);
    });
    it('should try again for inside values', () => {
      random.mockReturnValueOnce(0.25).mockReturnValueOnce(0.5);
      result = notDirection(unwanted, CONE_ANGLE, random);
      expect(result).toBe(Math.PI);
    });
    it('should work with negative angles', () => {
      random.mockReturnValueOnce(0.5);
      result = notDirection(-unwanted, CONE_ANGLE, random);
      expect(result).toBe(Math.PI);
    });
  });
});
