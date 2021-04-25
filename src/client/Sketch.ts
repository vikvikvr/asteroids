import P5 from 'p5';
import { GameSnapshot } from '../core/GameEngine';
import KeyController from './KeyController';
import Drawer from './Drawer';
import { loadAssets } from './assets-loaders';

export type ImageAsset =
  | 'asteroid'
  | 'ship'
  | 'fix'
  | 'shield'
  | 'freeze'
  | 'frozen-asteroid'
  | 'bullet';

export type AnimationType = 'explosion';

export interface DrawerAssets {
  // images: Record<ImageAsset, P5.Image>;
  images: any;
  explosionAnimation: P5.Image[];
  shatterAnimation: P5.Image[];
}

interface SnapshotEvent extends CustomEvent {
  detail: GameSnapshot;
}

const rootElementId = 'root';

const Sketch = (p5: P5) => {
  var keyController = new KeyController(rootElementId);
  var drawer: Drawer;
  let loaded = false;
  var assets: DrawerAssets = {
    images: {},
    explosionAnimation: [],
    shatterAnimation: []
  };
  var lastSnapshot: GameSnapshot;

  p5.preload = async () => {};

  p5.setup = async () => {
    assets = await loadAssets(p5);
    // listenForSnapshots
    let container = document.getElementById(rootElementId)!;
    container.addEventListener('snapshot', ((event: SnapshotEvent) => {
      lastSnapshot = event.detail;
    }) as EventListener);
    // askToStartGame
    setTimeout(() => {
      container.dispatchEvent(new Event('start'));
    }, 1000);
    p5.frameRate(60);
    drawer = new Drawer({
      p5,
      assets,
      rootElementId,
      showHitBoxes: false
    });
    let $loading = document.getElementById('loading')!;
    document.body.removeChild($loading);
    loaded = true;
  };

  p5.keyPressed = () => {
    keyController.pressed(p5.keyCode);
  };

  p5.windowResized = () => {
    console.log('resized');
    loaded && drawer.resizeScreen(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    if (loaded) {
      drawer.updateSnapshot(lastSnapshot);
      drawer.drawScreen();
    }
  };
};

export default Sketch;
