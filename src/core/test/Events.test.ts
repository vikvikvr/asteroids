import * as ev from '../Events';
import { validate as uuidValidate } from 'uuid';
import Asteroid from '../Asteroid';
import Bullet from '../Bullet';

describe('Events', () => {
  describe('GameEvent', () => {
    it('saves a different copy of coords', () => {
      let coords = { x: 0, y: 0 };
      let event = new ev.GameEvent('SHIP_HIT', coords);
      expect(event.coords).toEqual({ x: 0, y: 0 });
      coords.x = 5;
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
    it('serializes all properties by value', () => {
      let event = new ev.GameEvent('SHIP_HIT', { x: 0, y: 0 });
      let serialized = event.serialize();
      expect(serialized.type).toBe(event.type);
      expect(serialized.id).toBe(event.id);
      expect(serialized.coords).toEqual({ x: 0, y: 0 });
      event.coords.x = 42;
      expect(serialized.coords).toEqual({ x: 0, y: 0 });
    });
  });
  describe('ShipHit', () => {
    it('passes the right arguments to super', () => {
      let event = new ev.ShipHit(new Asteroid({ coords: { x: 42, y: 84 } }));
      expect(event.type).toBe('SHIP_HIT');
      expect(event.coords).toEqual({ x: 42, y: 84 });
    });
    it('assigns own public properties', () => {
      let asteroid = new Asteroid({ coords: { x: 42, y: 84 } });
      let event = new ev.ShipHit(asteroid);
      expect(event.asteroidId).toBe(asteroid.id);
      expect(event.damage).toEqual(asteroid.damage);
    });
  });
  describe('BulletHit', () => {
    it('passes the right arguments to super', () => {
      let asteroid = new Asteroid({ coords: { x: 42, y: 84 } });
      let bullet = new Bullet({ coords: { x: 42, y: 84 } });
      let event = new ev.BulletHit(bullet, asteroid);
      expect(event.type).toBe('BULLET_HIT');
      expect(event.coords).toEqual({ x: 42, y: 84 });
    });
    it('assigns own public properties', () => {
      let asteroid = new Asteroid({ coords: { x: 42, y: 84 } });
      let bullet = new Bullet({ coords: { x: 42, y: 84 } });
      let event = new ev.BulletHit(bullet, asteroid);
      expect(event.bulletId).toBe(bullet.id);
      expect(event.asteroidId).toBe(asteroid.id);
    });
  });
});
