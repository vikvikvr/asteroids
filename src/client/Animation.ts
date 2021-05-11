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
  public currentFrame: number = 0;
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

export type OverlayAnimationColor = 'white' | 'red' | 'green' | 'blue';

export class OverlayAnimation extends Animation {
  public color: OverlayAnimationColor;
  constructor(length: number, color: OverlayAnimationColor) {
    super(length);
    this.color = color;
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
