import { AsteroidSize } from './Asteroid';
import { Temperature } from './GameEngine';

const SCORES = [200, 100, 50];

export function bulletHitScore(
  size: AsteroidSize,
  temperature: Temperature
): number {
  const [small, medium, large] = SCORES;
  let score = SCORES[size];
  if (temperature === Temperature.Low) {
    if (size === AsteroidSize.Large) return large + medium * 2 + small * 4;
    if (size === AsteroidSize.Medium) return medium + small * 2;
    return small;
  } else if (temperature === Temperature.High) {
    return score * 2;
  }
  return score;
}

export function getHighScore(): number {
  const bestScore = localStorage.getItem('asteroids-highscore') || '0';
  return JSON.parse(bestScore);
}

export function saveHighScore(score: number, highScore: number): void {
  if (score > highScore) {
    localStorage.setItem('asteroids-highscore', score.toString());
  }
}
