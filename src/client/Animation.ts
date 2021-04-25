import P5 from 'p5';
import { Point } from '../lib/geometry';
import { DrawableObject } from './Drawer';

export interface AnimationFrame extends DrawableObject {
  image: P5.Image;
  currentFrame: number;
  scale: number;
}

class Animation {
  public isExpired: boolean = false;
  protected currentFrame: number = 0;
  constructor(public frameCount: number) {}

  public next(): number | false {
    if (this.currentFrame >= this.frameCount - 1) {
      this.isExpired = true;
      return false;
    } else {
      return this.currentFrame++;
    }
  }
}

export class OverlayAnimation extends Animation {
  public color: string;
  constructor(length: number, color: string) {
    super(length);
    this.color = color;
  }
}

export class ImageAnimation extends Animation {
  // private
  private frames: P5.Image[];
  private coords: Point;
  private scale: number;
  // constructor
  constructor(frames: P5.Image[], coords: Point, scale: number) {
    super(frames.length);
    this.frames = frames;
    this.coords = coords;
    this.scale = scale;
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
