import { SlotMachine } from './slot-machine';
import { Blackjack } from './blackjack';
import { CoinFlip } from './coin-flip';
import { HigherOrLower } from './higher-or-lower';
import { MineSweeper } from './mine-sweeper';
import { ScratchCards } from './scratch-cards';
import { WheelOfFortune } from './wheel-of-fortune';
import { MiniDerby } from './mini-derby';
import { DiceRoll } from './dice-roll';
import { MiniPoker } from './mini-poker';

describe('Game Engines Suite', () => {
  describe('SlotMachine', () => {
    it('initializes and generates 3x3 reel spin', () => {
      const slots = new SlotMachine();
      slots.init();
      slots.start(25);
      const reels = slots.generateSpin();
      expect(reels).toHaveLength(3);
      expect(reels[0]).toHaveLength(3);
      slots.finalizeSpin();
      const end = slots.end();
      expect(end).toHaveProperty('payout');
      expect(typeof end.payout).toBe('number');
    });
  });

  describe('Blackjack', () => {
    it('initializes and handles deal, hit, stand', () => {
      const bj = new Blackjack();
      bj.init();
      bj.start(50);
      bj.deal();
      const state = bj.getState();
      expect(state.playerHand).toHaveLength(2);
      expect(state.dealerHand).toHaveLength(2);
      expect(state.visibleDealerScore).toBeGreaterThan(0);

      if (state.stage === 'playing') {
        bj.hit();
        expect(bj.getState().playerHand.length).toBeGreaterThanOrEqual(2);
        bj.stand();
        expect(bj.getState().stage).toBe('complete');
      }

      const end = bj.end();
      expect(['win', 'loss', 'push']).toContain(end.result);
    });
  });

  describe('CoinFlip', () => {
    it('flips coin and awards 2x on win', async () => {
      const cf = new CoinFlip();
      cf.init();
      cf.start(20);
      await cf.flip('heads');
      const state = cf.getState();
      expect(['heads', 'tails']).toContain(state.coinResult);
      const end = cf.end();
      if (end.result === 'win') {
        expect(end.payout).toBe(40);
      } else {
        expect(end.payout).toBe(0);
        expect(end.result).toBe('loss');
      }
    });
  });

  describe('HigherOrLower', () => {
    it('initializes card and handles guess', async () => {
      const hol = new HigherOrLower();
      hol.init();
      hol.start(30);
      const initialCard = hol.getState().currentCard;
      expect(initialCard).not.toBeNull();
      await hol.guess('higher');
      const state = hol.getState();
      expect(state.nextCard).not.toBeNull();
    });
  });

  describe('MineSweeper', () => {
    it('sets difficulty and generates mine grid', () => {
      const ms = new MineSweeper();
      ms.setDifficulty(5);
      ms.init();
      ms.start(10);
      const state = ms.getState();
      expect(state.grid).toHaveLength(5);
      expect(state.grid[0]).toHaveLength(5);
      expect(state.multiplier).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ScratchCards', () => {
    it('generates tier card and auto-scratches', () => {
      const sc = new ScratchCards();
      sc.init();
      sc.buyCard('bronze');
      expect(sc.getCardCost('bronze')).toBe(50);
      sc.autoScratch();
      const state = sc.getState();
      expect(state.allScratched).toBe(true);
      const end = sc.end();
      expect(typeof end.payout).toBe('number');
    });
  });

  describe('WheelOfFortune', () => {
    it('initializes wheel segments and handles spin', async () => {
      const wheel = new WheelOfFortune();
      wheel.init();
      wheel.start(100);
      const segment = await wheel.spin(false);
      expect(segment).toHaveProperty('label');
      expect(segment).toHaveProperty('value');
      const end = wheel.end();
      expect(typeof end.payout).toBe('number');
    });
  });

  describe('MiniDerby', () => {
    it('generates racers with odds', () => {
      const derby = new MiniDerby();
      derby.init();
      const state = derby.getState();
      expect(state.racers.length).toBeGreaterThan(0);
      expect(state.racers[0].odds).toBeGreaterThan(1);
      const success = derby.selectRacer(state.racers[0].id);
      expect(success).toBe(true);
    });
  });

  describe('DiceRoll', () => {
    it('supports bet placement and dice roll', async () => {
      const dice = new DiceRoll();
      dice.init();
      dice.start(15);
      dice.setBet('even');
      await dice.roll();
      const state = dice.getState();
      expect(state.dice[0]).toBeGreaterThanOrEqual(1);
      expect(state.dice[0]).toBeLessThanOrEqual(6);
      expect(state.dice[1]).toBeGreaterThanOrEqual(1);
      expect(state.dice[1]).toBeLessThanOrEqual(6);
      const end = dice.end();
      expect(['win', 'loss']).toContain(end.result);
    });
  });

  describe('MiniPoker', () => {
    it('deals 3-card poker hands and plays against dealer', () => {
      const poker = new MiniPoker();
      poker.init();
      poker.start(25);
      poker.deal();
      const state = poker.getState();
      expect(state.playerHand).toHaveLength(3);
      expect(state.stage).toBe('decision');
      poker.play();
      const endState = poker.getState();
      expect(endState.dealerHand).toHaveLength(3);
      const end = poker.end();
      expect(['win', 'loss', 'push']).toContain(end.result);
    });
  });
});
