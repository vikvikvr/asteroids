import Entity from '../Entity';

describe('entity', () => {
  describe('constructor', () => {
    it('uses defaults for missing options', () => {
      let ent = new Entity();
      expect(ent.speed).toBe(0);
      expect(ent.direction).toBe(0);
      expect(ent.orientation).toBe(0);
      expect(ent['rotationSpeed']).toBe(0);
      expect(ent.world).toEqual({ width: 1000, height: 1000 });
      expect(ent.coords).toEqual({ x: 0, y: 0 });
    });
  });
  describe('update', () => {
    it('updates position and orientation', () => {
      let ent = new Entity({
        rotationSpeed: Math.PI / 12,
        direction: Math.PI / 3,
        speed: 1
      });
      ent['update']();
      expect(ent.coords.x).toBeCloseTo(0.5);
      expect(ent.coords.y).toBeCloseTo(Math.sqrt(3) / 2);
      expect(ent.orientation).toBeCloseTo(Math.PI / 12);
    });
    it('teleports from bottom right', () => {
      let ent = new Entity({ coords: { x: 1010, y: 1010 } });
      ent['update']();
      expect(ent.coords).toEqual({ x: 10, y: 10 });
    });
    it('teleports from top left', () => {
      let ent = new Entity({ coords: { x: -10, y: -10 } });
      ent['update']();
      expect(ent.coords).toEqual({ x: 990, y: 990 });
    });
    it('reaches higher target direction smoothly', () => {
      let steps = 6;
      let ent = new Entity({ angularSpeed: 1 / steps });
      ent['setTargetDirection'](Math.PI);
      for (let i = 1; i <= steps; i++) {
        ent['update']();
        expect(ent.direction).toBeCloseTo(i / steps);
      }
    });
    it('reaches lower target direction smoothly', () => {
      let steps = 6;
      let ent = new Entity({ angularSpeed: 1 / steps });
      ent['setTargetDirection'](-Math.PI);
      for (let i = 1; i <= steps; i++) {
        ent['update']();
        expect(ent.direction).toBeCloseTo(-i / steps);
      }
    });
  });
});
