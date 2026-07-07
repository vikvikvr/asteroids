import P5 from 'p5';
import colors from './colors';
import GameEngine from 'core/GameEngine';
import { Temperature } from 'types';

const SPACING = 40;

const STAGE_INFO: Record<Temperature, { name: string; bonus: string }> = {
  [Temperature.Normal]: {
    name: 'Normal space',
    bonus: 'Standard asteroid values.'
  },
  [Temperature.Low]: {
    name: 'Frozen field',
    bonus: 'Asteroids hold position, hits pay out as if fully split.'
  },
  [Temperature.High]: {
    name: 'On fire',
    bonus: 'Asteroids speed up, every hit scores double.'
  }
};

const HOTKEY_SEGMENTS = [
  { keys: ['←', '→'], label: 'Turn' },
  { keys: ['Space'], label: 'Brake' }
];

class GUI {
  constructor(private gr: P5.Graphics) {
    this.gr = gr;
  }

  public draw(engine: GameEngine): void {
    const { level, score, temperature } = engine.state;
    this.gr.noStroke();
    this.drawLevel(level);
    this.drawStage(temperature);
    this.drawCurrentScore(score);
    this.drawHighScore(engine.highScore);
    this.drawHotkeys();
  }

  private drawLevel(level: number): void {
    const { gr } = this;
    gr.fill(colors.hud);
    gr.textSize(30);
    gr.textAlign(gr.LEFT, gr.BASELINE);
    gr.text(`Level ${level}`, SPACING, SPACING);
  }

  private drawStage(temperature: Temperature): void {
    const { gr } = this;
    const { name, bonus } = STAGE_INFO[temperature];
    const stageColors = colors.stage[temperature];
    const paddingX = 14;
    const dotRadius = 4;
    const chipHeight = 28;
    const x = SPACING;
    const y = SPACING + 20;

    gr.textSize(15);
    const textWidth = gr.textWidth(name);
    const chipWidth = paddingX * 2 + dotRadius * 2 + 8 + textWidth;

    gr.fill(stageColors.bg);
    gr.rect(x, y, chipWidth, chipHeight, chipHeight / 2);

    gr.fill(stageColors.color);
    gr.circle(x + paddingX + dotRadius, y + chipHeight / 2, dotRadius * 2);

    gr.textAlign(gr.LEFT, gr.CENTER);
    gr.text(name, x + paddingX + dotRadius * 2 + 8, y + chipHeight / 2 + 1);

    gr.fill(colors.hudDim);
    gr.textSize(13);
    gr.textAlign(gr.LEFT, gr.TOP);
    gr.text(bonus, x, y + chipHeight + 10, 360);
  }

  private drawCurrentScore(score: number): void {
    const { gr } = this;
    const x = gr.width - SPACING;
    gr.textAlign(gr.RIGHT, gr.TOP);
    gr.fill(colors.hudFaint);
    gr.textSize(13);
    gr.text('SCORE', x, SPACING - 30);
    gr.fill(colors.hud);
    gr.textSize(30);
    gr.text(prettifyNumber(score), x, SPACING - 12);
  }

  private drawHighScore(highScore: number): void {
    const { gr } = this;
    const x = gr.width - SPACING;
    gr.textAlign(gr.RIGHT, gr.TOP);
    gr.fill(colors.hudFaint);
    gr.textSize(11);
    gr.text('BEST', x, SPACING + 42);
    gr.fill(colors.hudDim);
    gr.textSize(18);
    gr.text(prettifyNumber(highScore), x, SPACING + 56);
  }

  private drawHotkeys(): void {
    const { gr } = this;
    const keyPadding = 10;
    const keyHeight = 24;
    const keyGap = 4;
    const labelGap = 8;
    const segmentGap = 22;
    const panelPaddingX = 20;
    const panelPaddingY = 10;

    gr.textSize(13);

    const segmentWidths = HOTKEY_SEGMENTS.map(segment => {
      const keysWidth =
        segment.keys.reduce(
          (total, key) => total + gr.textWidth(key) + keyPadding * 2,
          0
        ) +
        keyGap * (segment.keys.length - 1);
      return keysWidth + labelGap + gr.textWidth(segment.label);
    });

    const contentWidth =
      segmentWidths.reduce((total, width) => total + width, 0) +
      segmentGap * (HOTKEY_SEGMENTS.length - 1);
    const panelWidth = contentWidth + panelPaddingX * 2;
    const panelHeight = keyHeight + panelPaddingY * 2;
    const panelX = gr.width / 2 - panelWidth / 2;
    const panelY = gr.height - SPACING - panelHeight;
    const centerY = panelY + panelHeight / 2;

    gr.fill(colors.hudPanel);
    gr.rect(panelX, panelY, panelWidth, panelHeight, panelHeight / 2);

    let x = panelX + panelPaddingX;
    for (const segment of HOTKEY_SEGMENTS) {
      for (const key of segment.keys) {
        const keyWidth = gr.textWidth(key) + keyPadding * 2;
        gr.fill(colors.hudKey);
        gr.rect(x, centerY - keyHeight / 2, keyWidth, keyHeight, 6);
        gr.fill(colors.hud);
        gr.textAlign(gr.CENTER, gr.CENTER);
        gr.text(key, x + keyWidth / 2, centerY + 1);
        x += keyWidth + keyGap;
      }
      x += labelGap;
      gr.fill(colors.hudDim);
      gr.textAlign(gr.LEFT, gr.CENTER);
      gr.text(segment.label, x, centerY + 1);
      x += gr.textWidth(segment.label) + segmentGap;
    }

    gr.textAlign(gr.RIGHT, gr.BASELINE);
  }
}

export function prettifyNumber(number: number): string {
  const groupThousands = /\B(?=(\d{3})+(?!\d))/g;
  return number.toString().replace(groupThousands, ',');
}

export default GUI;
