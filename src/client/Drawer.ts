import GameEngine, { GameStatus, GameTemperature } from '../core/GameEngine';
import P5 from 'p5';
import { drawableCoords, Point, Rect, toDrawableObject } from '../lib/geometry';
import GUI, { prettifyNumber } from './GUI';
import colors, { withAlpha } from './colors';
import Animation, { TextAnimation } from './Animation';
import { remove } from 'lodash';
import { bulletHitScore } from '../core/game-rules';
import { BulletHit, GameEvent, GameEventType } from '../core/Events';
import Asteroid from '../core/Asteroid';
import Bullet from '../core/Bullet';
import * as shapes from './shapes';
import { drawExplostionShard, drawTextAnimation } from './animations';

interface DrawGameObjectOptions {
  rotateDirection?: boolean;
  ignoreOrientation?: boolean;
  rotationOffset?: number;
  scale?: number;
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
  private screen: Rect;
  private engine: GameEngine;
  private gui: GUI;
  private animations: Animation[] = [];
  private shakeEndTime: number;
  // constructor
  constructor(p5: P5, engine: GameEngine) {
    this.p5 = p5;
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    this.engine = engine;
    canvas.parent('root');
    this.showHitBoxes = false;
    this.screen = {
      width: p5.windowWidth,
      height: p5.windowHeight
    };
    this.gui = new GUI(p5);
    this.shakeEndTime = -Infinity;
    this.createStars(200);
  }

  public drawScreen(): void {
    const screens: Record<GameStatus, () => void> = {
      playing: () => this.drawGameScreen(),
      lost: () => this.drawGameOverScreen(),
      idle: () => 0
    };
    screens[this.engine.status]();
  }

  public resizeScreen(width: number, height: number): void {
    this.p5.resizeCanvas(width, height);
    this.screen = { width, height };
  }

  private drawGameScreen(): void {
    this.p5.push();
    this.shakeCamera();
    this.drawEnvironment();
    this.drawGameObjects();
    this.addNewAnimations();
    this.drawAnimations();
    this.p5.pop();
    this.gui.draw(this.engine);
  }

  private shakeCamera() {
    const { shakeEndTime, p5 } = this;
    const currentTime = Date.now();
    if (currentTime < shakeEndTime) {
      const shakeSize = 10;
      const offsetX = p5.noise(currentTime) * shakeSize;
      const offsetY = p5.noise(0, currentTime) * shakeSize;
      p5.translate(offsetX, offsetY);
    }
  }

  private drawGameOverScreen(): void {
    const { p5 } = this;
    const x = p5.windowWidth / 2;
    const y = p5.windowHeight / 2;
    p5.background(colors.background.normal);
    p5.fill(colors.hud);
    this.drawGameOverTitle({ x, y });
    this.drawGameOverScore({ x, y });
    p5.textSize(20);
    p5.text('press F5 to try again', x, y + 90);
    p5.textAlign(p5.LEFT);
  }

  private drawGameOverScore(center: Point): void {
    const { p5, engine } = this;
    p5.textSize(20);
    const score = 'Score: ' + prettifyNumber(engine.state.score);
    p5.text(score, center.x, center.y);
    const bestScore = 'Best: ' + prettifyNumber(engine.highScore);
    p5.text(bestScore, center.x, center.y + 30);
  }

  private drawGameOverTitle(center: Point): void {
    const { p5 } = this;
    p5.textSize(40);
    p5.textAlign(p5.CENTER);
    p5.text('GAME OVER', center.x, center.y - 60);
  }

  private drawEnvironment(): void {
    const { p5, engine } = this;
    const { temperature } = engine.state;
    const bgColor = colors.background[temperature];
    p5.background(bgColor);
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

  private addStageAnimation(event: GameEvent) {
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

  private addScoreAnimation(event: GameEvent) {
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

  private drawTextAnimations() {
    const { p5 } = this;
    p5.textSize(30);
    p5.noStroke();
    for (const animation of this.animations) {
      if (animation instanceof TextAnimation) {
        const coords = animation.getNextCoords();
        if (coords) {
          const drawable = toDrawableObject(coords);
          const drawer = () => drawTextAnimation(p5, animation);
          this.drawGameObject(drawable, {}, drawer);
        }
      }
    }
  }

  private drawExplosionShards() {
    for (const shard of this.engine.state.shards) {
      const drawer = () => drawExplostionShard(this.p5, shard);
      this.drawGameObject(shard, {}, drawer);
    }
  }

  public createStars(amount: number): void {
    const { width, height } = this.engine.world;
    for (let i = 0; i < amount; i++) {
      const star: Star = {
        x: Math.random() * width,
        y: Math.random() * height,
        diameter: Math.random() > 0.5 ? 2 : 1
      };
      this.stars.push(star);
    }
  }

  private drawableCoords(object: Point): Point | null {
    return drawableCoords(
      object,
      this.engine.state.ship.coords,
      this.screen,
      this.engine.world
    );
  }

  private drawStars(): void {
    const { p5, stars } = this;
    p5.noStroke();
    p5.fill(withAlpha(colors.hud, 1));
    for (const star of stars) {
      const coords = this.drawableCoords(star);
      if (coords) {
        p5.circle(coords.x, coords.y, star.diameter);
      }
    }
  }

  private drawAsteroids(): void {
    const { asteroids, temperature } = this.engine.state;
    for (const asteroid of asteroids) {
      this.drawAsteroidTail(asteroid, temperature);
      const drawer = () => shapes.asteroid(this.p5, asteroid, temperature);
      this.drawGameObject(asteroid, {}, drawer);
    }
  }

  private drawGameObject(
    object: DrawableObject,
    options: DrawGameObjectOptions,
    drawer: () => void
  ): void {
    const { p5 } = this;
    const coords = this.drawableCoords(object.coords);
    if (coords) {
      p5.push();
      this.transformObjectMatrix(object, options, coords);
      drawer();
      this.drawHitBox(object.hitBoxRadius);
      p5.pop();
    }
  }

  private transformObjectMatrix(
    object: DrawableObject,
    options: DrawGameObjectOptions,
    coords: Point
  ): void {
    const { p5 } = this;
    let angle = options.ignoreOrientation ? 0 : object.orientation;
    angle += options.rotationOffset || 0;
    angle += options.rotateDirection ? object.direction : 0;
    p5.translate(coords.x, coords.y);
    p5.rotate(angle);
    p5.scale(options.scale || 1);
  }

  private drawHitBox(hitBoxRadius: number): void {
    const { p5 } = this;
    if (this.showHitBoxes) {
      p5.noFill();
      p5.stroke(colors.hud);
      p5.circle(0, 0, hitBoxRadius * 2);
    }
  }

  private drawShip(): void {
    const { p5 } = this;
    const { ship, temperature } = this.engine.state;
    this.drawShipTail();
    const options = {
      rotateDirection: true,
      rotationOffset: Math.PI / 2
    };
    const drawer = () => {
      shapes.ship(p5, ship.hitBoxRadius / 2);
      shapes.shipLifeArc(p5, ship.life, temperature);
    };
    this.drawGameObject(ship, options, drawer);
  }

  private drawAsteroidTail(
    asteroid: Asteroid,
    temperature: GameTemperature
  ): void {
    const length = asteroid.tail.length;
    for (let i = 0; i < length; i++) {
      const point = asteroid.tail[i];
      const drawable = toDrawableObject(point);
      const drawer = () => shapes.asteroidTail(this.p5, i, length);
      this.drawGameObject(drawable, {}, drawer);
    }
  }

  private drawShipTail(): void {
    const { p5 } = this;
    const { tail } = this.engine.state.ship;
    const length = tail.length;
    p5.noStroke();
    for (let i = 0; i < length; i++) {
      const point = tail[i];
      const drawable = toDrawableObject(point);
      const drawer = () => shapes.shipTail(p5, i, length);
      this.drawGameObject(drawable, {}, drawer);
    }
  }

  private drawBullets(): void {
    const { bullets } = this.engine.state.ship;
    for (const bullet of bullets) {
      const drawer = () => shapes.bullet(this.p5);
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
        shapes.bulletTail(this.p5, i, tailLength)
      );
    }
  }
}

export default Drawer;
