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
  SPACE_BAR = 32,
  LETTER_H = 72,
  LETTER_P = 80
}

class KeyController {
  constructor(private rootElementId: string) {}

  public pressed(keyCode: number) {
    switch (keyCode) {
      case Keys.ARROW_LEFT:
        return this.sendCommand('turnLeft');
      case Keys.ARROW_RIGHT:
        return this.sendCommand('turnRight');
      case Keys.ARROW_UP:
        return this.sendCommand('accelerate');
      case Keys.ARROW_DOWN:
        return this.sendCommand('decelerate');
      case Keys.SPACE_BAR:
        return this.sendCommand('fire');
    }
  }

  private sendCommand(type: Command): void {
    let container = document.getElementById(this.rootElementId)!;
    container.dispatchEvent(new CustomEvent('command', { detail: type }));
  }
}

export default KeyController;
