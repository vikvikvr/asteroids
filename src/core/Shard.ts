import { Point, Rect } from '../lib/geometry';
import { AsteroidSize } from './Asteroid';
import { Temperature } from './GameEngine';
import GameObject from './GameObject';

interface ShardOptions {
  colorIndex: number;
  size: AsteroidSize;
  coords: Point;
  world: Rect;
  temperature: Temperature;
}

const shardsCounts = [10, 20, 30];
const shardSizes = [9, 12, 15];

class Shard extends GameObject {
  public colorIndex: number;
  public temperature: Temperature;
  public creationTime: number;
  private duration: number;
  constructor(options: ShardOptions) {
    const minSpeed = shardsCounts[options.size] / 10;
    const shardSize = shardSizes[options.size];
    const duration = 250 + 150 * Math.random();
    // const duration = 1000;
    super({
      type: 'shard',
      speed: minSpeed + Math.random() * 2,
      direction: Math.random() * Math.PI * 2,
      hitBoxRadius: shardSize + (Math.random() * shardSize) / 2,
      duration: duration,
      ...options
    });
    this.colorIndex = options.colorIndex;
    this.temperature = options.temperature;
    this.creationTime = Date.now();
    this.duration = duration;
  }

  public update(): void {
    super.update();
    const percent = 1 - (Date.now() - this.creationTime) / this.duration;
    this.life = (percent + 1) / 2;
  }
}

export default Shard;
