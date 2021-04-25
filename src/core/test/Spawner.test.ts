import { distance } from '../../lib/geometry';
import Ship from '../Ship';
import Spawner from '../Spawner';
import { droppable } from '../Drop';
import { sizes } from '../Asteroid';

var spawner: Spawner;

beforeEach(() => {
  spawner = new Spawner(
    {
      ship: new Ship(),
      asteroids: [],
      bonuses: [],
      events: []
    },
    { height: 1000, width: 1000 }
  );
});

describe('Spawner', () => {
  describe('constructor', () => {
    it('assigns values in constuctor', () => {
      expect(spawner.state.asteroids).toEqual([]);
      expect(spawner.state.bonuses).toEqual([]);
      expect(spawner.state.events).toEqual([]);
      expect(spawner.world).toEqual({ height: 1000, width: 1000 });
      expect(spawner.nextAsteroidSpawnAt).toBe(Infinity);
      expect(spawner.nextBonusSpawnAt).toBe(Infinity);
    });
  });
  describe('spawn bonus', () => {
    it('spawns the right amount', () => {
      let spawned = spawner.spawnBonus({ count: 2 });
      expect(spawned.length).toBe(2);
    });
    it('spawns the right type', () => {
      droppable.forEach((type) => {
        let spawned = spawner.spawnBonus({ type });
        expect(spawned[0].dropType).toBe(type);
      });
    });
    it('spawns at the given coords', () => {
      let coords = { x: 42, y: 84 };
      let spawned = spawner.spawnBonus({ coords });
      expect(spawned[0].coords).toEqual(coords);
    });
    it('spawns them far from ship', () => {
      for (let i = 0; i < 1000; i++) {
        let { ship } = spawner.state;
        spawner.state.bonuses = [];
        let spawned = spawner.spawnBonus();
        let coords = spawned[0].coords;
        expect(distance(coords, ship.coords)).toBeGreaterThan(
          ship.hitBoxRadius * spawner['HIT_BOX_MULTIPLIER']
        );
      }
    });
    it('allows only 3 of the same type', () => {
      let spawned = spawner.spawnBonus({ count: 4, type: 'ammo' });
      expect(spawned.length).toBe(3);
    });
  });
  describe('spawn asteroid', () => {
    it('spawns the right amount', () => {
      let spawned = spawner.spawnAsteroid({ count: 2 });
      expect(spawned.length).toBe(2);
    });
    it('spawns the right size', () => {
      sizes.forEach((size) => {
        let spawned = spawner.spawnAsteroid({ size });
        expect(spawned[0].size).toBe(size);
      });
    });
    it('spawns at the given coords', () => {
      let coords = { x: 42, y: 84 };
      let spawned = spawner.spawnAsteroid({ coords });
      expect(spawned[0].coords).toEqual(coords);
    });
    it('spawns them far from ship', () => {
      for (let i = 0; i < 1000; i++) {
        let { ship } = spawner.state;
        let spawned = spawner.spawnAsteroid();
        let coords = spawned[0].coords;
        expect(distance(coords, ship.coords)).toBeGreaterThan(
          ship.hitBoxRadius * spawner['HIT_BOX_MULTIPLIER']
        );
      }
    });
    it('avoids a given direction', () => {
      let angle = Math.PI / 2;
      for (let i = 0; i < 1000; i++) {
        let { direction } = spawner.spawnAsteroid({ notDirection: angle })[0];
        let angleDist = Math.abs(direction - angle);
        expect(angleDist).toBeGreaterThan(spawner['CONE_ANGLE'] / 2);
      }
    });
  });
  describe('asteroid every', () => {
    it('calls spawn asteroid with the given interval', () => {
      jest.useFakeTimers();
      let ms = 500;
      spawner.spawnAsteroid = jest.fn();
      spawner.asteroidEvery(ms);
      jest.advanceTimersByTime(ms * 5);
      expect(spawner.spawnAsteroid).toHaveBeenCalledTimes(5);
    });
    it('passes options to spawn asteroid', () => {
      jest.useFakeTimers();
      let ms = 500;
      spawner.spawnAsteroid = jest.fn();
      spawner.asteroidEvery(ms, { count: 2 });
      jest.advanceTimersByTime(ms);
      expect(spawner.spawnAsteroid).toHaveBeenLastCalledWith({ count: 2 });
    });
    it('updates time of next spawn', () => {
      let now = jest.spyOn(global.Date, 'now');
      jest.useFakeTimers();
      let interval = 500;
      spawner.asteroidEvery(interval);
      for (let i = 1; i < 3; i++) {
        now.mockReturnValue(10_000 * i);
        jest.advanceTimersByTime(interval);
        expect(spawner.nextAsteroidSpawnAt).toBe(10_000 * i + interval);
      }
    });
  });
});
