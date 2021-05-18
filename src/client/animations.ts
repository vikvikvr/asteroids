import P5 from 'p5';
import { AsteroidSize } from '../core/Asteroid';
import { GameTemperature } from '../core/GameEngine';
import GameObject from '../core/GameObject';
import { TextAnimation } from './Animation';

const colorMap: Record<GameTemperature, string[]> = {
  normal: ['#009688', '#00897b', '#00796b', '#00695c'],
  high: ['#f44336', '#e53935', '#d32f2f', '#c62828'],
  low: ['#2196f3', '#1e88e5', '#1976d2', '#1565c0']
};

export function drawTextAnimation(p5: P5, animation: TextAnimation): void {
  const { currentFrame, frameCount, text } = animation;
  const alpha = (1 - currentFrame / frameCount) * 255;
  p5.fill(255, 255, 255, alpha);
  p5.text(text, 0, 0);
}

export function drawExplostionShard(
  p5: P5,
  shard: GameObject,
  size: AsteroidSize,
  temperature: GameTemperature
) {
  p5.fill(colorMap[temperature][0]);
  p5.circle(0, 0, shard.hitBoxRadius);
}
