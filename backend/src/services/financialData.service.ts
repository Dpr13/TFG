import { MarketDataProvider } from '../providers/interfaces/MarketDataProvider';
import { ProviderFactory } from '../providers/ProviderFactory';
import { CryptoFinancialData, FinancialData, StockFinancialData } from '../models/financialData';
import { MarketDataRepository } from '../repositories/marketData.repository';

type CacheEntry = {
  data: FinancialData;
  timestamp: number;
};

/**
 * Service layer for financial data operations
 * Contains business logic for retrieving financial information
 * Uses MarketDataProvider for data access
 */
export class FinancialDataService {
  private provider: MarketDataProvider;

  private cache = new Map<string, CacheEntry>();

  private pending = new Map<string, Promise<FinancialData | null>>();

  private TTL = 60 * 1000;

  constructor(provider?: MarketDataProvider) {
    this.provider = provider || ProviderFactory.getMarketDataProvider();
  }

  async getFinancialData(symbol: string): Promise<FinancialData | null> {
    const key = symbol.toUpperCase();

    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.TTL)) {
      return cached.data;
    }

    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const request = this.fetchAndCache(key);

    this.pending.set(key, request);

    try {
      const result = await request;
      return result;
    } finally {
      this.pending.delete(key);
    }
  }

  private async fetchAndCache(symbol: string): Promise<FinancialData | null> {
    try {
      const data = await this.provider.getFinancialData(symbol);

      if (data) {
        this.cache.set(symbol, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;

    } catch (err: any) {
      if (
        err instanceof Error &&
        (err.message.includes('429') || err.message.includes('Too Many Requests'))
      ) {
        console.warn(`Rate limit alcanzado para ${symbol}`);

        const cached = this.cache.get(symbol);
        if (cached) {
          return cached.data;
        }

        return null;
      }

      throw err;
    }
  }
}