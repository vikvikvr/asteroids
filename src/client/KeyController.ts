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
  // LETTER_H = 72,
  // LETTER_P = 80
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
        // this.sendCommand(command as Command);
      }
    });
    // if (p5.keyIsDown())
    // switch (keyCode) {
    //   case Keys.ARROW_LEFT:
    //     return this.sendCommand('turnLeft');
    //   case Keys.ARROW_RIGHT:
    //     return this.sendCommand('turnRight');
    //   case Keys.ARROW_UP:
    //     return this.sendCommand('accelerate');
    //   case Keys.ARROW_DOWN:
    //     return this.sendCommand('decelerate');
    //   case Keys.SPACE_BAR:
    //     return this.sendCommand('fire');
    // }
  }

  // private sendCommand(type: Command): void {
  //   let container = document.getElementById(this.rootElementId)!;
  //   container.dispatchEvent(new CustomEvent('command', { detail: type }));
  // }
}

export default KeyController;
