import Bullet from '../Bullet';

const world = { width: 1000, height: 1000 };

describe('bullet', () => {
  it('sets the right defaults', () => {
    let now = Date.now();
    let bullet = new Bullet({
      world,
      coords: { x: 0, y: 0 },
      direction: 0,
      speed: 10
    });
    expect(bullet.type).toBe('bullet');
    expect(bullet.hitBoxRadius).toBe(3);
    expect(bullet['expiresAt']).toBeGreaterThanOrEqual(now + 1500);
  });
});
