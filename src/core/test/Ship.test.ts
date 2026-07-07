import Ship from '../Ship';
import { Temperature } from 'types';

const world = { width: 1000, height: 1000 };
const coords = { x: 500, y: 500 };

function makeShip() {
  return new Ship({ world, coords });
}

describe('ship', () => {
  describe('constructor', () => {
    it('creates an instance with the right initial values', () => {
      let ship = makeShip();
      expect(ship.type).toBe('ship');
      expect(ship.life).toBe(1);
      expect(ship.bullets).toHaveLength(0);
      expect(ship.hitBoxRadius).toBe(30);
    });
  });
  describe('turnLeft / turnRight', () => {
    it('turns left and right', () => {
      let ship = makeShip();
      let startingDirection = ship.direction;
      ship.turnLeft();
      expect(ship.direction).toBeLessThan(startingDirection);
      ship.turnRight();
      expect(ship.direction).toBeCloseTo(startingDirection);
    });
  });
  describe('accelerate / decelerate', () => {
    it('increases speed up to MAX_SPEED', () => {
      let ship = makeShip();
      for (let i = 0; i < 100; i++) {
        ship.accelerate();
      }
      expect(ship.speed).toBe(ship.MAX_SPEED);
    });
    it('decreases speed down to zero', () => {
      let ship = makeShip();
      ship.accelerate();
      ship.decelerate();
      expect(ship.speed).toBe(0);
    });
  });
  describe('fire', () => {
    it('creates a bullet after enough time has passed', () => {
      let ship = makeShip();
      ship.fire(Temperature.Normal);
      expect(ship.bullets.length).toBe(1);
    });
    it('does not fire again before the cooldown expires', () => {
      let ship = makeShip();
      ship.fire(Temperature.Normal);
      ship.fire(Temperature.Normal);
      expect(ship.bullets.length).toBe(1);
    });
    it('fires two bullets when hot', () => {
      let ship = makeShip();
      ship.fire(Temperature.High);
      expect(ship.bullets.length).toBe(2);
    });
  });
  describe('restoreLife', () => {
    it('regenerates life at normal temperature', () => {
      let ship = makeShip();
      ship.life = 0.5;
      ship.restoreLife(Temperature.Normal);
      expect(ship.life).toBeGreaterThan(0.5);
    });
    it('does not regenerate life at other temperatures', () => {
      let ship = makeShip();
      ship.life = 0.5;
      ship.restoreLife(Temperature.High);
      expect(ship.life).toBe(0.5);
    });
    it('never exceeds max life', () => {
      let ship = makeShip();
      ship.restoreLife(Temperature.Normal);
      expect(ship.life).toBe(1);
    });
  });
  describe('removeBullet', () => {
    it('removes the bullet by id', () => {
      let ship = makeShip();
      ship.fire(Temperature.Normal);
      let bulletId = ship.bullets[0].id;
      ship.removeBullet(bulletId, Temperature.Normal);
      expect(ship.bullets.length).toBe(0);
    });
    it('pierces once before removing when cold', () => {
      let ship = makeShip();
      ship.fire(Temperature.Normal);
      let bullet = ship.bullets[0];
      ship.removeBullet(bullet.id, Temperature.Low);
      expect(ship.bullets.length).toBe(1);
      expect(bullet.piercesCount).toBe(1);
      ship.removeBullet(bullet.id, Temperature.Low);
      expect(ship.bullets.length).toBe(0);
    });
  });
  describe('update', () => {
    it('removes expired bullets', () => {
      let ship = makeShip();
      ship.fire(Temperature.Normal);
      ship.bullets[0]['expiresAt'] = Date.now() - 1;
      ship.update(Temperature.Normal);
      expect(ship.bullets).toHaveLength(0);
    });
  });
});
