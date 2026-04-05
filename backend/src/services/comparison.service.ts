import { PriceService } from './price.service';
import { FinancialDataService } from './financialData.service';
import { FinancialDataValidator, StockFinancialData, CryptoFinancialData } from '../models/financialData';
import {
  calculateReturns,
  calculateVolatility,
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculateVaR,
  calculateMean,
} from '../utils/riskCalculations';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ComparisonFundamental {
  market_cap: number | null;
  pe_ratio: number | null;
  roe: number | null;
  margen_neto: number | null;
  dividendo: number | null;
  eps: number | null;
  precio_book: number | null;
  deuda_equity: number | null;
  tipo: string;
  nombre: string;
}

export interface ComparisonTechnical {
  precio_actual: number;
  cambio_periodo_pct: number;
  rsi: number;
  macd_alcista: boolean;
  sobre_sma50: boolean;
  sobre_sma200: boolean;
  tendencia: string;
  puntuacion_tecnica: number;
}

export interface ComparisonRisk {
  volatilidad_anual: number;
  retorno_anualizado: number;
  sharpe_ratio: number;
  var_95: number;
  max_drawdown: number;
  beta: number | null;
}

export interface ComparisonAssetResult {
  ticker: string;
  nombre: string;
  tipo: string;
  fundamental: ComparisonFundamental | null;
  tecnico: ComparisonTechnical | null;
  riesgo: ComparisonRisk | null;
  error: string | null;
}

// ── Service ────────────────────────────────────────────────────────────────

export class ComparisonService {
  private priceService: PriceService;
  private financialDataService: FinancialDataService;

  constructor() {
    this.priceService = new PriceService();
    this.financialDataService = new FinancialDataService();
  }

  /**
   * Analyze a single asset for comparison purposes.
   * Returns fundamental, technical summary, and risk metrics.
   */
  async analyzeForComparison(ticker: string, horizonte: string = '1y'): Promise<ComparisonAssetResult> {
    try {
      // Fetch data in parallel
      const [financialResult, priceResult] = await Promise.allSettled([
        this.financialDataService.getFinancialData(ticker),
        this.priceService.getPriceHistory(ticker, '1d', horizonte),
      ]);

      const financialData = financialResult.status === 'fulfilled' ? financialResult.value : null;
      const priceData = priceResult.status === 'fulfilled' ? priceResult.value : null;

      if (!priceData || !priceData.prices || priceData.prices.length < 30) {
        return { ticker, nombre: ticker, tipo: 'EQUITY', fundamental: null, tecnico: null, riesgo: null, error: 'Datos de precio insuficientes' };
      }

      const closingPrices = priceData.prices.map(p => p.close);

      // ── FUNDAMENTAL ──────────────────────────────────────────────────

      let fundamental: ComparisonFundamental;
      let quoteType = 'EQUITY';
      let longName = ticker;

      if (financialData) {
        if (FinancialDataValidator.isStockData(financialData)) {
          const sd = financialData as StockFinancialData;
          quoteType = sd.quoteType?.toUpperCase() || 'EQUITY';
          longName = ticker; // symbol is always available
          fundamental = {
            market_cap: sd.marketCap ?? null,
            pe_ratio: sd.peRatio ?? null,
            roe: sd.roe != null ? sd.roe * 100 : null, // convert to percentage
            margen_neto: sd.profitMargin != null ? sd.profitMargin * 100 : null,
            dividendo: sd.dividendYield != null ? sd.dividendYield * 100 : null,
            eps: sd.eps ?? null,
            precio_book: sd.priceToBook ?? null,
            deuda_equity: sd.debtToEquity ?? null,
            tipo: quoteType,
            nombre: longName,
          };
        } else {
          const cd = financialData as CryptoFinancialData;
          quoteType = cd.quoteType?.toUpperCase() || 'CRYPTOCURRENCY';
          longName = ticker;
          fundamental = {
            market_cap: cd.marketCap ?? null,
            pe_ratio: null,
            roe: null,
            margen_neto: null,
            dividendo: null,
            eps: null,
            precio_book: null,
            deuda_equity: null,
            tipo: quoteType,
            nombre: longName,
          };
        }
      } else {
        fundamental = {
          market_cap: null, pe_ratio: null, roe: null, margen_neto: null,
          dividendo: null, eps: null, precio_book: null, deuda_equity: null,
          tipo: 'EQUITY', nombre: ticker,
        };
      }

      // ── TECHNICAL (summary) ──────────────────────────────────────────

      const sma50 = this.sma(closingPrices, 50);
      const sma200 = this.sma(closingPrices, 200);
      const rsi = this.rsi(closingPrices, 14);
      const macdHist = this.macdHistogram(closingPrices);
      const precioActual = closingPrices[closingPrices.length - 1];
      const cambioPeriodo = ((closingPrices[closingPrices.length - 1] - closingPrices[0]) / closingPrices[0]) * 100;

      // Simplified technical score (0-100)
      let puntos = 0;
      if (sma50 !== null && precioActual > sma50) puntos += 25;
      if (sma200 !== null && precioActual > sma200) puntos += 25;
      if (sma50 !== null && sma200 !== null && sma50 > sma200) puntos += 20;
      if (rsi !== null && rsi > 40 && rsi < 70) puntos += 15;
      if (macdHist !== null && macdHist > 0) puntos += 15;

      const tecnico: ComparisonTechnical = {
        precio_actual: precioActual,
        cambio_periodo_pct: cambioPeriodo,
        rsi: rsi ?? 50,
        macd_alcista: macdHist !== null ? macdHist > 0 : false,
        sobre_sma50: sma50 !== null ? precioActual > sma50 : false,
        sobre_sma200: sma200 !== null ? precioActual > sma200 : false,
        tendencia: (sma50 !== null && sma200 !== null && sma50 > sma200) ? 'alcista' : 'bajista',
        puntuacion_tecnica: puntos,
      };

      // ── RISK ─────────────────────────────────────────────────────────

      const returns = calculateReturns(closingPrices);
      const volatilidad = calculateVolatility(returns) * 100; // percentage
      const retornoMedio = calculateMean(returns) * 252 * 100; // annualized %
      const sharpe = calculateSharpeRatio(returns);
      const var95 = calculateVaR(returns, 0.95) * 100; // percentage
      const maxDrawdown = calculateMaxDrawdown(closingPrices) * 100; // percentage

      let beta: number | null = null;
      if (financialData && FinancialDataValidator.isStockData(financialData)) {
        beta = (financialData as StockFinancialData).beta ?? null;
      }

      const riesgo: ComparisonRisk = {
        volatilidad_anual: volatilidad,
        retorno_anualizado: retornoMedio,
        sharpe_ratio: sharpe,
        var_95: -var95, // negative = loss
        max_drawdown: -maxDrawdown, // negative = loss
        beta,
      };

      return {
        ticker,
        nombre: fundamental.nombre,
        tipo: fundamental.tipo,
        fundamental,
        tecnico,
        riesgo,
        error: null,
      };
    } catch (e: any) {
      console.error(`[ERROR comparar ${ticker}]:`, e);
      return { ticker, nombre: ticker, tipo: 'EQUITY', fundamental: null, tecnico: null, riesgo: null, error: e.message || 'Error desconocido' };
    }
  }

  // ── Technical Helpers ────────────────────────────────────────────────────

  private sma(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  private rsi(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private macdHistogram(prices: number[]): number | null {
    if (prices.length < 35) return null; // Need at least 26 + 9 days

    const ema12 = this.ema(prices, 12);
    const ema26 = this.ema(prices, 26);
    const macdLine = ema12 - ema26;

    // Approximate signal line from last 9 MACD values
    const macdValues: number[] = [];
    for (let i = Math.max(0, prices.length - 9); i <= prices.length; i++) {
      const slice = prices.slice(0, i);
      if (slice.length >= 26) {
        macdValues.push(this.ema(slice, 12) - this.ema(slice, 26));
      }
    }

    if (macdValues.length < 2) return macdLine > 0 ? 1 : -1;
    const signal = macdValues.reduce((a, b) => a + b, 0) / macdValues.length;
    return macdLine - signal;
  }

  private ema(prices: number[], period: number): number {
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  }
}
