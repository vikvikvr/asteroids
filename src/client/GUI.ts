import P5 from 'p5';
import { ShipSnapshot } from '../core/Ship';
import { SpawnerEtas } from '../core/Spawner';
import { Point, Rect } from '../lib/geometry';
import { AsteroidSnapshot } from '../core/Asteroid';
import { ColorsMap } from './colors';
import { GameSnapshot } from '../core/GameEngine';
import { filter } from 'lodash';

type GuiComponent = 'asteroids' | 'ship' | 'timers' | 'bonuses';

const SPACING = 20;

class GUI {
  // private
  private p5: P5;
  private anchors: Record<GuiComponent, Point>;
  private colors: ColorsMap;
  constructor(p5: P5, colors: ColorsMap) {
    this.p5 = p5;
    this.colors = colors;
    this.anchors = createAnchors({
      width: p5.windowWidth,
      height: p5.windowHeight
    });
  }

  public draw(snapshot: GameSnapshot) {
    let { ship, asteroids, timers, bonuses } = this.anchors;
    this.asteroids(snapshot.asteroids, asteroids);
    this.ship(snapshot.ship, ship);
    this.timers(snapshot.etas, timers);
    this.bonuses(snapshot.ship, bonuses);
  }

  private asteroids(asteroids: AsteroidSnapshot[], topLeft: Point): void {
    let { p5 } = this;
    let large = filter(asteroids, { size: 'large' }).length;
    let medium = filter(asteroids, { size: 'medium' }).length;
    let small = filter(asteroids, { size: 'small' }).length;
    p5.text(`asteroids: ${large} | ${medium} | ${small}`, topLeft.x, topLeft.y);
  }

  private ship(ship: ShipSnapshot, topLeft: Point) {
    let { ammo, fuel, cargo, life, speed } = ship;
    let { x, y } = topLeft;
    let { p5 } = this;
    p5.fill('white');
    p5.noStroke();
    p5.text(`fuel: ${percentToString(fuel)} [${cargo.fuel}]`, x, y);
    p5.text(`ammo: ${ammo} [${cargo.ammo}]`, x, 40);
    p5.text(`life: ${percentToString(life)} [${cargo.fix}]`, x, 60);
    p5.text(`speed: ${percentToString(speed)}`, x, 100);
  }

  private timers(etas: SpawnerEtas, topLeft: Point) {
    let { p5 } = this;
    let { x, y } = topLeft;
    p5.text(`Asteroids in: ${(etas.asteroids / 1000).toFixed(0)}s`, x, y);
    p5.text(`Drops in: ${(etas.bonuses / 1000).toFixed(0)}s`, x, y + 20);
  }

  private bonuses(ship: ShipSnapshot, topLeft: Point): void {
    let { p5 } = this;
    let { x, y } = topLeft;
    let suggestions = [
      ship.fuel < 0.3 && ship.cargo.fuel > 0,
      ship.ammo < 30 && ship.cargo.ammo > 0,
      ship.life < 0.3 && ship.cargo.fix > 0
    ];
    let keys = ['Q', 'W', 'E'];
    let activeColors = [this.colors.fuel, this.colors.ammo, this.colors.life];
    let side = SPACING * 2;
    let padding = SPACING;
    p5.push();
    p5.translate(x, y);
    p5.rectMode(p5.CENTER);
    p5.textAlign(p5.CENTER);
    for (let i = 0; i < 3; i++) {
      let currentX = i * (side + padding);
      p5.fill(suggestions[i] ? activeColors[i] : 'rgba(0,0,0,0)');
      p5.stroke(suggestions[i] ? activeColors[i] : this.colors.inactive);
      p5.text(keys[i], currentX, 0);
      p5.rect(currentX, 0, side, side, 10);
    }
    p5.pop();
  }
}

function percentToString(value: number): string {
  return (value * 100).toFixed(0) + '%';
}

function createAnchors(screen: Rect): Record<GuiComponent, Point> {
  return {
    asteroids: { x: SPACING, y: SPACING * 4 },
    ship: { x: SPACING, y: SPACING },
    timers: {
      x: screen.width - SPACING * 5,
      y: SPACING
    },
    bonuses: {
      x: SPACING,
      y: screen.height - SPACING * 2
    }
  };
}

export default GUI;
