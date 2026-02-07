/**
 * Example script demonstrating how to use MarketDataProviders
 * Run with: ts-node src/examples/provider-usage.ts
 */

import { MockMarketDataProvider, YahooFinanceMarketDataProvider } from '../providers';

async function exampleMockProvider() {
  console.log('\n=== Mock Provider Example ===\n');
  
  const mockProvider = new MockMarketDataProvider();
  
  // Get data for AAPL
  const applData = await mockProvider.getHistoricalPrices('AAPL');
  console.log('AAPL Data (first 3 prices):');
  console.log(applData?.slice(0, 3));
  
  // Try non-existent symbol
  const invalid = await mockProvider.getHistoricalPrices('INVALID');
  console.log('\nInvalid symbol result:', invalid);
}

async function exampleYahooFinanceProvider() {
  console.log('\n=== Yahoo Finance Provider Example ===\n');
  
  try {
    const yahooProvider = new YahooFinanceMarketDataProvider();
    
    // Get real data for AAPL
    console.log('Fetching real data from Yahoo Finance for AAPL...');
    const applData = await yahooProvider.getHistoricalPrices('AAPL');
    
    if (applData) {
      console.log(`\nReceived ${applData.length} data points`);
      console.log('Latest 3 prices:');
      console.log(applData.slice(-3)); // Last 3 prices
    } else {
      console.log('No data received');
    }

    // Get Bitcoin data
    console.log('\nFetching Bitcoin data from Yahoo Finance...');
    const btcData = await yahooProvider.getHistoricalPrices('BTC');
    
    if (btcData) {
      console.log(`\nReceived ${btcData.length} BTC data points`);
      console.log('Latest 3 prices:');
      console.log(btcData.slice(-3));
    }
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
  }
}

async function main() {
  console.log('Market Data Provider Examples');
  console.log('============================');
  
  // Example 1: Mock Provider
  await exampleMockProvider();
  
  // Example 2: Yahoo Finance Provider
  await exampleYahooFinanceProvider();
  
  console.log('\n✅ Examples completed\n');
}

// Run examples
main().catch(console.error);
