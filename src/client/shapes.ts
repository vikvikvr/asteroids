import P5 from 'p5';
import Asteroid from '../core/Asteroid';
import { GameTemperature } from '../core/GameEngine';
import colors, { withAlpha, alphaFromTime } from './colors';

const asteroidOffsets = {
  x: [2, 2, -2, -2],
  y: [-2, 2, 2, -2]
};

export function asteroid(
  p5: P5,
  asteroid: Asteroid,
  temp: GameTemperature
): void {
  const { hitBoxRadius, size } = asteroid;
  for (let i = 3; i >= 0; i--) {
    const { x, y } = asteroidOffsets;
    const color = colors.asteroid[temp][i];
    const diameter = (hitBoxRadius * 2 * (i + 1)) / 4;
    const isBlinking = size === 'large' && temp === 'low';
    const alpha = isBlinking ? (alphaFromTime(100) + 1) / 2 : 1;
    p5.fill(withAlpha(color, alpha));
    p5.circle(x[i], y[i], diameter);
  }
}

export function ship(p5: P5, side: number): void {
  p5.fill(colors.ship.dark);
  p5.triangle(0, side, -2 * side, side * 2, 0, -2 * side);
  p5.fill(colors.ship.light);
  p5.triangle(0, side, 0, -2 * side, 2 * side, 2 * side);
}

export function bullet(p5: P5): void {
  p5.fill(colors.ship.dark);
  p5.circle(0, 0, 4);
}

export function bulletTail(p5: P5, index: number, length: number): void {
  const percent = index / length;
  const color = withAlpha(colors.ship.light, percent / 2);
  p5.fill(color);
  p5.circle(0, 0, 3);
}

export function shipTail(p5: P5, index: number, length: number): void {
  const difference = length - index;
  const alpha = (1 - difference / length) / 4;
  const color = withAlpha(colors.hud, alpha);
  p5.fill(color);
  p5.circle(0, 0, difference / 1.5 + 15);
}

export function asteroidTail(p5: P5, index: number, length: number): void {
  const color = withAlpha(colors.hud, index / length / 2);
  p5.fill(color);
  p5.circle(0, 0, 4);
}

export function shipLifeArc(
  p5: P5,
  life: number,
  temperature: GameTemperature
) {
  fullShipLifeArc(p5);
  const subtractAngle = ((1 - life) * Math.PI) / 2;
  const startAngle = subtractAngle;
  const endAngle = Math.PI - subtractAngle;
  const isRestoring = life < 1 && temperature === 'normal';
  const color = isRestoring ? colors.asteroid.normal[0] : colors.ship.dark;
  const alpha = isRestoring ? alphaFromTime(100) : 1;
  p5.stroke(withAlpha(color, alpha));
  p5.arc(0, 0, 100, 100, startAngle, endAngle);
}

function fullShipLifeArc(p5: P5) {
  p5.noFill();
  p5.strokeWeight(4);
  p5.stroke(withAlpha(colors.hud, 1 / 4));
  p5.arc(0, 0, 100, 100, 0, Math.PI);
}
