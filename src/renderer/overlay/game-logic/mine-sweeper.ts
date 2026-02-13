/**
 * Mine Sweeper Game Logic
 * Crash-style minesweeper game with progressive multipliers
 */

import { GameEngine } from './base/GameEngine';

export interface Tile {
  type: 'safe' | 'mine';
  revealed: boolean;
  row: number;
  col: number;
}

export interface MineSweeperState {
  grid: Tile[][];
  multiplier: number;
  revealedCount: number;
  mineCount: number;
  gameActive: boolean;
  canCashOut: boolean;
  luckyRevealsRemaining: number;
  potentialWinning: number;
  safeTilesRemaining: number;
}

export class MineSweeper extends GameEngine {
  private gridSize = 5;
  private grid: Tile[][] = [];
  private minePositions: Set<string> = new Set();
  private mineCount: 3 | 5 | 10 = 3;
  private revealedCount = 0;
  private multiplier = 1;
  private gameActive = false;
  private canCashOut = false;
  private luckyRevealsRemaining = 2;
  private readonly LUCKY_REVEAL_LIMIT = 2;

  init(): void {
    this.reset();
    this.generateGrid();
    this.gameActive = true;
  }

  /**
   * Set difficulty (number of mines)
   */
  setDifficulty(mines: 3 | 5 | 10): void {
    if (!this.gameActive) {
      this.mineCount = mines;
    }
  }

  /**
   * Reveal a tile at specified position
   */
  reveal(row: number, col: number): boolean {
    if (!this.gameActive) return false;
    if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return false;
    
    const tile = this.grid[row][col];
    if (tile.revealed) return false;
    
    tile.revealed = true;
    
    if (tile.type === 'mine') {
      this.result = 'loss';
      this.payout = 0;
      this.gameActive = false;
      this.canCashOut = false;
      this.revealAll();
      return false;
    } else {
      this.revealedCount++;
      this.updateMultiplier();
      this.canCashOut = true;
      
      // Check if all safe tiles revealed (auto win)
      const totalSafeTiles = (this.gridSize * this.gridSize) - this.mineCount;
      if (this.revealedCount >= totalSafeTiles) {
        this.result = 'win';
        this.payout = this.calculatePayout();
        this.gameActive = false;
        this.revealAll();
      }
      
      return true;
    }
  }

  /**
   * Lucky Reveal - safely reveal one random safe tile
   * Costs extra coins and has limited uses per game
   */
  luckyReveal(): { success: boolean; tile: { row: number; col: number } | null } {
    if (!this.gameActive || this.luckyRevealsRemaining <= 0) {
      return { success: false, tile: null };
    }

    // Find all unrevealed safe tiles
    const unrevealedSafeTiles: Tile[] = [];
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const tile = this.grid[row][col];
        if (!tile.revealed && tile.type === 'safe') {
          unrevealedSafeTiles.push(tile);
        }
      }
    }

    if (unrevealedSafeTiles.length === 0) {
      return { success: false, tile: null };
    }

    // Randomly select a safe tile to reveal
    const randomIndex = Math.floor(Math.random() * unrevealedSafeTiles.length);
    const tileToReveal = unrevealedSafeTiles[randomIndex];
    
    this.luckyRevealsRemaining--;
    tileToReveal.revealed = true;
    this.revealedCount++;
    this.updateMultiplier();
    this.canCashOut = true;

    // Check if all safe tiles revealed
    const totalSafeTiles = (this.gridSize * this.gridSize) - this.mineCount;
    if (this.revealedCount >= totalSafeTiles) {
      this.result = 'win';
      this.payout = this.calculatePayout();
      this.gameActive = false;
      this.revealAll();
    }

    return {
      success: true,
      tile: { row: tileToReveal.row, col: tileToReveal.col }
    };
  }

  /**
   * Cash out with current multiplier
   */
  cashOut(): number {
    if (!this.canCashOut || !this.gameActive) {
      return 0;
    }

    this.result = 'win';
    this.payout = this.calculatePayout();
    this.gameActive = false;
    this.canCashOut = false;
    this.revealAll();

    return this.payout;
  }

  /**
   * Calculate payout based on revealed tiles and multiplier
   */
  calculatePayout(): number {
    if (this.result === 'loss') return 0;
    return Math.floor(this.bet * this.multiplier);
  }

  /**
   * Get current multiplier
   */
  getCurrentMultiplier(): number {
    return this.multiplier;
  }

  /**
   * Get potential winning if cashed out now
   */
  getPotentialWinning(): number {
    if (this.revealedCount === 0) return 0;
    return Math.floor(this.bet * this.multiplier);
  }

  /**
   * Get current game state
   */
  getState(): MineSweeperState {
    const totalSafeTiles = (this.gridSize * this.gridSize) - this.mineCount;
    return {
      grid: this.grid,
      multiplier: this.multiplier,
      revealedCount: this.revealedCount,
      mineCount: this.mineCount,
      gameActive: this.gameActive,
      canCashOut: this.canCashOut,
      luckyRevealsRemaining: this.luckyRevealsRemaining,
      potentialWinning: this.getPotentialWinning(),
      safeTilesRemaining: totalSafeTiles - this.revealedCount,
    };
  }

  /**
   * Check if game is currently active
   */
  isGameActive(): boolean {
    return this.gameActive;
  }

  /**
   * Check if player can cash out
   */
  canPlayerCashOut(): boolean {
    return this.canCashOut && this.gameActive && this.revealedCount > 0;
  }

  /**
   * Get number of lucky reveals remaining
   */
  getLuckyRevealsRemaining(): number {
    return this.luckyRevealsRemaining;
  }

  /**
   * Get grid size
   */
  getGridSize(): number {
    return this.gridSize;
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    this.grid = [];
    this.minePositions.clear();
    this.revealedCount = 0;
    this.multiplier = 1;
    this.result = null;
    this.payout = 0;
    this.gameActive = false;
    this.canCashOut = false;
    this.luckyRevealsRemaining = this.LUCKY_REVEAL_LIMIT;
  }

  /**
   * Generate grid with mines placed randomly
   */
  private generateGrid(): void {
    const totalTiles = this.gridSize * this.gridSize;
    this.minePositions.clear();

    // Generate random mine positions
    while (this.minePositions.size < this.mineCount) {
      const position = Math.floor(Math.random() * totalTiles);
      this.minePositions.add(position.toString());
    }

    // Create grid with tiles
    this.grid = [];
    let position = 0;
    for (let row = 0; row < this.gridSize; row++) {
      const gridRow: Tile[] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const isMine = this.minePositions.has(position.toString());
        gridRow.push({
          type: isMine ? 'mine' : 'safe',
          revealed: false,
          row,
          col,
        });
        position++;
      }
      this.grid.push(gridRow);
    }
  }

  /**
   * Update multiplier based on revealed tiles and difficulty
   * Uses exponential growth based on risk (more mines = higher multiplier growth)
   */
  private updateMultiplier(): void {
    if (this.revealedCount === 0) {
      this.multiplier = 1;
      return;
    }

    const totalTiles = this.gridSize * this.gridSize;
    
    // Calculate multiplier using probability-based formula
    // Each reveal increases multiplier based on odds of NOT hitting a mine
    // Formula: multiply by (tiles_remaining / safe_tiles_remaining) for each reveal
    let multiplier = 1;
    for (let i = 0; i < this.revealedCount; i++) {
      const tilesRemaining = totalTiles - i;
      const safeTilesRemaining = tilesRemaining - this.mineCount;
      
      // Multiplier increases based on risk: totalRemaining / safeRemaining
      // This represents the inverse probability of hitting a mine
      const riskFactor = tilesRemaining / safeTilesRemaining;
      multiplier *= riskFactor;
    }

    // Apply difficulty-based scaling
    // More mines = higher base multiplier
    const difficultyMultiplier = this.getDifficultyMultiplier();
    this.multiplier = Math.max(1, multiplier * difficultyMultiplier);
    
    // Round to 2 decimal places for cleaner display
    this.multiplier = Math.round(this.multiplier * 100) / 100;
  }

  /**
   * Get difficulty multiplier based on mine count
   */
  private getDifficultyMultiplier(): number {
    switch (this.mineCount) {
      case 3:
        return 0.9; // Lower multiplier for easy mode
      case 5:
        return 1.0; // Standard multiplier for medium
      case 10:
        return 1.15; // Higher multiplier for hard mode
      default:
        return 1.0;
    }
  }

  /**
   * Reveal all tiles (on game end)
   */
  private revealAll(): void {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col].revealed = true;
      }
    }
  }
}
