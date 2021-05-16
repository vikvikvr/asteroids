import P5 from 'p5';
import GameEngine from '../core/GameEngine';
import KeyController from './KeyController';
import Drawer from './Drawer';

export type AnimationType = 'explosion';

const rootElementId = 'root';

const Sketch = (p5: P5) => {
  var keyController: KeyController;
  var drawer: Drawer;
  let loaded = false;
  let engine: GameEngine;

  p5.preload = async () => {};

  p5.setup = async () => {
    p5.pixelDensity(2);
    p5.textFont('Verdana');
    p5.textStyle(p5.BOLD);
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
        rootElementId,
        showHitBoxes: false
      });
      engine.startLevel();
      keyController = new KeyController(engine.state);

      drawer.createStars(engine.world, 200);
    }, 500);
  };

  // p5.keyPressed = () => {};

  p5.windowResized = () => {
    console.log('resized');
    loaded && drawer.resizeScreen(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    if (loaded) {
      keyController.pressed(p5);
      drawer.drawScreen(engine);
    }
  };
};

export default Sketch;
