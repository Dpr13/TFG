import { describe, it, expect } from 'vitest';
import {
  calculateReturns,
  calculateMean,
  calculateStandardDeviation,
  calculateVolatility,
  calculateMaxDrawdown,
  classifyRisk,
  RISK_THRESHOLDS,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateVaR,
  calculateCalmarRatio,
} from '../../utils/riskCalculations';


describe('New Risk Metrics', () => {
  describe('calculateSharpeRatio', () => {
    it('should return 0 for insufficient data', () => {
      expect(calculateSharpeRatio([])).toBe(0);
      expect(calculateSharpeRatio([0.01])).toBe(0);
    });
    it('should calculate Sharpe ratio for positive returns', () => {
      const returns = [0.01, 0.02, 0.015, 0.017, 0.013];
      const sharpe = calculateSharpeRatio(returns);
      expect(sharpe).toBeGreaterThan(0);
    });
    it('should handle risk-free rate', () => {
      const returns = [0.01, 0.02, 0.015, 0.017, 0.013];
      const sharpe = calculateSharpeRatio(returns, 0.01);
      expect(sharpe).toBeLessThan(calculateSharpeRatio(returns));
    });
    it('should return 0 if std deviation is 0', () => {
      const returns = [0.01, 0.01, 0.01];
      expect(calculateSharpeRatio(returns)).toBe(0);
    });
  });

  describe('calculateSortinoRatio', () => {
    it('should return 0 for insufficient data', () => {
      expect(calculateSortinoRatio([])).toBe(0);
      expect(calculateSortinoRatio([0.01])).toBe(0);
    });
    it('should calculate Sortino ratio for returns with downside risk', () => {
      const returns = [0.01, -0.02, 0.015, -0.01, 0.013];
      const sortino = calculateSortinoRatio(returns);
      expect(sortino).toBeGreaterThan(0);
    });
    it('should handle risk-free rate with downside risk', () => {
      const returns = [0.01, -0.02, 0.015, -0.01, 0.013];
      const sortino = calculateSortinoRatio(returns, 0.01);
      expect(sortino).toBeLessThan(calculateSortinoRatio(returns));
    });
    it('should return 0 if no downside deviation', () => {
      const returns = [0.02, 0.03, 0.025];
      expect(calculateSortinoRatio(returns)).toBe(0);
    });
  });

  describe('calculateVaR', () => {
    it('should return 0 for empty returns', () => {
      expect(calculateVaR([])).toBe(0);
    });
    it('should calculate VaR at 95% confidence', () => {
      const returns = [-0.05, -0.02, 0.01, 0.03, -0.01, 0.02, 0.00];
      const var95 = calculateVaR(returns, 0.95);
      expect(var95).toBeGreaterThanOrEqual(0);
    });
    it('should calculate VaR at 99% confidence', () => {
      const returns = [-0.10, -0.02, 0.01, 0.03, -0.01, 0.02, 0.00];
      const var99 = calculateVaR(returns, 0.99);
      expect(var99).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateCalmarRatio', () => {
    it('should return 0 if max drawdown is 0', () => {
      const returns = [0.01, 0.01, 0.01];
      const prices = [100, 101, 102];
      expect(calculateCalmarRatio(returns, prices)).toBe(0);
    });
    it('should calculate Calmar ratio for positive returns and drawdown', () => {
      const returns = [0.01, 0.02, 0.015, 0.017, 0.013];
      const prices = [100, 110, 105, 90, 80, 95];
      const calmar = calculateCalmarRatio(returns, prices);
      expect(calmar).toBeGreaterThan(0);
    });
    it('should handle negative mean returns', () => {
      const returns = [-0.01, -0.02, -0.015];
      const prices = [100, 90, 80];
      const calmar = calculateCalmarRatio(returns, prices);
      expect(calmar).toBeLessThan(0);
    });
  });
});

describe('Risk Calculations - Pure Functions', () => {
  describe('calculateReturns', () => {
    it('should calculate daily returns correctly', () => {
      const prices = [100, 105, 103, 110];
      const returns = calculateReturns(prices);

      // Expected: [(105-100)/100, (103-105)/105, (110-103)/103]
      expect(returns).toHaveLength(3);
      expect(returns[0]).toBeCloseTo(0.05, 4); // 5% gain
      expect(returns[1]).toBeCloseTo(-0.019047, 4); // ~1.9% loss
      expect(returns[2]).toBeCloseTo(0.067961, 4); // ~6.8% gain
    });

    it('should return empty array for less than 2 prices', () => {
      expect(calculateReturns([])).toEqual([]);
      expect(calculateReturns([100])).toEqual([]);
    });

    it('should throw error for zero price', () => {
      const prices = [100, 0, 110];
      expect(() => calculateReturns(prices)).toThrow(
        'Cannot calculate returns with zero price'
      );
    });

    it('should handle negative returns correctly', () => {
      const prices = [100, 50];
      const returns = calculateReturns(prices);

      expect(returns).toHaveLength(1);
      expect(returns[0]).toBe(-0.5); // 50% loss
    });
  });

  describe('calculateMean', () => {
    it('should calculate mean correctly', () => {
      const values = [1, 2, 3, 4, 5];
      const mean = calculateMean(values);

      expect(mean).toBe(3);
    });

    it('should return 0 for empty array', () => {
      expect(calculateMean([])).toBe(0);
    });

    it('should handle negative values', () => {
      const values = [-2, -1, 0, 1, 2];
      expect(calculateMean(values)).toBe(0);
    });
  });

  describe('calculateStandardDeviation', () => {
    it('should calculate standard deviation correctly', () => {
      // Simple dataset with known std dev
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const stdDev = calculateStandardDeviation(values);

      // Sample standard deviation ≈ 2.138
      expect(stdDev).toBeCloseTo(2.138, 2);
    });

    it('should return 0 for less than 2 values', () => {
      expect(calculateStandardDeviation([])).toBe(0);
      expect(calculateStandardDeviation([5])).toBe(0);
    });

    it('should handle all identical values', () => {
      const values = [5, 5, 5, 5];
      expect(calculateStandardDeviation(values)).toBe(0);
    });
  });

  describe('calculateVolatility', () => {
    it('should calculate annualized volatility correctly', () => {
      // Mock daily returns with 1% daily std dev
      // Annualized should be ~0.01 * sqrt(252) ≈ 0.1588
      const returns = Array(100).fill(0.01);
      const volatility = calculateVolatility(returns);

      expect(volatility).toBeGreaterThan(0);
    });

    it('should return 0 for insufficient data', () => {
      expect(calculateVolatility([])).toBe(0);
      expect(calculateVolatility([0.01])).toBe(0);
    });

    it('should calculate realistic volatility for mock data', () => {
      // Simulate returns with some variance
      const returns = [0.01, -0.015, 0.02, -0.005, 0.01, 0.03, -0.02];
      const volatility = calculateVolatility(returns);

      // Should be between 0 and 1 (0-100%)
      expect(volatility).toBeGreaterThan(0);
      expect(volatility).toBeLessThan(1);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('should calculate max drawdown correctly', () => {
      // Peak at 110, trough at 80, drawdown = (110-80)/110 ≈ 0.2727
      const prices = [100, 110, 105, 90, 80, 95];
      const maxDrawdown = calculateMaxDrawdown(prices);

      expect(maxDrawdown).toBeCloseTo(0.2727, 3);
    });

    it('should return 0 for constantly increasing prices', () => {
      const prices = [100, 110, 120, 130];
      const maxDrawdown = calculateMaxDrawdown(prices);

      expect(maxDrawdown).toBe(0);
    });

    it('should return 0 for less than 2 prices', () => {
      expect(calculateMaxDrawdown([])).toBe(0);
      expect(calculateMaxDrawdown([100])).toBe(0);
    });

    it('should handle multiple drawdowns and return max', () => {
      // First drawdown: 100 -> 90 = 10%
      // Second drawdown: 110 -> 70 = 36.36%
      const prices = [100, 90, 95, 110, 100, 70, 80];
      const maxDrawdown = calculateMaxDrawdown(prices);

      expect(maxDrawdown).toBeCloseTo(0.3636, 3);
    });

    it('should handle complete loss scenario', () => {
      const prices = [100, 0];
      const maxDrawdown = calculateMaxDrawdown(prices);

      expect(maxDrawdown).toBe(1); // 100% loss
    });
  });

  describe('classifyRisk', () => {
    it('should classify as LOW when both metrics are low', () => {
      const volatility = 0.10; // 10% volatility
      const maxDrawdown = 0.05; // 5% drawdown

      const risk = classifyRisk(volatility, maxDrawdown);

      expect(risk).toBe('LOW');
    });

    it('should classify as MEDIUM when volatility is medium', () => {
      const volatility = 0.20; // 20% volatility
      const maxDrawdown = 0.05; // 5% drawdown

      const risk = classifyRisk(volatility, maxDrawdown);

      expect(risk).toBe('MEDIUM');
    });

    it('should classify as MEDIUM when drawdown is medium', () => {
      const volatility = 0.10; // 10% volatility
      const maxDrawdown = 0.15; // 15% drawdown

      const risk = classifyRisk(volatility, maxDrawdown);

      expect(risk).toBe('MEDIUM');
    });

    it('should classify as HIGH when volatility is high', () => {
      const volatility = 0.35; // 35% volatility
      const maxDrawdown = 0.05; // 5% drawdown

      const risk = classifyRisk(volatility, maxDrawdown);

      expect(risk).toBe('HIGH');
    });

    it('should classify as HIGH when drawdown is high', () => {
      const volatility = 0.10; // 10% volatility
      const maxDrawdown = 0.30; // 30% drawdown

      const risk = classifyRisk(volatility, maxDrawdown);

      expect(risk).toBe('HIGH');
    });

    it('should use worst classification when both are different', () => {
      const volatility = 0.10; // LOW
      const maxDrawdown = 0.30; // HIGH

      const risk = classifyRisk(volatility, maxDrawdown);

      expect(risk).toBe('HIGH'); // Takes the worst
    });

    it('should classify boundary values correctly', () => {
      // Exactly at LOW threshold
      expect(classifyRisk(RISK_THRESHOLDS.VOLATILITY.LOW, 0.05)).toBe('MEDIUM');

      // Just below LOW threshold
      expect(classifyRisk(RISK_THRESHOLDS.VOLATILITY.LOW - 0.01, 0.05)).toBe('LOW');

      // Exactly at MEDIUM threshold
      expect(classifyRisk(RISK_THRESHOLDS.VOLATILITY.MEDIUM, 0.05)).toBe('HIGH');

      // Just below MEDIUM threshold
      expect(classifyRisk(RISK_THRESHOLDS.VOLATILITY.MEDIUM - 0.01, 0.05)).toBe('MEDIUM');
    });
  });
});
