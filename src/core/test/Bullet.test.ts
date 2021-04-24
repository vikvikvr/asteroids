import Bullet from '../Bullet';

describe('bullet', () => {
  it('sets the right defaults', () => {
    let now = Date.now();
    let bullet = new Bullet();
    expect(bullet.type).toBe('bullet');
    expect(bullet.hitBoxRadius).toBe(3);
    expect(bullet['expiresAt']).toBeGreaterThanOrEqual(now + 2000);
  });
});
