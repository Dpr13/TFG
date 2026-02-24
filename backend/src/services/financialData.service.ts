import { MarketDataProvider } from '../providers/interfaces/MarketDataProvider';
import { ProviderFactory } from '../providers/ProviderFactory';
import { FinancialData } from '../models/financialData';

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
    const financialData = await this.provider.getFinancialData(symbol);

    if (!financialData) {
      return null;
    }

    return financialData;
  }
}
