import P5 from 'p5';
import { TextAnimation } from './Animation';

export function drawTextAnimation(p5: P5, animation: TextAnimation): void {
  const { currentFrame, frameCount, text } = animation;
  const alpha = (1 - currentFrame / frameCount) * 255;
  p5.fill(255, 255, 255, alpha);
  p5.text(text, 0, 0);
}
