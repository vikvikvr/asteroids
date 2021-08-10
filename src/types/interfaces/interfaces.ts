// **** Game ****

import Asteroid from 'core/Asteroid';
import Shard from 'core/Shard';
import Ship from 'core/Ship';
import { Temperature } from '../enums';
import { TGameEvent } from '../types';

export interface GameState {
  score: number;
  level: number;
  ship: Ship;
  asteroids: Asteroid[];
  shards: Shard[];
  events: TGameEvent[];
  temperature: Temperature;
}

// **** Geometry ****

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  width: number;
  height: number;
}

export interface Collidable {
  hitBoxRadius: number;
  coords: Point;
}

// **** Graphics ****

export interface DrawableObject {
  coords: Point;
  hitBoxRadius: number;
  orientation: number;
  direction: number;
}

export interface Star {
  x: number;
  y: number;
  diameter: number;
}
