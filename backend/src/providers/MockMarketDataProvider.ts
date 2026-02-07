import { MarketDataProvider } from './interfaces/MarketDataProvider';
import { MarketDataRepository } from '../repositories/marketData.repository';
import { Price } from '../models/price';

/**
 * Mock implementation of MarketDataProvider
 * Uses local JSON files as data source
 * Useful for development and testing without external API calls
 */
export class MockMarketDataProvider implements MarketDataProvider {
  /**
   * Get historical prices from local JSON files
   */
  async getHistoricalPrices(
    symbol: string
  ): Promise<Array<{ date: string; close: number }> | null> {
    const asset = MarketDataRepository.getAssetBySymbol(symbol);

    if (!asset) {
      return null;
    }

    const priceHistory = MarketDataRepository.getPriceHistoryBySymbol(symbol);

    // Transform to standard format
    const prices = priceHistory.map((p: Price) => ({
      date: p.date,
      close: p.price,
    }));

    return prices;
  }
}
