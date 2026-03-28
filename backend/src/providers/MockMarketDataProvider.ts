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
    interval?: string,
    range?: string
  ): Promise<Array<{ date: string; open?: number; high?: number; low?: number; close: number; volume?: number }> | null> {
    const asset = await MarketDataRepository.getAssetBySymbol(symbol);

    if (!asset) {
      return null;
    }

    // Usar el JSON local (no Yahoo Finance)
    let priceHistory = MarketDataRepository.getPriceHistoryByAssetId(symbol.toUpperCase());

    // Filtrar por interval si se proporciona
    if (interval) {
      priceHistory = filterByInterval(priceHistory, interval);
      priceHistory = limitByInterval(priceHistory, interval);
    }

    // Transform to standard format
    const prices = priceHistory.map((p: Price) => ({
      date: p.date,
      open: p.price,
      high: p.price,
      low: p.price,
      close: p.price,
      volume: 0,
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
    '12h': 720,
    '1d': 1440,
  };
  const step = intervalMap[interval] || 1;
  return prices.filter((_, idx) => idx % step === 0);
}

// Limita la cantidad de datos según el intervalo para coherencia
function limitByInterval(prices: Price[], interval: string): Price[] {
  // Limitar a un número razonable de puntos según el intervalo
  const limitMap: Record<string, number> = {
    '5min': 288,   // 24 horas (288 puntos de 5 min)
    '15min': 480,  // 5 días (96 puntos/día × 5)
    '30min': 480,  // 5 días (48 puntos/día × 5)
    '1h': 720,     // 30 días (24 puntos/día × 30)
    '4h': 180,     // 30 días (6 puntos/día × 30)
    '12h': 120,    // 60 días (2 puntos/día × 60)
    '1d': 90,      // 90 días
    '1wk': 52,     // 1 año (52 semanas)
    '1mo': 60,     // 5 años (12 meses × 5)
  };
  
  const limit = limitMap[interval];
  if (limit && prices.length > limit) {
    // Tomar los últimos N elementos
    return prices.slice(-limit);
  }
  
  return prices;
}
