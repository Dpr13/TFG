import { MarketDataRepository } from '../repositories/marketData.repository';
import { Asset } from '../models/asset';
import { YahooFinanceMarketDataProvider } from '../providers/YahooFinanceMarketDataProvider';

/**
 * Service layer for asset operations
 * Uses repository for data access
 */
export class AssetService {
  static async getAllAssets(): Promise<Asset[]> {
    return await MarketDataRepository.getAllAssets();
  }

  static async searchAsset(symbol: string): Promise<Asset | null> {
    return await MarketDataRepository.searchAssetBySymbol(symbol);
  }

  static async autocomplete(query: string): Promise<{ symbol: string; name: string; type: string; exchange: string }[]> {
    if (!query || query.trim().length < 1) return [];
    const provider = new YahooFinanceMarketDataProvider();
    return provider.searchSymbols(query.trim());
  }
}
