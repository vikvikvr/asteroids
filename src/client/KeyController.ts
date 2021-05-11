import { forIn } from 'lodash';
import p5 from 'p5';

export type Command =
  | 'turnLeft'
  | 'turnRight'
  | 'accelerate'
  | 'decelerate'
  | 'fire';

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
  private rootElementId: string;
  private commandsMap: Record<Keys, Command>;
  constructor(rootElementId: string) {
    this.rootElementId = rootElementId;
    this.commandsMap = {
      [Keys.ARROW_LEFT]: 'turnLeft',
      [Keys.ARROW_RIGHT]: 'turnRight',
      [Keys.ARROW_UP]: 'accelerate',
      [Keys.ARROW_DOWN]: 'decelerate',
      [Keys.SPACE_BAR]: 'fire'
    };
  }

  public pressed(p5: p5) {
    forIn(this.commandsMap, (command, key) => {
      const keyCode = parseInt(key);
      if (p5.keyIsDown(keyCode)) {
        this.sendCommand(command as Command);
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

  private sendCommand(type: Command): void {
    let container = document.getElementById(this.rootElementId)!;
    container.dispatchEvent(new CustomEvent('command', { detail: type }));
  }
}

export default KeyController;
