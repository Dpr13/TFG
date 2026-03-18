import yahooFinanceDefault from 'yahoo-finance2';
import { MarketDataProvider } from './interfaces/MarketDataProvider';
import { FinancialData, StockFinancialData, CryptoFinancialData } from '../models/financialData';

// Initialize the YahooFinance class instance required for yahoo-finance2 v3+
const yahooFinance: any = new (yahooFinanceDefault as any)({ suppressNotices: ['yahooSurvey'] });

/**
 * Yahoo Finance implementation of MarketDataProvider
 * Fetches real market data using the official yahoo-finance2 library
 * Handles required crumb/authentication automatically under the hood
 */
export class YahooFinanceMarketDataProvider implements MarketDataProvider {
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
      if (upperSymbol === 'BITCOIN') return 'BTC-USD';
      if (upperSymbol === 'ETHEREUM') return 'ETH-USD';
      if (!upperSymbol.includes('-')) return `${upperSymbol}-USD`;
    }
    return upperSymbol;
  }

  /**
   * Get historical prices
   */
  async getHistoricalPrices(
    symbol: string,
    interval: string = '1d',
    range: string = '1y'
  ): Promise<Array<{ date: string; close: number }> | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);

      const intervalMap: Record<string, '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo'> = {
        '1min': '1m', '2min': '2m', '5min': '5m', '15min': '15m',
        '30min': '30m', '1h': '60m', '4h': '60m', '12h': '60m',
        '1d': '1d', '1wk': '1wk', '1mo': '1mo', '3mo': '3mo',
      };
      const mappedInterval = intervalMap[interval] || '1d';
      
      // Auto-determine range if not provided or if user provided range is incompatible with interval
      // For short intervals, we need shorter ranges
      let effectiveRange = range;
      if (!range || range === '1y') {
        if (['1m', '2m', '5m', '15m', '30m'].includes(mappedInterval)) {
          effectiveRange = '5d'; // Intraday data typically available for last 5 days
        } else if (['60m'].includes(mappedInterval)) {
          effectiveRange = '2y'; // Hourly data for last 2 years (supports 4h and 12h aggregations)
        } else if (['90m'].includes(mappedInterval)) {
          effectiveRange = '2y'; // 90m data for last 2 years
        } else if (['1d'].includes(mappedInterval)) {
          effectiveRange = '1y'; // Daily data for last year
        } else if (['5d', '1wk'].includes(mappedInterval)) {
          effectiveRange = '2y'; // Weekly/5-day for last 2 years
        } else if (['1mo', '3mo'].includes(mappedInterval)) {
          effectiveRange = '5y'; // Monthly data for last 5 years
        }
      }

      const now = new Date();
      let period1 = new Date();
      
      switch (effectiveRange) {
        case '1d': period1.setDate(now.getDate() - 1); break;
        case '5d': period1.setDate(now.getDate() - 5); break;
        case '1mo': period1.setMonth(now.getMonth() - 1); break;
        case '3mo': period1.setMonth(now.getMonth() - 3); break;
        case '6mo': period1.setMonth(now.getMonth() - 6); break;
        case 'ytd': period1 = new Date(now.getFullYear(), 0, 1); break;
        case '1y': period1.setFullYear(now.getFullYear() - 1); break;
        case '2y': period1.setFullYear(now.getFullYear() - 2); break;
        case '3y': period1.setFullYear(now.getFullYear() - 3); break;
        case '5y': period1.setFullYear(now.getFullYear() - 5); break;
        case '10y': period1.setFullYear(now.getFullYear() - 10); break;
        case 'max': period1 = new Date('1970-01-01'); break;
        default: period1.setFullYear(now.getFullYear() - 1);
      }

      const queryOptions: any = { period1, interval: mappedInterval };
      
      console.log(`[YahooFinance] Requesting chart for ${yahooSymbol}, interval: ${interval} (mapped: ${mappedInterval}), effectiveRange: ${effectiveRange}`);
      const result: any = await yahooFinance.chart(yahooSymbol, queryOptions);
      
      if (!result || !result.quotes || result.quotes.length === 0) {
        console.warn(`[YahooFinance] No price data received for ${symbol} (${yahooSymbol}). Result:`, result ? (result.quotes ? `${result.quotes.length} quotes` : 'no quotes field') : 'null result');
        return null;
      }

      console.log(`[YahooFinance] Successfully fetched ${result.quotes.length} quotes for ${symbol} with interval ${interval}`);
      const prices = result.quotes
        .filter((q: any) => q.close !== null && !isNaN(q.close as number))
        .map((q: any) => ({
          date: q.date instanceof Date ? q.date.toISOString() : new Date(q.date).toISOString(),
          close: q.close as number,
        }));
        
      return prices.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[YahooFinance] Exception fetching historical prices for ${symbol}:`, errorMsg);
      return null;
    }
  }

  /**
   * Get latest price
   */
  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      const quote: any = await yahooFinance.quote(yahooSymbol);
      return quote?.regularMarketPrice ?? null;
    } catch (error) {
       console.error(`Error fetching latest price for ${symbol}:`, error);
       return null;
    }
  }

  /**
   * Validate symbol
   */
  async validateSymbol(symbol: string): Promise<{ symbol: string; name: string; type: 'stock' | 'crypto' | 'forex' } | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      console.log(`[YahooFinance] Validating symbol: ${symbol} -> ${yahooSymbol}`);
      const quote: any = await yahooFinance.quote(yahooSymbol);
      
      if (!quote) {
        console.warn(`[YahooFinance] Quote validation returned null for ${yahooSymbol}`);
        return null;
      }

      const upperSymbol = symbol.toUpperCase();
      const isCryptoAsset = this.isCrypto(upperSymbol) || quote.quoteType === 'CRYPTOCURRENCY';
      const result: { symbol: string; name: string; type: 'stock' | 'crypto' | 'forex' } = {
        symbol: upperSymbol,
        name: quote.shortName || quote.longName || upperSymbol,
        type: isCryptoAsset ? 'crypto' : 'stock',
      };
      
      console.log(`[YahooFinance] Symbol validated successfully: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[YahooFinance] Symbol validation failed for ${symbol}:`, errorMsg);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.getLatestPrice('AAPL');
      return result !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get financial data (Now using yahoo-finance2 quoteSummary to dodge 401 Unauthorized errors)
   */
  async getFinancialData(symbol: string): Promise<FinancialData | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      const isCryptoAsset = this.isCrypto(symbol);

      const modules = isCryptoAsset
        ? ['price', 'summaryDetail'] as const
        : ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData'] as const;

      const data: any = await yahooFinance.quoteSummary(yahooSymbol, { modules: modules as any } as any);

      if (!data) {
        console.error(`No financial data found for symbol: ${symbol}`);
        return null;
      }

      const price = data.price || {};
      const summaryDetail = data.summaryDetail || {};
      
      if (isCryptoAsset) {
        return {
          symbol: symbol.toUpperCase(),
          marketCap: price.marketCap || summaryDetail.marketCap,
          volume24h: summaryDetail.volume24Hr || summaryDetail.volume || summaryDetail.averageVolume,
          circulatingSupply: price.circulatingSupply,
          totalSupply: price.circulatingSupply, 
          maxSupply: undefined,
          fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow,
          allTimeHigh: undefined,
          allTimeLow: undefined,
          athDate: undefined,
          atlDate: undefined,
          lastUpdated: new Date().toISOString(),
        } as CryptoFinancialData;
      } else {
        const keyStats = data.defaultKeyStatistics || {};
        const financialData = data.financialData || {};

        return {
          symbol: symbol.toUpperCase(),
          marketCap: price.marketCap || summaryDetail.marketCap,
          enterpriseValue: keyStats.enterpriseValue,
          peRatio: summaryDetail.trailingPE || keyStats.trailingPE,
          pegRatio: keyStats.pegRatio,
          priceToSales: keyStats.priceToSalesTrailing12Months,
          priceToBook: keyStats.priceToBook,
          evToEbitda: keyStats.enterpriseToEbitda,
          eps: keyStats.trailingEps || summaryDetail.trailingEps,
          dividendYield: summaryDetail.dividendYield || keyStats.yield,
          beta: keyStats.beta || summaryDetail.beta,
          roe: financialData.returnOnEquity,
          roa: financialData.returnOnAssets,
          profitMargin: financialData.profitMargins,
          operatingMargin: financialData.operatingMargins,
          fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow,
          averageVolume: summaryDetail.averageVolume || summaryDetail.averageVolume10days,
          sharesOutstanding: keyStats.sharesOutstanding,
          lastUpdated: new Date().toISOString(),
        } as StockFinancialData;
      }
    } catch (error) {
      console.error(`Error fetching financial data from yahoo-finance2 for ${symbol}:`, error);
      return null;
    }
  }
}
