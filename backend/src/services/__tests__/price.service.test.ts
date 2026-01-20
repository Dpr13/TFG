import { describe, it, expect } from 'vitest';
import { PriceService } from '../price.service';

describe('PriceService', () => {
  it('returns price history for a valid symbol', () => {
    const result = PriceService.getPriceHistory('AAPL');

    expect(result).not.toBeNull();
    expect(result?.symbol).toBe('AAPL');
    expect(Array.isArray(result?.prices)).toBe(true);
    expect(result?.prices.length).toBeGreaterThan(0);
    expect(result?.prices[0]).toHaveProperty('date');
    expect(result?.prices[0]).toHaveProperty('close');
  });

  it('returns null for invalid symbol', () => {
    const result = PriceService.getPriceHistory('INVALID');
    expect(result).toBeNull();
  });

  it('is case insensitive for symbol lookup', () => {
    const result1 = PriceService.getPriceHistory('AAPL');
    const result2 = PriceService.getPriceHistory('aapl');
    
    expect(result1?.symbol).toBe(result2?.symbol);
    expect(result1?.prices.length).toBe(result2?.prices.length);
  });
});
