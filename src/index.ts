import './style.css';
import GameServer from './server/GameServer';
import Sketch from './client/Sketch';
import P5 from 'p5';

let server = new GameServer();
server.start();

new P5(Sketch);
