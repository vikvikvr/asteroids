import { BulletHit, GameEvent, ShipHit } from 'core/Events';

// **** Game logic ****

export type GameStatus = 'playing' | 'lost' | 'idle';

export type GameObjectType = 'ship' | 'asteroid' | 'bullet' | 'shard';

// **** Game events ****

export type GameEventType =
  | 'BULLET_HIT'
  | 'SHIP_HIT'
  | 'FREEZE'
  | 'BURN'
  | 'LEVEL_UP';

export type TGameEvent = ShipHit | BulletHit | GameEvent;

// **** Graphics ****

export type RGB = [number, number, number];
