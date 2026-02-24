import { MarketDataRepository } from '../repositories/marketData.repository';
import { Asset } from '../models/asset';

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
}
