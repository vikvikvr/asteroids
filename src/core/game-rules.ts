import { AsteroidSize, Temperature } from 'types';

const SCORES = [200, 100, 50];

export const COMBO_WINDOW_MS = 1_500;

// Kill counts required to reach x1, x2, x3, x4, x5.
const COMBO_THRESHOLDS = [0, 3, 6, 10, 15];

export function comboMultiplier(count: number): number {
  let multiplier = 1;
  for (let i = 1; i < COMBO_THRESHOLDS.length; i++) {
    if (count >= COMBO_THRESHOLDS[i]) {
      multiplier = i + 1;
    }
  }
  return multiplier;
}

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
