import { makeBullet } from '../../utils/test-utils';
import GameEngine from '../GameEngine';
import Ship from '../Ship';
import * as ev from '../Events';
import { AsteroidSize, damages } from '../Asteroid';
import Drop from '../Drop';

const world = { height: 10000, width: 10000 };
var engine: GameEngine;
var mock = jest.fn();

beforeEach(() => {
  engine = new GameEngine(world);
  jest.resetAllMocks();
});

describe('gameEngine', () => {
  describe('constructor', () => {
    it('adds a ship', () => {
      expect(engine.state.ship).toBeInstanceOf(Ship);
    });
  });
  describe('update', () => {
    it('updates ship', () => {
      engine.state.ship.update = mock;
      engine['update']();
      expect(mock).toHaveBeenCalledTimes(1);
    });
    it('updates asteroids', () => {
      engine['spawner'].spawnAsteroid({});
      engine.state.asteroids[0].update = mock;
      engine['update']();
      expect(mock).toHaveBeenCalledTimes(1);
    });
    it('checks collisions', () => {
      engine['checkCollisions'] = mock;
      engine['update']();
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });
  describe('detects collisions', () => {
    it('asteroid vs bullet', () => {
      let { ship, asteroids, events } = engine.state;
      engine['spawner'].spawnAsteroid();
      ship.bullets.push(makeBullet(world, asteroids[0].coords));
      engine['checkCollisions']();
      expect(events[0]).toBeInstanceOf(ev.BulletHit);
    });
    it('asteroid vs ship', () => {
      let { ship, events } = engine.state;
      engine['spawner'].spawnAsteroid({ size: 'large', coords: ship.coords });
      engine['checkCollisions']();
      expect(events[0]).toBeInstanceOf(ev.ShipHit);
    });
    it('ship vs bonus', () => {
      let { bonuses, events, ship } = engine.state;
      bonuses.push(new Drop({ type: 'fix', coords: ship.coords }));
      engine['checkCollisions']();
      expect(events[0]).toBeInstanceOf(ev.GotBonus);
    });
  });
  describe('process events', () => {
    describe('bullet hit', () => {
      function spawnAndHit(size: AsteroidSize) {
        let { ship } = engine.state;
        let asteroid = engine['spawner'].spawnAsteroid({ size })[0];
        let bullet = makeBullet(world, asteroid.coords);
        ship.bullets.push(bullet);
        return { asteroidId: asteroid.id, bulletId: bullet.id };
      }
      it('splits large asteroids', () => {
        spawnAndHit('large');
        engine['checkCollisions']();
        expect(engine['countAsteroids']('large')).toBe(0);
        expect(engine['countAsteroids']('medium')).toBe(2);
      });
      it('splits medium asteroids', () => {
        spawnAndHit('medium');
        engine['checkCollisions']();
        expect(engine['countAsteroids']('medium')).toBe(0);
        expect(engine['countAsteroids']('small')).toBe(2);
      });
      it('does not split small asteroids', () => {
        let { asteroids } = engine.state;
        spawnAndHit('small');
        engine['checkCollisions']();
        expect(asteroids.length).toBe(0);
      });
      it('removes original asteroid and bullet', () => {
        let { ship } = engine.state;
        let { asteroidId, bulletId } = spawnAndHit('large');
        engine['checkCollisions']();
        expect(engine['hasAsteroid'](asteroidId)).toBe(false);
        expect(ship['hasBullet'](bulletId)).toBe(false);
      });
    });
    describe('ship hit', () => {
      describe('damages ship based on asteroid size', () => {
        const sizes: AsteroidSize[] = ['large', 'medium', 'small'];
        sizes.forEach((size) => {
          it(`${size}`, () => {
            let { ship, events } = engine.state;
            let { id, damage, coords } = engine['spawner'].spawnAsteroid({
              size
            })[0];
            events.push(new ev.ShipHit(id, damage, coords));
            engine['checkCollisions']();
            expect(ship.life).toBe(1 - damages[size]);
          });
        });
      });
      it('removes asteroid and damages ship', () => {
        let { events, asteroids } = engine.state;
        let { id, damage, coords } = engine['spawner'].spawnAsteroid()[0];
        events.push(new ev.ShipHit(id, damage, coords));
        engine['checkCollisions']();
        expect(asteroids.length).toBe(0);
      });
    });
    describe('got bonus', () => {
      beforeEach(() => {
        let { bonuses, events } = engine.state;
        let bonus = new Drop({ type: 'fix' });
        bonuses.push(bonus);
        events.push(new ev.GotBonus(bonus.id, bonus.dropType, bonus.coords));
      });
      it('gives bonus type to ship', () => {
        engine.state.ship.collectBonus = mock;
        engine['checkCollisions']();
        expect(mock).toHaveBeenLastCalledWith('fix');
      });
    });
    it('removes all events after', () => {
      engine.state.events.push(
        new ev.BulletHit('first-id', 'second-id', { x: 0, y: 0 })
      );
      engine['checkCollisions']();
      expect(engine.state.events.length).toBe(0);
    });
  });
});
