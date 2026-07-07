import Ship from '../Ship';
import Spawner from '../Spawner';
import { squareDistance } from 'lib/geometry';
import { AsteroidSize, GameState, Rect, Temperature } from 'types';

const world: Rect = { width: 1000, height: 1000 };

let state: GameState;
let spawner: Spawner;

beforeEach(() => {
  state = {
    ship: new Ship({ world, coords: { x: 500, y: 500 } }),
    asteroids: [],
    shards: [],
    events: [],
    score: 0,
    level: 0,
    temperature: Temperature.Normal
  };
  spawner = new Spawner(state, world);
});

describe('Spawner', () => {
  describe('constructor', () => {
    it('assigns values in constructor', () => {
      expect(spawner.state).toBe(state);
      expect(spawner.world).toEqual(world);
    });
  });
  describe('spawnAsteroid', () => {
    it('spawns the right amount', () => {
      spawner.spawnAsteroid({ size: AsteroidSize.Large, count: 2 });
      expect(state.asteroids.length).toBe(2);
    });
    it('spawns the right size', () => {
      [AsteroidSize.Small, AsteroidSize.Medium, AsteroidSize.Large].forEach(
        (size) => {
          state.asteroids = [];
          spawner.spawnAsteroid({ size });
          expect(state.asteroids[0].size).toBe(size);
        }
      );
    });
    it('spawns at the given coords', () => {
      let coords = { x: 42, y: 84 };
      spawner.spawnAsteroid({ size: AsteroidSize.Large, coords });
      expect(state.asteroids[0].coords).toEqual(coords);
    });
    it('spawns them far from the ship', () => {
      for (let i = 0; i < 100; i++) {
        state.asteroids = [];
        spawner.spawnAsteroid({ size: AsteroidSize.Large });
        let dist = squareDistance(state.asteroids[0].coords, state.ship.coords);
        let minDistance = state.ship.hitBoxRadius * spawner['HIT_BOX_MULTIPLIER'];
        expect(dist).toBeGreaterThan(minDistance ** 2);
      }
    });
    it('avoids a given direction', () => {
      let angle = Math.PI / 2;
      for (let i = 0; i < 100; i++) {
        state.asteroids = [];
        spawner.spawnAsteroid({ size: AsteroidSize.Large, notDirection: angle });
        let { direction } = state.asteroids[0];
        expect(Math.abs(direction)).toBeGreaterThan(spawner['CONE_ANGLE'] / 2);
      }
    });
  });
});
