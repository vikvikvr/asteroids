import { Point } from '../lib/geometry';

const world = {
  width: 2000,
  height: 1000
};

const screen = {
  width: 800,
  height: 400
};

function toScreenCoords(object: Point, ship: Point): Point | undefined {
  let deltaX = object.x - ship.x;
  let deltaY = object.y - ship.y;
  let screenX = screen.width / 2 + deltaX;
  let screenY = screen.height / 2 + deltaY;
  if (screenX < 0) {
    let newX = screenX + world.width;
    if (newX > 0 && newX < screen.width) {
      screenX = newX;
    } else {
      return undefined;
    }
  }
  if (screenX > screen.width) {
    let newX = screenX - world.width;
    if (newX > 0 && newX < screen.width) {
      screenX = newX;
    } else {
      return undefined;
    }
  }
  if (screenY < 0) {
    let newY = screenY + world.height;
    if (newY > 0 && newY < screen.height) {
      screenY = newY;
    } else {
      return undefined;
    }
  }
  if (screenY > screen.height) {
    let newY = screenY - world.height;
    if (newY > 0 && newY < screen.height) {
      screenY = newY;
    } else {
      return undefined;
    }
  }
  return { x: screenX, y: screenY };
}

const func = toScreenCoords;

describe('toScreenCoords', () => {
  it('should place ship in the middle of the screen', () => {
    let coords = func({ x: 1, y: 15 }, { x: 1, y: 15 });
    expect(coords).toEqual({ x: screen.width / 2, y: screen.height / 2 });
  });
  describe('screen inside world', () => {
    let ship = { x: 1000, y: 500 };
    it('should place visible object inside screen', () => {
      let coords = func({ x: 1010, y: 500 }, ship);
      expect(coords).toEqual({ x: 410, y: 200 });
    });
    it('should hide far left', () => {
      let coords = func({ x: 0, y: ship.y }, ship);
      expect(coords).toBe(undefined);
    });
    it('should hide far right', () => {
      let coords = func({ x: world.width, y: ship.y }, ship);
      expect(coords).toBe(undefined);
    });
    it('should hide far top', () => {
      let coords = func({ x: ship.x, y: 0 }, ship);
      expect(coords).toBe(undefined);
    });
    it('should hide far bottom', () => {
      let coords = func({ x: ship.x, y: world.height }, ship);
      expect(coords).toBe(undefined);
    });
  });
  it('should project from left when overlapping right', () => {
    let ship = { x: world.width, y: world.height / 2 };
    let coords = func({ x: screen.width / 4, y: ship.y }, ship);
    expect(coords).toEqual({
      x: (screen.width * 3) / 4,
      y: screen.height / 2
    });
  });
  it('should project from right when overlapping left', () => {
    let ship = { x: 0, y: world.height / 2 };
    let coords = func({ x: world.width - screen.width / 4, y: ship.y }, ship);
    expect(coords).toEqual({
      x: screen.width / 4,
      y: screen.height / 2
    });
  });
  it('should project from bottom when overlapping top', () => {
    let ship = { x: world.width / 2, y: 0 };
    let coords = func({ x: ship.x, y: world.height - screen.height / 4 }, ship);
    expect(coords).toEqual({
      x: screen.width / 2,
      y: screen.height / 4
    });
  });
  it('should project from top when overlapping bottom', () => {
    let ship = { x: world.width / 2, y: world.height };
    let coords = func({ x: ship.x, y: screen.height / 4 }, ship);
    expect(coords).toEqual({
      x: screen.width / 2,
      y: (screen.height * 3) / 4
    });
  });
});
