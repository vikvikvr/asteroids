import P5 from 'p5';
import GameEngine from '../core/GameEngine';
import KeyController from './KeyController';
import Drawer from './Drawer';
import { loadAssets } from './assets-loaders';

export type ImageAsset =
  | 'asteroid-large'
  | 'asteroid-medium'
  | 'asteroid-small'
  | 'frozen-asteroid-large'
  | 'frozen-asteroid-medium'
  | 'frozen-asteroid-small'
  | 'asteroid-tail'
  | 'ship'
  | 'fix'
  | 'shield'
  | 'freeze'
  | 'bullet';

export type AnimationType = 'explosion';

export interface DrawerAssets {
  // images: Record<ImageAsset, P5.Image>;
  images: any;
  explosionAnimation: P5.Image[];
  shatterAnimation: P5.Image[];
}

const rootElementId = 'root';

const Sketch = (p5: P5) => {
  var keyController: KeyController;
  var drawer: Drawer;
  let loaded = false;
  let engine: GameEngine;
  var assets: DrawerAssets = {
    images: {},
    explosionAnimation: [],
    shatterAnimation: []
  };

  p5.preload = async () => {};

  p5.setup = async () => {
    assets = await loadAssets(p5);
    p5.pixelDensity(2);
    p5.imageMode(p5.CENTER);
    p5.rectMode(p5.CORNER);
    p5.frameRate(60);
    setTimeout(() => {
      let $loading = document.getElementById('loading')!;
      document.body.removeChild($loading);
      loaded = true;
      engine = new GameEngine({ width: 4000, height: 2000 });
      drawer = new Drawer({
        p5,
        engine,
        assets,
        rootElementId,
        showHitBoxes: false
      });
      engine.startLevel();
      keyController = new KeyController(engine.state.ship);

      drawer.createStars(engine.world, 200);
    }, 500);
  };

  // p5.keyPressed = () => {};

  p5.windowResized = () => {
    console.log('resized');
    loaded && drawer.resizeScreen(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    const canDraw = loaded && engine.status === 'playing';
    if (canDraw) {
      keyController.pressed(p5);
      drawer.drawScreen(engine);
    }
  };
};

export default Sketch;
