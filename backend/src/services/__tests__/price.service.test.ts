import { describe, it, expect, beforeEach } from 'vitest';
import { PriceService } from '../price.service';
import { MockMarketDataProvider } from '../../providers/MockMarketDataProvider';

describe('PriceService', () => {
  let priceService: PriceService;

  beforeEach(() => {
    // Always use MockMarketDataProvider for tests
    const mockProvider = new MockMarketDataProvider();
    priceService = new PriceService(mockProvider);
  });

  it('returns price history for a valid symbol', async () => {
    const result = await priceService.getPriceHistory('AAPL');

    expect(result).not.toBeNull();
    expect(result?.symbol).toBe('AAPL');
    expect(Array.isArray(result?.prices)).toBe(true);
    expect(result?.prices.length).toBeGreaterThan(0);
    expect(result?.prices[0]).toHaveProperty('date');
    expect(result?.prices[0]).toHaveProperty('close');
  });

  it('returns null for invalid symbol', async () => {
    const result = await priceService.getPriceHistory('INVALID');
    expect(result).toBeNull();
  });

  it('is case insensitive for symbol lookup', async () => {
    const result1 = await priceService.getPriceHistory('AAPL');
    const result2 = await priceService.getPriceHistory('aapl');
    
    expect(result1?.symbol).toBe(result2?.symbol);
    expect(result1?.prices.length).toBe(result2?.prices.length);
  });

  it('normalizes symbol to uppercase in response', async () => {
    const result = await priceService.getPriceHistory('aapl');
    expect(result?.symbol).toBe('AAPL');
  });
});
