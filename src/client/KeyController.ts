import p5 from 'p5';
import Ship from '../core/Ship';

class KeyController {
  private ship: Ship;
  private commandsMap: Record<number, () => void>;
  constructor(ship: Ship) {
    this.ship = ship;
    this.commandsMap = {
      37: ship.turnLeft,
      39: ship.turnRight,
      32: ship.decelerate
    };
  }

  public pressed(p5: p5) {
    for (const key in this.commandsMap) {
      const keyCode = parseInt(key);
      if (p5.keyIsDown(keyCode)) {
        this.commandsMap[keyCode].call(this.ship);
      }
    }
  }
}

export default KeyController;
