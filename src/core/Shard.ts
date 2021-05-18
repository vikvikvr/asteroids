import { Point, Rect } from '../lib/geometry';
import { AsteroidSize } from './Asteroid';
import GameObject from './GameObject';

interface ShardOptions {
  color: string;
  size: AsteroidSize;
  coords: Point;
  world: Rect;
  duration: number;
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
  public color: string;
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
    this.color = options.color;
  }

  public update() {
    super.update();
  }
}

export default Shard;
