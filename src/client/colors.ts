export type ColorCode = 'fuel' | 'inactive' | 'life' | 'ammo' | 'hud' | 'space';
export type ColorsMap = Record<ColorCode, string>;

const colors: ColorsMap = {
  fuel: '#0CA789',
  inactive: '#808080',
  life: '#F24726',
  ammo: '#E6E6E6',
  hud: '#2D9BF0',
  space: 'black'
};

export default colors;
