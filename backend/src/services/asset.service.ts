import { MarketDataRepository } from '../repositories/marketData.repository';
import { Asset } from '../models/asset';

/**
 * Service layer for asset operations
 * Uses repository for data access
 */
export class AssetService {
  static getAllAssets(): Asset[] {
    return MarketDataRepository.getAllAssets();
  }
}
