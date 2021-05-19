import { AsteroidSize } from './Asteroid';
import { GameTemperature } from './GameEngine';

const SCORES: Record<AsteroidSize, number> = {
  large: 50,
  medium: 100,
  small: 200
};

function bulletHitScore(
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

export { bulletHitScore };
