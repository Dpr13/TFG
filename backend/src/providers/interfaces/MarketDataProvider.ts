/**
 * Interface for market data providers
 * Defines the contract for obtaining historical price data
 * Implementations can use mock data, external APIs, databases, etc.
 */
export interface MarketDataProvider {
  /**
   * Get historical prices for a given symbol
   * @param symbol - Asset symbol (e.g., 'AAPL', 'BTC')
   * @returns Array of historical prices with date and close price
   *          Returns null if the asset is not found
   */
  getHistoricalPrices(
    symbol: string
  ): Promise<Array<{ date: string; close: number }> | null>;
}
