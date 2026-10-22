import React, { useState, useEffect, useRef } from 'react';
import { ScratchCards as ScratchCardsEngine, CardTier } from '../../../game-logic/scratch-cards';
import { PixelIcon } from '../../../../components/PixelIcon';
import ChipSelector from '../../ui/ChipSelector';
import { playWin, playBigWin, playLoss, playBet, playScratch } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface ScratchCardsProps {
  onCoinsUpdate: () => void;
}

const TIERS: { id: CardTier; label: string; cost: number; color: string }[] = [
  { id: 'bronze', label: 'BRONZE', cost: 10, color: '#CD7F32' },
  { id: 'silver', label: 'SILVER', cost: 50, color: '#C0C0C0' },
  { id: 'gold', label: 'GOLD', cost: 100, color: '#FFD700' },
  { id: 'diamond', label: 'DIAMOND', cost: 250, color: '#00E5FF' },
];

export const ScratchCards: React.FC<ScratchCardsProps> = ({ onCoinsUpdate }) => {
  const [tier, setTier] = useState<CardTier>('bronze');
  const [bet, setBet] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [panels, setPanels] = useState<string[]>(Array(9).fill('?'));
  const [result, setResult] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ScratchCardsEngine | null>(null);
  const isScratchingRef = useRef(false);
  const revealedPixelsRef = useRef(0);

  useEffect(() => {
    const engine = new ScratchCardsEngine();
    engine.init();
    engine.buyCard(tier);
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
    };
  }, [tier]);

  const initFoilCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    // Metallic foil gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#718096');
    grad.addColorStop(0.3, '#A0AEC0');
    grad.addColorStop(0.5, '#CBD5E0');
    grad.addColorStop(0.7, '#A0AEC0');
    grad.addColorStop(1, '#718096');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative lattice border and label
    ctx.strokeStyle = '#4A5568';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    ctx.fillStyle = '#2D3748';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2);
  };

  const handleBuyCard = async () => {
    const engine = engineRef.current;
    if (!engine || playing) return;

    const currentTierData = TIERS.find((t) => t.id === tier)!;
    const cost = currentTierData.cost;

    try {
      const startResult = await window.electronAPI.startGame('scratch-cards', bet);
      if (!startResult?.success) {
        setResult({ error: startResult?.error || 'Insufficient coins to place bet', win: false, bet, payout: 0 });
        return;
      }
      onCoinsUpdate();

      setSessionId(startResult.sessionId ?? null);
      playBet();
      engine.init();
      engine.buyCard(tier);

      const state = engine.getState();
      setPanels(state.panels);
      setResult(null);
      setPlaying(true);
      revealedPixelsRef.current = 0;

      setTimeout(() => {
        initFoilCanvas();
      }, 50);
    } catch (error) {
      console.error('Buy card failed:', error);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!playing) return;
    isScratchingRef.current = true;
    handleScratchAt(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!playing || !isScratchingRef.current) return;
    handleScratchAt(e);
  };

  const handlePointerUp = () => {
    isScratchingRef.current = false;
  };

  const handleScratchAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    playScratch();
    revealedPixelsRef.current += 1;

    // Check if enough scratched (approx 45 strokes) to auto-complete
    if (revealedPixelsRef.current > 42) {
      handleAutoScratch();
    }
  };

  const handleAutoScratch = async () => {
    const engine = engineRef.current;
    if (!engine || !playing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    engine.autoScratch();
    const state = engine.getState();
    const endResult = engine.end();
    const isWin = state.isWin;
    const payout = endResult.payout;

    const currentTierData = TIERS.find((t) => t.id === tier)!;
    const gameResult = {
      bet: currentTierData.cost,
      payout,
      result: isWin ? 'win' : 'loss',
      win: isWin,
      tier,
      sessionId,
    };

    setResult(gameResult);
    setPlaying(false);

    if (payout >= currentTierData.cost * 5) {
      playBigWin();
      particles.burstConfetti(undefined, undefined, 50);
    } else if (isWin) {
      playWin();
      particles.burstCoins(undefined, undefined, 30);
    } else {
      playLoss();
    }

    await window.electronAPI.endGame('scratch-cards', gameResult);
    setSessionId(null);
    onCoinsUpdate();
  };

  const currentTierData = TIERS.find((t) => t.id === tier)!;

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="ticket" size={28} aria-hidden={true} /> Scratch Cards</h2>
      </div>

      <div className="game-interface">
        {result?.error ? (
          <div className="result-display error error-message">
            ⚠️ {result.error}
          </div>
        ) : result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win ? `🎉 Match found! Won ${result.payout} coins!` : 'No match this time. Try another card!'}
          </div>
        )}

        {/* Tier Selector (when not playing) */}
        {!playing && (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '8px' }}>
            {TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`step-btn ${tier === t.id ? 'active' : ''}`}
                onClick={() => setTier(t.id)}
                style={{
                  color: tier === t.id ? '#FFF' : t.color,
                  borderColor: tier === t.id ? t.color : undefined,
                  background: tier === t.id ? 'var(--balatro-panel-base)' : undefined,
                }}
              >
                {t.label} ({t.cost})
              </button>
            ))}
          </div>
        )}

        {/* Interactive Scratch Foil Canvas */}
        <div className="scratch-canvas-container">
          <div className="scratch-underlayer-grid">
            {panels.map((sym, idx) => (
              <div key={idx} className="scratch-cell-prize">
                <span className="scratch-cell-symbol">{sym || '✨'}</span>
              </div>
            ))}
          </div>

          {playing && (
            <canvas
              ref={canvasRef}
              width={270}
              height={270}
              className="scratch-foil-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          )}
        </div>

        <div className="game-controls">
          {!playing ? (
            <>
              <ChipSelector
                currentBet={bet}
                onBetChange={(newBet) => {
                  setBet(newBet);
                  // Auto pick closest tier
                  const closest = TIERS.reduce((prev, curr) =>
                    Math.abs(curr.cost - newBet) < Math.abs(prev.cost - newBet) ? curr : prev
                  );
                  setTier(closest.id);
                }}
              />
              <button
                className="play-btn"
                onClick={handleBuyCard}
                style={{ marginTop: '8px' }}
              >
                SCRATCH ({bet} coins)
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                Rub cursor across card or click Auto-Scratch!
              </p>
              <button
                className="step-btn"
                onClick={handleAutoScratch}
                style={{ padding: '8px', background: 'var(--balatro-purple)', color: '#FFF' }}
              >
                ⚡ AUTO-SCRATCH
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScratchCards;
