import { MarketDataProvider } from './interfaces/MarketDataProvider';
import { MockMarketDataProvider } from './MockMarketDataProvider';
import { YahooFinanceMarketDataProvider } from './YahooFinanceMarketDataProvider';
import { config } from '../config';

/**
 * Factory for creating MarketDataProvider instances
 * Centralized logic to instantiate the correct provider based on configuration
 */
export class ProviderFactory {
  private static instance: MarketDataProvider | null = null;

  /**
   * Get the configured MarketDataProvider instance (singleton)
   * Uses environment configuration to determine which provider to instantiate
   */
  static getMarketDataProvider(): MarketDataProvider {
    // Return existing instance if already created
    if (this.instance) {
      return this.instance;
    }

    // Create new instance based on configuration
    switch (config.marketDataProvider) {
      case 'yahoo-finance':
        console.log('Using Yahoo Finance market data provider (free, no API key required)');
        this.instance = new YahooFinanceMarketDataProvider();
        break;

      case 'mock':
      default:
        console.log('Using mock market data provider');
        this.instance = new MockMarketDataProvider();
        break;
    }

    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null;
  }
}
