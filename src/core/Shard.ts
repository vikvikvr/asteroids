import { Point, Rect } from '../lib/geometry';
import { AsteroidSize } from './Asteroid';
import { GameTemperature } from './GameEngine';
import GameObject from './GameObject';

interface ShardOptions {
  colorIndex: number;
  size: AsteroidSize;
  coords: Point;
  world: Rect;
  duration: number;
  temperature: GameTemperature;
}

type AsteroidSizeMap = Record<AsteroidSize, number>;

const shardsCountMap: AsteroidSizeMap = {
  large: 30,
  medium: 20,
  small: 10
};

const shardSizeMap: AsteroidSizeMap = {
  large: 15,
  medium: 12,
  small: 9
};

class Shard extends GameObject {
  public colorIndex: number;
  public temperature: GameTemperature;
  constructor(options: ShardOptions) {
    const minSpeed = shardsCountMap[options.size] / 10;
    const shardSize = shardSizeMap[options.size];
    super({
      type: 'shard',
      speed: minSpeed + Math.random() * 2,
      direction: Math.random() * Math.PI * 2,
      hitBoxRadius: shardSize + (Math.random() * shardSize) / 2,
      coords: options.coords,
      world: options.world,
      duration: options.duration
    });
    this.colorIndex = options.colorIndex;
    this.temperature = options.temperature;
  }

  public update() {
    super.update('normal');
  }
}

export default Shard;
