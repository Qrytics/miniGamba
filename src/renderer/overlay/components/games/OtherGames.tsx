import React, { useState, useRef, useEffect } from 'react';
import { PixelIcon } from '../../../components/PixelIcon';
import {
  playWin,
  playBigWin,
  playLoss,
  playBet,
  playWheelSpin,
  playDiceRoll,
  playHorseGallop,
  playScratch,
  playReveal,
  playClick,
} from '../../utils/sounds';

interface GameProps {
  onCoinsUpdate: () => void;
}

interface WheelResult {
  bet: number;
  payout: number;
  result: 'win' | 'loss';
  win: boolean;
  seg: { label: string; multiplier: number; color: string };
}

// ──────────────────────────────────────────────
// Scratch Cards
// ──────────────────────────────────────────────
const SCRATCH_SYMBOLS = ['🍒', '💎', '⭐', '🔔', '🍀', '💰'];
function genScratchGrid(win: boolean): string[] {
  const pick = () => SCRATCH_SYMBOLS[Math.floor(Math.random() * SCRATCH_SYMBOLS.length)];
  const grid = Array.from({ length: 9 }, pick);
  if (win) {
    // Guarantee 3 matching symbols in a row (rows only)
    const sym = SCRATCH_SYMBOLS[Math.floor(Math.random() * SCRATCH_SYMBOLS.length)];
    const row = Math.floor(Math.random() * 3) * 3;
    grid[row] = sym;
    grid[row + 1] = sym;
    grid[row + 2] = sym;
  }
  return grid;
}

export const ScratchCards: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [grid, setGrid] = useState<string[]>([]);
  const [scratched, setScratched] = useState<boolean[]>(Array(9).fill(false));
  const [won, setWon] = useState<boolean | null>(null);
  const [payout, setPayout] = useState(0);

  const checkWin = (symbols: string[], revealed: boolean[]) => {
    const rows = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];
    for (const row of rows) {
      if (row.every((i) => revealed[i])) {
        const s = symbols[row[0]];
        if (row.every((i) => symbols[i] === s)) return true;
      }
    }
    return false;
  };

  const handleBuy = async () => {
    try {
      const startRes = await window.electronAPI.startGame('scratch-cards', bet);
      if (!startRes?.success) return;
      playBet();
      const willWin = Math.random() < 0.35;
      setGrid(genScratchGrid(willWin));
      setScratched(Array(9).fill(false));
      setWon(null);
      setPayout(0);
      setPlaying(true);
    } catch (error) {
      console.error('Buy failed:', error);
    }
  };

  const handleScratch = async (idx: number) => {
    if (!playing || scratched[idx]) return;
    playScratch();
    const newScratched = [...scratched];
    newScratched[idx] = true;
    setScratched(newScratched);

    const isWin = checkWin(grid, newScratched);
    const allDone = newScratched.every(Boolean);

    if (isWin || allDone) {
      const winAmount = isWin ? Math.floor(bet * (2 + Math.random() * 3)) : 0;
      setPayout(winAmount);
      setWon(isWin);
      setPlaying(false);
      const result = { bet, payout: winAmount, result: isWin ? 'win' : 'loss', win: isWin };
      await window.electronAPI.endGame('scratch-cards', result);
      if (isWin) playWin(); else playLoss();
      onCoinsUpdate();
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="ticket" size={24} aria-hidden /> Scratch Cards</h2>
      </div>
      <div className="game-interface">
        {won !== null && (
          <div className={`result-display ${won ? 'win' : 'loss'}`}>
            {won ? `🎉 You won ${payout} coins!` : '💸 No match — try again!'}
          </div>
        )}
        {playing ? (
          <div className="game-display" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              Scratch to reveal — match a row to win!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxWidth: '220px', margin: '0 auto' }}>
              {grid.map((sym, i) => (
                <button
                  key={i}
                  onClick={() => handleScratch(i)}
                  style={{
                    width: '66px',
                    height: '66px',
                    fontSize: '1.6rem',
                    background: scratched[i] ? 'var(--surface)' : 'var(--balatro-panel-shadow)',
                    border: '2px solid var(--border)',
                    borderRadius: '6px',
                    cursor: scratched[i] ? 'default' : 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: scratched[i] ? 'none' : 'inset 0 2px 6px rgba(0,0,0,0.4)',
                  }}
                >
                  {scratched[i] ? sym : '?'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="game-display">
            <p className="text-muted">Buy a scratch card and reveal the symbols!</p>
          </div>
        )}
        <div className="game-controls">
          {!playing && (
            <>
              <div className="bet-controls">
                <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
                <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
              </div>
              <button className="play-btn" onClick={handleBuy}>🎟 BUY CARD ({bet} coins)</button>
            </>
          )}
          {playing && (
            <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.8rem' }}>
              Click each tile to scratch!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Wheel of Fortune
// ──────────────────────────────────────────────
const WHEEL_SEGMENTS = [
  { label: '2×', multiplier: 2, color: '#8B5CF6' },
  { label: '0×', multiplier: 0, color: '#374151' },
  { label: '1.5×', multiplier: 1.5, color: '#06B6D4' },
  { label: '0×', multiplier: 0, color: '#374151' },
  { label: '3×', multiplier: 3, color: '#F59E0B' },
  { label: '0×', multiplier: 0, color: '#374151' },
  { label: '1×', multiplier: 1, color: '#10B981' },
  { label: '0×', multiplier: 0, color: '#374151' },
  { label: '5×', multiplier: 5, color: '#EF4444' },
  { label: '0×', multiplier: 0, color: '#374151' },
  { label: '1.5×', multiplier: 1.5, color: '#06B6D4' },
  { label: '0×', multiplier: 0, color: '#374151' },
];
const SEGMENT_COUNT = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

export const WheelOfFortune: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelResult | null>(null);
  const spinRef = useRef(0);

  const handleSpin = async () => {
    if (spinning) return;
    try {
      const startRes = await window.electronAPI.startGame('wheel-of-fortune', bet);
      if (!startRes?.success) return;
      playBet();
      playWheelSpin();
      setSpinning(true);
      setResult(null);

      const segmentIdx = Math.floor(Math.random() * SEGMENT_COUNT);
      // Spin at least 5 full turns + land on chosen segment
      const extraSpins = 5 + Math.floor(Math.random() * 5);
      const targetAngle = extraSpins * 360 + segmentIdx * SEGMENT_ANGLE;
      const newRotation = spinRef.current + targetAngle;
      spinRef.current = newRotation;
      setRotation(newRotation);

      setTimeout(async () => {
        const seg = WHEEL_SEGMENTS[segmentIdx];
        const payout = Math.floor(bet * seg.multiplier);
        const win = payout > 0;
        const gameResult = { bet, payout, result: win ? 'win' as const : 'loss' as const, win, segment: seg.label };
        setResult({ bet, payout, result: gameResult.result, win, seg });
        setSpinning(false);
        await window.electronAPI.endGame('wheel-of-fortune', gameResult);
        if (payout >= bet * 4) playBigWin();
        else if (win) playWin();
        else playLoss();
        onCoinsUpdate();
      }, 4000);
    } catch (error) {
      console.error('Spin failed:', error);
      setSpinning(false);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="wheel" size={24} aria-hidden /> Wheel of Fortune</h2>
      </div>
      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win ? `🎉 ${result.seg.label} — Won ${result.payout} coins!` : '💸 Better luck next time!'}
          </div>
        )}
        <div className="game-display" style={{ flexDirection: 'column', gap: '1rem' }}>
          {/* Wheel visual */}
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
            {/* Pointer */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '20px solid var(--balatro-yellow)',
              zIndex: 10,
            }} />
            <svg
              width="200"
              height="200"
              viewBox="-100 -100 200 200"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,1)' : 'none',
                borderRadius: '50%',
                boxShadow: '0 0 20px rgba(139,92,246,0.4)',
              }}
            >
              {WHEEL_SEGMENTS.map((seg, i) => {
                const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
                const r = 98;
                const x1 = Math.cos(startAngle) * r;
                const y1 = Math.sin(startAngle) * r;
                const x2 = Math.cos(endAngle) * r;
                const y2 = Math.sin(endAngle) * r;
                const midAngle = (startAngle + endAngle) / 2;
                const lx = Math.cos(midAngle) * 65;
                const ly = Math.sin(midAngle) * 65;
                return (
                  <g key={i}>
                    <path
                      d={`M0,0 L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                      fill={seg.color}
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                    />
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      {seg.label}
                    </text>
                  </g>
                );
              })}
              <circle r="12" fill="var(--balatro-panel-base)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
            <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
          </div>
          <button className="play-btn" onClick={handleSpin} disabled={spinning}>
            {spinning ? '🌀 SPINNING...' : `🎡 SPIN (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Mini Derby (Horse Racing)
// ──────────────────────────────────────────────
const HORSES = [
  { name: 'Thunder', emoji: '🐎', odds: 2 },
  { name: 'Shadow', emoji: '🐴', odds: 3 },
  { name: 'Blaze', emoji: '🦄', odds: 5 },
  { name: 'Comet', emoji: '🐎', odds: 2 },
];

export const MiniDerby: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [pick, setPick] = useState<number | null>(null);
  const [racing, setRacing] = useState(false);
  const [positions, setPositions] = useState<number[]>([0, 0, 0, 0]);
  const [winner, setWinner] = useState<number | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleRace = async () => {
    if (pick === null || racing) return;
    try {
      const startRes = await window.electronAPI.startGame('mini-derby', bet);
      if (!startRes?.success) return;
      playBet();
      playHorseGallop();
      setRacing(true);
      setResult(null);
      setWinner(null);
      setPositions([0, 0, 0, 0]);

      const speeds = HORSES.map(() => 1 + Math.random() * 2);
      const pos = [0, 0, 0, 0];

      intervalRef.current = setInterval(async () => {
        for (let i = 0; i < 4; i++) {
          pos[i] = Math.min(100, pos[i] + speeds[i] * (0.5 + Math.random()));
        }
        setPositions([...pos]);

        const done = pos.findIndex((p) => p >= 100);
        if (done !== -1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setWinner(done);
          setRacing(false);
          const win = done === pick;
          const payout = win ? Math.floor(bet * HORSES[done].odds) : 0;
          const gameResult = { bet, payout, result: win ? 'win' : 'loss', win, horse: HORSES[done].name };
          setResult(gameResult);
          await window.electronAPI.endGame('mini-derby', gameResult);
          if (win) playBigWin(); else playLoss();
          onCoinsUpdate();
        }
      }, 100);
    } catch (error) {
      console.error('Race failed:', error);
      setRacing(false);
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="horse" size={24} aria-hidden /> Mini Derby</h2>
      </div>
      <div className="game-interface">
        {result && (
          <div className={`result-display ${(result as Record<string,unknown>).win ? 'win' : 'loss'}`}>
            {(result as Record<string,unknown>).win
              ? `🏆 ${(result as Record<string,unknown>).horse as string} wins! +${(result as Record<string,unknown>).payout as number} coins!`
              : winner !== null
                ? `💸 ${HORSES[winner]?.name} won. Better luck next time!`
                : '💸 Better luck next time!'}
          </div>
        )}
        <div className="game-display" style={{ flexDirection: 'column', width: '100%', gap: '0.5rem' }}>
          {HORSES.map((horse, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '60px', fontSize: '0.75rem', color: pick === i ? 'var(--balatro-yellow)' : 'var(--text-secondary)', fontWeight: pick === i ? 700 : 400 }}>
                {horse.emoji} {horse.name}
              </span>
              <div style={{ flex: 1, height: '28px', background: 'var(--balatro-panel-shadow)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${positions[i]}%`,
                  background: pick === i
                    ? 'linear-gradient(90deg, var(--balatro-purple), var(--balatro-cyan))'
                    : 'linear-gradient(90deg, #4b5563, #6b7280)',
                  transition: 'width 0.1s linear',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '4px',
                  fontSize: '1rem',
                }}>
                  {positions[i] > 5 ? horse.emoji : ''}
                </div>
              </div>
              <span style={{ width: '32px', fontSize: '0.7rem', color: 'var(--balatro-yellow)', textAlign: 'right' }}>{horse.odds}×</span>
            </div>
          ))}
        </div>
        <div className="game-controls">
          {!racing && !result && (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {HORSES.map((horse, i) => (
                  <button
                    key={i}
                    className={`action-btn ${pick === i ? '' : 'bet-btn'}`}
                    onClick={() => { setPick(i); playClick(); }}
                    style={{ flex: '1', minWidth: '60px', fontSize: '0.75rem' }}
                  >
                    {horse.emoji} #{i + 1}
                  </button>
                ))}
              </div>
              <div className="bet-controls">
                <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
                <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
              </div>
              <button className="play-btn" onClick={handleRace} disabled={pick === null}>
                🏁 RACE ({bet} coins)
              </button>
            </>
          )}
          {!racing && result && (
            <button className="play-btn" onClick={() => { setResult(null); setPick(null); setPositions([0,0,0,0]); setWinner(null); }}>
              🔄 Race Again
            </button>
          )}
          {racing && <p className="text-muted" style={{ textAlign: 'center' }}>🏇 Racing...</p>}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Dice Roll
// ──────────────────────────────────────────────
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

type BetType = 'high' | 'low' | 'even' | 'odd' | 'exact';

const BET_TYPES: { id: BetType; label: string; desc: string; payout: number }[] = [
  { id: 'high', label: 'High (7-12)', desc: '7–12', payout: 2 },
  { id: 'low', label: 'Low (2-6)', desc: '2–6', payout: 2 },
  { id: 'even', label: 'Even sum', desc: 'Even', payout: 2 },
  { id: 'odd', label: 'Odd sum', desc: 'Odd', payout: 2 },
  { id: 'exact', label: 'Snake eyes (2)', desc: '2', payout: 10 },
];

export const DiceRoll: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [betType, setBetType] = useState<BetType>('high');
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [rollingDice, setRollingDice] = useState<[number, number]>([1, 1]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleRoll = async () => {
    if (rolling) return;
    try {
      const startRes = await window.electronAPI.startGame('dice-roll', bet);
      if (!startRes?.success) return;
      playBet();
      playDiceRoll();
      setRolling(true);
      setResult(null);

      // Animate dice
      let frames = 0;
      const anim = setInterval(() => {
        setRollingDice([
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 6),
        ]);
        frames++;
        if (frames >= 12) {
          clearInterval(anim);
          const d1 = Math.floor(Math.random() * 6);
          const d2 = Math.floor(Math.random() * 6);
          const sum = d1 + d2 + 2;
          setDice([d1, d2]);
          setRollingDice([d1, d2]);

          let win = false;
          if (betType === 'high') win = sum >= 7;
          else if (betType === 'low') win = sum <= 6;
          else if (betType === 'even') win = sum % 2 === 0;
          else if (betType === 'odd') win = sum % 2 !== 0;
          else if (betType === 'exact') win = sum === 2;

          const selectedBet = BET_TYPES.find((b) => b.id === betType)!;
          const payout = win ? bet * selectedBet.payout : 0;
          const gameResult = { bet, payout, result: win ? 'win' : 'loss', win, sum, dice: [d1 + 1, d2 + 1] };
          setResult(gameResult);
          setRolling(false);
          window.electronAPI.endGame('dice-roll', gameResult);
          if (win) playWin(); else playLoss();
          onCoinsUpdate();
        }
      }, 80);
    } catch (error) {
      console.error('Roll failed:', error);
      setRolling(false);
    }
  };

  const displayDice = rolling ? rollingDice : dice;

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="dice" size={24} aria-hidden /> Dice Roll</h2>
      </div>
      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win ? `🎲 Sum: ${result.sum} — Won ${result.payout} coins!` : `🎲 Sum: ${result.sum} — No luck this time`}
          </div>
        )}
        <div className="game-display" style={{ flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '4rem' }}>
            <span style={{ display: 'inline-block', transition: rolling ? 'none' : 'transform 0.2s', transform: rolling ? `rotate(${Math.random() * 360}deg)` : 'none' }}>
              {DICE_FACES[displayDice[0]]}
            </span>
            <span style={{ display: 'inline-block' }}>
              {DICE_FACES[displayDice[1]]}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
            {BET_TYPES.map((b) => (
              <button
                key={b.id}
                className={`action-btn ${betType === b.id ? '' : 'bet-btn'}`}
                onClick={() => { setBetType(b.id); playClick(); }}
                style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                disabled={rolling}
              >
                {b.label} ({b.payout}×)
              </button>
            ))}
          </div>
        </div>
        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
            <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
          </div>
          <button className="play-btn" onClick={handleRoll} disabled={rolling}>
            {rolling ? '🎲 Rolling...' : `🎲 ROLL (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Mini Poker (3-Card)
// ──────────────────────────────────────────────
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function makeDeck() {
  const deck: { rank: string; suit: string; value: number }[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      deck.push({ rank: RANKS[i], suit, value: i + 2 });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function handRank(cards: { rank: string; suit: string; value: number }[]) {
  const vals = cards.map((c) => c.value).sort((a, b) => a - b);
  const suits = cards.map((c) => c.suit);
  const flush = suits.every((s) => s === suits[0]);
  const straight = vals[1] === vals[0] + 1 && vals[2] === vals[1] + 1;
  const counts = vals.reduce<Record<number, number>>((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});
  const freqs = Object.values(counts).sort((a, b) => b - a);

  if (flush && straight) return { name: 'Straight Flush', multiplier: 40 };
  if (freqs[0] === 3) return { name: 'Three of a Kind', multiplier: 30 };
  if (flush) return { name: 'Flush', multiplier: 6 };
  if (straight) return { name: 'Straight', multiplier: 5 };
  if (freqs[0] === 2) return { name: 'Pair', multiplier: 2 };
  return { name: 'High Card', multiplier: 0 };
}

export const MiniPoker: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [hand, setHand] = useState<{ rank: string; suit: string; value: number }[]>([]);
  const [dealerHand, setDealerHand] = useState<{ rank: string; suit: string; value: number }[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false]);
  const [stage, setStage] = useState<'idle' | 'hold' | 'result'>('idle');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const deckRef = useRef(makeDeck());

  const handleDeal = async () => {
    try {
      const startRes = await window.electronAPI.startGame('mini-poker', bet);
      if (!startRes?.success) return;
      playBet();
      deckRef.current = makeDeck();
      const newHand = deckRef.current.splice(0, 3);
      setHand(newHand);
      setHeld([false, false, false]);
      setDealerHand([]);
      setResult(null);
      setStage('hold');
      // Deal sound
      [0, 1, 2].forEach((i) => setTimeout(() => { playReveal(); }, i * 120));
    } catch (error) {
      console.error('Deal failed:', error);
    }
  };

  const handleDraw = async () => {
    let drawIndex = 0;
    const newHand = hand.map((card, i) => {
      if (held[i]) return card;
      const drawn = deckRef.current.shift();
      const delay = drawIndex * 150;
      drawIndex++;
      if (drawn) { setTimeout(() => playReveal(), delay); }
      return drawn ?? card;
    });

    const dealer = deckRef.current.splice(0, 3);
    setHand(newHand);
    setDealerHand(dealer);

    const playerRank = handRank(newHand);
    const win = playerRank.multiplier > 0;
    const payout = win ? Math.floor(bet * playerRank.multiplier) : 0;
    const gameResult = { bet, payout, result: win ? 'win' : 'loss', win, hand: playerRank.name };
    setResult(gameResult);
    setStage('result');
    await window.electronAPI.endGame('mini-poker', gameResult);
    if (payout >= bet * 10) playBigWin();
    else if (win) playWin();
    else playLoss();
    onCoinsUpdate();
  };

  const isRed = (card: { suit: string }) => card.suit === '♥' || card.suit === '♦';

  const renderCard = (card: { rank: string; suit: string }, highlight = false, faceDown = false) => (
    <div
      className={`playing-card ${isRed(card) ? 'red' : ''}`}
      style={{
        width: '46px',
        height: '64px',
        fontSize: '1rem',
        flexShrink: 0,
        background: faceDown ? '#4a5568' : highlight ? 'rgba(139,92,246,0.15)' : undefined,
        border: highlight ? '2px solid var(--balatro-yellow)' : undefined,
      }}
    >
      {faceDown ? '🂠' : `${card.rank}${card.suit}`}
    </div>
  );

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="spade" size={24} aria-hidden /> Mini Poker</h2>
      </div>
      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win
              ? `🃏 ${result.hand}! Won ${result.payout} coins!`
              : `🃏 ${handRank(hand).name} — No payout`}
          </div>
        )}
        <div className="game-display" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {dealerHand.length > 0 && (
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem', textAlign: 'center', marginBottom: '4px' }}>Dealer</p>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {dealerHand.map((c, i) => <div key={i}>{renderCard(c)}</div>)}
              </div>
            </div>
          )}
          {hand.length > 0 && (
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem', textAlign: 'center', marginBottom: '4px' }}>
                {stage === 'hold' ? 'Tap to HOLD cards' : 'Your Hand'}
              </p>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {hand.map((c, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div
                      onClick={() => {
                        if (stage !== 'hold') return;
                        playClick();
                        const h = [...held];
                        h[i] = !h[i];
                        setHeld(h);
                      }}
                      style={{ cursor: stage === 'hold' ? 'pointer' : 'default' }}
                    >
                      {renderCard(c, held[i])}
                    </div>
                    {stage === 'hold' && (
                      <span style={{ fontSize: '0.6rem', color: held[i] ? 'var(--balatro-yellow)' : 'var(--text-secondary)', fontWeight: 700 }}>
                        {held[i] ? 'HOLD' : '—'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {stage === 'idle' && (
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>3-Card Poker — Pair or better wins!</p>
          )}
        </div>
        <div className="game-controls">
          {stage === 'idle' && (
            <>
              <div className="bet-controls">
                <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
                <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
              </div>
              <button className="play-btn" onClick={handleDeal}>🃏 DEAL ({bet} coins)</button>
            </>
          )}
          {stage === 'hold' && (
            <button className="play-btn" onClick={handleDraw}>🔄 DRAW</button>
          )}
          {stage === 'result' && (
            <button className="play-btn" onClick={() => setStage('idle')}>🔄 Play Again</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScratchCards;

