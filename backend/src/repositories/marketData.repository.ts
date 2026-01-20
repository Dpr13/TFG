import prices from '../data/prices.json';
import assets from '../data/assets.json';
import { Price } from '../models/price';
import { Asset } from '../models/asset';

/**
 * Repository layer for market data access
 * Encapsulates data source logic (currently mock JSON files)
 * Can be easily replaced with API calls or database queries in the future
 */
export class MarketDataRepository {
  /**
   * Get all available assets
   */
  static getAllAssets(): Asset[] {
    return assets as Asset[];
  }

  /**
   * Get asset by symbol
   */
  static getAssetBySymbol(symbol: string): Asset | undefined {
    return (assets as Asset[]).find(
      (asset) => asset.symbol.toUpperCase() === symbol.toUpperCase()
    );
  }

  /**
   * Get price history for a specific asset
   */
  static getPriceHistoryByAssetId(assetId: string): Price[] {
    return (prices as Price[]).filter((price) => price.assetId === assetId);
  }

  /**
   * Get price history for a specific asset by symbol
   */
  static getPriceHistoryBySymbol(symbol: string): Price[] {
    const asset = this.getAssetBySymbol(symbol);
    if (!asset) {
      return [];
    }
    return this.getPriceHistoryByAssetId(asset.id);
  }
}