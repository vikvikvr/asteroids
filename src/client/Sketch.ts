import P5 from 'p5';
import { GameSnapshot } from '../core/GameEngine';
import KeyController from './KeyController';
import Drawer from './Drawer';
import { FrameObject, SpriteSheet } from './animations';
// import {} from '@code-dot-org/p5.play';
// import {}
export type ImageAsset =
  | 'asteroid'
  | 'ship'
  | 'fix'
  | 'ammo'
  | 'fuel'
  | 'bullet';

export type AnimationType = 'explosion';

export interface DrawerAssets {
  // images: Record<ImageAsset, P5.Image>;
  images: any;
  explosionAnimation: P5.Image[];
  // frames: Record<AnimationType, FrameObject[]>;
  // sprites
}

interface SnapshotEvent extends CustomEvent {
  detail: GameSnapshot;
}

const rootElementId = 'root';

const Sketch = (p5: P5) => {
  var keyController = new KeyController(rootElementId);
  var drawer: Drawer;
  var assets: DrawerAssets = { images: {}, explosionAnimation: [] };
  var lastSnapshot: GameSnapshot;

  p5.preload = async () => {
    assets.images = await loadImageAssets(p5);
    assets.explosionAnimation = await loadExplosionAnimation(p5);
  };

  p5.setup = () => {
    let container = document.getElementById(rootElementId)!;
    container.addEventListener('snapshot', ((event: SnapshotEvent) => {
      lastSnapshot = event.detail;
    }) as EventListener);
    // todo: add listener for game events (animations)
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
  };

  p5.keyPressed = () => {
    keyController.pressed(p5.keyCode);
  };

  p5.windowResized = () => {
    console.log('resized');
    drawer.resizeScreen(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    try {
      drawer.updateSnapshot(lastSnapshot);
    } catch (error) {
      console.error('Failed to update snapshot', error);
    }
    try {
      drawer.draw();
    } catch (error) {
      console.error('Failed to draw', error);
    }
  };
};

function loadJSON(p5: P5, path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    p5.loadJSON(
      path,
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

function loadImage(p5: P5, path: string): Promise<P5.Image> {
  return new Promise((resolve, reject) => {
    p5.loadImage(
      path,
      (image: P5.Image) => {
        resolve(image);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

async function loadExplosionAnimation(p5: P5) {
  let animation = [];
  try {
    for (let i = 0; i <= 31; i++) {
      let twoDigitsPadded = i.toString().padStart(2, '0');
      let path = `./assets/explosion/expl_06_00${twoDigitsPadded}.png`;
      let img = await loadImage(p5, path);
      animation.push(img);
    }
  } catch (error) {
    throw new Error('Failed to load explosion animation');
  }
  return animation;
}

function loadImageAssets(p5: P5): Promise<Record<string, P5.Image>> {
  let images: Record<string, P5.Image> = {};
  let names: ImageAsset[] = [
    'asteroid',
    'ship',
    'fix',
    'ammo',
    'fuel',
    'bullet'
  ];
  return new Promise((resolve, reject) => {
    try {
      names.forEach(async (name) => {
        let image = await loadImage(p5, `./assets/${name}.png`);
        images[name] = image;
      });
      resolve(images);
    } catch (error) {
      reject('Failed to load image assets');
    }
  });
}

export default Sketch;
