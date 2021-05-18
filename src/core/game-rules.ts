import { AsteroidSize } from './Asteroid';
import { GameTemperature } from './GameEngine';

function bulletHitScore(
  size: AsteroidSize,
  temperature: GameTemperature
): number {
  const SCORES: Record<AsteroidSize, number> = {
    large: 50,
    medium: 100,
    small: 200
  };
  let score = SCORES[size];
  if (temperature === 'low') {
    if (size === 'large') {
      score = SCORES.large + SCORES.medium * 2 + SCORES.small * 4;
    } else if (size === 'medium') {
      score = SCORES.medium + SCORES.small * 2;
    } else {
      score = SCORES.small;
    }
  } else if (temperature === 'high') {
    score *= 2;
  }
  return score;
}

export { bulletHitScore };
