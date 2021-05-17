export type ColorCode =
  | 'freeze'
  | 'inactive'
  | 'life'
  | 'shield'
  | 'hud'
  | 'space';
export type ColorsMap = Record<ColorCode, string>;

const colors: ColorsMap = {
  freeze: '#0CA789',
  inactive: '#808080',
  life: '#F24726',
  shield: '#E6E6E6',
  hud: '#2D9BF0',
  space: '#1a237e'
};

export default colors;
