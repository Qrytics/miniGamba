import React, { useState, useRef, useEffect } from 'react';
import { SlotMachine as SlotMachineEngine } from '../../game-logic/slot-machine';
import { PixelIcon } from '../../../components/PixelIcon';

interface SlotMachineProps {
  onCoinsUpdate: () => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [theme] = useState('classic');

  const engineRef = useRef<SlotMachineEngine | null>(null);

  useEffect(() => {
    const engine = new SlotMachineEngine();
    engine.init();
    engine.setTheme('classic');
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
    };
  }, []);

  const handleSpin = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (spinning) return;
    
    setSpinning(true);
    setResult(null);

    try {
      // Start game
      await window.electronAPI.startGame('slot-machine', bet);
      engine.start(bet);
      
      // Spin animation
      const animationFrames = 15;
      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣'];
      
      for (let i = 0; i < animationFrames; i++) {
        setReels([
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
        ]);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Get actual result
      await engine.spin();
      const state = engine.getState();
      const endResult = engine.end();

      // Middle row of each reel for display
      const middleRow = state.reels.map((col: string[]) => col[1] ?? col[0] ?? '🍒');

      const gameResult = {
        bet: bet, // Include bet in result
        payout: endResult.payout,
        matchType: state.result?.type,
        reels: middleRow,
        result: endResult.result,
        win: endResult.result === 'win',
      };

      setReels(middleRow);
      setResult(gameResult);
      await window.electronAPI.endGame('slot-machine', gameResult);
      onCoinsUpdate();
    } catch (error) {
      console.error('Spin failed:', error);
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="slots" size={28} aria-hidden={true} /> Slot Machine</h2>
      </div>

      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.payout > 0 ? 'win' : 'loss'}`}>
            {result.payout > 0 ? `You won ${result.payout} coins!` : `No win this time`}
            {result.matchType && <div className="mt-1">{result.matchType}</div>}
          </div>
        )}

        <div className="game-display">
          <div className="slot-reels">
            {reels.map((symbol, idx) => (
              <div key={idx} className="slot-reel">
                {symbol}
              </div>
            ))}
          </div>
        </div>

        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>
              -10
            </button>
            <input
              type="number"
              className="bet-input"
              value={bet}
              onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>
              +10
            </button>
          </div>

          <button 
            className="play-btn" 
            onClick={handleSpin}
            disabled={spinning}
          >
            {spinning ? 'SPINNING...' : `SPIN (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
