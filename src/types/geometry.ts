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
