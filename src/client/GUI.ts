import P5 from 'p5';
import { SpawnerEtas } from '../core/Spawner';
import { ColorsMap } from './colors';
import GameEngine, { GameState } from '../core/GameEngine';
import Ship from '../core/Ship';

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
    this.p5.textSize(20);
    this.drawShipInfo(engine.state.ship);
    // this.drawTimersInfo(etas);
    this.drawScore(engine.state);
  }

  private drawShipInfo(ship: Ship) {
    let { life } = ship;
    let { p5 } = this;
    let [x, y] = [SPACING, SPACING];
    p5.fill('white');
    p5.noStroke();
    p5.textAlign(p5.LEFT);
    p5.text(`life: ${percentToString(life)}`, x, y);
    // p5.text(`speed: ${percentToString(speed)}`, x, y + SPACING);
  }

  private drawTimersInfo(etas: SpawnerEtas) {
    let { p5 } = this;
    let [x, y] = [p5.windowWidth - SPACING * 5, SPACING];
    p5.text(`Asteroids in: ${(etas.asteroids / 1000).toFixed(0)}s`, x, y);
  }

  private drawScore(state: GameState): void {
    let { p5 } = this;
    p5.textAlign(p5.CENTER);
    p5.text(state.score, p5.windowWidth / 2, SPACING);
    p5.text(`Level ${state.level}`, p5.windowWidth / 2, SPACING * 2);
  }
}

function percentToString(value: number): string {
  return (value * 100).toFixed(0) + '%';
}

export default GUI;
