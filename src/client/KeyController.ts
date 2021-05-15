import { forIn } from 'lodash';
import p5 from 'p5';
import { GameState } from '../core/GameEngine';

type Func = () => void;

enum Keys {
  ARROW_LEFT = 37,
  ARROW_RIGHT = 39,
  LETTER_J = 74,
  LETTER_L = 76,
  NUMPAD_4 = 100,
  NUMPAD_5 = 101,
  NUMPAD_6 = 102,
  LETTER_Q = 81,
  LETTER_E = 69,
  // ARROW_UP = 38,
  // ARROW_DOWN = 40,
  SPACE_BAR = 32
}

class KeyController {
  private state: GameState;
  private commandsMap: Record<Keys, Func>;
  constructor(state: GameState) {
    this.state = state;
    this.commandsMap = {
      [Keys.ARROW_LEFT]: state.ship.turnLeft,
      [Keys.LETTER_J]: state.ship.turnLeft,
      [Keys.NUMPAD_4]: state.ship.turnLeft,
      [Keys.LETTER_Q]: state.ship.turnLeft,
      [Keys.ARROW_RIGHT]: state.ship.turnRight,
      [Keys.LETTER_L]: state.ship.turnRight,
      [Keys.NUMPAD_6]: state.ship.turnRight,
      [Keys.LETTER_E]: state.ship.turnRight,
      // [Keys.ARROW_UP]: state.ship.accelerate,
      // [Keys.ARROW_DOWN]: state.ship.decelerate,
      [Keys.SPACE_BAR]: state.ship.decelerate,
      [Keys.NUMPAD_5]: state.ship.decelerate
    };
  }

  public pressed(p5: p5) {
    forIn(this.commandsMap, (command, key) => {
      const keyCode = parseInt(key) as Keys;
      if (p5.keyIsDown(keyCode)) {
        this.commandsMap[keyCode].call(this.state.ship);
      }
    });
  }
}

export default KeyController;
