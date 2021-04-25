import Drop, { DropOptions, DropType } from './Drop';
import { GameState } from './GameEngine';
import {
  notDirection,
  Point,
  randomCoordsFarFrom,
  Rect
} from '../lib/geometry';
import Asteroid, { AsteroidOptions, AsteroidSize } from './Asteroid';
import { filter } from 'lodash';

export interface SpawnOptions {
  count?: number;
  coords?: Point;
}

export interface BonusSpawnOptions extends SpawnOptions {
  type?: DropType;
}

export interface AsteroidSpawnOptions extends SpawnOptions {
  size?: AsteroidSize;
  notDirection?: number;
}

export type SpawnerEtas = {
  asteroids: number;
  bonuses: number;
};

export type ID = string;

class Spawner {
  // public
  public state: GameState;
  public world: Rect;
  public nextBonusSpawnAt: number;
  public nextAsteroidSpawnAt: number;
  // private
  private asteroidTimer?: NodeJS.Timeout;
  private bonusTimer?: NodeJS.Timeout;
  private HIT_BOX_MULTIPLIER = 5;
  private CONE_ANGLE = Math.PI / 3;

  constructor(state: GameState, world: Rect) {
    this.state = state;
    this.world = world;
    this.nextAsteroidSpawnAt = Infinity;
    this.nextBonusSpawnAt = Infinity;
  }

  public getEtas(): SpawnerEtas {
    return {
      asteroids: this.nextAsteroidSpawnAt - Date.now(),
      bonuses: this.nextBonusSpawnAt - Date.now()
    };
  }

  public spawnBonus(options: BonusSpawnOptions = {}): Drop[] {
    let { bonuses } = this.state;
    let added: Drop[] = [];
    for (let i = 0; i < (options.count || 1); i++) {
      let dropOptions = this.makeDropOptions(options);
      let drop = new Drop(dropOptions);
      bonuses.push(drop);
      added.push(drop);
    }
    return added;
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

  public asteroidEvery(ms: number, options: AsteroidSpawnOptions = {}) {
    this.nextAsteroidSpawnAt = Date.now() + ms;
    this.asteroidTimer = setInterval(() => {
      this.spawnAsteroid(options);
      this.nextAsteroidSpawnAt = Date.now() + ms;
    }, ms);
  }

  private makeDropOptions(options: BonusSpawnOptions = {}): DropOptions {
    let type: DropType;
    if (!options.type) {
      let roll = Math.random();
      if (roll < 1 / 3) type = 'fix';
      else if (roll < 2 / 3) type = 'freeze';
      else type = 'shield';
    } else {
      type = options.type;
    }
    let coords =
      options.coords ||
      randomCoordsFarFrom(this.state.ship, this.world, this.HIT_BOX_MULTIPLIER);
    return {
      type,
      world: this.world,
      coords
    };
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
