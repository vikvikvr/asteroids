import { AsteroidSize } from './Asteroid';

function bulletHitScore(size: AsteroidSize, frozen: boolean): number {
  const SCORES: Record<AsteroidSize, number> = {
    large: 50,
    medium: 100,
    small: 200
  };
  let score = SCORES[size];
  if (frozen) {
    if (size === 'large') {
      score = SCORES.large + SCORES.medium * 2 + SCORES.small * 4;
    } else if (size === 'medium') {
      score = SCORES.medium + SCORES.small * 2;
    } else {
      score = SCORES.small;
    }
  }
  return score;
}

export { bulletHitScore };
