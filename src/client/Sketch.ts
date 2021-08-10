import P5 from 'p5';
import GameEngine from 'core/GameEngine';
import KeyController from './KeyController';
import Drawer from './Drawer';

export type AnimationType = 'explosion';

let keyController: KeyController;
let drawer: Drawer;
let loaded = false;
let engine: GameEngine;

function Sketch(p5: P5) {
  p5.setup = function () {
    setupGraphics(p5);
    setTimeout(() => start(p5), 500);
  };

  p5.windowResized = function () {
    drawer?.resizeScreen();
  };

  p5.draw = function () {
    if (loaded) {
      keyController.processPressedKeys(p5);
      drawer.drawScreen();
    }
  };
}

function setupGraphics(p5: P5): void {
  p5.disableFriendlyErrors = true;
  p5.frameRate(60);
  p5.pixelDensity(2);
  p5.rectMode(p5.CORNER);
}

function start(p5: P5): void {
  engine = new GameEngine({ width: 4000, height: 2000 });
  hideLoadingScreen();
  drawer = new Drawer(p5, engine);
  keyController = new KeyController(engine.state.ship);
  engine.startLevel();
}

function hideLoadingScreen(): void {
  const $loading = document.getElementById('loading')!;
  document.body.removeChild($loading);
  loaded = true;
}

export default Sketch;
