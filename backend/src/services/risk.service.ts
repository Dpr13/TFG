import { PriceService } from './price.service';
import { RiskMetrics, InsufficientDataError } from '../models/risk';
import {
  calculateReturns,
  calculateVolatility,
  calculateMaxDrawdown,
  classifyRisk,
} from '../utils/riskCalculations';

/**
 * Minimum number of data points required for meaningful risk calculation
 * At least 30 days to calculate reliable volatility
 */
const MIN_DATA_POINTS = 30;

/**
 * Service layer for risk calculation operations
 * Orchestrates price fetching and risk metrics calculation
 */
export class RiskService {
  private priceService: PriceService;

  constructor(priceService?: PriceService) {
    this.priceService = priceService || new PriceService();
  }

  /**
   * Calculate risk metrics for a given asset symbol
   * 
   * @param symbol - Asset symbol (e.g., 'AAPL', 'BTC')
   * @returns Risk metrics object with volatility, drawdown, and risk level
   * @throws InsufficientDataError if not enough historical data
   * @throws Error if symbol not found
   */
  async calculateRiskMetrics(symbol: string): Promise<RiskMetrics> {
    // 1. Fetch historical prices
    const priceData = await this.priceService.getPriceHistory(symbol);

    if (!priceData) {
      throw new Error(`Asset with symbol '${symbol}' not found`);
    }

    // 2. Validate sufficient data
    const { prices } = priceData;
    if (prices.length < MIN_DATA_POINTS) {
      throw new InsufficientDataError(symbol, MIN_DATA_POINTS, prices.length);
    }

    // 3. Extract closing prices array
    const closingPrices = prices.map((p) => p.close);

    // 4. Calculate returns
    const returns = calculateReturns(closingPrices);

    // 5. Calculate volatility (annualized)
    const volatility = calculateVolatility(returns);

    // 6. Calculate maximum drawdown
    const maxDrawdown = calculateMaxDrawdown(closingPrices);

    // 7. Classify risk level
    const riskLevel = classifyRisk(volatility, maxDrawdown);

    // 8. Build response object
    const riskMetrics: RiskMetrics = {
      symbol: symbol.toUpperCase(),
      volatility: Math.round(volatility * 10000) / 10000, // Round to 4 decimals
      maxDrawdown: Math.round(maxDrawdown * 10000) / 10000, // Round to 4 decimals
      riskLevel,
      dataPoints: prices.length,
      period: {
        start: prices[0].date,
        end: prices[prices.length - 1].date,
      },
    };

    return riskMetrics;
  }
}
