import { PriceService } from './price.service';
import { RiskMetrics, InsufficientDataError } from '../models/risk';
import {
  calculateReturns,
  calculateVolatility,
  calculateMaxDrawdown,
  classifyRisk,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateVaR,
  calculateCalmarRatio,
} from '../utils/riskCalculations';

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
  /**
   * Permite elegir el rango de análisis ('6mo', '1y', '3y', '5y')
   * Las funciones de cálculo ya anualizan automáticamente las métricas
   */
  async calculateRiskMetrics(symbol: string, range: '6mo' | '1y' | '3y' | '5y' = '1y'): Promise<RiskMetrics> {
    // 1. Fetch historical prices con rango
    const priceData = await this.priceService.getPriceHistory(symbol, '1d', range);
    if (!priceData) {
      throw new Error(`Asset with symbol '${symbol}' not found`);
    }
    const { prices } = priceData;
    // Validar mínimo de datos según rango
    const minDataPoints = range === '6mo' ? 60 : range === '1y' ? 120 : range === '3y' ? 252 : 400;
    if (prices.length < minDataPoints) {
      throw new InsufficientDataError(symbol, minDataPoints, prices.length);
    }
    // 2. Extraer precios de cierre
    const closingPrices = prices.map((p) => p.close);
    // 3. Calcular retornos
    const returns = calculateReturns(closingPrices);
    // 4. Calcular métricas (ya están anualizadas por las funciones de cálculo)
    const volatility = calculateVolatility(returns);
    const maxDrawdown = calculateMaxDrawdown(closingPrices);
    const sharpeRatio = calculateSharpeRatio(returns);
    const sortinoRatio = calculateSortinoRatio(returns);
    const valueAtRisk95 = calculateVaR(returns, 0.95);
    const calmarRatio = calculateCalmarRatio(returns, closingPrices);
    // 5. Clasificar nivel de riesgo
    const riskLevel = classifyRisk(volatility, maxDrawdown);
    // 6. Construir objeto de respuesta
    const riskMetrics: RiskMetrics = {
      symbol: symbol.toUpperCase(),
      volatility: Math.round(volatility * 10000) / 10000,
      maxDrawdown: Math.round(maxDrawdown * 10000) / 10000,
      sharpeRatio: sharpeRatio !== undefined ? Math.round(sharpeRatio * 10000) / 10000 : undefined,
      sortinoRatio: sortinoRatio !== undefined ? Math.round(sortinoRatio * 10000) / 10000 : undefined,
      valueAtRisk95: valueAtRisk95 !== undefined ? Math.round(valueAtRisk95 * 10000) / 10000 : undefined,
      calmarRatio: calmarRatio !== undefined ? Math.round(calmarRatio * 10000) / 10000 : undefined,
      riskLevel,
      dataPoints: prices.length,
      period: {
        start: prices[0].date,
        end: prices[prices.length - 1].date,
      },
      interval: '1d',
      range,
    };
    return riskMetrics;
  }
}
