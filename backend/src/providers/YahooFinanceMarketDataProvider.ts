import axios from 'axios';
import { MarketDataProvider } from './interfaces/MarketDataProvider';

/**
 * Yahoo Finance API response types
 */
interface YahooFinanceChartResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        currency: string;
        regularMarketPrice: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
    }>;
    error: null | {
      code: string;
      description: string;
    };
  };
}

/**
 * Yahoo Finance implementation of MarketDataProvider
 * Fetches real market data from Yahoo Finance API (free, no API key required)
 * Supports both stocks and cryptocurrencies
 */
export class YahooFinanceMarketDataProvider implements MarketDataProvider {
  private readonly baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
  private readonly cryptoSymbols = ['BTC', 'ETH', 'BITCOIN', 'ETHEREUM'];

  /**
   * Check if symbol is a cryptocurrency
   */
  private isCrypto(symbol: string): boolean {
    return this.cryptoSymbols.includes(symbol.toUpperCase());
  }

  /**
   * Get Yahoo Finance symbol format
   * Converts 'BTC' to 'BTC-USD', 'AAPL' stays as 'AAPL'
   */
  private getYahooSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    if (this.isCrypto(upperSymbol)) {
      // Para criptomonedas, usar formato BTC-USD
      if (upperSymbol === 'BITCOIN') return 'BTC-USD';
      if (upperSymbol === 'ETHEREUM') return 'ETH-USD';
      return `${upperSymbol}-USD`;
    }
    return upperSymbol;
  }

  /**
   * Get historical prices from Yahoo Finance API
   * @param symbol - Stock symbol (e.g., 'AAPL', 'GOOGL') or crypto (e.g., 'BTC', 'ETH')
   * @returns Array of historical prices ordered by date, or null if not found
   */
  async getHistoricalPrices(
    symbol: string
  ): Promise<Array<{ date: string; close: number }> | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      
      const response = await axios.get<YahooFinanceChartResponse>(
        `${this.baseUrl}/${yahooSymbol}`,
        {
          params: {
            interval: '1d',      // Daily data
            range: '1y',         // Last year
            includePrePost: false
          },
          timeout: 10000,
        }
      );

      if (response.data.chart.error) {
        console.error(
          `Yahoo Finance API error for ${symbol}: ${response.data.chart.error.description}`
        );
        return null;
      }

      const result = response.data.chart.result[0];

      if (!result || !result.timestamp || result.timestamp.length === 0) {
        console.error(`No data found for symbol: ${symbol}`);
        return null;
      }

      const timestamps = result.timestamp;
      const closes = result.indicators.quote[0].close;

      // Convert timestamps to dates and pair with close prices
      const prices = timestamps
        .map((timestamp, index) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          close: closes[index],
        }))
        .filter(price => price.close !== null && !isNaN(price.close));

      // Sort by date ascending
      prices.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return prices;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `HTTP error fetching data from Yahoo Finance for ${symbol}:`,
          error.message
        );
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        throw new Error(
          `Failed to fetch data from Yahoo Finance: ${error.message}`
        );
      }
      console.error('Unexpected error fetching Yahoo Finance data:', error);
      throw error;
    }
  }

  /**
   * Get latest price for a symbol
   * @param symbol - Stock or crypto symbol
   * @returns Latest price or null if not found
   */
  async getLatestPrice(symbol: string): Promise<number | null> {
    const prices = await this.getHistoricalPrices(symbol);
    if (!prices || prices.length === 0) {
      return null;
    }
    return prices[prices.length - 1].close;
  }

  /**
   * Check if Yahoo Finance service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try fetching a common symbol to verify service availability
      const result = await this.getLatestPrice('AAPL');
      return result !== null;
    } catch (error) {
      console.error('Yahoo Finance health check failed:', error);
      return false;
    }
  }
}
