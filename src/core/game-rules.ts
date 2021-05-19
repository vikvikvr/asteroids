import { AsteroidSize } from './Asteroid';
import { GameTemperature } from './GameEngine';

const SCORES: Record<AsteroidSize, number> = {
  large: 50,
  medium: 100,
  small: 200
};

export function bulletHitScore(
  size: AsteroidSize,
  temperature: GameTemperature
): number {
  const { large, medium, small } = SCORES;
  let score = SCORES[size];
  if (temperature === 'low') {
    if (size === 'large') return large + medium * 2 + small * 4;
    if (size === 'medium') return medium + small * 2;
    return small;
  } else if (temperature === 'high') {
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
