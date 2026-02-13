/**
 * Base Game Engine
 * Abstract class that all games extend
 */

export abstract class GameEngine {
  protected bet: number = 0;
  protected result: 'win' | 'loss' | 'push' | null = null;
  protected payout: number = 0;

  /**
   * Initialize a new game
   * TODO: Implement game initialization
   */
  abstract init(): void;

  /**
   * Start the game with a bet
   * TODO: Implement betting logic
   */
  start(bet: number): void {
    this.bet = bet;
    this.result = null;
    this.payout = 0;
    // TODO: Validate bet amount
    // TODO: Deduct bet from user coins
  }

  /**
   * Calculate payout based on game outcome
   * TODO: Implement payout calculation
   */
  abstract calculatePayout(): number;

  /**
   * End the game and return results
   * TODO: Implement game end logic
   */
  end(): { result: 'win' | 'loss' | 'push'; payout: number } {
    this.payout = this.calculatePayout();
    // TODO: Update user coins
    // TODO: Record game in history
    return {
      result: this.result!,
      payout: this.payout,
    };
  }

  /**
   * Get current game state
   */
  abstract getState(): any;

  /**
   * Reset game to initial state
   */
  abstract reset(): void;
}
