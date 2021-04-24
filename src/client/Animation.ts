import P5 from 'p5';
import { Point } from '../lib/geometry';
import { DrawableObject } from './Drawer';

export interface AnimationFrame extends DrawableObject {
  image: P5.Image;
  frameCount: number;
}

class Animation {
  public isExpired: boolean = false;
  private frameCount: number = 0;
  constructor(private frames: P5.Image[], private coords: Point) {}

  public next(): AnimationFrame | false {
    if (this.frameCount > 31) {
      this.isExpired = true;
      return false;
    } else {
      return {
        coords: this.coords,
        direction: 0,
        hitBoxRadius: 60,
        orientation: 0,
        image: this.frames[this.frameCount],
        frameCount: this.frameCount++
      };
    }
  }
}

export default Animation;
