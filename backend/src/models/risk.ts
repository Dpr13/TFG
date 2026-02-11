import { RiskLevel } from '../utils/riskCalculations';

/**
 * Risk metrics for a financial asset
 */
export interface RiskMetrics {
  /**
   * Asset symbol (e.g., 'AAPL', 'BTC')
   */
  symbol: string;

  /**
   * Annualized volatility (standard deviation of returns)
   * Expressed as decimal (e.g., 0.18 = 18%)
   */
  volatility: number;

  /**
   * Maximum drawdown - largest peak-to-trough decline
   * Expressed as decimal (e.g., 0.12 = 12% loss)
   */
  maxDrawdown: number;

  /**
   * Sharpe Ratio (rentabilidad ajustada al riesgo)
   */
  sharpeRatio?: number;

  /**
   * Sortino Ratio (rentabilidad ajustada a la volatilidad negativa)
   */
  sortinoRatio?: number;

  /**
   * Value at Risk (VaR) al 95% de confianza
   */
  valueAtRisk95?: number;

  /**
   * Calmar Ratio (rentabilidad media / drawdown máximo)
   */
  calmarRatio?: number;

  /**
   * Risk classification based on volatility and drawdown
   */
  riskLevel: RiskLevel;

  /**
   * Number of data points used in calculation
   */
  dataPoints: number;

  /**
   * Date range of analyzed data
   */
  period?: {
    start: string;
    end: string;
  };
}

/**
 * Error thrown when insufficient data for risk calculation
 */
export class InsufficientDataError extends Error {
  constructor(symbol: string, requiredPoints: number, actualPoints: number) {
    super(
      `Insufficient data for ${symbol}: need at least ${requiredPoints} data points, got ${actualPoints}`
    );
    this.name = 'InsufficientDataError';
  }
}
