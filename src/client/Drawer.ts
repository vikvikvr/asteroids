import { GameSnapshot } from '../core/GameEngine';
import P5 from 'p5';
import { drawableCoords, Point, Rect } from '../lib/geometry';
import { DrawerAssets } from './Sketch';
import { GameObjectSnapshot } from '../core/GameObject';
import { DropSnapshot } from '../core/Drop';
import { AsteroidSnapshot } from '../core/Asteroid';
import GUI from './GUI';
import COLORS from './colors';
import Animation, {
  ImageAnimation,
  OverlayAnimation,
  OverlayAnimationColor,
  TextAnimation
} from './Animation';
import { ShipSnapshot } from '../core/Ship';
import {
  BulletHitSnapshot,
  GameEventSnapshot,
  GotBonusSnapshot,
  ShipHitSnapshot
} from '../core/Events';
import { remove } from 'lodash';
import { bulletHitScore } from '../core/game-rules';

interface DrawGameObjectOptions {
  image: P5.Image;
  rotateDirection?: boolean;
  rotationOffset?: number;
  scale?: number;
}

interface DrawerOptions {
  p5: P5;
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
  private gui: GUI;
  private snapshot?: GameSnapshot;
  private animations: Animation[] = [];
  // constructor
  constructor(options: DrawerOptions) {
    this.p5 = options.p5;
    const canvas = this.p5.createCanvas(
      this.p5.windowWidth,
      this.p5.windowHeight
    );
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

  public updateSnapshot(snapshot: GameSnapshot) {
    if (!snapshot) return;
    if (!this.snapshot) {
      this.createStars(snapshot.world, 200);
    }
    this.snapshot = snapshot;
  }

  public drawScreen(): void {
    if (!this.snapshot) return;
    switch (this.snapshot.status) {
      case 'playing':
        this.drawGameScreen(this.snapshot);
        break;
      case 'lost':
        this.drawGameOverScreen(this.snapshot.score);
        break;
      case 'won':
        this.drawGameWonScreen(this.snapshot.score);
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

  private drawGameScreen(snapshot: GameSnapshot): void {
    this.drawEnvironment();
    this.drawGameObjects(snapshot);
    this.addNewAnimations(snapshot);
    this.drawAnimations();
    this.gui.draw(snapshot);
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
    p5.background(COLORS.space);
    this.drawStars(stars);
  }

  private drawGameObjects(snapshot: GameSnapshot): void {
    let { ship, bonuses, asteroids } = snapshot;
    this.drawBullets(ship.bullets);
    this.drawShip(ship);
    this.drawBonuses(bonuses);
    this.drawAsteroids(asteroids, snapshot.frozen);
  }

  private addNewAnimations(snapshot: GameSnapshot): void {
    for (const event of snapshot.events) {
      if (event.type === 'GOT_BONUS') {
        this.addGotBonusAnimation(event);
      } else {
        this.addExplosionAnimation(event, snapshot.frozen);
        if (event.type === 'SHIP_HIT') {
          this.addShipHitAnimation(event);
        } else {
          this.addScoreAnimation(event, snapshot.frozen);
        }
      }
    }
  }

  private addScoreAnimation(event: GameEventSnapshot, frozen: boolean) {
    event = event as BulletHitSnapshot;
    const score = bulletHitScore(event.size, frozen);
    const scoreAnimation = new TextAnimation(score.toString(), event.coords);
    this.animations.push(scoreAnimation);
    // console.log('add points', score);
  }

  private addExplosionAnimation(
    event: GameEventSnapshot,
    frozen: boolean
  ): void {
    const explosionScaleMap = {
      large: 1,
      medium: 0.75,
      small: 0.5
    };
    event = event as BulletHitSnapshot;
    const assetKey = frozen ? 'shatterAnimation' : 'explosionAnimation';
    const frames = this.assets[assetKey];
    const scale = explosionScaleMap[event.size];
    const animation = new ImageAnimation(frames, event.coords, scale);
    this.animations.push(animation);
  }

  private addShipHitAnimation(event: GameEventSnapshot): void {
    event = event as ShipHitSnapshot;
    if (!event.shielded) {
      this.animations.push(new OverlayAnimation(30, 'red'));
    }
  }

  private addGotBonusAnimation(event: GameEventSnapshot): void {
    event = event as GotBonusSnapshot;
    let color = 'white';
    if (event.bonusType === 'shield') color = 'green';
    else if (event.bonusType === 'freeze') color = 'blue';
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
    for (const animation of this.animations) {
      if (animation instanceof TextAnimation) {
        const coords = animation.getNextCoords();
        if (coords) {
          let drawCoords = this.drawableCoords(coords);
          if (drawCoords) {
            const { currentFrame, frameCount, text } = animation;
            const alpha = (1 - currentFrame / frameCount) * 255;
            p5.fill(255, 255, 255, alpha);
            p5.stroke(255, 255, 255, alpha);
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

  private createStars(world: Rect, amount: number): void {
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
      this.snapshot?.ship.coords || { x: 0, y: 0 },
      this.screen,
      this.snapshot?.world || { width: 1000, height: 1000 }
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

  private drawBonuses(bonuses: DropSnapshot[]): void {
    for (const bonus of bonuses) {
      this.drawGameObject(bonus, { image: this.assets.images[bonus.dropType] });
    }
  }

  private drawAsteroids(asteroids: AsteroidSnapshot[], frozen: boolean): void {
    for (const asteroid of asteroids) {
      this.drawTail(asteroid.tail, 'asteroid', frozen);
      const assetPrefix = frozen ? 'frozen-' : '';
      const assetSuffix = '-' + asteroid.size;
      const assetName = `${assetPrefix}asteroid${assetSuffix}`;
      const options = { image: this.assets.images[assetName] };
      this.drawGameObject(asteroid, options);
    }
  }

  private drawGameObject(
    object: DrawableObject,
    options: DrawGameObjectOptions
  ): void {
    const { p5 } = this;
    const coords = this.drawableCoords(object.coords);
    if (coords) {
      const side = object.hitBoxRadius * 2;
      const rotation = object.orientation + (options.rotationOffset || 0);
      p5.push();
      p5.translate(coords.x, coords.y);
      p5.rotate(rotation + (options.rotateDirection ? object.direction : 0));
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

  private drawShip(ship: ShipSnapshot): void {
    this.drawTail(ship.tail, 'ship');
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

  private drawTail(tail: Point[], type: 'ship' | 'asteroid', frozen = false) {
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
          if (frozen) {
            p5.fill(75, 174, 219, alpha);
          } else {
            p5.fill(240, 125, 10, alpha);
          }
        }
        p5.circle(coords.x, coords.y, size);
      }
    }
  }

  private drawBullets(bullets: GameObjectSnapshot[]): void {
    for (const bullet of bullets) {
      this.drawGameObject(bullet, {
        image: this.assets.images.bullet
      });
    }
  }
}

export default Drawer;
