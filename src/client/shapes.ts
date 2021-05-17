import P5 from 'p5';
import { AsteroidSize } from '../core/Asteroid';
import { GameTemperature } from '../core/GameEngine';

export function drawAsteroidShape(
  p5: P5,
  hitBoxRadius: number,
  size: AsteroidSize,
  temperature: GameTemperature
): void {
  const colorMap: Record<GameTemperature, string[]> = {
    normal: ['#009688', '#00897b', '#00796b', '#00695c'],
    high: ['#ff9800', '#f57c00', '#ef6c00', '#e65100'],
    low: ['#2196f3', '#1e88e5', '#1976d2', '#1565c0']
  };
  const offsets = {
    x: [2, 2, -2, -2],
    y: [-2, 2, 2, -2]
  };
  for (let i = 3; i >= 0; i--) {
    p5.fill(colorMap[temperature][i]);
    p5.circle(offsets.x[i], offsets.y[i], (hitBoxRadius * 2 * (i + 1)) / 4);
  }
}

export function drawShipShape(p5: P5, side: number): void {
  p5.fill('#ff9800');
  p5.beginShape();
  p5.vertex(side * +0, side * +1);
  p5.vertex(side * -2, side * +2);
  p5.vertex(side * +0, side * -2);
  p5.endShape();
  p5.fill('#f57c00');
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
  p5.strokeWeight(4);
  p5.stroke('#ffb74d');
  const subtractAngle = ((1 - life) * Math.PI) / 2;
  const startAngle = subtractAngle;
  const endAngle = Math.PI - subtractAngle;
  p5.arc(0, 0, 100, 100, startAngle, endAngle);
}
