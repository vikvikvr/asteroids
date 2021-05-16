import { GameState } from './GameEngine';
import {
  notDirection,
  Point,
  randomCoordsFarFrom,
  Rect
} from '../lib/geometry';
import Asteroid, { AsteroidOptions, AsteroidSize } from './Asteroid';

export interface AsteroidSpawnOptions {
  count?: number;
  coords?: Point;
  size?: AsteroidSize;
  notDirection?: number;
}

export type SpawnerEtas = {
  asteroids: number;
};

export type ID = string;

class Spawner {
  // public
  public state: GameState;
  public world: Rect;
  // private
  private HIT_BOX_MULTIPLIER = 5;
  private CONE_ANGLE = Math.PI / 3;

  constructor(state: GameState, world: Rect) {
    this.state = state;
    this.world = world;
  }

  public spawnAsteroid(options: AsteroidSpawnOptions = {}): Asteroid[] {
    let { asteroids } = this.state;
    let added: Asteroid[] = [];
    for (let i = 0; i < (options.count || 1); i++) {
      let asteroidOptions = this.makeAsteroidOptions(options);
      let asteroid = new Asteroid(asteroidOptions);
      asteroids.push(asteroid);
      added.push(asteroid);
    }
    return added;
  }

  private makeAsteroidOptions(
    options: AsteroidSpawnOptions = {}
  ): AsteroidOptions {
    let direction = Math.random() * Math.PI * 2;
    if (options.notDirection) {
      direction = notDirection(
        options.notDirection,
        this.CONE_ANGLE,
        Math.random
      );
    }
    return {
      size: options.size || 'large',
      world: this.world,
      coords:
        options.coords ||
        randomCoordsFarFrom(
          this.state.ship,
          this.world,
          this.HIT_BOX_MULTIPLIER
        ),
      direction
    };
  }
}

export default Spawner;
