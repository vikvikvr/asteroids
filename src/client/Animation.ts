import P5 from 'p5';
import { AsteroidSize } from '../core/Asteroid';
import { GameTemperature } from '../core/GameEngine';
import GameObject from '../core/GameObject';
import { Point, Rect } from '../lib/geometry';
import { DrawableObject } from './Drawer';

export interface AnimationFrame extends DrawableObject {
  image: P5.Image;
  currentFrame: number;
  scale: number;
}

class Animation {
  public isExpired: boolean = false;
  public currentFrame: number = 0;
  constructor(public frameCount: number) {}

  protected next(): number | false {
    if (this.currentFrame >= this.frameCount - 1) {
      this.isExpired = true;
      return false;
    } else {
      return this.currentFrame++;
    }
  }
}

export class TextAnimation extends Animation {
  // private
  public text: string;
  private coords: Point;
  // constructor
  constructor(text: string, coords: Point) {
    super(30);
    this.coords = coords;
    this.text = text;
  }

  public getNextCoords(): Point | false {
    let next = super.next();
    if (next) {
      // const y =
      return {
        x: this.coords.x,
        y: this.coords.y - next
      };
    } else {
      return false;
    }
  }
}

export class ExplosionAnimation extends Animation {
  // public size: AsteroidSize;
  // public coords: Point;
  // public temperature: GameTemperature;
  public shards: GameObject[];
  public percent = 0;
  constructor(
    size: AsteroidSize,
    coords: Point,
    temperature: GameTemperature,
    world: Rect
  ) {
    super(20);
    // this.size = size;
    // this.coords = coords;
    // this.temperature = temperature;
    this.shards = [];
    for (let i = 0; i < 10; i++) {
      const shard = new GameObject({
        speed: 4,
        direction: Math.random() * Math.PI * 2,
        coords: coords,
        world: world
      });
      this.shards.push(shard);
    }
  }

  public next(): number | false {
    super.next();
    this.percent += 0.05;
    for (const shard of this.shards) {
      shard.update();
    }
    return 1;
  }
}

export class ImageAnimation extends Animation {
  // private
  private frames: P5.Image[];
  private coords: Point;
  private scale: number;
  public rotation: number;
  // constructor
  constructor(frames: P5.Image[], coords: Point, scale: number) {
    super(frames.length);
    this.frames = frames;
    this.coords = coords;
    this.scale = scale;
    this.rotation = Math.random() * Math.PI * 2;
  }

  public getNextFrame(): AnimationFrame | false {
    let next = super.next();
    if (next) {
      return {
        coords: this.coords,
        direction: 0,
        hitBoxRadius: 60,
        orientation: 0,
        image: this.frames[this.currentFrame],
        currentFrame: this.currentFrame,
        scale: this.scale
      };
    } else {
      return false;
    }
  }
}

export default Animation;
