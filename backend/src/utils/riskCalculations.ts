/**
 * Pure functions for financial risk calculations
 * All functions are stateless and side-effect free for easy testing
 */

const TRADING_DAYS = 252;

/**
 * Calculate daily returns from price array
 * Return = (Price_today - Price_yesterday) / Price_yesterday
 */
export function calculateReturns(prices: number[]): number[] {
  if (prices.length < 2) {
    return [];
  }

  const returns: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const previousPrice = prices[i - 1];
    const currentPrice = prices[i];

    if (previousPrice === 0) {
      throw new Error('Cannot calculate returns with zero price');
    }

    const dailyReturn = (currentPrice - previousPrice) / previousPrice;
    returns.push(dailyReturn);
  }

  return returns;
}

/**
 * Calculate mean (average) of an array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate standard deviation (sample std, n-1)
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const mean = calculateMean(values);
  const squaredDifferences = values.map(v => Math.pow(v - mean, 2));
  const variance =
    squaredDifferences.reduce((acc, v) => acc + v, 0) / (values.length - 1);

  return Math.sqrt(variance);
}

/**
 * Calculate annualized volatility
 * Assumes daily returns
 */
export function calculateVolatility(returns: number[]): number {
  const dailyStdDev = calculateStandardDeviation(returns);
  return dailyStdDev * Math.sqrt(TRADING_DAYS);
}

/**
 * Calculate maximum drawdown (MDD)
 */
export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) {
    return 0;
  }

  let maxDrawdown = 0;
  let peak = prices[0];

  for (let i = 1; i < prices.length; i++) {
    const price = prices[i];

    if (price > peak) {
      peak = price;
    }

    const drawdown = (peak - price) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Risk level thresholds
 */
export const RISK_THRESHOLDS = {
  VOLATILITY: {
    LOW: 0.15,
    MEDIUM: 0.30,
  },
  DRAWDOWN: {
    LOW: 0.10,
    MEDIUM: 0.25,
  },
} as const;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Classify risk level using worst-case rule
 */
export function classifyRisk(
  volatility: number,
  maxDrawdown: number
): RiskLevel {
  let volatilityRisk: RiskLevel;
  if (volatility < RISK_THRESHOLDS.VOLATILITY.LOW) {
    volatilityRisk = 'LOW';
  } else if (volatility < RISK_THRESHOLDS.VOLATILITY.MEDIUM) {
    volatilityRisk = 'MEDIUM';
  } else {
    volatilityRisk = 'HIGH';
  }

  let drawdownRisk: RiskLevel;
  if (maxDrawdown < RISK_THRESHOLDS.DRAWDOWN.LOW) {
    drawdownRisk = 'LOW';
  } else if (maxDrawdown < RISK_THRESHOLDS.DRAWDOWN.MEDIUM) {
    drawdownRisk = 'MEDIUM';
  } else {
    drawdownRisk = 'HIGH';
  }

  const order: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
  return order[
    Math.max(order.indexOf(volatilityRisk), order.indexOf(drawdownRisk))
  ];
}

/**
 * Calculate ANNUALIZED Sharpe Ratio
 * Sharpe = (annual return - annual risk-free rate) / annual volatility
 */
export function calculateSharpeRatio(
  returns: number[],
  annualRiskFreeRate = 0
): number {
  if (returns.length < 2) return 0;

  const meanDaily = calculateMean(returns);
  const stdDaily = calculateStandardDeviation(returns);
  if (stdDaily === 0) return 0;

  const annualReturn = meanDaily * TRADING_DAYS;
  const annualVolatility = stdDaily * Math.sqrt(TRADING_DAYS);

  return (annualReturn - annualRiskFreeRate) / annualVolatility;
}

/**
 * Calculate ANNUALIZED Sortino Ratio
 */
export function calculateSortinoRatio(
  returns: number[],
  annualRiskFreeRate = 0
): number {
  if (returns.length < 2) return 0;

  const meanDaily = calculateMean(returns);
  const annualReturn = meanDaily * TRADING_DAYS;

  const downsideReturns = returns.filter(r => r < 0);
  if (downsideReturns.length === 0) return 0;

  const downsideStdDaily = Math.sqrt(
    downsideReturns.reduce((acc, r) => acc + r * r, 0) /
      downsideReturns.length
  );

  const downsideDeviationAnnual =
    downsideStdDaily * Math.sqrt(TRADING_DAYS);

  if (downsideDeviationAnnual === 0) return 0;

  return (annualReturn - annualRiskFreeRate) / downsideDeviationAnnual;
}

/**
 * Calculate historical Value at Risk (VaR)
 */
export function calculateVaR(
  returns: number[],
  confidenceLevel = 0.95
): number {
  if (returns.length === 0) return 0;

  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sorted.length);

  return Math.abs(sorted[index]);
}

/**
 * Calculate Calmar Ratio
 * Calmar = annual return / max drawdown
 */
export function calculateCalmarRatio(
  returns: number[],
  prices: number[]
): number {
  const maxDrawdown = calculateMaxDrawdown(prices);
  if (maxDrawdown === 0) return 0;

  const annualReturn = calculateMean(returns) * TRADING_DAYS;
  return annualReturn / maxDrawdown;
}
