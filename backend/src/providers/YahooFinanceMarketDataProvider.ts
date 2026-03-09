import axios from 'axios';
import { MarketDataProvider } from './interfaces/MarketDataProvider';
import { FinancialData, StockFinancialData, CryptoFinancialData } from '../models/financialData';

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
   * @param interval - Interval (e.g., '1min', '5min', '1h', '1d')
   * @returns Array of historical prices ordered by date, or null if not found
   */
  async getHistoricalPrices(
    symbol: string,
    interval: string = '1d',
    range: string = '1y'
  ): Promise<Array<{ date: string; close: number }> | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      // Validar y mapear intervalos soportados por Yahoo Finance
      const allowedIntervals = ['1m','2m','5m','15m','30m','60m','90m','1d','5d','1wk','1mo','3mo'];
      // Mapear intervalos de usuario a los de Yahoo
      const intervalMap: Record<string, string> = {
        '1min': '1m',
        '2min': '2m',
        '5min': '5m',
        '15min': '15m',
        '30min': '30m',
        '1h': '60m',
        '4h': '60m', // Yahoo no soporta 4h, usar 1h
        '12h': '90m', // Yahoo no soporta 12h, usar 90m (más cercano)
        '1d': '1d',
        '5h': '5h',
        '1wk': '1wk',
        '1mo': '1mo',
        '3mo': '3mo'
      };
      // Usar el rango directamente en la petición
      const response = await axios.get<YahooFinanceChartResponse>(
        `${this.baseUrl}/${this.getYahooSymbol(symbol)}`,
        {
          params: {
            interval,
            range,
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
      const prices = timestamps
        .map((timestamp, index) => {
          const dateObj = new Date(timestamp * 1000);
          const date = dateObj.toISOString().split('T')[0];
          return {
            date,
            close: closes[index],
          };
        })
        .filter(price => price.close !== null && !isNaN(price.close));
      prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return prices;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 4xx means the symbol doesn't exist or is invalid — treat as not found
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          console.error(`Symbol not found on Yahoo Finance: ${symbol} (status ${error.response.status})`);
          return null;
        }
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
   * Validate and get basic info for a symbol
   * @param symbol - Stock or crypto symbol to validate
   * @returns Asset info if valid, null if not found
   */
  async validateSymbol(symbol: string): Promise<{
    symbol: string;
    name: string;
    type: 'stock' | 'crypto' | 'forex';
  } | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      
      // Try to fetch latest data to verify symbol exists
      const response = await axios.get<YahooFinanceChartResponse>(
        `${this.baseUrl}/${yahooSymbol}`,
        {
          params: {
            interval: '1d',
            range: '5d',
          },
          timeout: 5000,
        }
      );

      if (response.data.chart.error || !response.data.chart.result[0]) {
        return null;
      }

      const result = response.data.chart.result[0];
      const upperSymbol = symbol.toUpperCase();
      
      return {
        symbol: upperSymbol,
        name: upperSymbol, // Yahoo Finance API básica no incluye nombres completos
        type: this.isCrypto(upperSymbol) ? 'crypto' : 'stock',
      };
    } catch (error) {
      console.error(`Failed to validate symbol ${symbol}:`, error);
      return null;
    }
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

  /**
   * Get financial data for a given symbol
   * Uses Yahoo Finance quoteSummary API to fetch detailed financial information
   * Falls back to basic data from chart endpoint if quoteSummary is unavailable (401 errors)
   * @param symbol - Stock or crypto symbol
   * @returns Financial data or null if not found
   */
  async getFinancialData(symbol: string): Promise<FinancialData | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      const isCryptoAsset = this.isCrypto(symbol);

      // Yahoo Finance quoteSummary endpoint provides detailed financial data
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}`,
        {
          params: {
            modules: isCryptoAsset 
              ? 'price,summaryDetail' 
              : 'price,summaryDetail,defaultKeyStatistics,financialData',
          },
          timeout: 10000,
        }
      );

      if (!response.data?.quoteSummary?.result?.[0]) {
        console.error(`No financial data found for symbol: ${symbol}`);
        return null;
      }

      const data = response.data.quoteSummary.result[0];
      const price = data.price || {};
      const summaryDetail = data.summaryDetail || {};
      const keyStats = data.defaultKeyStatistics || {};
      const financialData = data.financialData || {};

      if (isCryptoAsset) {
        // Crypto financial data
        const cryptoData: CryptoFinancialData = {
          symbol: symbol.toUpperCase(),
          marketCap: price.marketCap?.raw || summaryDetail.marketCap?.raw,
          volume24h: summaryDetail.volume?.raw || summaryDetail.averageVolume?.raw,
          circulatingSupply: price.circulatingSupply?.raw,
          totalSupply: price.circulatingSupply?.raw, // Crypto APIs often use same value
          maxSupply: undefined, // Not readily available in Yahoo Finance
          fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh?.raw,
          fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow?.raw,
          allTimeHigh: undefined, // Not available in Yahoo Finance
          allTimeLow: undefined,
          athDate: undefined,
          atlDate: undefined,
          lastUpdated: new Date().toISOString(),
        };
        return cryptoData;
      } else {
        // Stock financial data
        const stockData: StockFinancialData = {
          symbol: symbol.toUpperCase(),
          
          // Valuation Measures
          marketCap: price.marketCap?.raw || summaryDetail.marketCap?.raw,
          enterpriseValue: keyStats.enterpriseValue?.raw,
          peRatio: summaryDetail.trailingPE?.raw || keyStats.trailingPE?.raw,
          pegRatio: keyStats.pegRatio?.raw,
          priceToSales: keyStats.priceToSalesTrailing12Months?.raw,
          priceToBook: keyStats.priceToBook?.raw,
          evToEbitda: keyStats.enterpriseToEbitda?.raw,
          
          // Financial Highlights
          eps: keyStats.trailingEps?.raw,
          dividendYield: summaryDetail.dividendYield?.raw || keyStats.yield?.raw,
          beta: keyStats.beta?.raw || summaryDetail.beta?.raw,
          roe: financialData.returnOnEquity?.raw,
          roa: financialData.returnOnAssets?.raw,
          profitMargin: financialData.profitMargins?.raw,
          operatingMargin: financialData.operatingMargins?.raw,
          
          // Trading Info
          fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh?.raw,
          fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow?.raw,
          averageVolume: summaryDetail.averageVolume?.raw || summaryDetail.averageVolume10days?.raw,
          sharesOutstanding: keyStats.sharesOutstanding?.raw,
          
          lastUpdated: new Date().toISOString(),
        };
        return stockData;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If we get a 401 error, quoteSummary requires authentication
        // Fall back to basic data from chart endpoint
        if (error.response?.status === 401) {
          console.log(`quoteSummary endpoint requires auth for ${symbol}, using basic data from chart endpoint`);
          return this.getBasicFinancialDataFromChart(symbol);
        }
        
        console.error(
          `HTTP error fetching financial data from Yahoo Finance for ${symbol}:`,
          error.message
        );
        if (error.response) {
          console.error('Status:', error.response.status);
        }
      } else {
        console.error('Unexpected error fetching financial data:', error);
      }
      return null;
    }
  }

  /**
   * Get basic financial data from chart endpoint (fallback when quoteSummary is unavailable)
   * @param symbol - Stock or crypto symbol
   * @returns Basic financial data or null if not found
   */
  private async getBasicFinancialDataFromChart(symbol: string): Promise<FinancialData | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      const isCryptoAsset = this.isCrypto(symbol);

      console.log(`Fetching basic data from chart endpoint for ${symbol}`);

      // Fetch 1 year of daily data to calculate 52-week high/low
      const response = await axios.get<YahooFinanceChartResponse>(
        `${this.baseUrl}/${yahooSymbol}`,
        {
          params: {
            interval: '1d',
            range: '1y',
          },
          timeout: 10000,
        }
      );

      if (response.data.chart.error) {
        console.error(`Chart API error: ${response.data.chart.error.description}`);
        return null;
      }

      if (!response.data.chart.result[0]) {
        console.error('No chart data in response');
        return null;
      }

      const result = response.data.chart.result[0];
      const meta = result.meta;
      const closes = result.indicators.quote[0].close.filter((c: number) => c !== null && !isNaN(c));
      const volumes = result.indicators.quote[0].volume.filter((v: number) => v !== null && !isNaN(v));

      console.log(`Chart data: ${closes.length} price points, ${volumes.length} volume points`);

      if (closes.length === 0) {
        console.error('No valid close prices found');
        return null;
      }

      const fiftyTwoWeekHigh = Math.max(...closes);
      const fiftyTwoWeekLow = Math.min(...closes);
      const averageVolume = volumes.length > 0 
        ? volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length 
        : undefined;

      console.log(`Calculated: High=$${fiftyTwoWeekHigh}, Low=$${fiftyTwoWeekLow}, AvgVol=${averageVolume}`);

      if (isCryptoAsset) {
        const cryptoData: CryptoFinancialData = {
          symbol: symbol.toUpperCase(),
          marketCap: null,
          volume24h: volumes.length > 0 ? volumes[volumes.length - 1] : null,
          circulatingSupply: null,
          totalSupply: null,
          maxSupply: null,
          fiftyTwoWeekHigh,
          fiftyTwoWeekLow,
          allTimeHigh: null,
          allTimeLow: null,
          athDate: null,
          atlDate: null,
          lastUpdated: new Date().toISOString(),
        };
        console.log(`Returning crypto data for ${symbol}:`, JSON.stringify(cryptoData, null, 2));
        return cryptoData;
      } else {
        const stockData: StockFinancialData = {
          symbol: symbol.toUpperCase(),
          marketCap: null,
          enterpriseValue: null,
          peRatio: null,
          pegRatio: null,
          priceToSales: null,
          priceToBook: null,
          evToEbitda: null,
          eps: null,
          dividendYield: null,
          beta: null,
          roe: null,
          roa: null,
          profitMargin: null,
          operatingMargin: null,
          fiftyTwoWeekHigh,
          fiftyTwoWeekLow,
          averageVolume,
          sharesOutstanding: null,
          lastUpdated: new Date().toISOString(),
        };
        console.log(`Returning stock data for ${symbol}:`, JSON.stringify(stockData, null, 2));
        return stockData;
      }
    } catch (error) {
      console.error(`Error fetching basic financial data from chart for ${symbol}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response data:`, error.response.data);
      }
      return null;
    }
  }
}
