import React from 'react';
import { playBet, playClick } from '../../utils/sounds';

interface ChipSelectorProps {
  currentBet: number;
  onBetChange: (newBet: number) => void;
  minBet?: number;
  maxBet?: number;
  disabled?: boolean;
}

const CHIP_VALUES = [10, 25, 50, 100, 250];

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  currentBet,
  onBetChange,
  minBet = 1,
  maxBet = 10000,
  disabled = false,
}) => {
  const handleChipClick = (amount: number) => {
    if (disabled) return;
    playBet();
    onBetChange(Math.min(maxBet, Math.max(minBet, amount)));
  };

  const handleStep = (delta: number) => {
    if (disabled) return;
    playClick();
    onBetChange(Math.min(maxBet, Math.max(minBet, currentBet + delta)));
  };

  return (
    <div className="chip-selector-container">
      <div className="chip-buttons-row">
        {CHIP_VALUES.map((val) => {
          const isSelected = currentBet === val;
          return (
            <button
              key={val}
              type="button"
              className={`casino-chip chip-${val} ${isSelected ? 'active' : ''}`}
              onClick={() => handleChipClick(val)}
              disabled={disabled}
              title={`Bet ${val}`}
            >
              <span className="chip-inner">
                <span className="chip-value">{val}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="bet-stepper-row">
        <button
          type="button"
          className="step-btn"
          onClick={() => handleStep(-10)}
          disabled={disabled || currentBet <= minBet}
          title="Decrease bet by 10"
        >
          -10
        </button>
        <div className="bet-display-badge">
          <span className="bet-label">BET</span>
          <input
            type="number"
            className="bet-input"
            value={currentBet}
            min={minBet}
            max={maxBet}
            disabled={disabled}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                onBetChange(Math.max(minBet, Math.min(maxBet, val)));
              }
            }}
          />
          <span className="bet-currency">COINS</span>
        </div>
        <button
          type="button"
          className="step-btn"
          onClick={() => handleStep(10)}
          disabled={disabled || currentBet >= maxBet}
          title="Increase bet by 10"
        >
          +10
        </button>
      </div>
    </div>
  );
};

export default ChipSelector;
