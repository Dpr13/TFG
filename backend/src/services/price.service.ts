import { MarketDataProvider } from '../providers/interfaces/MarketDataProvider';
import { ProviderFactory } from '../providers/ProviderFactory';

/**
 * Service layer for price history operations
 * Contains business logic (minimal for now, prepared for future risk calculations)
 * Uses MarketDataProvider for data access (mock or external API)
 */
export class PriceService {
  private provider: MarketDataProvider;

  constructor(provider?: MarketDataProvider) {
    // Use injected provider or get from factory
    this.provider = provider || ProviderFactory.getMarketDataProvider();
  }

  /**
   * Get price history for a given symbol and interval
   * Returns prices ordered by date
   */
  async getPriceHistory(symbol: string, interval?: string, range?: string): Promise<{
    symbol: string;
    interval?: string;
    range?: string;
    prices: Array<{ date: string; close: number }>;
  } | null> {
    const prices = await this.provider.getHistoricalPrices(symbol, interval, range);
    if (!prices) {
      return null;
    }
    return {
      symbol: symbol.toUpperCase(),
      interval,
      range,
      prices,
    };
  }
}
