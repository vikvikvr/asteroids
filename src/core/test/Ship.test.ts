import { DropType, droppable } from '../Drop';
import Ship from '../Ship';

describe('ship', () => {
  describe('constructor', () => {
    it('creates an instance with the right initial values', () => {
      let ship = new Ship();
      expect(ship.ammo).toBe(100);
      expect(ship.life).toBe(1);
      expect(ship.fuel).toBe(1);
      expect(ship.bullets).toHaveLength(0);
      expect(ship.cargo).toEqual({
        ammo: 0,
        fix: 0,
        fuel: 0
      });
    });
  });
  describe('accelerate', () => {
    it('assigns positive sprints when there are none', () => {
      let ship = new Ship();
      ship.accelerate();
      expect(ship['sprints']).toBe(ship['ACC_SPRINTS']);
      ship['sprints'] = -5;
      ship.accelerate();
      expect(ship['sprints']).toBe(ship['ACC_SPRINTS']);
    });
    it('adds positive sprints to existing positive sprints', () => {
      let ship = new Ship();
      ship.accelerate(3);
      expect(ship['sprints']).toBe(ship['ACC_SPRINTS'] * 3);
    });
    it('does not add sprints when out of fuel', () => {
      let ship = new Ship();
      ship.fuel = 0;
      ship.accelerate();
      expect(ship['sprints']).toBe(0);
    });
  });
  describe('decelerate', () => {
    it('assigns negative sprints when there are none', () => {
      let ship = new Ship();
      ship.decelerate();
      expect(ship['sprints']).toBe(-ship['DEC_SPRINTS']);
      ship['sprints'] = 5;
      ship.decelerate();
      expect(ship['sprints']).toBe(-ship['DEC_SPRINTS']);
    });
    it('adds negative sprints to existing negative sprints', () => {
      let ship = new Ship();
      ship.decelerate(3);
      expect(ship['sprints']).toBe(-ship['DEC_SPRINTS'] * 3);
    });
    it('does not add sprints when out of fuel', () => {
      let ship = new Ship();
      ship.fuel = 0;
      ship.decelerate();
      expect(ship['sprints']).toBe(0);
    });
  });
  it('turn left and right', () => {
    let ship = new Ship();
    var startingDirection = ship.direction;
    ship.turnLeft();
    ship.update(20);
    expect(ship.direction).toBeLessThan(startingDirection);
    ship.turnRight();
    ship.update(20);
    expect(ship.direction).toBe(ship['startingDirection']);
  });
  describe('fire', () => {
    it('does not allow firing when out of bullets', () => {
      let ship = new Ship();
      ship.ammo = 0;
      ship.fire();
      expect(ship.bullets.length).toBe(0);
    });
    it('creates a bullet with the right direction and speed', () => {
      let ship = new Ship();
      ship.fire();
      let bullet = ship.bullets[0];
      expect(bullet.direction).toBe(ship.direction);
      expect(bullet.speed).toBeGreaterThan(ship.speed);
    });
  });
  describe('update', () => {
    describe('acceleration cycle', () => {
      let ship = new Ship();
      let prevSpeed = ship.speed;
      it('uses positive sprints to accelerate forward', () => {
        ship.accelerate();
        for (let i = 0; i < ship['ACC_SPRINTS']; i++) {
          ship.update();
          expect(ship.speed).toBeGreaterThan(prevSpeed);
          prevSpeed = ship.speed;
        }
      });
      it('decelerates back to zero after using positive sprints', () => {
        for (let i = 0; i < ship['ACC_SPRINTS']; i++) {
          ship.update();
          expect(ship.speed).toBeLessThan(prevSpeed);
          prevSpeed = ship.speed;
        }
        ship.update();
        expect(ship.speed).toBe(0);
      });
      it('does not allow speeds higher than max speed', () => {
        for (let i = 1; i < 10; i++) {
          let ship = new Ship();
          ship.accelerate(i * 20);
          ship.update(ship['ACC_SPRINTS'] * i * 20);
          expect(ship.speed).toBeLessThan(ship.MAX_SPEED);
        }
      });
    });
    describe('deceleration cycle', () => {
      let ship = new Ship();
      let prevSpeed = ship.speed;
      it('uses negative sprints to accelerate backwards', () => {
        ship.decelerate();
        for (let i = 0; i < ship['DEC_SPRINTS']; i++) {
          ship.update();
          expect(ship.speed).toBeLessThan(prevSpeed);
          prevSpeed = ship.speed;
        }
      });
      it('decelerates back to zero after using negative sprints', () => {
        for (let i = 0; i < ship['DEC_SPRINTS']; i++) {
          ship.update();
          expect(ship.speed).toBeGreaterThan(prevSpeed);
          prevSpeed = ship.speed;
        }
        ship.update();
        expect(ship.speed).toBe(0);
      });
      it('does not allow speeds lower than -max speed', () => {
        for (let i = 1; i < 10; i++) {
          let ship = new Ship();
          ship.decelerate(20 * i);
          ship.update(ship['DEC_SPRINTS'] * 20 * i);
          expect(ship.speed).toBeGreaterThan(-ship.MAX_SPEED);
        }
      });
    });
    it('updates bullets', () => {
      let ship = new Ship();
      let mock = jest.fn();
      ship.fire();
      ship.bullets[0].update = mock;
      ship.update();
      expect(mock).toHaveBeenCalledTimes(1);
    });
    it('removes expired bullets', () => {
      let ship = new Ship();
      ship.fire();
      ship.bullets[0].isExpired = true;
      ship.update();
      expect(ship.bullets).toHaveLength(0);
    });
    it('consumes fuel only while moving', () => {
      let ship = new Ship();
      ship.update(5);
      expect(ship.fuel).toBe(1);
      ship.accelerate();
      ship.update(5);
      expect(ship.fuel).toBeLessThan(1);
    });
  });
  describe('use bonus', () => {
    const collectAndUse = (ship: Ship, bonus: DropType) => {
      ship.collectBonus(bonus);
      ship.useBonus(bonus);
    };
    it('does not allow using missing bonus', () => {
      let ship = new Ship();
      ship.fuel = 0.3;
      ship.useBonus('fuel');
      expect(ship.fuel).toBe(0.3);
    });
    it('uses ammo to restore ammo', () => {
      let ship = new Ship();
      ship.ammo = 30;
      collectAndUse(ship, 'ammo');
      expect(ship.ammo).toBe(100);
      expect(ship.cargo.ammo).toBe(0);
    });
    it('does not allow using ammo at full ammo', () => {
      let ship = new Ship();
      collectAndUse(ship, 'ammo');
      expect(ship.cargo.ammo).toBe(1);
    });
    it('uses fix to restore life', () => {
      let ship = new Ship();
      ship.life = 0.3;
      collectAndUse(ship, 'fix');
      expect(ship.life).toBe(1);
      expect(ship.cargo.fix).toBe(0);
    });
    it('does not allow using fix at full life', () => {
      let ship = new Ship();
      collectAndUse(ship, 'fix');
      expect(ship.cargo.fix).toBe(1);
    });
    it('uses fuel to restore fuel', () => {
      let ship = new Ship();
      ship.fuel = 0.3;
      collectAndUse(ship, 'fuel');
      expect(ship.fuel).toBe(1);
      expect(ship.cargo.fuel).toBe(0);
    });
    it('does not allow using fuel at full fuel', () => {
      let ship = new Ship();
      collectAndUse(ship, 'fuel');
      expect(ship.cargo.fuel).toBe(1);
    });
  });
  describe('collect bonus', () => {
    it(`stores bonuses in cargo`, () => {
      let ship = new Ship();
      droppable.forEach((drop) => {
        ship.collectBonus(drop);
        expect(ship.cargo[drop]).toBe(1);
      });
    });
  });
});
