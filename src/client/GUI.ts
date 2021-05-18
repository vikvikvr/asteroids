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
    this.drawScore(engine);
  }

  private drawScore(engine: GameEngine): void {
    const { level, score } = engine.state;
    let { p5 } = this;
    p5.textAlign(p5.LEFT);
    p5.text(`Level ${level}`, SPACING * 2, SPACING * 2);
    p5.textAlign(p5.RIGHT);
    const scoreText = numberWithSeparators(score, ',');
    p5.text(scoreText, p5.windowWidth - SPACING * 2, SPACING * 2);
    this.p5.textSize(20);
    const bestScoreText = numberWithSeparators(engine.highScore, ',');
    p5.text(bestScoreText, p5.windowWidth - SPACING * 2, SPACING * 4);
  }
}

export function numberWithSeparators(
  number: number,
  separator: string
): string {
  const groupThousands = /\B(?=(\d{3})+(?!\d))/g;
  return number.toString().replace(groupThousands, separator);
}

export default GUI;
