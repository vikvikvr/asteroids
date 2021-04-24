export type Frame = {
  x: number;
  y: number;
  w: number;
  h: number;
};

// http://www.texturepacker.com
export type Sprite = {
  frame: Frame;
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: Frame;
  sourceSize: { w: number; h: number };
};

export type SpriteSheet = { [K: string]: Sprite };

export type FrameObject = {
  name: string;
  frame: Frame;
};
