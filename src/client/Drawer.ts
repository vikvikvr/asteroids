import { GameSnapshot } from '../core/GameEngine';
import P5 from 'p5';
import { drawableCoords, Point, Rect } from '../lib/geometry';
import { DrawerAssets } from './Sketch';
import { GameObjectSnapshot } from '../core/GameObject';
import { DropSnapshot } from '../core/Drop';
import { AsteroidSnapshot } from '../core/Asteroid';
import GUI from './GUI';
import COLORS from './colors';
import Animation, { ImageAnimation, OverlayAnimation } from './Animation';
import { ShipSnapshot } from '../core/Ship';
import { GotBonusSnapshot, ShipHitSnapshot } from '../core/Events';

interface DrawGameObjectOptions {
  image: P5.Image;
  rotateDirection?: boolean;
  rotationOffset?: number;
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
    if (this.snapshot) {
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
  }

  public resizeScreen(width: number, height: number): void {
    this.p5.resizeCanvas(width, height);
    this.screen = { width, height };
  }

  private drawGameScreen(snapshot: GameSnapshot): void {
    this.drawEnvironment();
    this.drawGameObjects(snapshot);
    this.createNewAnimations(snapshot);
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

  private createNewAnimations(snapshot: GameSnapshot): void {
    // save new animations
    snapshot.events.forEach((event) => {
      // explosion animation
      if (event.type !== 'GOT_BONUS') {
        let frames = this.assets[
          snapshot.frozen ? 'shatterAnimation' : 'explosionAnimation'
        ];
        // TODO: adapt explosion size to event
        this.animations.push(new ImageAnimation(frames, event.coords, 1));
        // overlay animation
        if (event.type === 'SHIP_HIT') {
          let myEvent = event as ShipHitSnapshot;
          if (!myEvent.shielded) {
            this.animations.push(new OverlayAnimation(30, 'red'));
          }
        }
      } else {
        // got bonus
        let myEvent = event as GotBonusSnapshot;
        let color: string;
        if (myEvent.bonusType === 'shield') color = 'green';
        else if (myEvent.bonusType === 'freeze') color = 'blue';
        else color = 'white';
        this.animations.push(new OverlayAnimation(30, color));
      }
    });
  }

  private drawAnimations(): void {
    let { p5 } = this;
    this.animations.forEach((animation) => {
      // explosion
      if (animation instanceof ImageAnimation) {
        let drawable = animation.getNextFrame();
        if (drawable) {
          // console.log(drawable);
          this.drawGameObject(drawable, { image: drawable.image });
        }
      } else if (animation instanceof OverlayAnimation) {
        // overlay
        let frame = animation.next();
        if (frame) {
          let alpha =
            ((animation.frameCount - frame) / animation.frameCount) * 128;
          let color = animation.color;
          if (color === 'red') p5.fill(128, 0, 0, alpha);
          else if (color === 'green') p5.fill(0, 128, 0, alpha);
          else if (color === 'blue') p5.fill(0, 200, 255, alpha);
          else p5.fill(128, 128, 128, alpha);
          p5.rectMode(p5.CORNER);
          p5.noStroke();
          p5.rect(0, 0, this.screen.width, this.screen.height);
        }
      }
    });
    // remove expired animations
    this.animations = this.animations.filter((animation) => {
      return !animation.isExpired;
    });
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
    stars.forEach((star) => {
      let coords = this.drawableCoords(star);
      coords && p5.circle(coords.x, coords.y, star.radius);
    });
  }

  private drawBonuses(bonuses: DropSnapshot[]): void {
    bonuses.forEach((bonus) => {
      this.drawGameObject(bonus, { image: this.assets.images[bonus.dropType] });
    });
  }

  private drawAsteroids(asteroids: AsteroidSnapshot[], frozen: boolean): void {
    asteroids.forEach((asteroid) => {
      this.drawGameObject(asteroid, {
        image: this.assets.images[`${frozen ? 'frozen-' : ''}asteroid`]
      });
    });
  }

  private drawGameObject(
    object: DrawableObject,
    options: DrawGameObjectOptions
  ): boolean {
    let { p5 } = this;
    let coords = this.drawableCoords(object.coords);
    if (!coords) return false;
    let side = object.hitBoxRadius * 2;
    p5.imageMode(p5.CENTER);
    p5.push();
    p5.translate(coords.x, coords.y);
    p5.rotate(object.orientation);
    p5.rotate(options.rotateDirection ? object.direction : 0);
    p5.rotate(options.rotationOffset || 0);
    p5.image(options.image, 0, 0, side, side);
    if (this.showHitBoxes) {
      p5.noFill();
      p5.stroke('red');
      p5.circle(0, 0, side);
    }
    p5.pop();
    return true;
  }

  private drawShip(ship: ShipSnapshot): void {
    let { p5 } = this;
    // tail
    ship.tail.forEach((point, i) => {
      let size = (1 - (ship.tail.length - i) / ship.tail.length + 1) * 10;
      let alpha = (1 - (ship.tail.length - i) / ship.tail.length) * 255;
      p5.noStroke();
      p5.fill(50, 50, 50, alpha);
      let coords = this.drawableCoords(point);
      coords && p5.circle(coords.x, coords.y, size);
    });
    // shield
    if (ship.shielded) {
      p5.stroke(0, 255, 0, 128);
      p5.fill(0, 55, 0, 128);
      p5.circle(p5.windowWidth / 2, p5.windowHeight / 2, 80);
    }
    // ship
    this.drawGameObject(ship, {
      image: this.assets.images.ship,
      rotateDirection: true,
      rotationOffset: Math.PI / 2
    });
  }

  private drawBullets(bullets: GameObjectSnapshot[]): void {
    bullets.forEach((bullet) => {
      this.drawGameObject(bullet, {
        image: this.assets.images.bullet
      });
    });
  }
}

export default Drawer;
