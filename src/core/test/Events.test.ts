import * as ev from '../Events';
import { validate as uuidValidate } from 'uuid';
import Asteroid from '../Asteroid';
import Bullet from '../Bullet';
import { AsteroidSize } from 'types';

const world = { width: 1000, height: 1000 };
const coords = { x: 42, y: 84 };

function makeAsteroid() {
  return new Asteroid({ size: AsteroidSize.Large, world, coords, direction: 0 });
}

function makeBullet() {
  return new Bullet({ world, coords, direction: 0, speed: 10 });
}

describe('Events', () => {
  describe('GameEvent', () => {
    it('saves a different copy of coords', () => {
      let originalCoords = { x: 0, y: 0 };
      let event = new ev.GameEvent('SHIP_HIT', originalCoords);
      expect(event.coords).toEqual({ x: 0, y: 0 });
      originalCoords.x = 5;
      expect(event.coords).toEqual({ x: 0, y: 0 });
    });
    it('assigns type', () => {
      let event = new ev.GameEvent('SHIP_HIT', { x: 0, y: 0 });
      expect(event.type).toBe('SHIP_HIT');
    });
    it('assigns a unique id', () => {
      let event = new ev.GameEvent('SHIP_HIT', { x: 0, y: 0 });
      expect(uuidValidate(event.id)).toBe(true);
    });
  });
  describe('ShipHit', () => {
    it('passes the right arguments to super', () => {
      let asteroid = makeAsteroid();
      let event = new ev.ShipHit(asteroid);
      expect(event.type).toBe('SHIP_HIT');
      expect(event.coords).toEqual(coords);
    });
    it('assigns own public properties', () => {
      let asteroid = makeAsteroid();
      let event = new ev.ShipHit(asteroid);
      expect(event.asteroidId).toBe(asteroid.id);
      expect(event.damage).toEqual(asteroid.damage);
      expect(event.size).toBe(asteroid.size);
    });
  });
  describe('BulletHit', () => {
    it('passes the right arguments to super', () => {
      let asteroid = makeAsteroid();
      let bullet = makeBullet();
      let event = new ev.BulletHit(bullet, asteroid, false);
      expect(event.type).toBe('BULLET_HIT');
      expect(event.coords).toEqual(coords);
    });
    it('assigns own public properties', () => {
      let asteroid = makeAsteroid();
      let bullet = makeBullet();
      let event = new ev.BulletHit(bullet, asteroid, true);
      expect(event.bulletId).toBe(bullet.id);
      expect(event.asteroidId).toBe(asteroid.id);
      expect(event.size).toBe(asteroid.size);
      expect(event.shattered).toBe(true);
    });
  });
});
