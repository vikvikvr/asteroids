export type Point = {
  x: number;
  y: number;
};

export type Rect = {
  width: number;
  height: number;
};

export type Collidable = {
  hitBoxRadius: number;
  coords: Point;
};

export function centerOf(rect: Rect): Point {
  return {
    x: rect.width / 2,
    y: rect.height / 2
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

function minDistance(obj1: Point, obj2: Point, world: Rect) {
  let min = Infinity;
  const mirrors1 = makePointMirros(obj1, world);
  const mirrors2 = makePointMirros(obj2, world);
  for (const mirror1 of mirrors1) {
    for (const mirror2 of mirrors2) {
      const dist = distance(mirror1, mirror2);
      if (dist < min) min = dist;
    }
  }
  return min;
}

export function distance(obj1: Point, obj2: Point): number {
  const deltaX = obj1.x - obj2.x;
  const deltaY = obj1.y - obj2.y;
  return Math.sqrt(deltaX ** 2 + deltaY ** 2);
}

export function haveCollided(obj1: Collidable, obj2: Collidable): boolean {
  const dist = distance(obj1.coords, obj2.coords);
  const minDistance = obj1.hitBoxRadius + obj2.hitBoxRadius;
  return dist < minDistance;
}

export function randomCoordsFarFrom(
  object: Collidable,
  world: Rect,
  hitBoxMultiplier = 2
): Point {
  let distFromObject, coords;
  let tries = 0;
  do {
    if (tries > 100) throw Error('Could not create randomCoordsFarFrom');
    tries++;
    coords = {
      x: Math.random() * world.width,
      y: Math.random() * world.height
    };
    distFromObject = minDistance(coords, object.coords, world);
  } while (distFromObject < object.hitBoxRadius * hitBoxMultiplier);

  return coords;
}

export function notDirection(
  direction: number,
  coneAngle: number,
  random: () => number
): number {
  if (direction < 0) direction += Math.PI;

  let dir: number;
  do {
    dir = random() * Math.PI * 2;
  } while (Math.abs(dir - direction) <= coneAngle / 2);
  return dir;
}

function tryPuttingValueInsideRange(
  value: number,
  adjustment: number,
  max: number,
  min = 0
): number {
  if (value < min) {
    return value + adjustment;
  } else if (value > max) {
    return value - adjustment;
  } else {
    return value;
  }
}

function mostVisibleCoords(
  screenCoords: Point,
  world: Rect,
  screen: Rect
): Point {
  const bestX = tryPuttingValueInsideRange(
    screenCoords.x,
    world.width,
    screen.width
  );
  const bestY = tryPuttingValueInsideRange(
    screenCoords.y,
    world.height,
    screen.height
  );

  return {
    x: bestX,
    y: bestY
  };
}

function isBetween(value: number, max: number, min = 0): boolean {
  return value >= min && value <= max;
}

// assuming origin is always drawn in the middle of the screen
export function drawableCoords(
  object: Point,
  origin: Point,
  screen: Rect,
  world: Rect,
  showAlways?: boolean
): Point | undefined {
  const deltaX = object.x - origin.x;
  const deltaY = object.y - origin.y;
  const screenX = screen.width / 2 + deltaX;
  const screenY = screen.height / 2 + deltaY;
  const screenCoords = { x: screenX, y: screenY };

  if (showAlways) return screenCoords;

  const result = mostVisibleCoords(screenCoords, world, screen);
  if (!isBetween(result.x, screen.width)) return undefined;
  if (!isBetween(result.y, screen.height)) return undefined;
  return result;
}
