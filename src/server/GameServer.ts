import GameEngine, { GameSnapshot } from '../core/GameEngine';
import { Command } from '../client/KeyController';

type ClientEvent = 'start' | 'command';

class GameServer {
  private engine: GameEngine;
  private container: HTMLElement;
  constructor() {
    this.engine = new GameEngine({ width: 4000, height: 2000 });
    this.container = document.getElementById('root')!;
  }

  public start() {
    this.on('start', this.handleStartRequest);
    this.on('command', this.handleCommand);
  }

  private on(type: ClientEvent, handler: (event: CustomEvent) => any) {
    this.container.addEventListener(type, handler.bind(this) as EventListener);
  }

  private handleStartRequest(event: CustomEvent) {
    // create client id
    // add engine to engines array
    // send client id back to client
    // start sending updates to the client
    this.engine.startLevel(this.sendSnapshotToClient.bind(this));
    this.container.dispatchEvent(new Event('started'));
  }

  private sendSnapshotToClient(snapshot: GameSnapshot) {
    this.container.dispatchEvent(
      new CustomEvent('snapshot', { detail: snapshot })
    );
  }

  private handleCommand(event: CustomEvent) {
    let command = event.detail as Command;
    let { ship } = this.engine.state;
    switch (command) {
      case 'turnLeft':
        return ship.turnLeft();
      case 'turnRight':
        return ship.turnRight();
      case 'accelerate':
        return ship.accelerate();
      case 'decelerate':
        return ship.decelerate();
      case 'fire':
        return ship.fire();
      case 'useFix':
        return ship.useBonus('fix');
      case 'useFuel':
        return ship.useBonus('fuel');
      case 'useAmmo':
        return ship.useBonus('ammo');
    }
  }
}

export default GameServer;
