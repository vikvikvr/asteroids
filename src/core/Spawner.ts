import {
  circleFraction,
  notDirection,
  randomAngle,
  randomCoordsFarFrom
} from 'lib/geometry';
import { AsteroidOptions, AsteroidSpawnOptions, GameState, Rect } from 'types';
import Asteroid from './Asteroid';

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

  public spawnAsteroid(spawnOptions: AsteroidSpawnOptions): void {
    const { asteroids } = this.state;
    const howMany = spawnOptions.count || 1;
    for (let i = 0; i < howMany; i++) {
      const options = this.makeAsteroidOptions(spawnOptions);
      const asteroid = new Asteroid(options);
      asteroids.push(asteroid);
    }
  }

  private makeAsteroidOptions(
    spawnOptions: AsteroidSpawnOptions
  ): AsteroidOptions {
    let direction = randomAngle();
    if (spawnOptions.notDirection) {
      direction = notDirection(spawnOptions.notDirection, this.CONE_ANGLE);
    }
    return {
      size: spawnOptions.size,
      world: this.world,
      coords:
        spawnOptions.coords ||
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
