import { GameState } from './GameEngine';
import {
  circleFraction,
  notDirection,
  Point,
  randomAngle,
  randomCoordsFarFrom,
  Rect
} from '../lib/geometry';
import Asteroid, { AsteroidOptions, AsteroidSize } from './Asteroid';

export interface AsteroidSpawnOptions {
  size: AsteroidSize;
  count?: number;
  coords?: Point;
  notDirection?: number;
}

class Spawner {
  // public
  public state: GameState;
  public world: Rect;
  // private
  private HIT_BOX_MULTIPLIER = 5;
  private CONE_ANGLE = circleFraction(6);

  constructor(state: GameState, world: Rect) {
    this.state = state;
    this.world = world;
  }

  public spawnAsteroid(options: AsteroidSpawnOptions): void {
    const { asteroids } = this.state;
    for (let i = 0; i < (options.count || 1); i++) {
      const asteroidOptions = this.makeAsteroidOptions(options);
      const asteroid = new Asteroid(asteroidOptions);
      asteroids.push(asteroid);
    }
  }

  private makeAsteroidOptions(options: AsteroidSpawnOptions): AsteroidOptions {
    let direction = randomAngle();
    if (options.notDirection) {
      direction = notDirection(options.notDirection, this.CONE_ANGLE);
    }
    return {
      size: options.size,
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
