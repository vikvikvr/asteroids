import P5 from 'p5';
import { ColorsMap } from './colors';
import GameEngine, { GameState } from '../core/GameEngine';

const SPACING = 20;

class GUI {
  // private
  private p5: P5;
  private colors: ColorsMap;
  // constructor
  constructor(p5: P5, colors: ColorsMap) {
    this.p5 = p5;
    this.colors = colors;
  }

  public draw(engine: GameEngine) {
    this.p5.textSize(30);
    this.p5.fill('white');
    this.drawScore(engine.state);
  }

  private drawScore(state: GameState): void {
    let { p5 } = this;
    p5.textAlign(p5.LEFT);
    p5.text(`Level ${state.level}`, SPACING * 2, SPACING * 2);
    p5.textAlign(p5.RIGHT);
    const scoreText = numberWithSeparators(state.score, ',');
    p5.text(scoreText, p5.windowWidth - SPACING * 2, SPACING * 2);
  }
}

function numberWithSeparators(number: number, separator: string): string {
  const groupThousands = /\B(?=(\d{3})+(?!\d))/g;
  return number.toString().replace(groupThousands, separator);
}

export default GUI;
