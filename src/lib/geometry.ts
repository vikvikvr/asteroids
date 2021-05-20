import { DrawableObject } from '../client/Drawer';

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

export function centerOf(rect: Rect): Point {
  return {
    x: rect.width / 2,
    y: rect.height / 2
  };
}

export function toDrawableObject(point: Point): DrawableObject {
  return {
    coords: point,
    hitBoxRadius: 2,
    orientation: 0,
    direction: 0
  };
}

function makePointMirros(object: Point, world: Rect): Point[] {
  const mirrors = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      mirrors.push({
        x: object.x + world.width * i,
        y: object.y + world.height * j
      });
    }
  }
  return mirrors;
}

function minSquareDistance(obj1: Point, obj2: Point, world: Rect) {
  let min = Infinity;
  const mirrors1 = makePointMirros(obj1, world);
  const mirrors2 = makePointMirros(obj2, world);
  for (const mirror1 of mirrors1) {
    for (const mirror2 of mirrors2) {
      const dist = squareDistance(mirror1, mirror2);
      if (dist < min) min = dist;
    }
  }
  return min;
}

export function squareDistance(obj1: Point, obj2: Point): number {
  const deltaX = obj1.x - obj2.x;
  const deltaY = obj1.y - obj2.y;
  return deltaX ** 2 + deltaY ** 2;
}

export function haveCollided(obj1: Collidable, obj2: Collidable): boolean {
  const dist = squareDistance(obj1.coords, obj2.coords);
  const minDistance = obj1.hitBoxRadius + obj2.hitBoxRadius;
  return dist < minDistance ** 2;
}

export function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export function randomSign(): number {
  return Math.random() > 0.5 ? 1 : -1;
}

export function randomAngle(): number {
  return Math.random() * Math.PI * 2;
}

export function randomNumber(multiplier?: number, offset?: number): number {
  return Math.random() * (multiplier || 1) + (offset || 0);
}

export function circleFraction(divisor = 1, offset = 0): number {
  return (Math.PI * 2) / divisor + offset;
}

export function randomCoordsFarFrom(
  object: Collidable,
  world: Rect,
  hitBoxMultiplier = 2
): Point {
  let squredDistance, coords;
  let tries = 0;
  const minDistance = object.hitBoxRadius * hitBoxMultiplier;
  do {
    if (tries > 100) throw Error('Could not create randomCoordsFarFrom');
    tries++;
    coords = {
      x: randomNumber(world.width),
      y: randomNumber(world.height)
    };
    squredDistance = minSquareDistance(coords, object.coords, world);
  } while (squredDistance < minDistance ** 2);

  return coords;
}

export function notDirection(direction: number, coneAngle: number): number {
  const adjustedDirection = direction + direction < 0 ? Math.PI : 0;
  let dir: number;
  do {
    dir = randomAngle();
  } while (Math.abs(dir - adjustedDirection) <= coneAngle / 2);
  return dir;
}

function tryPuttingValueInsideRange(
  value: number,
  adjustment: number,
  max: number,
  min = 0
): number {
  if (value < min) return value + adjustment;
  if (value > max) return value - adjustment;
  return value;
}

function mostVisibleCoords(
  screenCoords: Point,
  world: Rect,
  screen: Rect
): Point {
  const overlap = 100;
  const bestX = tryPuttingValueInsideRange(
    screenCoords.x,
    world.width,
    screen.width + overlap,
    -overlap
  );
  const bestY = tryPuttingValueInsideRange(
    screenCoords.y,
    world.height,
    screen.height + overlap,
    -overlap
  );

  return { x: bestX, y: bestY };
}

function isBetween(value: number, max: number, min = 0): boolean {
  return value >= min && value <= max;
}

// assuming origin is always drawn in the middle of the screen
export function drawableCoords(
  object: Point,
  origin: Point,
  screen: Rect,
  world: Rect
): Point | null {
  const deltaX = object.x - origin.x;
  const deltaY = object.y - origin.y;
  const screenX = screen.width / 2 + deltaX;
  const screenY = screen.height / 2 + deltaY;
  const screenCoords = { x: screenX, y: screenY };
  const result = mostVisibleCoords(screenCoords, world, screen);
  const overlap = 100;
  if (!isBetween(result.x, screen.width + overlap, -overlap)) return null;
  if (!isBetween(result.y, screen.height + overlap, -overlap)) return null;
  return result;
}
