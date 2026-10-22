import React, { useState, useRef, useEffect } from 'react';
import { PixelIcon } from '../../../../components/PixelIcon';
import ChipSelector from '../../ui/ChipSelector';
import { playWin, playBigWin, playLoss, playBet, playWheelSpin, playPegTick } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface GameProps {
  onCoinsUpdate: () => void;
}

interface WheelSegment {
  label: string;
  multiplier: number;
  color: string;
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { label: '2×', multiplier: 2, color: '#8B5CF6' },
  { label: '0×', multiplier: 0, color: '#2D3748' },
  { label: '1.5×', multiplier: 1.5, color: '#06B6D4' },
  { label: '0×', multiplier: 0, color: '#2D3748' },
  { label: '3×', multiplier: 3, color: '#F59E0B' },
  { label: '0×', multiplier: 0, color: '#2D3748' },
  { label: '1×', multiplier: 1, color: '#10B981' },
  { label: '0×', multiplier: 0, color: '#2D3748' },
  { label: '5×', multiplier: 5, color: '#EF4444' },
  { label: '0×', multiplier: 0, color: '#2D3748' },
  { label: '1.5×', multiplier: 1.5, color: '#06B6D4' },
  { label: '0×', multiplier: 0, color: '#2D3748' },
];

const SEGMENT_COUNT = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

export const WheelOfFortune: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [flapperBent, setFlapperBent] = useState(false);

  const spinRotationRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

  const handleSpin = async () => {
    if (spinning) return;

    try {
      const startRes = await window.electronAPI.startGame('wheel-of-fortune', bet);
      if (!startRes?.success) {
        setResult({ error: startRes?.error || 'Insufficient coins to place bet', win: false, bet, payout: 0 });
        setSpinning(false);
        return;
      }
      onCoinsUpdate();

      sessionIdRef.current = startRes.sessionId ?? null;
      playBet();
      playWheelSpin();
      setSpinning(true);
      setResult(null);

      // Choose winning segment
      const segmentIdx = Math.floor(Math.random() * SEGMENT_COUNT);
      const chosenSeg = WHEEL_SEGMENTS[segmentIdx];

      // Exact mathematical landing angle:
      // Segment center is at (segmentIdx + 0.5) * SEGMENT_ANGLE
      // To bring it under top needle: (360 - centerAngle)
      const centerAngle = (segmentIdx + 0.5) * SEGMENT_ANGLE;
      const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
      const targetDelta = extraSpins + ((360 - (centerAngle % 360)) % 360);
      const newRotation = spinRotationRef.current + targetDelta;
      spinRotationRef.current = newRotation;
      setRotation(newRotation);

      // Flapper vibration intervals
      const tickInterval = setInterval(() => {
        setFlapperBent((prev) => !prev);
      }, 90);

      setTimeout(async () => {
        clearInterval(tickInterval);
        setFlapperBent(false);
        playPegTick();

        const payout = Math.floor(bet * chosenSeg.multiplier);
        const isWin = payout > 0;
        const gameResult = {
          bet,
          payout,
          result: isWin ? 'win' : 'loss',
          win: isWin,
          segment: chosenSeg.label,
          sessionId: sessionIdRef.current,
        };

        setResult({ ...gameResult, seg: chosenSeg });
        setSpinning(false);
        await window.electronAPI.endGame('wheel-of-fortune', gameResult);
        sessionIdRef.current = null;

        if (payout >= bet * 4) {
          playBigWin();
          particles.burstConfetti(undefined, undefined, 45);
        } else if (isWin) {
          playWin();
          particles.burstCoins(undefined, undefined, 25);
        } else {
          playLoss();
        }

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
        {result?.error ? (
          <div className="result-display error error-message">
            ⚠️ {result.error}
          </div>
        ) : result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win ? `🎉 Landed on ${result.seg?.label}! Won ${result.payout} coins!` : '💸 Landed on 0×. Better luck next spin!'}
          </div>
        )}

        <div className="game-display" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {/* Wheel Graphic */}
          <div style={{ position: 'relative', width: '210px', height: '210px', margin: '0 auto' }}>
            {/* Animated Peg Flapper */}
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: `translateX(-50%) rotate(${flapperBent ? '18deg' : '0deg'})`,
                transition: 'transform 0.05s ease',
                width: 0,
                height: 0,
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderTop: '22px solid var(--balatro-yellow)',
                zIndex: 10,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
              }}
            />

            <svg
              width="210"
              height="210"
              viewBox="-105 -105 210 210"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
                borderRadius: '50%',
                boxShadow: '0 0 24px rgba(139, 92, 246, 0.45)',
              }}
            >
              {WHEEL_SEGMENTS.map((seg, i) => {
                const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
                const r = 100;
                const x1 = Math.cos(startAngle) * r;
                const y1 = Math.sin(startAngle) * r;
                const x2 = Math.cos(endAngle) * r;
                const y2 = Math.sin(endAngle) * r;
                const midAngle = (startAngle + endAngle) / 2;
                const lx = Math.cos(midAngle) * 68;
                const ly = Math.sin(midAngle) * 68;

                return (
                  <g key={i}>
                    <path
                      d={`M0,0 L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                      fill={seg.color}
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={lx}
                      y={ly}
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="800"
                      fontFamily="var(--balatro-font-mono)"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2}, ${lx}, ${ly})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
              {/* Golden Center Hub */}
              <circle r="18" fill="#1A1A24" stroke="#FFD84B" strokeWidth="3" />
              <circle r="6" fill="#FFD84B" />
            </svg>
          </div>
        </div>

        <div className="game-controls">
          <ChipSelector
            currentBet={bet}
            onBetChange={setBet}
            disabled={spinning}
          />

          <button
            className="play-btn"
            onClick={handleSpin}
            disabled={spinning}
            style={{ marginTop: '8px' }}
          >
            {spinning ? 'SPINNING...' : `SPIN WHEEL (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WheelOfFortune;
