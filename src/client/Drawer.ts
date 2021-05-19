import GameEngine, { GameStatus, GameTemperature } from '../core/GameEngine';
import P5 from 'p5';
import { drawableCoords, Point, Rect, toDrawableObject } from '../lib/geometry';
import GUI, { numberWithSeparators } from './GUI';
import colors, { withAlpha } from './colors';
import Animation, { TextAnimation } from './Animation';
import { remove } from 'lodash';
import { bulletHitScore } from '../core/game-rules';
import { BulletHit, GameEvent, GameEventType } from '../core/Events';
import Asteroid from '../core/Asteroid';
import Bullet from '../core/Bullet';
import {
  drawAsteroidShape,
  drawAsteroidTailShape,
  drawBulletShape,
  drawBulletTailShape,
  drawShipLifeArcShape,
  drawShipShape,
  drawShipTailShape
} from './shapes';
import { drawExplostionShard, drawTextAnimation } from './animations';

interface DrawGameObjectOptions {
  rotateDirection?: boolean;
  ignoreOrientation?: boolean;
  rotationOffset?: number;
  scale?: number;
}

interface DrawerOptions {
  p5: P5;
  engine: GameEngine;
  rootElementId: string;
  showHitBoxes?: boolean;
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
  constructor(options: DrawerOptions) {
    this.p5 = options.p5;
    const canvas = this.p5.createCanvas(
      this.p5.windowWidth,
      this.p5.windowHeight
    );
    this.engine = options.engine;
    canvas.parent(options.rootElementId);
    this.showHitBoxes = options.showHitBoxes || false;
    this.screen = {
      width: this.p5.windowWidth,
      height: this.p5.windowHeight
    };
    this.gui = new GUI(this.p5);
    this.p5.textSize(20);
    this.shakeEndTime = -Infinity;
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
    const currentTime = Date.now();
    if (currentTime < this.shakeEndTime) {
      const shakeSize = 10;
      const offsetX = this.p5.noise(currentTime) * shakeSize;
      const offsetY = this.p5.noise(0, currentTime) * shakeSize;
      this.p5.translate(offsetX, offsetY);
    }
  }

  private drawGameOverScreen(): void {
    const { p5 } = this;
    const ankerX = p5.windowWidth / 2;
    const ankerY = p5.windowHeight / 2;
    p5.background(colors.background.normal);
    p5.fill(colors.hud);
    this.drawGameOverTitle(ankerX, ankerY);
    this.drawGameOverScore(ankerX, ankerY);
    p5.textSize(20);
    p5.text('press F5 to try again', ankerX, ankerY + 90);
    p5.textAlign(p5.LEFT);
  }

  private drawGameOverScore(ankerX: number, ankerY: number): void {
    const { p5, engine } = this;
    p5.textSize(20);
    const scoreText = 'Score: ' + numberWithSeparators(engine.state.score, ',');
    p5.text(scoreText, ankerX, ankerY);
    const bestScoreText =
      'Best: ' + numberWithSeparators(engine.highScore, ',');
    p5.text(bestScoreText, ankerX, ankerY + 30);
  }

  private drawGameOverTitle(ankerX: number, ankerY: number): void {
    const { p5 } = this;
    p5.textSize(40);
    p5.textAlign(p5.CENTER);
    p5.text('GAME OVER', ankerX, ankerY - 60);
  }

  private drawEnvironment(): void {
    const { p5, stars, engine } = this;
    const bgColor = colors.background[engine.state.temperature];
    p5.background(bgColor);
    this.drawStars(stars);
  }

  private drawGameObjects(): void {
    this.drawBullets();
    this.drawShip();
    this.drawAsteroids();
  }

  private addNewAnimations(): void {
    const { events, temperature } = this.engine.state;
    for (const event of events) {
      if (['LEVEL_UP', 'FREEZE', 'BURN'].includes(event.type)) {
        this.addStageAnimation(event);
      } else {
        if (event.type === 'SHIP_HIT') {
          this.shakeEndTime = Date.now() + 500;
        } else {
          this.addScoreAnimation(event, temperature);
        }
      }
    }
    this.engine.state.events = [];
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

  private addScoreAnimation(event: GameEvent, temperature: GameTemperature) {
    const bulletHit = event as BulletHit;
    const score = bulletHitScore(bulletHit.size, temperature);
    const animation = new TextAnimation(`+${score}`, bulletHit.coords);
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

  public createStars(world: Rect, amount: number): void {
    for (let i = 0; i < amount; i++) {
      this.stars.push({
        x: Math.random() * world.width,
        y: Math.random() * world.height,
        diameter: Math.random() > 0.5 ? 2 : 1
      });
    }
  }

  private drawableCoords(object: Point): Point | undefined {
    return drawableCoords(
      object,
      this.engine.state.ship.coords,
      this.screen,
      this.engine.world
    );
  }

  private drawStars(stars: Star[]): void {
    const { p5 } = this;
    p5.noStroke();
    p5.fill(withAlpha(colors.hud, 1));
    for (const star of stars) {
      const coords = this.drawableCoords(star);
      if (coords) p5.circle(coords.x, coords.y, star.diameter);
    }
  }

  private drawAsteroids(): void {
    const { asteroids, temperature } = this.engine.state;
    for (const asteroid of asteroids) {
      this.drawAsteroidTail(asteroid, temperature);
      const drawer = () => drawAsteroidShape(this.p5, asteroid, temperature);
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

  private drawHitBox(hitBoxRadius: number) {
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
    this.drawShipTail(ship.tail);
    const options = {
      rotateDirection: true,
      rotationOffset: Math.PI / 2
    };
    const drawer = () => {
      drawShipShape(p5, ship.hitBoxRadius / 2);
      drawShipLifeArcShape(p5, ship.life, temperature);
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
      this.drawGameObject(drawable, {}, () =>
        drawAsteroidTailShape(this.p5, i, length)
      );
    }
  }

  private drawShipTail(tail: Point[]) {
    const { p5 } = this;
    const length = tail.length;
    p5.noStroke();
    for (let i = 0; i < length; i++) {
      const point = tail[i];
      const drawable = toDrawableObject(point);
      this.drawGameObject(drawable, {}, () => drawShipTailShape(p5, i, length));
    }
  }

  private drawBullets(): void {
    const { bullets } = this.engine.state.ship;
    for (const bullet of bullets) {
      this.drawGameObject(bullet, {}, () => drawBulletShape(this.p5));
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
        drawBulletTailShape(this.p5, i, tailLength)
      );
    }
  }
}

export default Drawer;
