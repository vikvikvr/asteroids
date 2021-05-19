import P5 from 'p5';
import colors from './colors';
import GameEngine from '../core/GameEngine';

const SPACING = 40;

class GUI {
  constructor(private p5: P5) {
    this.p5 = p5;
  }

  public draw(engine: GameEngine): void {
    const { level, score } = engine.state;
    this.p5.textSize(30);
    this.p5.fill(colors.hud);
    this.drawLevel(level);
    this.drawCurrentScore(score);
    this.drawHighScore(engine.highScore);
  }

  private drawLevel(level: number): void {
    const { p5 } = this;
    p5.textAlign(p5.LEFT);
    p5.text(`Level ${level}`, SPACING, SPACING);
  }

  private drawHighScore(highScore: number): void {
    const { p5 } = this;
    p5.textSize(20);
    const text = prettifyNumber(highScore);
    p5.text(text, p5.windowWidth - SPACING, SPACING * 2);
  }

  private drawCurrentScore(score: number): void {
    const { p5 } = this;
    p5.textAlign(p5.RIGHT);
    const text = prettifyNumber(score);
    p5.text(text, p5.windowWidth - SPACING, SPACING);
  }
}

export function prettifyNumber(number: number): string {
  const groupThousands = /\B(?=(\d{3})+(?!\d))/g;
  return number.toString().replace(groupThousands, ',');
}

export default GUI;
