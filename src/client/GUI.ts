import P5 from 'p5';
import colors from './colors';
import GameEngine from 'core/GameEngine';

const SPACING = 40;

class GUI {
  constructor(private gr: P5.Graphics) {
    this.gr = gr;
  }

  public draw(engine: GameEngine): void {
    const { level, score } = engine.state;
    this.gr.textSize(30);
    this.gr.fill(colors.hud);
    this.drawLevel(level);
    this.drawCurrentScore(score);
    this.drawHighScore(engine.highScore);
  }

  private drawLevel(level: number): void {
    const { gr } = this;
    gr.textAlign(gr.LEFT);
    gr.text(`Level ${level}`, SPACING, SPACING);
  }

  private drawHighScore(highScore: number): void {
    const { gr } = this;
    gr.textSize(20);
    const text = prettifyNumber(highScore);
    gr.text(text, gr.windowWidth - SPACING, SPACING * 2);
  }

  private drawCurrentScore(score: number): void {
    const { gr } = this;
    gr.textAlign(gr.RIGHT);
    const text = prettifyNumber(score);
    gr.text(text, gr.windowWidth - SPACING, SPACING);
  }
}

export function prettifyNumber(number: number): string {
  const groupThousands = /\B(?=(\d{3})+(?!\d))/g;
  return number.toString().replace(groupThousands, ',');
}

export default GUI;
