import React, { useState } from 'react';
import SlotMachineEngine from '../../game-logic/slot-machine';

interface SlotMachineProps {
  onCoinsUpdate: () => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [theme] = useState('classic');

  const engine = new SlotMachineEngine();

  const handleSpin = async () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);

    try {
      // Start game
      await window.electronAPI.startGame('slot-machine', bet);
      
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
      const gameResult = engine.spin(bet, theme);
      setReels(gameResult.reels);
      setResult(gameResult);
      
      // End game and update coins
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
        <h2 className="game-title">🎰 Slot Machine</h2>
      </div>

      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.payout > 0 ? 'win' : 'loss'}`}>
            {result.payout > 0 ? `🎉 You won ${result.payout} coins!` : `💔 No win this time`}
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
