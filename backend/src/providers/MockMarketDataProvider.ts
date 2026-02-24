import { MarketDataProvider } from './interfaces/MarketDataProvider';
import { MarketDataRepository } from '../repositories/marketData.repository';
import { Price } from '../models/price';
import { FinancialData, StockFinancialData, CryptoFinancialData } from '../models/financialData';

/**
 * Mock implementation of MarketDataProvider
 * Uses local JSON files as data source
 * Useful for development and testing without external API calls
 */
export class MockMarketDataProvider implements MarketDataProvider {
  /**
   * Get historical prices from local JSON files, filtered by interval if provided
   */
  async getHistoricalPrices(
    symbol: string,
    interval?: string
  ): Promise<Array<{ date: string; close: number }> | null> {
    const asset = await MarketDataRepository.getAssetBySymbol(symbol);

    if (!asset) {
      return null;
    }

    let priceHistory = await MarketDataRepository.getPriceHistoryBySymbol(symbol);

    // Filtrar por interval si se proporciona
    if (interval) {
      priceHistory = filterByInterval(priceHistory, interval);
    }

    // Transform to standard format
    const prices = priceHistory.map((p: Price) => ({
      date: p.date,
      close: p.price,
    }));

    return prices;
  }

  /**
   * Get mock financial data
   * Returns null as mock data doesn't include financial information
   */
  async getFinancialData(symbol: string): Promise<FinancialData | null> {
    const asset = await MarketDataRepository.getAssetBySymbol(symbol);

    if (!asset) {
      return null;
    }

    // Return mock data with some example values
    if (asset.type === 'crypto') {
      const cryptoData: CryptoFinancialData = {
        symbol: symbol.toUpperCase(),
        marketCap: undefined,
        volume24h: undefined,
        circulatingSupply: undefined,
        totalSupply: undefined,
        maxSupply: undefined,
        fiftyTwoWeekHigh: undefined,
        fiftyTwoWeekLow: undefined,
        lastUpdated: new Date().toISOString(),
      };
      return cryptoData;
    } else {
      const stockData: StockFinancialData = {
        symbol: symbol.toUpperCase(),
        marketCap: undefined,
        peRatio: undefined,
        eps: undefined,
        lastUpdated: new Date().toISOString(),
      };
      return stockData;
    }
  }
}

// Filtra un array de precios por el intervalo solicitado
function filterByInterval(prices: Price[], interval: string): Price[] {
  // Ejemplo simple: filtrar cada N elementos según el intervalo
  // (En producción, se debería agrupar por tiempo real)
  const intervalMap: Record<string, number> = {
    '1min': 1,
    '5min': 5,
    '10min': 10,
    '15min': 15,
    '30min': 30,
    '1h': 60,
    '4h': 240,
    '1d': 1440,
  };
  const step = intervalMap[interval] || 1;
  return prices.filter((_, idx) => idx % step === 0);
}
