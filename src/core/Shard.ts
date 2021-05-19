import { Point, Rect } from '../lib/geometry';
import { AsteroidSize } from './Asteroid';
import { Temperature } from './GameEngine';
import GameObject from './GameObject';

interface ShardOptions {
  colorIndex: number;
  size: AsteroidSize;
  coords: Point;
  world: Rect;
  duration: number;
  temperature: Temperature;
}

const shardsCounts = [10, 20, 30];
const shardSizes = [9, 12, 15];

class Shard extends GameObject {
  public colorIndex: number;
  public temperature: Temperature;
  constructor(options: ShardOptions) {
    const minSpeed = shardsCounts[options.size] / 10;
    const shardSize = shardSizes[options.size];
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
    super.update();
  }
}

export default Shard;
