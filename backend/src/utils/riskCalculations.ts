/**
 * Pure functions for financial risk calculations
 * All functions are stateless and side-effect free for easy testing
 */

/**
 * Calculate daily returns from price array
 * Return = (Price_today - Price_yesterday) / Price_yesterday
 * 
 * @param prices - Array of closing prices ordered by date (oldest to newest)
 * @returns Array of daily returns (length = prices.length - 1)
 * @example
 * calculateReturns([100, 105, 103]) => [0.05, -0.019047...]
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
 * 
 * @param values - Array of numeric values
 * @returns Mean value
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate standard deviation (volatility)
 * Uses sample standard deviation (n-1 denominator)
 * 
 * @param values - Array of returns
 * @returns Standard deviation (annualized if returns are daily)
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }
  
  const mean = calculateMean(values);
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / (values.length - 1);
  
  return Math.sqrt(variance);
}

/**
 * Calculate volatility (annualized standard deviation of returns)
 * Assumes daily returns as input
 * 
 * @param returns - Array of daily returns
 * @returns Annualized volatility (e.g., 0.18 = 18% annual volatility)
 */
export function calculateVolatility(returns: number[]): number {
  const dailyStdDev = calculateStandardDeviation(returns);
  
  // Annualize: daily volatility * sqrt(252 trading days per year)
  const annualizedVolatility = dailyStdDev * Math.sqrt(252);
  
  return annualizedVolatility;
}

/**
 * Calculate maximum drawdown (MDD)
 * Maximum loss from a peak to a trough
 * 
 * @param prices - Array of closing prices ordered by date
 * @returns Maximum drawdown as decimal (e.g., 0.20 = 20% drawdown)
 */
export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) {
    return 0;
  }
  
  let maxDrawdown = 0;
  let peak = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];
    
    // Update peak if we found a new high
    if (currentPrice > peak) {
      peak = currentPrice;
    }
    
    // Calculate drawdown from peak
    const drawdown = (peak - currentPrice) / peak;
    
    // Update max drawdown if this is worse
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

/**
 * Risk level thresholds
 * Can be adjusted based on asset class or requirements
 */
export const RISK_THRESHOLDS = {
  VOLATILITY: {
    LOW: 0.15,    // < 15% annual volatility
    MEDIUM: 0.30, // < 30% annual volatility
    // >= 30% is HIGH
  },
  DRAWDOWN: {
    LOW: 0.10,    // < 10% max drawdown
    MEDIUM: 0.25, // < 25% max drawdown
    // >= 25% is HIGH
  },
} as const;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Classify risk level based on volatility and drawdown
 * Uses the worst classification of the two metrics
 * 
 * @param volatility - Annualized volatility (decimal)
 * @param maxDrawdown - Maximum drawdown (decimal)
 * @returns Risk level classification
 * @example
 * classifyRisk(0.12, 0.08) => 'LOW'
 * classifyRisk(0.25, 0.30) => 'HIGH'
 */
export function classifyRisk(volatility: number, maxDrawdown: number): RiskLevel {
  // Classify based on volatility
  let volatilityRisk: RiskLevel;
  if (volatility < RISK_THRESHOLDS.VOLATILITY.LOW) {
    volatilityRisk = 'LOW';
  } else if (volatility < RISK_THRESHOLDS.VOLATILITY.MEDIUM) {
    volatilityRisk = 'MEDIUM';
  } else {
    volatilityRisk = 'HIGH';
  }
  
  // Classify based on drawdown
  let drawdownRisk: RiskLevel;
  if (maxDrawdown < RISK_THRESHOLDS.DRAWDOWN.LOW) {
    drawdownRisk = 'LOW';
  } else if (maxDrawdown < RISK_THRESHOLDS.DRAWDOWN.MEDIUM) {
    drawdownRisk = 'MEDIUM';
  } else {
    drawdownRisk = 'HIGH';
  }
  
  // Return the worst (most conservative) classification
  const riskLevels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
  const volatilityIndex = riskLevels.indexOf(volatilityRisk);
  const drawdownIndex = riskLevels.indexOf(drawdownRisk);
  
  return riskLevels[Math.max(volatilityIndex, drawdownIndex)];
}
