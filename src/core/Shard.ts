import { randomAngle, randomNumber } from 'lib/geometry';
import { ShardOptions, Temperature } from 'types';
import GameObject from './GameObject';

const shardSizes = [9, 12, 15];
const shardSpeeds = [2, 3, 4];

class Shard extends GameObject {
  public colorIndex: number;
  public temperature: Temperature;
  public creationTime: number;
  private duration: number;
  constructor(options: ShardOptions) {
    const minSpeed = shardSpeeds[options.size];
    const shardSize = shardSizes[options.size];
    const duration = randomNumber(100, 200);
    super({
      type: 'shard',
      speed: randomNumber(3, minSpeed),
      direction: randomAngle(),
      hitBoxRadius: shardSize + randomNumber(shardSize) / 2,
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
