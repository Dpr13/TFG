import prices from '../data/prices.json';
import { Price } from '../models/price';
import { Asset } from '../models/asset';
import { YahooFinanceMarketDataProvider } from '../providers/YahooFinanceMarketDataProvider';

/**
 * Repository layer for market data access
 * Encapsulates data source logic (currently mock JSON files)
 * Can be easily replaced with API calls or database queries in the future
 */
export class MarketDataRepository {
  /**
   * Centralized map of known asset names and types
   */
  private static readonly KNOWN_ASSETS: Record<string, { name: string; type: 'stock' | 'crypto' | 'forex' }> = {
    AAPL:  { name: 'Apple Inc.',                    type: 'stock'  },
    GOOGL: { name: 'Alphabet Inc.',                 type: 'stock'  },
    BTC:   { name: 'Bitcoin',                       type: 'crypto' },
    MSFT:  { name: 'Microsoft Corporation',         type: 'stock'  },
    AMZN:  { name: 'Amazon.com Inc.',               type: 'stock'  },
    TSLA:  { name: 'Tesla Inc.',                    type: 'stock'  },
    KO:    { name: 'The Coca-Cola Company',         type: 'stock'  },
    JPM:   { name: 'JPMorgan Chase & Co.',          type: 'stock'  },
    NVDA:  { name: 'NVIDIA Corporation',            type: 'stock'  },
    META:  { name: 'Meta Platforms Inc.',           type: 'stock'  },
    NFLX:  { name: 'Netflix Inc.',                  type: 'stock'  },
    DIS:   { name: 'The Walt Disney Company',       type: 'stock'  },
    PYPL:  { name: 'PayPal Holdings Inc.',          type: 'stock'  },
    INTC:  { name: 'Intel Corporation',             type: 'stock'  },
    AMD:   { name: 'Advanced Micro Devices Inc.',   type: 'stock'  },
    BA:    { name: 'The Boeing Company',            type: 'stock'  },
    ETH:   { name: 'Ethereum',                      type: 'crypto' },
  };

  /**
   * Get all available assets (suggested/popular assets)
   */
  static async getAllAssets(): Promise<Asset[]> {
    const symbols = ['AAPL', 'GOOGL', 'BTC', 'MSFT', 'AMZN', 'TSLA', 'KO', 'JPM', 'NVDA'];
    return symbols.map((symbol, idx) => ({
      id: (idx + 1).toString(),
      symbol,
      name: this.KNOWN_ASSETS[symbol]?.name || symbol,
      type: this.KNOWN_ASSETS[symbol]?.type ?? 'stock',
    }));
  }

  /**
   * Search for an asset by symbol using Yahoo Finance API
   * Allows searching any symbol, not just the predefined list
   */
  static async searchAssetBySymbol(symbol: string): Promise<Asset | null> {
    const provider = new YahooFinanceMarketDataProvider();
    const result = await provider.validateSymbol(symbol);

    if (!result) {
      return null;
    }

    const knownAsset = this.KNOWN_ASSETS[result.symbol];

    return {
      id: result.symbol,
      symbol: result.symbol,
      name: knownAsset?.name || result.name,
      type: knownAsset?.type || result.type,
    };
  }

  /**
   * Get asset by symbol (using Yahoo Finance, fallback to local if not found)
   */
  static async getAssetBySymbol(symbol: string): Promise<Asset | undefined> {
    // Intenta buscar usando Yahoo Finance
    const provider = new YahooFinanceMarketDataProvider();
    const result = await provider.validateSymbol(symbol);
    if (result) {
      const knownAsset = this.KNOWN_ASSETS[result.symbol];
      return {
        id: result.symbol,
        symbol: result.symbol,
        name: knownAsset?.name || result.name,
        type: knownAsset?.type || result.type,
      };
    }
    // Fallback a la lista local si Yahoo Finance no lo encuentra
    const all = await this.getAllAssets();
    return all.find((asset) => asset.symbol.toUpperCase() === symbol.toUpperCase());
  }

  /**
   * Get price history for a specific asset by assetId (from JSON file)
   */
  static getPriceHistoryByAssetId(assetId: string): Price[] {
    return (prices as Price[]).filter((price) => price.assetId === assetId);
  }

  /**
   * Get price history for a specific asset by symbol (using Yahoo Finance)
   */
  static async getPriceHistoryBySymbol(symbol: string, interval?: string, range?: string): Promise<Price[]> {
    const provider = new YahooFinanceMarketDataProvider();
    const prices = await provider.getHistoricalPrices(symbol, interval, range);
    if (!prices) {
      return [];
    }
    // Adaptar al modelo Price correctamente
    return prices.map((p) => ({
      assetId: symbol.toUpperCase(),
      date: p.date,
      price: p.close,
    }));
  }
}
