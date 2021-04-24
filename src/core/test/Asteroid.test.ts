import Asteroid, { speeds, hitBoxes, AsteroidSize, damages } from '../Asteroid';

describe('asteroid', () => {
  it('bases hitBoxRadius, speed and damage on size', () => {
    const sizes: AsteroidSize[] = ['large', 'medium', 'small'];
    sizes.forEach((size) => {
      let ast = new Asteroid({ size });
      expect(ast.speed).toBe(speeds[size]);
      expect(ast.hitBoxRadius).toBe(hitBoxes[size]);
      expect(ast.damage).toBe(damages[size]);
    });
  });
  it('splits large to medium', () => {
    let ast = new Asteroid({ size: 'large' });
    expect(ast.splitSize()).toBe('medium');
  });
  it('splits medium to small', () => {
    let ast = new Asteroid({ size: 'medium' });
    expect(ast.splitSize()).toBe('small');
  });
  it('does not split small', () => {
    let ast = new Asteroid({ size: 'small' });
    expect(ast.splitSize()).toBe(null);
  });
});
