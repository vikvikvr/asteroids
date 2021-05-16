import P5 from 'p5';

function loadImage(p5: P5, path: string): Promise<P5.Image> {
  return new Promise((resolve, reject) => {
    p5.loadImage(
      path,
      (image: P5.Image) => resolve(image),
      (error) => reject(error)
    );
  });
}

// function loadMultipleImages(
//   p5: P5,
//   howMany: number,
//   pathCreator: (index: number) => string
// ): Promise<P5.Image[]> {
//   let promises = [];
//   for (let i = 0; i <= howMany; i++) {
//     let path = pathCreator(i);
//     promises.push(loadImage(p5, path));
//   }
//   return Promise.all(promises);
// }

// function loadExplosionAnimation(p5: P5): Promise<P5.Image[]> {
//   return loadMultipleImages(p5, 31, (index: number) => {
//     let twoDigitsPadded = index.toString().padStart(2, '0');
//     return `./assets/explosion/expl_06_00${twoDigitsPadded}.png`;
//   });
// }

// function loadShatterAnimation(p5: P5): Promise<P5.Image[]> {
//   return loadMultipleImages(p5, 17, (index: number) => {
//     return `./assets/shatter/Blue Ring Explosion${index + 1}.png`;
//   });
// }

// function loadImageAssets(p5: P5): Promise<Record<string, P5.Image>> {
//   let images: Record<string, P5.Image> = {};
//   let names: ImageAsset[] = [
//     'asteroid-large',
//     'asteroid-medium',
//     'asteroid-small',
//     'frozen-asteroid-large',
//     'frozen-asteroid-medium',
//     'frozen-asteroid-small',
//     'burning-asteroid-large',
//     'burning-asteroid-medium',
//     'burning-asteroid-small',
//     'asteroid-tail',
//     'frozen-asteroid-tail',
//     'burning-asteroid-tail',
//     'ship',
//     'fix',
//     'shield',
//     'freeze',
//     'bullet'
//   ];
//   return new Promise(async (resolve, reject) => {
//     try {
//       let results = await Promise.all(
//         names.map((name) => {
//           return loadImage(p5, `./assets/${name}.png`);
//         })
//       );
//       results.forEach((image, i) => {
//         images[names[i]] = image;
//       });
//       resolve(images);
//     } catch (error) {
//       reject('Failed to load image assets');
//     }
//   });
// }

// export async function loadAssets(p5: P5) {
//   return {
//     images: await loadImageAssets(p5),
//     explosionAnimation: await loadExplosionAnimation(p5),
//     shatterAnimation: await loadShatterAnimation(p5)
//   };
// }
