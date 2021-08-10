import P5 from 'p5';
import Shard from 'core/Shard';
import { TextAnimation } from './Animation';
import colors, { withAlpha } from './colors';

export function drawTextAnimation(p5: P5, animation: TextAnimation): void {
  const { currentFrame, frameCount, text } = animation;
  const alpha = 1 - currentFrame / frameCount;
  p5.fill(withAlpha(colors.hud, alpha));
  p5.text(text, 0, 0);
}

export function drawExplostionShard(p5: P5, shard: Shard) {
  const { hitBoxRadius, temperature, colorIndex } = shard;
  const color = colors.asteroid[temperature][colorIndex];
  p5.fill(withAlpha(color, shard.life));
  p5.circle(0, 0, hitBoxRadius);
}
