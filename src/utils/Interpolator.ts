export interface InterpolatorOptions {
  current: number;
  steps?: number;
}

class Interpolator {
  target: number;
  steps: number;
  private step: number;
  private current: number;

  constructor(options: InterpolatorOptions) {
    this.target = options.current;
    this.steps = options.steps || 0;
    this.current = options.current;
    this.step = 0;
  }

  setTarget(target: number) {
    this.target = target;
  }

  next(): number {
    let stepsLeft = this.steps - this.step;
    if (stepsLeft) {
      let increment = (this.target - this.current) / stepsLeft;
      this.current += increment;
      this.step++;
    } else {
      this.step = 0;
    }
    return this.current;
  }
}

export default Interpolator;
