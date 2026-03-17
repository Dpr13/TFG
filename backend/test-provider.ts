/**
 * Test the exact flow of YahooFinanceMarketDataProvider
 */
import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance: any = new (yahooFinanceDefault as any)({ suppressNotices: ['yahooSurvey'] });

class TestProvider {
  private readonly cryptoSymbols = ['BTC', 'ETH', 'BITCOIN', 'ETHEREUM'];

  private isCrypto(symbol: string): boolean {
    return this.cryptoSymbols.includes(symbol.toUpperCase());
  }

  private getYahooSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    if (this.isCrypto(upperSymbol)) {
      if (upperSymbol === 'BITCOIN') return 'BTC-USD';
      if (upperSymbol === 'ETHEREUM') return 'ETH-USD';
      if (!upperSymbol.includes('-')) return `${upperSymbol}-USD`;
    }
    return upperSymbol;
  }

  async getHistoricalPrices(
    symbol: string,
    interval: string = '1d',
    range: string = '1y'
  ): Promise<Array<{ date: string; close: number }> | null> {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      const intervalMap: Record<string, '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo'> = {
        '1min': '1m', '2min': '2m', '5min': '5m', '15min': '15m',
        '30min': '30m', '1h': '60m', '4h': '60m', '12h': '90m',
        '1d': '1d', '1wk': '1wk', '1mo': '1mo', '3mo': '3mo',
      };
      const mappedInterval = intervalMap[interval] || '1d';
      
      const now = new Date();
      let period1 = new Date();
      
      switch (range) {
        case '1d': period1.setDate(now.getDate() - 1); break;
        case '5d': period1.setDate(now.getDate() - 5); break;
        case '1mo': period1.setMonth(now.getMonth() - 1); break;
        case '3mo': period1.setMonth(now.getMonth() - 3); break;
        case '6mo': period1.setMonth(now.getMonth() - 6); break;
        case 'ytd': period1 = new Date(now.getFullYear(), 0, 1); break;
        case '1y': period1.setFullYear(now.getFullYear() - 1); break;
        case '2y': period1.setFullYear(now.getFullYear() - 2); break;
        case '5y': period1.setFullYear(now.getFullYear() - 5); break;
        case '10y': period1.setFullYear(now.getFullYear() - 10); break;
        case 'max': period1 = new Date('1970-01-01'); break;
        default: period1.setFullYear(now.getFullYear() - 1);
      }

      const queryOptions: any = { period1, interval: mappedInterval };
      
      console.log(`[Test] Requesting chart for ${yahooSymbol} with options:`, {
        interval: mappedInterval,
        period1: period1.toISOString(),
      });
      
      const result: any = await yahooFinance.chart(yahooSymbol, queryOptions);
      
      if (!result || !result.quotes || result.quotes.length === 0) {
        console.warn(`[Test] No price data received for ${symbol} (${yahooSymbol})`);
        return null;
      }

      console.log(`[Test] Successfully fetched ${result.quotes.length} quotes for ${symbol}`);
      const prices = result.quotes
        .filter((q: any) => q.close !== null && !isNaN(q.close as number))
        .map((q: any) => ({
          date: q.date instanceof Date ? q.date.toISOString() : new Date(q.date).toISOString(),
          close: q.close as number,
        }));
        
      return prices.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Test] Exception fetching historical prices for ${symbol}:`, errorMsg);
      return null;
    }
  }
}

async function test() {
  const provider = new TestProvider();
  
  console.log('Testing TestProvider.getHistoricalPrices...\n');
  
  try {
    const result = await provider.getHistoricalPrices('AAPL', '5min');
    if (result) {
      console.log('✓ Success! Got', result.length, 'prices');
      console.log('First 3 prices:', result.slice(0, 3));
    } else {
      console.log('✗ Returned null');
    }
  } catch (error) {
    console.error('✗ Error:', error);
  }
}

test();
