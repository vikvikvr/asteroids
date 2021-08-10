// **** Entities options ****

import { Point, Rect } from './interfaces';
import { GameObjectType } from '../types';
import { AsteroidSize, Temperature } from '../enums';

export interface EntityOptions {
  world: Rect;
  coords: Point;
  speed?: number;
  acceleration?: number;
  direction?: number;
  angularSpeed?: number;
  orientation?: number;
  rotationSpeed?: number;
}

export interface GameObjectOptions extends EntityOptions {
  type: GameObjectType;
  hitBoxRadius: number;
  duration?: number;
  tailLength?: number;
}

export interface AsteroidOptions {
  size: AsteroidSize;
  world: Rect;
  coords: Point;
  direction: number;
}

export interface ShipOptions {
  world: Rect;
  coords: Point;
}

export interface BulletOptions {
  world: Rect;
  coords: Point;
  direction: number;
  speed: number;
}

export interface AsteroidSpawnOptions {
  size: AsteroidSize;
  count?: number;
  coords?: Point;
  notDirection?: number;
}

// **** Graphics options ****

export interface DrawGameObjectOptions {
  rotateDirection?: boolean;
  ignoreOrientation?: boolean;
  rotationOffset?: number;
}

export interface ShardOptions {
  colorIndex: number;
  size: AsteroidSize;
  coords: Point;
  world: Rect;
  temperature: Temperature;
}

// **** Physics options ****

export interface InterpolatorOptions {
  current: number;
  steps?: number;
}
