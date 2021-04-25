import { GameSnapshot } from '../core/GameEngine';
import P5 from 'p5';
import { drawableCoords, Point, Rect } from '../lib/geometry';
import { DrawerAssets } from './Sketch';
import { GameObjectSnapshot } from '../core/GameObject';
import { DropSnapshot } from '../core/Drop';
import { AsteroidSnapshot } from '../core/Asteroid';
import GUI from './GUI';
import COLORS from './colors';
import Animation from './Animation';

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
    console.log('drawer assets', this.assets);
  }

  public updateSnapshot(snapshot: GameSnapshot) {
    if (!snapshot) return;
    if (!this.snapshot) {
      this.createStars(snapshot.world, 200);
    }
    this.snapshot = snapshot;
  }

  public draw(): void {
    if (this.snapshot) {
      switch (this.snapshot.status) {
        case 'playing':
          this.gameScreen(this.snapshot);
          break;
        case 'lost':
          this.gameOverScreen();
          break;
        case 'won':
          this.gameWonScreen();
          break;
        case 'idle':
          console.log('idle');
          break;
      }
    }
  }

  public resizeScreen(width: number, heigth: number): void {
    this.p5.resizeCanvas(width, heigth);
  }

  private gameScreen(snapshot: GameSnapshot): void {
    this.drawEnvironment();
    this.drawGameObjects(snapshot);
    this.drawAnimations(snapshot);
    this.gui.draw(snapshot);
  }

  private gameOverScreen(): void {
    let { p5 } = this;
    p5.background(COLORS.space);
    p5.fill('yellow');
    p5.textAlign(p5.CENTER);
    p5.text('GAME OVER', p5.windowWidth / 2, p5.windowHeight / 2);
    p5.text(
      'press F5 to try again',
      p5.windowWidth / 2,
      p5.windowHeight / 2 + 30
    );
    p5.textAlign(p5.LEFT);
  }

  private gameWonScreen(): void {
    let { p5 } = this;
    p5.background(COLORS.space);
    p5.fill('yellow');
    p5.textAlign(p5.CENTER);
    p5.text('GAME WON!', p5.windowWidth / 2, p5.windowHeight / 2);
    p5.text(
      'press F5 to try again',
      p5.windowWidth / 2,
      p5.windowHeight / 2 + 30
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
    this.drawAsteroids(asteroids);
  }

  private drawAnimations(snapshot: GameSnapshot): void {
    // save new animations
    snapshot.events.forEach((event) => {
      if (event.type === 'BULLET_HIT' || event.type === 'SHIP_HIT') {
        this.animations.push(
          new Animation(this.assets.explosionAnimation, event.coords)
        );
      }
    });
    // draw existing animations
    this.animations.forEach((animation) => {
      let drawable = animation.next();
      if (drawable) {
        this.drawGameObject(drawable, { image: drawable.image });
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

  private drawAsteroids(asteroids: AsteroidSnapshot[]): void {
    asteroids.forEach((a) => {
      this.drawGameObject(a, { image: this.assets.images.asteroid });
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
    p5.rotate(options.rotationOffset ? options.rotationOffset : 0);
    p5.image(options.image, 0, 0, side, side);
    if (this.showHitBoxes) {
      p5.noFill();
      p5.stroke('red');
      p5.circle(0, 0, side);
    }
    p5.pop();
    return true;
  }

  private drawShip(ship: GameObjectSnapshot): void {
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
