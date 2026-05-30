import { describe, expect, it, vi, beforeEach } from 'vitest';

// Vitest hoists `vi.mock()` to the top of the module.
// Create mocks via `vi.hoisted()` so they're initialized before the mock factory runs.
const { quoteMock } = vi.hoisted(() => ({
  quoteMock: vi.fn(),
}));

// Mock yahoo-finance2 default export as a constructor
vi.mock('yahoo-finance2', () => {
  return {
    default: class YahooFinance {
      quote = quoteMock;
      search = vi.fn();
      quoteSummary = vi.fn();
      chart = vi.fn();
      constructor(_opts?: any) {}
    },
  };
});

import { YahooFinanceMarketDataProvider } from '../YahooFinanceMarketDataProvider';

describe('YahooFinanceMarketDataProvider.validateSymbol', () => {
  beforeEach(() => {
    quoteMock.mockReset();
  });

  it('classifies CURRENCY quoteType as forex and returns canonical EURUSD=X', async () => {
    quoteMock.mockResolvedValue({ quoteType: 'CURRENCY', shortName: 'EUR/USD' });

    const provider = new YahooFinanceMarketDataProvider();
    const result = await provider.validateSymbol('EUR/USD');

    expect(result).not.toBeNull();
    expect(result?.type).toBe('forex');
    expect(result?.symbol).toBe('EURUSD=X');
    expect(result?.name).toBe('EUR/USD');

    expect(quoteMock).toHaveBeenCalledTimes(1);
    expect(quoteMock).toHaveBeenCalledWith('EURUSD=X');
  });

  it('keeps EURUSD=X as forex when quoteType is CURRENCY', async () => {
    quoteMock.mockResolvedValue({ quoteType: 'CURRENCY', shortName: 'EUR/USD' });

    const provider = new YahooFinanceMarketDataProvider();
    const result = await provider.validateSymbol('EURUSD=X');

    expect(result).not.toBeNull();
    expect(result?.type).toBe('forex');
    expect(result?.symbol).toBe('EURUSD=X');
    expect(quoteMock).toHaveBeenCalledWith('EURUSD=X');
  });

  it('does not misclassify equity as forex', async () => {
    quoteMock.mockResolvedValue({ quoteType: 'EQUITY', shortName: 'Apple Inc.' });

    const provider = new YahooFinanceMarketDataProvider();
    const result = await provider.validateSymbol('AAPL');

    expect(result).not.toBeNull();
    expect(result?.type).toBe('stock');
    expect(result?.symbol).toBe('AAPL');
    expect(quoteMock).toHaveBeenCalledWith('AAPL');
  });
});
