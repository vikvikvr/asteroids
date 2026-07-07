import { Point } from './geometry';

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

export type RGB = [number, number, number];

export interface DrawGameObjectOptions {
  rotateDirection?: boolean;
  ignoreOrientation?: boolean;
  rotationOffset?: number;
}
