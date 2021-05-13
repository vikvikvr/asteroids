import { forIn } from 'lodash';
import p5 from 'p5';
import Ship from '../core/Ship';

type Func = () => void;

enum Keys {
  ARROW_LEFT = 37,
  ARROW_RIGHT = 39,
  ARROW_UP = 38,
  ARROW_DOWN = 40,
  SPACE_BAR = 32
}

class KeyController {
  private ship: Ship;
  private commandsMap: Record<Keys, Func>;
  constructor(ship: Ship) {
    this.ship = ship;
    this.commandsMap = {
      [Keys.ARROW_LEFT]: ship.turnLeft,
      [Keys.ARROW_RIGHT]: ship.turnRight,
      [Keys.ARROW_UP]: ship.accelerate,
      [Keys.ARROW_DOWN]: ship.decelerate,
      [Keys.SPACE_BAR]: ship.fire
    };
  }

  public pressed(p5: p5) {
    forIn(this.commandsMap, (command, key) => {
      const keyCode = parseInt(key) as Keys;
      if (p5.keyIsDown(keyCode)) {
        this.commandsMap[keyCode].call(this.ship);
      }
    });
  }
}

export default KeyController;
