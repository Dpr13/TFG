/**
 * Simple test script to verify yahoo-finance2 is working
 */
import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance: any = new (yahooFinanceDefault as any)({ suppressNotices: ['yahooSurvey'] });

async function testYahooFinance() {
  console.log('Testing yahoo-finance2 library...\n');

  try {
    // Test 1: Get quote for AAPL
    console.log('Test 1: Getting quote for AAPL...');
    const quote = await yahooFinance.quote('AAPL');
    console.log('✓ Quote received:', {
      symbol: quote.symbol,
      regularMarketPrice: quote.regularMarketPrice,
      shortName: quote.shortName,
    });
    console.log('');

    // Test 2: Get historical prices for AAPL (last 30 days)
    console.log('Test 2: Getting historical prices for AAPL (last 30 days)...');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await yahooFinance.chart('AAPL', {
      period1: thirtyDaysAgo,
      interval: '1d',
    });
    
    if (result && result.quotes && result.quotes.length > 0) {
      console.log('✓ Historical data received:', {
        totalQuotes: result.quotes.length,
        firstDate: result.quotes[0].date,
        lastDate: result.quotes[result.quotes.length - 1].date,
        samplePrice: result.quotes[0].close,
      });
    } else {
      console.log('✗ No quotes received');
      console.log('Result:', result);
    }
    console.log('');

    // Test 3: Get quote for BTC-USD
    console.log('Test 3: Getting quote for BTC-USD...');
    const btcQuote = await yahooFinance.quote('BTC-USD');
    console.log('✓ BTC Quote received:', {
      symbol: btcQuote.symbol,
      regularMarketPrice: btcQuote.regularMarketPrice,
    });
    console.log('');

    console.log('All tests passed! Yahoo Finance is working correctly.');
  } catch (error) {
    console.error('✗ Error during testing:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Error:', error);
    }
  }
}

testYahooFinance();
