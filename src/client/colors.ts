import { Temperature } from '../core/GameEngine';
import palette from './palette';

type RGB = [number, number, number];

export function alphaFromTime(divisor = 10) {
  const time = Date.now() / divisor;
  return (Math.sin(time) + 1) / 2;
}

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
    [Temperature.High]: palette.deepPurple[900],
    [Temperature.Normal]: palette.indigo[900],
    [Temperature.Low]: palette.blue[900]
  },
  hud: palette.grey[50],
  asteroid: {
    [Temperature.High]: [
      palette.orange[500],
      palette.orange[700],
      palette.orange[800],
      palette.orange[900]
    ],
    [Temperature.Normal]: [
      palette.teal[500],
      palette.teal[600],
      palette.teal[700],
      palette.teal[800]
    ],
    [Temperature.Low]: [
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

export default colors;
