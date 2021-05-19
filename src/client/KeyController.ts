import p5 from 'p5';
import Ship from '../core/Ship';

enum Keys {
  ARROW_LEFT = 37,
  ARROW_RIGHT = 39,
  SPACE_BAR = 32
}

class KeyController {
  private ship: Ship;
  private commandsMap: Record<Keys, () => void>;
  constructor(ship: Ship) {
    this.ship = ship;
    this.commandsMap = {
      [Keys.ARROW_LEFT]: ship.turnLeft,
      [Keys.ARROW_RIGHT]: ship.turnRight,
      [Keys.SPACE_BAR]: ship.decelerate
    };
  }

  public pressed(p5: p5) {
    for (const key in this.commandsMap) {
      const keyCode = parseInt(key) as Keys;
      if (p5.keyIsDown(keyCode)) {
        this.commandsMap[keyCode].call(this.ship);
      }
    }
  }
}

export default KeyController;
