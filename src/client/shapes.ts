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
    let color = colorMap[temperature][i];
    let alpha = 255;
    if (size === 'large' && temperature === 'low') {
      alpha = Math.floor((Math.sin(Date.now() / 100) + 2) * 80);
    }
    color += alpha.toString(16);
    p5.fill(color);
    p5.circle(offsets.x[i], offsets.y[i], (hitBoxRadius * 2 * (i + 1)) / 4);
  }
}

export function drawShipShape(p5: P5, side: number): void {
  p5.fill('#fdd835');
  p5.beginShape();
  p5.vertex(side * +0, side * +1);
  p5.vertex(side * -2, side * +2);
  p5.vertex(side * +0, side * -2);
  p5.endShape();
  p5.fill('#ffee58');
  p5.beginShape();
  p5.vertex(side * +0, side * +1);
  p5.vertex(side * +0, side * -2);
  p5.vertex(side * +2, side * +2);
  p5.endShape();
}

export function drawBulletShape(p5: P5): void {
  p5.fill('#ffeb3b');
  p5.circle(0, 0, 4);
}

export function drawBulletTailShape(
  p5: P5,
  index: number,
  length: number
): void {
  const alpha = (index / length) * 125;
  p5.fill(255, 255, 0, alpha);
  p5.circle(0, 0, 3);
}

export function drawShipTailShape(p5: P5, index: number, length: number): void {
  const difference = length - index;
  const alpha = (1 - (length - index) / length) * 50;
  p5.fill(255, 255, 255, alpha);
  p5.circle(0, 0, difference / 1.5 + 15);
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

export function drawShipLifeArcShape(
  p5: P5,
  life: number,
  temperature: GameTemperature
) {
  const isRestoring = life < 1 && temperature === 'normal';
  p5.noFill();
  p5.strokeWeight(4);
  p5.stroke(207, 216, 220, 75);
  const subtractAngle = ((1 - life) * Math.PI) / 2;
  const startAngle = subtractAngle;
  const endAngle = Math.PI - subtractAngle;
  p5.arc(0, 0, 100, 100, 0, Math.PI);
  const alpha = isRestoring ? (Math.sin(Date.now() / 100) + 1) * 125 : 255;
  if (isRestoring) {
    p5.stroke(0, 150, 136, alpha);
  } else {
    p5.stroke(255, 235, 59, alpha);
    // p5.stroke(244, 67, 54, alpha);
  }
  p5.arc(0, 0, 100, 100, startAngle, endAngle);
}
