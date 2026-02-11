/**
 * Interface for market data providers
 * Defines the contract for obtaining historical price data
 * Implementations can use mock data, external APIs, databases, etc.
 */
export interface MarketDataProvider {
  /**
   * Get historical prices for a given symbol and interval
   * @param symbol - Asset symbol (e.g., 'AAPL', 'BTC')
   * @param interval - Interval (e.g., '1min', '5min', '1h', '1d')
   * @returns Array of historical prices with date and close price
   *          Returns null if the asset is not found
   */
  getHistoricalPrices(
    symbol: string,
    interval?: string
  ): Promise<Array<{ date: string; close: number }> | null>;
}
