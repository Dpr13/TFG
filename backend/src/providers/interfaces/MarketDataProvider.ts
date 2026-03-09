import { FinancialData } from '../../models/financialData';

/**
 * Interface for market data providers
 * Defines the contract for obtaining historical price data and financial information
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
    interval?: string,
    range?: string
  ): Promise<Array<{ date: string; close: number }> | null>;

  /**
   * Get financial data for a given symbol
   * @param symbol - Asset symbol (e.g., 'AAPL', 'BTC')
   * @returns Financial data for the asset
   *          Returns null if the asset is not found or data is unavailable
   */
  getFinancialData(symbol: string): Promise<FinancialData | null>;
}
