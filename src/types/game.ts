import Asteroid from 'core/Asteroid';
import Shard from 'core/Shard';
import Ship from 'core/Ship';
import { BulletHit, GameEvent, ShipHit } from 'core/Events';
import { Temperature } from './enums';

export interface Combo {
  count: number;
  multiplier: number;
  expiresAt: number;
}

export interface GameState {
  score: number;
  level: number;
  ship: Ship;
  asteroids: Asteroid[];
  shards: Shard[];
  events: TGameEvent[];
  temperature: Temperature;
  combo: Combo;
}

export type GameStatus = 'playing' | 'paused' | 'lost' | 'idle';

export type GameObjectType = 'ship' | 'asteroid' | 'bullet' | 'shard';

export type GameEventType =
  | 'BULLET_HIT'
  | 'SHIP_HIT'
  | 'FREEZE'
  | 'BURN'
  | 'LEVEL_UP';

export type TGameEvent = ShipHit | BulletHit | GameEvent;
