import GameEngine from '../GameEngine';
import Ship from '../Ship';
import Bullet from '../Bullet';
import * as ev from '../Events';
import { AsteroidSize } from 'types';

const world = { height: 10000, width: 10000 };
let engine: GameEngine;
let mock = vi.fn();

function makeBullet(coords = { x: 0, y: 0 }) {
  return new Bullet({ world, coords, direction: 0, speed: 10 });
}

beforeEach(() => {
  engine = new GameEngine(world);
  vi.resetAllMocks();
});

describe('gameEngine', () => {
  describe('constructor', () => {
    it('adds a ship', () => {
      expect(engine.state.ship).toBeInstanceOf(Ship);
    });
  });
  describe('update', () => {
    beforeEach(() => {
      engine.status = 'playing';
    });
    it('updates ship', () => {
      engine.state.ship.update = mock;
      engine.update();
      expect(mock).toHaveBeenCalledTimes(1);
    });
    it('updates asteroids', () => {
      engine.spawner.spawnAsteroid({ size: AsteroidSize.Large });
      engine.state.asteroids[0].update = mock;
      engine.update();
      expect(mock).toHaveBeenCalledTimes(1);
    });
    it('checks collisions', () => {
      engine['checkCollisions'] = mock;
      engine.update();
      expect(mock).toHaveBeenCalledTimes(1);
    });
    it('does nothing when not playing', () => {
      engine.status = 'idle';
      engine.state.ship.update = mock;
      engine.update();
      expect(mock).not.toHaveBeenCalled();
    });
  });
  describe('detects collisions', () => {
    it('asteroid vs bullet', () => {
      let { ship, asteroids, events } = engine.state;
      engine.spawner.spawnAsteroid({ size: AsteroidSize.Large });
      ship.bullets.push(makeBullet(asteroids[0].coords));
      engine['checkCollisions']();
      expect(events[0]).toBeInstanceOf(ev.BulletHit);
    });
    it('asteroid vs ship', () => {
      let { ship, events } = engine.state;
      engine.spawner.spawnAsteroid({
        size: AsteroidSize.Large,
        coords: ship.coords
      });
      engine['checkCollisions']();
      expect(events[0]).toBeInstanceOf(ev.ShipHit);
    });
  });
  describe('process bullet hit', () => {
    function spawnAndHit(size: AsteroidSize) {
      let { ship, asteroids } = engine.state;
      engine.spawner.spawnAsteroid({ size });
      let asteroid = asteroids[0];
      let bullet = makeBullet(asteroid.coords);
      ship.bullets.push(bullet);
      return { asteroidId: asteroid.id, bulletId: bullet.id };
    }
    it('splits large asteroids', () => {
      spawnAndHit(AsteroidSize.Large);
      engine['checkCollisions']();
      let sizes = engine.state.asteroids.map((a) => a.size);
      expect(sizes.filter((s) => s === AsteroidSize.Large).length).toBe(0);
      expect(sizes.filter((s) => s === AsteroidSize.Medium).length).toBe(2);
    });
    it('splits medium asteroids', () => {
      spawnAndHit(AsteroidSize.Medium);
      engine['checkCollisions']();
      let sizes = engine.state.asteroids.map((a) => a.size);
      expect(sizes.filter((s) => s === AsteroidSize.Medium).length).toBe(0);
      expect(sizes.filter((s) => s === AsteroidSize.Small).length).toBe(2);
    });
    it('does not split small asteroids', () => {
      spawnAndHit(AsteroidSize.Small);
      engine['checkCollisions']();
      expect(engine.state.asteroids.length).toBe(0);
    });
    it('removes original asteroid and bullet', () => {
      let { ship } = engine.state;
      let { asteroidId, bulletId } = spawnAndHit(AsteroidSize.Large);
      engine['checkCollisions']();
      expect(
        engine.state.asteroids.find((a) => a.id === asteroidId)
      ).toBeUndefined();
      expect(ship.bullets.find((b) => b.id === bulletId)).toBeUndefined();
    });
    it('adds to the score', () => {
      spawnAndHit(AsteroidSize.Large);
      engine['checkCollisions']();
      expect(engine.state.score).toBeGreaterThan(0);
    });
  });
  describe('process ship hit', () => {
    it('damages ship based on asteroid size and removes it', () => {
      let { ship, asteroids } = engine.state;
      engine.spawner.spawnAsteroid({
        size: AsteroidSize.Large,
        coords: ship.coords
      });
      let damage = asteroids[0].damage;
      engine['checkCollisions']();
      expect(ship.life).toBeCloseTo(1 - damage);
      expect(asteroids.length).toBe(0);
    });
  });
});
