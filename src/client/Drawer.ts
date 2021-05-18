import GameEngine, { GameTemperature } from '../core/GameEngine';
import P5 from 'p5';
import { drawableCoords, Point, Rect } from '../lib/geometry';
import GUI from './GUI';
import COLORS from './colors';
import Animation, { ExplosionAnimation, TextAnimation } from './Animation';
import Ship from '../core/Ship';
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
  radius: number;
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
    this.gui = new GUI(this.p5, COLORS);
    this.p5.textSize(20);
    this.shakeEndTime = -Infinity;
  }

  public drawScreen(engine: GameEngine): void {
    switch (engine.status) {
      case 'playing':
        this.drawGameScreen(engine);
        break;
      case 'lost':
        this.drawGameOverScreen(engine.state.score);
        break;
      case 'idle':
        console.log('idle');
        break;
    }
  }

  public resizeScreen(width: number, height: number): void {
    this.p5.resizeCanvas(width, height);
    this.screen = { width, height };
  }

  private drawGameScreen(engine: GameEngine): void {
    this.p5.push();
    this.shakeCamera();
    this.drawEnvironment();
    this.drawGameObjects(engine);
    this.addNewAnimations(engine);
    this.drawAnimations();
    this.p5.pop();
    this.gui.draw(engine);
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

  private drawGameOverScreen(score: number): void {
    let { p5 } = this;
    p5.background(COLORS.space);
    p5.fill('white');
    p5.textSize(40);
    p5.textAlign(p5.CENTER);
    p5.text('GAME OVER', p5.windowWidth / 2, p5.windowHeight / 2);
    p5.textSize(20);
    p5.text(score, p5.windowWidth / 2, p5.windowHeight / 2 + 30);
    p5.text(
      'press F5 to try again',
      p5.windowWidth / 2,
      p5.windowHeight / 2 + 60
    );
    p5.textAlign(p5.LEFT);
  }

  private drawEnvironment(): void {
    let { p5, stars, engine } = this;
    const bgColorMap: Record<GameTemperature, string> = {
      high: '#311b92',
      normal: '#1a237e',
      low: '#0d47a1'
    };
    p5.background(bgColorMap[engine.state.temperature]);
    this.drawStars(stars);
  }

  private drawGameObjects(engine: GameEngine): void {
    let { ship, asteroids } = engine.state;
    this.drawBullets(ship.bullets);
    this.drawShip(ship);
    this.drawAsteroids(asteroids, engine.state.temperature);
  }

  private addNewAnimations(engine: GameEngine): void {
    for (const event of engine.state.events) {
      if (['LEVEL_UP', 'FREEZE', 'BURN'].includes(event.type)) {
        const textMap: Partial<Record<GameEventType, string>> = {
          LEVEL_UP: 'level up!',
          FREEZE: 'frozen!',
          BURN: 'on fire!'
        };
        const textAnimation = new TextAnimation(
          textMap[event.type] as string,
          engine.state.ship.coords
        );
        this.animations.push(textAnimation);
      } else {
        this.addExplosionAnimation(event, engine.state.temperature);
        if (event.type === 'SHIP_HIT') {
          this.shakeEndTime = Date.now() + 500;
        } else {
          this.addScoreAnimation(event, engine.state.temperature);
        }
      }
    }
    engine.state.events = [];
  }

  private addScoreAnimation(event: GameEvent, temperature: GameTemperature) {
    const myEvent = event as BulletHit;
    const score = bulletHitScore(myEvent.size, temperature);
    const scoreAnimation = new TextAnimation(`+${score}`, myEvent.coords);
    this.animations.push(scoreAnimation);
  }

  private addExplosionAnimation(
    event: GameEvent,
    temperature: GameTemperature
  ): void {
    const myEvent = event as BulletHit;
    const animation = new ExplosionAnimation(
      myEvent.size,
      myEvent.coords,
      temperature,
      this.engine.world
    );
    this.animations.push(animation);
  }

  private drawAnimations(): void {
    this.drawExplosionAnimations();
    this.drawTextAnimations();
    remove(this.animations, { isExpired: true });
  }

  private drawTextAnimations() {
    const { p5 } = this;
    p5.textSize(30);
    p5.noStroke();
    for (const animation of this.animations) {
      if (animation instanceof TextAnimation) {
        const coords = animation.getNextCoords();
        if (coords) {
          const drawable = this.toDrawableObject(coords);
          this.drawGameObject(drawable, {}, () =>
            drawTextAnimation(p5, animation)
          );
        }
      }
    }
  }

  private drawExplosionAnimations() {
    const { p5 } = this;
    for (const animation of this.animations) {
      if (animation instanceof ExplosionAnimation) {
        animation.next();
        const percent = animation.percent;
        if (percent <= 1) {
          for (const shard of animation.shards) {
            const drawer = () =>
              drawExplostionShard(
                p5,
                shard,
                animation.size,
                animation.temperature
              );
            this.drawGameObject(shard, {}, drawer);
          }
        }
      }
    }
  }

  public createStars(world: Rect, amount: number): void {
    for (let i = 0; i < amount; i++) {
      this.stars.push({
        x: Math.random() * world.width,
        y: Math.random() * world.height,
        radius: Math.random() > 0.5 ? 2 : 1
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
    let { p5 } = this;
    p5.noStroke();
    p5.fill(`rgba(255,255,255,${(Date.now() / 10) % 255})`);
    for (const star of stars) {
      let coords = this.drawableCoords(star);
      coords && p5.circle(coords.x, coords.y, star.radius);
    }
  }

  private drawAsteroids(
    asteroids: Asteroid[],
    temperature: GameTemperature
  ): void {
    for (const asteroid of asteroids) {
      this.drawAsteroidTail(asteroid, temperature);
      // const side = asteroid.hitBoxRadius / 3.5;
      const options = {};
      const drawer = () =>
        drawAsteroidShape(
          this.p5,
          asteroid.hitBoxRadius,
          asteroid.size,
          temperature
        );
      this.drawGameObject(asteroid, options, drawer);
    }
  }

  private toDrawableObject(point: Point): DrawableObject {
    return {
      coords: point,
      hitBoxRadius: 2,
      orientation: 0,
      direction: 0
    };
  }

  private drawGameObject(
    object: DrawableObject,
    options: DrawGameObjectOptions,
    drawer: () => void
  ): void {
    const { p5 } = this;
    const coords = this.drawableCoords(object.coords);
    if (coords) {
      const side = object.hitBoxRadius * 2;
      const orientation = options.ignoreOrientation ? 0 : object.orientation;
      const offset = options.rotationOffset || 0;
      const direction = options.rotateDirection ? object.direction : 0;
      p5.push();
      p5.translate(coords.x, coords.y);
      p5.rotate(orientation + offset + direction);
      p5.scale(options.scale || 1);
      drawer();
      if (this.showHitBoxes) {
        p5.noFill();
        p5.stroke('red');
        p5.circle(0, 0, side);
      }
      p5.pop();
    }
  }

  private drawShip(ship: Ship): void {
    this.drawShipTail(ship.tail);
    const options = {
      rotateDirection: true,
      rotationOffset: Math.PI / 2
    };
    const drawer = () => {
      drawShipShape(this.p5, ship.hitBoxRadius / 2);
      drawShipLifeArcShape(this.p5, ship.life);
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
      const drawable = this.toDrawableObject(point);
      this.drawGameObject(drawable, {}, () =>
        drawAsteroidTailShape(this.p5, i, length)
      );
    }
  }

  private drawShipTail(tail: Point[]) {
    let { p5 } = this;
    const length = tail.length;
    p5.noStroke();
    for (let i = 0; i < length; i++) {
      const point = tail[i];
      const drawable = this.toDrawableObject(point);
      this.drawGameObject(drawable, {}, () => drawShipTailShape(p5, i, length));
    }
  }

  private drawBullets(bullets: Bullet[]): void {
    for (const bullet of bullets) {
      const tailLength = bullet.tailLength;
      this.drawGameObject(bullet, {}, () => drawBulletShape(this.p5));
      for (let i = 0; i < bullet.tail.length; i++) {
        const point = bullet.tail[i];
        const drawable = this.toDrawableObject(point);
        this.drawGameObject(drawable, {}, () =>
          drawBulletTailShape(this.p5, i, tailLength)
        );
      }
    }
  }
}

export default Drawer;
