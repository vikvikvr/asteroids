import Interpolator from './Interpolator';

const steps = 5;
const current = 5;
var interpol: Interpolator;

beforeEach(() => {
  interpol = new Interpolator({ current, steps });
});

describe('interpolator', () => {
  it('does not interpolate when steps are missing', () => {
    let interpol2 = new Interpolator({ current });
    expect(interpol2.next()).toBe(5);
    expect(interpol2.next()).toBe(5);
    expect(interpol2.next()).toBe(5);
  });
  it('does nothing when current equals target', () => {
    expect(interpol.next()).toBe(5);
  });
  it('interpolates higher values', () => {
    interpol.setTarget(10);
    for (let i = 1; i <= steps; i++) {
      expect(interpol.next()).toBe(current + i);
    }
  });
  it('interpolates lower values', () => {
    interpol.setTarget(0);
    for (let i = 1; i <= steps; i++) {
      expect(interpol.next()).toBe(steps - i);
    }
  });
});
