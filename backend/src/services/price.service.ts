import { MarketDataRepository } from '../repositories/marketData.repository';
import { Price } from '../models/price';

/**
 * Service layer for price history operations
 * Contains business logic (minimal for now, prepared for future risk calculations)
 */
export class PriceService {
  /**
   * Get price history for a given symbol
   * Returns prices ordered by date
   */
  static getPriceHistory(symbol: string): {
    symbol: string;
    prices: Array<{ date: string; close: number }>;
  } | null {
    const asset = MarketDataRepository.getAssetBySymbol(symbol);
    
    if (!asset) {
      return null;
    }

    const priceHistory = MarketDataRepository.getPriceHistoryBySymbol(symbol);

    // Transform to response format
    const prices = priceHistory.map((p: Price) => ({
      date: p.date,
      close: p.price,
    }));

    return {
      symbol: asset.symbol,
      prices,
    };
  }
}
