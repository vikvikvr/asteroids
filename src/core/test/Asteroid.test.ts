import Asteroid, { speeds, hitBoxes, damages } from '../Asteroid';
import { AsteroidSize } from 'types';

const world = { width: 1000, height: 1000 };
const coords = { x: 0, y: 0 };

describe('asteroid', () => {
  it('bases hitBoxRadius, speed and damage on size', () => {
    const sizes = [AsteroidSize.Small, AsteroidSize.Medium, AsteroidSize.Large];
    sizes.forEach((size) => {
      let ast = new Asteroid({ size, world, coords, direction: 0 });
      expect(ast.speed).toBe(speeds[size]);
      expect(ast.hitBoxRadius).toBe(hitBoxes[size]);
      expect(ast.damage).toBe(damages[size]);
    });
  });
  it('splits large to medium', () => {
    let ast = new Asteroid({ size: AsteroidSize.Large, world, coords, direction: 0 });
    expect(ast.splitSize()).toBe(AsteroidSize.Medium);
  });
  it('splits medium to small', () => {
    let ast = new Asteroid({ size: AsteroidSize.Medium, world, coords, direction: 0 });
    expect(ast.splitSize()).toBe(AsteroidSize.Small);
  });
  it('does not split small', () => {
    let ast = new Asteroid({ size: AsteroidSize.Small, world, coords, direction: 0 });
    expect(ast.splitSize()).toBe(null);
  });
});
