import GameEngine, { GameTemperature } from '../core/GameEngine';
import P5 from 'p5';
import { drawableCoords, Point, Rect } from '../lib/geometry';
import { DrawerAssets } from './Sketch';
import GUI from './GUI';
import COLORS from './colors';
import Animation, {
  ImageAnimation,
  OverlayAnimation,
  OverlayAnimationColor,
  TextAnimation
} from './Animation';
import Ship from '../core/Ship';
import { remove } from 'lodash';
import { bulletHitScore } from '../core/game-rules';
import { BulletHit, GameEvent, GotBonus, ShipHit } from '../core/Events';
import Drop from '../core/Drop';
import Asteroid from '../core/Asteroid';
import Bullet from '../core/Bullet';

interface DrawGameObjectOptions {
  image: P5.Image;
  rotateDirection?: boolean;
  ignoreOrientation?: boolean;
  rotationOffset?: number;
  scale?: number;
}

interface DrawerOptions {
  p5: P5;
  engine: GameEngine;
  assets: DrawerAssets;
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
  private assets: DrawerAssets;
  private showHitBoxes: boolean;
  private screen: Rect;
  private engine: GameEngine;
  private gui: GUI;
  private animations: Animation[] = [];
  // constructor
  constructor(options: DrawerOptions) {
    this.p5 = options.p5;
    const canvas = this.p5.createCanvas(
      this.p5.windowWidth,
      this.p5.windowHeight
    );
    this.engine = options.engine;
    canvas.parent(options.rootElementId);
    this.assets = options.assets;
    this.showHitBoxes = options.showHitBoxes || false;
    this.screen = {
      width: this.p5.windowWidth,
      height: this.p5.windowHeight
    };
    this.gui = new GUI(this.p5, COLORS);
    this.p5.textSize(20);
    // console.log('drawer assets', this.assets);
  }

  public drawScreen(engine: GameEngine): void {
    switch (engine.status) {
      case 'playing':
        this.drawGameScreen(engine);
        break;
      case 'lost':
        this.drawGameOverScreen(engine.state.score);
        break;
      case 'won':
        this.drawGameWonScreen(engine.state.score);
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
    this.drawEnvironment();
    this.drawGameObjects(engine);
    this.addNewAnimations(engine);
    this.drawAnimations();
    this.gui.draw(engine);
  }

  private drawGameOverScreen(score: number): void {
    let { p5 } = this;
    p5.background(COLORS.space);
    p5.fill('yellow');
    p5.textAlign(p5.CENTER);
    p5.text('GAME OVER', p5.windowWidth / 2, p5.windowHeight / 2);
    p5.text(score, p5.windowWidth / 2, p5.windowHeight / 2 + 30);
    p5.text(
      'press F5 to try again',
      p5.windowWidth / 2,
      p5.windowHeight / 2 + 60
    );
    p5.textAlign(p5.LEFT);
  }

  private drawGameWonScreen(score: number): void {
    let { p5 } = this;
    p5.background(COLORS.space);
    p5.fill('yellow');
    p5.textAlign(p5.CENTER);
    p5.text('GAME WON!', p5.windowWidth / 2, p5.windowHeight / 2);
    p5.text(score, p5.windowWidth / 2, p5.windowHeight / 2 + 30);
    p5.text(
      'press F5 to try again',
      p5.windowWidth / 2,
      p5.windowHeight / 2 + 60
    );
    p5.textAlign(p5.LEFT);
  }

  private drawEnvironment(): void {
    let { p5, stars } = this;
    // p5.background(COLORS.space);
    const c1 = p5.color('#030039');
    const c2 = p5.color('#075eac');
    this.setGradient(c1, c2);
    this.drawStars(stars);
  }

  private drawGameObjects(engine: GameEngine): void {
    let { ship, bonuses, asteroids } = engine.state;
    this.drawBullets(ship.bullets);
    this.drawShip(ship);
    this.drawBonuses(bonuses);
    this.drawAsteroids(asteroids, engine.state.temperature);
  }

  private addNewAnimations(engine: GameEngine): void {
    for (const event of engine.state.events) {
      if (event.type === 'GOT_BONUS') {
        this.addGotBonusAnimation(event);
      } else {
        this.addExplosionAnimation(event, engine.state.temperature);
        if (event.type === 'SHIP_HIT') {
          this.addShipHitAnimation(event);
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
    const scoreAnimation = new TextAnimation(score.toString(), myEvent.coords);
    this.animations.push(scoreAnimation);
    // console.log('add points', score);
  }

  private addExplosionAnimation(
    event: GameEvent,
    temperature: GameTemperature
  ): void {
    const explosionScaleMap = {
      large: 1,
      medium: 0.75,
      small: 0.5
    };
    const myEvent = event as BulletHit;
    const assetKey =
      temperature === 'low' ? 'shatterAnimation' : 'explosionAnimation';
    const frames = this.assets[assetKey];
    const scale = explosionScaleMap[myEvent.size];
    const animation = new ImageAnimation(frames, myEvent.coords, scale);
    this.animations.push(animation);
  }

  private addShipHitAnimation(event: GameEvent): void {
    const myEvent = event as ShipHit;
    if (!myEvent.shielded) {
      this.animations.push(new OverlayAnimation(30, 'red'));
    }
  }

  private addGotBonusAnimation(event: GameEvent): void {
    const myEvent = event as GotBonus;
    let color = 'white';
    if (myEvent.bonusType === 'shield') color = 'green';
    else if (myEvent.bonusType === 'freeze') color = 'blue';
    const animation = new OverlayAnimation(30, color as OverlayAnimationColor);
    this.animations.push(animation);
  }

  private drawAnimations(): void {
    this.drawExplosionAnimations();
    this.drawTextAnimations();
    this.drawOverlayAnimations();
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
          let drawCoords = this.drawableCoords(coords);
          if (drawCoords) {
            const { currentFrame, frameCount, text } = animation;
            const alpha = (1 - currentFrame / frameCount) * 255;
            p5.fill(255, 255, 255, alpha);
            // p5.stroke(255, 255, 255, alpha);
            p5.text(text, drawCoords.x, drawCoords.y);
          }
        }
      }
    }
  }

  private drawOverlayAnimations() {
    let { p5 } = this;
    for (const animation of this.animations) {
      if (animation instanceof OverlayAnimation) {
        let nextFrame = animation.next();
        if (nextFrame) {
          let alpha =
            (animation.frameCount - nextFrame) / animation.frameCount / 2;
          const colorMap = {
            red: `rgba(128, 0, 0, ${alpha})`,
            green: `rgba(0, 128, 0, ${alpha})`,
            blue: `rgba(0, 200, 255, ${alpha})`,
            white: `rgba(128, 128, 128, ${alpha})`
          };
          p5.fill(colorMap[animation.color]);
          p5.noStroke();
          p5.rect(0, 0, this.screen.width, this.screen.height);
        }
      }
    }
  }

  private drawExplosionAnimations() {
    for (const animation of this.animations) {
      if (animation instanceof ImageAnimation) {
        let drawable = animation.getNextFrame();
        if (drawable) {
          this.drawGameObject(drawable, {
            image: drawable.image,
            rotationOffset: animation.rotation,
            scale: drawable.scale
          });
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
    p5.fill('white');
    for (const star of stars) {
      let coords = this.drawableCoords(star);
      coords && p5.circle(coords.x, coords.y, star.radius);
    }
  }

  private drawBonuses(bonuses: Drop[]): void {
    for (const bonus of bonuses) {
      this.drawGameObject(bonus, { image: this.assets.images[bonus.dropType] });
    }
  }

  private setGradient(c1: P5.Color, c2: P5.Color): void {
    const { p5 } = this;
    p5.noFill();
    for (var y = 0; y < p5.height; y++) {
      var inter = p5.map(y, 0, p5.height, 0, 1);
      var c = p5.lerpColor(c1, c2, inter);
      p5.stroke(c);
      p5.line(0, y, p5.width, y);
    }
  }

  private drawAsteroids(
    asteroids: Asteroid[],
    temperature: GameTemperature
  ): void {
    for (const asteroid of asteroids) {
      this.drawAsteroidTail(asteroid, temperature);
      let assetPrefix = '';
      if (temperature === 'low') assetPrefix = 'frozen-';
      const assetSuffix = '-' + asteroid.size;
      const assetName = `${assetPrefix}asteroid${assetSuffix}`;
      const options = { image: this.assets.images[assetName] };
      this.drawGameObject(asteroid, options);
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
    options: DrawGameObjectOptions
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
      p5.image(options.image, 0, 0, side, side);
      if (this.showHitBoxes) {
        p5.noFill();
        p5.stroke('red');
        p5.circle(0, 0, side);
      }
      p5.pop();
    }
  }

  private drawShip(ship: Ship): void {
    // this.drawTail(ship.tail, 'ship');
    this.drawShipShield(ship.shielded);
    this.drawGameObject(ship, {
      image: this.assets.images.ship,
      rotateDirection: true,
      rotationOffset: Math.PI / 2
    });
  }

  private drawShipShield(isShielded: boolean) {
    if (isShielded) {
      const { p5 } = this;
      p5.stroke(0, 255, 0, 128);
      p5.fill(0, 55, 0, 128);
      p5.circle(p5.windowWidth / 2, p5.windowHeight / 2, 80);
    }
  }

  private drawAsteroidTail(
    asteroid: Asteroid,
    temperature: GameTemperature
  ): void {
    this.drawGameObject(asteroid, {
      image: this.assets.images['asteroid-tail'],
      ignoreOrientation: true,
      rotateDirection: true,
      rotationOffset: Math.PI,
      scale: 3
    });
  }

  private drawTail(tail: Point[], type: 'ship' | 'asteroid') {
    let { p5 } = this;
    for (let i = 0; i < tail.length; i++) {
      const point = tail[i];
      let coords = this.drawableCoords(point);
      if (coords) {
        let size = (1 - (tail.length - i) / tail.length + 1) * 10;
        let alpha = (1 - (tail.length - i) / tail.length) * 125;
        p5.noStroke();
        if (type === 'ship') {
          p5.fill(50, 50, 50, alpha);
        } else {
          size *= 1.5;
          p5.fill(240, 125, 10, alpha);
        }
        p5.circle(coords.x, coords.y, size);
      }
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
