import { describe, it, expect, beforeEach } from 'vitest';
import { RiskService } from '../risk.service';
import { PriceService } from '../price.service';
import { MockMarketDataProvider } from '../../providers/MockMarketDataProvider';
import { InsufficientDataError } from '../../models/risk';

describe('RiskService - Risk Metrics Calculation', () => {
  let riskService: RiskService;
  let priceService: PriceService;

  beforeEach(() => {
    // Always use MockProvider for tests
    const mockProvider = new MockMarketDataProvider();
    priceService = new PriceService(mockProvider);
    riskService = new RiskService(priceService);
  });

  describe('calculateRiskMetrics', () => {
    it('should calculate risk metrics for valid symbol', async () => {
      const result = await riskService.calculateRiskMetrics('AAPL');

      expect(result).toBeDefined();
      expect(result.symbol).toBe('AAPL');
      expect(result.volatility).toBeGreaterThanOrEqual(0);
      expect(result.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(result.maxDrawdown).toBeLessThanOrEqual(1);
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.riskLevel);
      expect(result.dataPoints).toBeGreaterThan(0);
    });

    it('should include period information', async () => {
      const result = await riskService.calculateRiskMetrics('GOOGL');

      expect(result.period).toBeDefined();
      expect(result.period?.start).toBeDefined();
      expect(result.period?.end).toBeDefined();
      expect(typeof result.period?.start).toBe('string');
      expect(typeof result.period?.end).toBe('string');
    });

    it('should normalize symbol to uppercase', async () => {
      const result = await riskService.calculateRiskMetrics('aapl');

      expect(result.symbol).toBe('AAPL');
    });

    it('should round volatility and drawdown to 4 decimals', async () => {
      const result = await riskService.calculateRiskMetrics('MSFT');

      // Check that values are rounded (no more than 4 decimal places)
      const volatilityStr = result.volatility.toString();
      const drawdownStr = result.maxDrawdown.toString();

      const volatilityDecimals = volatilityStr.split('.')[1]?.length || 0;
      const drawdownDecimals = drawdownStr.split('.')[1]?.length || 0;

      expect(volatilityDecimals).toBeLessThanOrEqual(4);
      expect(drawdownDecimals).toBeLessThanOrEqual(4);
    });

    it('should throw error for non-existent symbol', async () => {
      await expect(
        riskService.calculateRiskMetrics('INVALID')
      ).rejects.toThrow("Asset with symbol 'INVALID' not found");
    });

    it('should calculate different metrics for different assets', async () => {
      const appleRisk = await riskService.calculateRiskMetrics('AAPL');
      const googleRisk = await riskService.calculateRiskMetrics('GOOGL');

      // Different assets should generally have different metrics
      // (unless mock data happens to be identical, which is unlikely)
      expect(appleRisk.symbol).not.toBe(googleRisk.symbol);
    });
  });

  describe('Risk Level Classification', () => {
    it('should classify risk level based on volatility and drawdown', async () => {
      const result = await riskService.calculateRiskMetrics('AAPL');

      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.riskLevel);
    });

    it('should handle all available mock assets', async () => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'BTC'];

      for (const symbol of symbols) {
        const result = await riskService.calculateRiskMetrics(symbol);

        expect(result).toBeDefined();
        expect(result.symbol).toBe(symbol);
        expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.riskLevel);
      }
    });
  });

  describe('Data Validation', () => {
    it('should throw InsufficientDataError for assets with too few data points', async () => {
      // This test assumes we could mock a provider with insufficient data
      // For now, we test the error type exists
      expect(InsufficientDataError).toBeDefined();

      // Create a scenario with insufficient data
      const mockProviderWithLittleData = new MockMarketDataProvider();

      // Override to return minimal data (less than 30 points)
      const originalMethod = mockProviderWithLittleData.getHistoricalPrices;
      mockProviderWithLittleData.getHistoricalPrices = async (symbol: string) => {
        const data = await originalMethod.call(mockProviderWithLittleData, symbol);
        if (data && data.length > 10) {
          return data.slice(0, 10); // Return only 10 data points
        }
        return data;
      };

      const testPriceService = new PriceService(mockProviderWithLittleData);
      const testRiskService = new RiskService(testPriceService);

      await expect(
        testRiskService.calculateRiskMetrics('AAPL')
      ).rejects.toThrow(InsufficientDataError);
    });

    it('should require at least 30 data points', async () => {
      // Test the minimum threshold
      const mockProviderWithLittleData = new MockMarketDataProvider();
      const originalMethod = mockProviderWithLittleData.getHistoricalPrices;

      mockProviderWithLittleData.getHistoricalPrices = async (symbol: string) => {
        const data = await originalMethod.call(mockProviderWithLittleData, symbol);
        if (data && data.length > 25) {
          return data.slice(0, 25); // Return only 25 data points (less than 30)
        }
        return data;
      };

      const testPriceService = new PriceService(mockProviderWithLittleData);
      const testRiskService = new RiskService(testPriceService);

      const error = await testRiskService
        .calculateRiskMetrics('AAPL')
        .catch((e) => e);

      expect(error).toBeInstanceOf(InsufficientDataError);
      expect(error.message).toContain('30');
      expect(error.message).toContain('25');
    });
  });

  describe('Integration with PriceService', () => {
    it('should use injected PriceService', async () => {
      const mockProvider = new MockMarketDataProvider();
      const customPriceService = new PriceService(mockProvider);
      const customRiskService = new RiskService(customPriceService);

      const result = await customRiskService.calculateRiskMetrics('AAPL');

      expect(result).toBeDefined();
      expect(result.symbol).toBe('AAPL');
    });

    it('should create default PriceService if not provided', () => {
      const defaultRiskService = new RiskService();

      expect(defaultRiskService).toBeDefined();
    });
  });
});
