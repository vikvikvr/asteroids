import P5 from 'p5';
import Asteroid from '../core/Asteroid';
import { Temperature } from '../core/GameEngine';
import colors, { withAlpha, alphaFromTime } from './colors';

const asteroidOffsets = {
  x: [2, 2, -2, -2],
  y: [-2, 2, 2, -2]
};

export function asteroid(
  gr: P5.Graphics,
  asteroid: Asteroid,
  temp: Temperature
): void {
  const { hitBoxRadius, size } = asteroid;
  for (let i = 3; i >= 0; i--) {
    const { x, y } = asteroidOffsets;
    const color = colors.asteroid[temp][i];
    const diameter = (hitBoxRadius * 2 * (i + 1)) / 4;
    const isBlinking = size === 2 && temp === Temperature.Low;
    const alpha = isBlinking ? (alphaFromTime(100) + 1) / 2 : 1;
    gr.fill(withAlpha(color, alpha));
    gr.circle(x[i], y[i], diameter);
  }
}

export function ship(gr: P5.Graphics, side: number): void {
  gr.fill(colors.ship.dark);
  gr.triangle(0, side, -2 * side, side * 2, 0, -2 * side);
  gr.fill(colors.ship.light);
  gr.triangle(0, side, 0, -2 * side, 2 * side, 2 * side);
}

export function bullet(gr: P5.Graphics): void {
  gr.fill(colors.ship.dark);
  gr.circle(0, 0, 4);
}

export function bulletTail(
  gr: P5.Graphics,
  index: number,
  length: number
): void {
  const percent = index / length;
  const color = withAlpha(colors.ship.light, percent / 2);
  gr.fill(color);
  gr.circle(0, 0, 3);
}

export function shipTail(gr: P5.Graphics, index: number, length: number): void {
  const difference = length - index;
  const alpha = (1 - difference / length) / 4;
  const color = withAlpha(colors.hud, alpha);
  gr.fill(color);
  gr.circle(0, 0, difference / 1.5 + 15);
}

export function asteroidTail(
  gr: P5.Graphics,
  index: number,
  length: number
): void {
  const color = withAlpha(colors.hud, index / length / 2);
  gr.fill(color);
  gr.circle(0, 0, 4);
}

export function shipLifeArc(
  gr: P5.Graphics,
  life: number,
  temperature: Temperature
) {
  fullShipLifeArc(gr);
  const subtractAngle = ((1 - life) * Math.PI) / 2;
  const startAngle = subtractAngle;
  const endAngle = Math.PI - subtractAngle;
  const isRestoring = life < 1 && temperature === Temperature.Normal;
  const color = isRestoring
    ? colors.asteroid[Temperature.Normal][0]
    : colors.ship.dark;
  const alpha = isRestoring ? alphaFromTime(100) : 1;
  gr.stroke(withAlpha(color, alpha));
  gr.arc(0, 0, 100, 100, startAngle, endAngle);
}

function fullShipLifeArc(gr: P5.Graphics) {
  gr.noFill();
  gr.strokeWeight(4);
  gr.stroke(withAlpha(colors.hud, 1 / 4));
  gr.arc(0, 0, 100, 100, 0, Math.PI);
}
