import P5 from 'p5';
import { AsteroidSize } from '../core/Asteroid';
import { GameTemperature } from '../core/GameEngine';

export function drawAsteroidShape(
  p5: P5,
  hitBoxRadius: number,
  size: AsteroidSize,
  temperature: GameTemperature
): void {
  const colorMap: Record<GameTemperature, string> = {
    normal: 'green',
    high: 'red',
    low: 'blue'
  };
  p5.fill(colorMap[temperature]);
  p5.circle(0, 0, hitBoxRadius * 2);
}

export function drawShipShape(p5: P5, side: number): void {
  p5.fill('#BEC6ED');
  p5.beginShape();
  p5.vertex(side * +0, side * +1);
  p5.vertex(side * -2, side * +2);
  p5.vertex(side * +0, side * -2);
  p5.endShape();
  p5.fill('#6D7BBD');
  p5.beginShape();
  p5.vertex(side * +0, side * +1);
  p5.vertex(side * +0, side * -2);
  p5.vertex(side * +2, side * +2);
  p5.endShape();
}

export function drawBulletShape(p5: P5): void {
  p5.fill(255, 255, 255);
  p5.circle(0, 0, 4);
}

export function drawBulletTailShape(
  p5: P5,
  index: number,
  length: number
): void {
  const alpha = (index / length) * 125;
  p5.fill(255, 255, 255, alpha);
  p5.circle(0, 0, 3);
}

export function drawShipTailShape(p5: P5, index: number, length: number): void {
  const alpha = (1 - (length - index) / length) * 125;
  p5.fill(255, 255, 255, alpha);
  p5.circle(0, 0, 5);
}

export function drawAsteroidTailShape(
  p5: P5,
  index: number,
  length: number
): void {
  const alpha = (index / length) * 50;
  p5.fill(255, 255, 255, alpha);
  p5.circle(0, 0, 4);
}

export function drawShipLifeArcShape(p5: P5, life: number) {
  p5.noFill();
  p5.stroke('white');
  p5.arc(0, 0, 100, 100, 0, 2 * Math.PI * life);
}
