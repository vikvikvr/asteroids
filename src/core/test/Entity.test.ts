import Entity from '../Entity';
import { Temperature } from 'types';

const world = { width: 1000, height: 1000 };

describe('entity', () => {
  describe('constructor', () => {
    it('uses defaults for missing options', () => {
      let ent = new Entity({ world, coords: { x: 0, y: 0 } });
      expect(ent.speed).toBe(0);
      expect(ent.direction).toBe(0);
      expect(ent.orientation).toBe(0);
      expect(ent.rotationSpeed).toBe(0);
      expect(ent.world).toEqual(world);
      expect(ent.coords).toEqual({ x: 0, y: 0 });
    });
  });
  describe('update', () => {
    it('updates position and orientation', () => {
      let ent = new Entity({
        world,
        coords: { x: 0, y: 0 },
        rotationSpeed: Math.PI / 12,
        direction: Math.PI / 3,
        speed: 1
      });
      ent['update'](Temperature.Normal);
      expect(ent.coords.x).toBeCloseTo(0.5);
      expect(ent.coords.y).toBeCloseTo(Math.sqrt(3) / 2);
      expect(ent.orientation).toBeCloseTo(Math.PI / 12);
    });
    it('teleports from bottom right', () => {
      let ent = new Entity({ world, coords: { x: 1010, y: 1010 } });
      ent['update'](Temperature.Normal);
      expect(ent.coords).toEqual({ x: 10, y: 10 });
    });
    it('teleports from top left', () => {
      let ent = new Entity({ world, coords: { x: -10, y: -10 } });
      ent['update'](Temperature.Normal);
      expect(ent.coords).toEqual({ x: 990, y: 990 });
    });
    it('doubles rotation speed and applies the temperature multiplier when hot', () => {
      let ent = new Entity({
        world,
        coords: { x: 0, y: 0 },
        rotationSpeed: 1
      });
      ent['update'](Temperature.High);
      expect(ent.orientation).toBeCloseTo(4);
    });
    it('slows down movement when cold', () => {
      let ent = new Entity({
        world,
        coords: { x: 0, y: 0 },
        direction: 0,
        speed: 1
      });
      ent['update'](Temperature.Low);
      expect(ent.coords.x).toBeCloseTo(0.05);
    });
  });
});
