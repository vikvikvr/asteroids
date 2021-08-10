import GameEngine, { Temperature } from 'core/GameEngine';
import P5 from 'p5';
import {
  circleFraction,
  drawableCoords,
  Point,
  randomNumber,
  toDrawableObject
} from 'lib';
import GUI, { prettifyNumber } from './GUI';
import colors, { withAlpha } from './colors';
import Animation, { TextAnimation } from './Animation';
import { remove } from 'lodash';
import { bulletHitScore } from 'core/game-rules';
import { BulletHit, GameEvent, GameEventType } from 'core/Events';
import Asteroid from 'core/Asteroid';
import Bullet from 'core/Bullet';
import * as shapes from './shapes';
import { drawExplostionShard, drawTextAnimation } from './animations';

interface DrawGameObjectOptions {
  rotateDirection?: boolean;
  ignoreOrientation?: boolean;
  rotationOffset?: number;
}

export interface DrawableObject {
  coords: Point;
  hitBoxRadius: number;
  orientation: number;
  direction: number;
}

interface Star {
  x: number;
  y: number;
  diameter: number;
}

class Drawer {
  // private
  private p5: P5;
  private stars: Star[] = [];
  private showHitBoxes: boolean;
  private engine: GameEngine;
  private gui: GUI;
  private animations: Animation[] = [];
  private shakeEndTime: number;
  private gr: P5.Graphics;
  // constructor
  constructor(p5: P5, engine: GameEngine) {
    this.p5 = p5;
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    this.engine = engine;
    canvas.parent('root');
    this.showHitBoxes = false;
    this.gr = p5.createGraphics(p5.windowWidth, p5.windowHeight);
    this.setupGraphics();
    this.gui = new GUI(this.gr);
    this.shakeEndTime = -Infinity;
    this.stars = this.createStars(200);
  }

  public drawScreen(): void {
    const { status } = this.engine;
    if (status === 'playing') {
      this.drawGameScreen();
    } else if (status === 'lost') {
      this.drawGameOverScreen();
    }
  }

  public resizeScreen(): void {
    const { windowWidth, windowHeight } = this.p5;
    this.p5.resizeCanvas(windowWidth, windowHeight);
    this.gr.resizeCanvas(windowWidth, windowHeight);
  }

  private drawGameScreen(): void {
    this.gr.push();
    this.shakeCamera();
    this.drawEnvironment();
    this.drawGameObjects();
    this.addNewAnimations();
    this.drawAnimations();
    this.gr.pop();
    this.gui.draw(this.engine);
    this.p5.clear();
    this.p5.image(this.gr, 0, 0);
  }

  private setupGraphics(): void {
    const { gr } = this;
    gr.textFont('Verdana');
    gr.textStyle(gr.BOLD);
  }

  private shakeCamera(): void {
    const { shakeEndTime, gr } = this;
    const currentTime = Date.now();
    if (currentTime < shakeEndTime) {
      const shakeSize = 10;
      const offsetX = gr.noise(currentTime) * shakeSize;
      const offsetY = gr.noise(0, currentTime) * shakeSize;
      gr.translate(offsetX, offsetY);
    }
  }

  private drawGameOverScreen(): void {
    const { gr } = this;
    const x = gr.windowWidth / 2;
    const y = gr.windowHeight / 2;
    gr.background(colors.background[Temperature.Normal]);
    gr.fill(colors.hud);
    this.drawGameOverTitle({ x, y });
    this.drawGameOverScore({ x, y });
    gr.textSize(20);
    gr.text('press F5 to try again', x, y + 90);
    this.p5.image(this.gr, 0, 0);
  }

  private drawGameOverScore(center: Point): void {
    const { gr, engine } = this;
    gr.textSize(20);
    const score = 'Score: ' + prettifyNumber(engine.state.score);
    gr.text(score, center.x, center.y);
    const bestScore = 'Best: ' + prettifyNumber(engine.highScore);
    gr.text(bestScore, center.x, center.y + 30);
  }

  private drawGameOverTitle(center: Point): void {
    const { gr } = this;
    gr.textSize(40);
    gr.textAlign(gr.CENTER);
    gr.text('GAME OVER', center.x, center.y - 60);
  }

  private drawEnvironment(): void {
    this.gr.clear();
    this.drawStars();
  }

  private drawGameObjects(): void {
    this.drawBullets();
    this.drawShip();
    this.drawAsteroids();
  }

  private addNewAnimations(): void {
    const { events } = this.engine.state;
    for (const event of events) {
      if (['LEVEL_UP', 'FREEZE', 'BURN'].includes(event.type)) {
        this.addStageAnimation(event);
      } else {
        if (event.type === 'SHIP_HIT') {
          this.shakeEndTime = Date.now() + 500;
        } else {
          this.addScoreAnimation(event);
        }
      }
    }
    events.length = 0;
  }

  private addStageAnimation(event: GameEvent): void {
    const textMap: Partial<Record<GameEventType, string>> = {
      LEVEL_UP: 'level up!',
      FREEZE: 'frozen!',
      BURN: 'on fire!'
    };
    const animation = new TextAnimation(
      textMap[event.type] as string,
      this.engine.state.ship.coords
    );
    this.animations.push(animation);
  }

  private addScoreAnimation(event: GameEvent): void {
    const { temperature } = this.engine.state;
    const { size, coords } = event as BulletHit;
    const score = bulletHitScore(size, temperature);
    const animation = new TextAnimation(`+${score}`, coords);
    this.animations.push(animation);
  }

  private drawAnimations(): void {
    this.drawExplosionShards();
    this.drawTextAnimations();
    remove(this.animations, 'isExpired');
  }

  private drawTextAnimations(): void {
    const { gr } = this;
    gr.textSize(30);
    gr.noStroke();
    for (const animation of this.animations) {
      if (animation instanceof TextAnimation) {
        const coords = animation.getNextCoords();
        if (coords) {
          const drawable = toDrawableObject(coords);
          const drawer = () => drawTextAnimation(gr, animation);
          this.drawGameObject(drawable, {}, drawer);
        }
      }
    }
  }

  private drawExplosionShards(): void {
    for (const shard of this.engine.state.shards) {
      const drawer = () => drawExplostionShard(this.gr, shard);
      this.drawGameObject(shard, {}, drawer);
    }
  }

  public createStars(amount: number): Star[] {
    const { width, height } = this.engine.world;
    const stars = [];
    for (let i = 0; i < amount; i++) {
      const star: Star = {
        x: randomNumber(width),
        y: randomNumber(height),
        diameter: randomNumber(0.5, 1.5)
      };
      stars.push(star);
    }
    return stars;
  }

  private drawableCoords(object: Point): Point | null {
    const screen = { width: this.gr.width, height: this.gr.height };
    return drawableCoords(
      object,
      this.engine.state.ship.coords,
      screen,
      this.engine.world
    );
  }

  private drawStars(): void {
    const { gr, stars } = this;
    gr.noStroke();
    gr.fill(withAlpha(colors.hud, 1));
    for (const star of stars) {
      const coords = this.drawableCoords(star);
      if (coords) {
        gr.square(coords.x, coords.y, star.diameter);
      }
    }
  }

  private drawAsteroids(): void {
    const { asteroids, temperature } = this.engine.state;
    for (const asteroid of asteroids) {
      this.drawAsteroidTail(asteroid, temperature);
      const drawer = () => shapes.asteroid(this.gr, asteroid, temperature);
      this.drawGameObject(asteroid, {}, drawer);
    }
  }

  private drawGameObject(
    object: DrawableObject,
    options: DrawGameObjectOptions,
    drawer: () => void
  ): void {
    const { gr } = this;
    const coords = this.drawableCoords(object.coords);
    if (coords) {
      gr.push();
      this.transformObjectMatrix(object, options, coords);
      drawer();
      this.drawHitBox(object.hitBoxRadius);
      gr.pop();
    }
  }

  private transformObjectMatrix(
    object: DrawableObject,
    options: DrawGameObjectOptions,
    coords: Point
  ): void {
    const { gr } = this;
    let angle = options.ignoreOrientation ? 0 : object.orientation;
    angle += options.rotationOffset || 0;
    angle += options.rotateDirection ? object.direction : 0;
    gr.translate(coords.x, coords.y);
    gr.rotate(angle);
  }

  private drawHitBox(hitBoxRadius: number): void {
    const { gr } = this;
    if (this.showHitBoxes) {
      gr.noFill();
      gr.stroke(colors.hud);
      gr.circle(0, 0, hitBoxRadius * 2);
    }
  }

  private drawShip(): void {
    const { gr } = this;
    const { ship, temperature } = this.engine.state;
    this.drawShipTail();
    const options = {
      rotateDirection: true,
      rotationOffset: circleFraction(4)
    };
    const drawer = () => {
      shapes.ship(gr, ship.hitBoxRadius / 2);
      shapes.shipLifeArc(gr, ship.life, temperature);
    };
    this.drawGameObject(ship, options, drawer);
  }

  private drawAsteroidTail(asteroid: Asteroid, temperature: Temperature): void {
    const length = asteroid.tail.length;
    for (let i = 0; i < length; i++) {
      const point = asteroid.tail[i];
      const drawable = toDrawableObject(point);
      const drawer = () => shapes.asteroidTail(this.gr, i, length);
      this.drawGameObject(drawable, {}, drawer);
    }
  }

  private drawShipTail(): void {
    const { gr } = this;
    const { tail } = this.engine.state.ship;
    const length = tail.length;
    gr.noStroke();
    for (let i = 0; i < length; i++) {
      const point = tail[i];
      const drawable = toDrawableObject(point);
      const drawer = () => shapes.shipTail(gr, i, length);
      this.drawGameObject(drawable, {}, drawer);
    }
  }

  private drawBullets(): void {
    const { bullets } = this.engine.state.ship;
    for (const bullet of bullets) {
      const drawer = () => shapes.bullet(this.gr);
      this.drawGameObject(bullet, {}, drawer);
      this.drawBulletTail(bullet);
    }
  }

  private drawBulletTail(bullet: Bullet): void {
    const tailLength = bullet.tailLength;
    const tailShapes = bullet.tail.length;
    for (let i = 0; i < tailShapes; i++) {
      const point = bullet.tail[i];
      const drawable = toDrawableObject(point);
      this.drawGameObject(drawable, {}, () =>
        shapes.bulletTail(this.gr, i, tailLength)
      );
    }
  }
}

export default Drawer;
