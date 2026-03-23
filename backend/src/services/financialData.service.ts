import { MarketDataProvider } from '../providers/interfaces/MarketDataProvider';
import { ProviderFactory } from '../providers/ProviderFactory';
import { CryptoFinancialData, FinancialData, StockFinancialData } from '../models/financialData';
import { MarketDataRepository } from '../repositories/marketData.repository';

/**
 * Service layer for financial data operations
 * Contains business logic for retrieving financial information
 * Uses MarketDataProvider for data access
 */
export class FinancialDataService {
  private provider: MarketDataProvider;

  constructor(provider?: MarketDataProvider) {
    // Use injected provider or get from factory
    this.provider = provider || ProviderFactory.getMarketDataProvider();
  }

  /**
   * Get financial data for a given symbol
   * Returns comprehensive financial information including valuation metrics,
   * financial highlights, and market data
   */
  async getFinancialData(symbol: string): Promise<FinancialData | null> {
    try {
      const financialData = await this.provider.getFinancialData(symbol);
      return financialData;
    } catch (err) {
      if (err instanceof Error && err.message === 'PROVIDER_UNAVAILABLE') {
        // Yahoo Finance no está accesible: devolver un placeholder para activos conocidos
        const asset = await MarketDataRepository.getAssetBySymbol(symbol);
        if (!asset) {
          return null;
        }

        if (asset.type === 'crypto') {
          const cryptoData: CryptoFinancialData = {
            symbol: asset.symbol.toUpperCase(),
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
        }

        const stockData: StockFinancialData = {
          symbol: asset.symbol.toUpperCase(),
          marketCap: undefined,
          peRatio: undefined,
          eps: undefined,
          lastUpdated: new Date().toISOString(),
        };
        return stockData;
      }

      throw err;
    }
  }
}
