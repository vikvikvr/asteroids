import { Point } from '../lib/geometry';

class Animation {
  public isExpired: boolean = false;
  public currentFrame: number = 0;
  frameCount: number;
  constructor(frameCount: number) {
    this.frameCount = frameCount;
  }
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
    super(50);
    this.coords = coords;
    this.text = text;
  }

  public getNextCoords(): Point | false {
    const next = super.next();
    if (next) {
      return {
        x: this.coords.x,
        y: this.coords.y - next
      };
    } else {
      return false;
    }
  }
}

export default Animation;
