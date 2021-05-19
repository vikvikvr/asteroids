import palette from './palette';

export type ColorCode =
  | 'freeze'
  | 'inactive'
  | 'life'
  | 'shield'
  | 'hud'
  | 'space';
export type ColorsMap = Record<ColorCode, string>;

export function alphaFromTime(divisor = 10) {
  const time = Date.now() / divisor;
  return (Math.sin(time) + 1) / 2;
}

type RGB = [number, number, number];

function toRGB(hexColor = '#ffffff'): RGB {
  return [
    parseInt(hexColor.substr(1, 2), 16),
    parseInt(hexColor.substr(3, 2), 16),
    parseInt(hexColor.substr(5, 2), 16)
  ];
}

export function withAlpha(hexColor = '#ffffff', percent = 1): string {
  const rgb = toRGB(hexColor);
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${percent})`;
}

const colors = {
  background: {
    high: palette.deepPurple[900],
    normal: palette.indigo[900],
    low: palette.blue[900]
  },
  hud: palette.grey[50],
  asteroid: {
    high: [
      palette.orange[500],
      palette.orange[700],
      palette.orange[800],
      palette.orange[900]
    ],
    normal: [
      palette.teal[500],
      palette.teal[600],
      palette.teal[700],
      palette.teal[800]
    ],
    low: [
      palette.blue[500],
      palette.blue[600],
      palette.blue[700],
      palette.blue[800]
    ]
  },
  ship: {
    light: palette.yellow[400],
    dark: palette.yellow[600]
  }
};

// const colors: ColorsMap = {
//   freeze: '#0CA789',
//   inactive: '#808080',
//   life: '#F24726',
//   shield: '#E6E6E6',
//   hud: '#2D9BF0',
//   space: '#1a237e'
// };

export default colors;
