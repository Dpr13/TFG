import { TechnicalAnalysisService } from './technicalAnalysis.service';
import type {
  RecommendationRequest,
  RecommendationResult,
  TPResult,
  RiskManagementResult,
} from '../models/recommendation';

const technicalService = new TechnicalAnalysisService();

// Map intervals to ranges that Yahoo Finance supports
const INTERVAL_RANGE_MAP: Record<string, string> = {
  '1m': '6mo',
  '5m': '6mo',
  '15m': '6mo',
  '1h': '1y',
  '4h': '1y',
  '1d': '1y',
  '1wk': '3y',
  '1mo': '5y',
};

export class RecommendationService {

  async calculate(req: RecommendationRequest): Promise<RecommendationResult> {
    const range = req.range || INTERVAL_RANGE_MAP[req.interval] || '1y';

    // 1) Get full technical analysis (OHLCV + indicators)
    const analysis = await technicalService.analyze(req.symbol, range, req.interval);

    const candles = analysis.candles;
    if (candles.length === 0) {
      throw new Error('No se encontraron datos para el activo seleccionado.');
    }

    const entryPrice = candles[candles.length - 1].close;
    const entryDate = candles[candles.length - 1].date;
    const warnings: string[] = [];

    // 2) Calculate Stop Loss
    let sl: number;
    let slMethodLabel: string;
    let detectedSLLevel: string | undefined;

    if (req.slMethod === 'FIXED_PCT') {
      const pct = (req.slPct ?? 2) / 100;
      sl = req.direction === 'LONG'
        ? entryPrice * (1 - pct)
        : entryPrice * (1 + pct);
      slMethodLabel = '% Fijo';
    } else {
      // SUPPORT_RESISTANCE
      if (req.direction === 'LONG') {
        // Find closest support BELOW entry price
        const supportBelow = analysis.supports
          .filter(s => s.price < entryPrice)
          .sort((a, b) => b.price - a.price);
        if (supportBelow.length > 0) {
          sl = supportBelow[0].price;
          detectedSLLevel = `Soporte detectado en $${sl.toFixed(2)}`;
        } else {
          throw new Error('No se detectaron soportes por debajo del precio actual. Usa el método de porcentaje fijo.');
        }
      } else {
        // SHORT: find closest resistance ABOVE entry price
        const resistanceAbove = analysis.resistances
          .filter(r => r.price > entryPrice)
          .sort((a, b) => a.price - b.price);
        if (resistanceAbove.length > 0) {
          sl = resistanceAbove[0].price;
          detectedSLLevel = `Resistencia detectada en $${sl.toFixed(2)}`;
        } else {
          throw new Error('No se detectaron resistencias por encima del precio actual. Usa el método de porcentaje fijo.');
        }
      }
      slMethodLabel = req.direction === 'LONG' ? 'Soporte' : 'Resistencia';
    }

    // 3) Validate SL
    if (req.direction === 'LONG' && sl >= entryPrice) {
      throw new Error('El stop loss debe estar por debajo del precio de entrada para una posición larga.');
    }
    if (req.direction === 'SHORT' && sl <= entryPrice) {
      throw new Error('El stop loss debe estar por encima del precio de entrada para una posición corta.');
    }

    const slDistanceAbs = Math.abs(entryPrice - sl);
    const slDistancePct = (slDistanceAbs / entryPrice) * 100;

    if (slDistancePct < 0.1) {
      warnings.push('Stop loss muy ajustado. Alta probabilidad de activación por ruido de mercado.');
    }
    if (slDistancePct > 15) {
      warnings.push('Stop loss muy amplio. El tamaño de posición resultante será muy pequeño.');
    }

    // 4) Calculate Take Profit(s)
    const tps: TPResult[] = [];

    for (const method of req.tpMethods) {
      if (method === 'RISK_REWARD') {
        const ratio = req.rrRatio ?? req.customRatio ?? 2;
        let tpPrice: number;
        if (req.direction === 'LONG') {
          tpPrice = entryPrice + slDistanceAbs * ratio;
        } else {
          tpPrice = entryPrice - slDistanceAbs * ratio;
        }

        const tpDistAbs = Math.abs(tpPrice - entryPrice);
        const tpDistPct = (tpDistAbs / entryPrice) * 100;
        const realRatio = slDistanceAbs > 0 ? tpDistAbs / slDistanceAbs : 0;

        tps.push({
          method: 'RISK_REWARD',
          price: tpPrice,
          distancePct: tpDistPct,
          distanceAbs: tpDistAbs,
          realRatio,
          label: `R/B 1:${ratio}`,
          potentialProfit: 0, // Calculated below
        });
      }

      if (method === 'SUPPORT_RESISTANCE') {
        let tpPrice: number | null = null;
        let label = '';

        if (req.direction === 'LONG') {
          const resistanceAbove = analysis.resistances
            .filter(r => r.price > entryPrice)
            .sort((a, b) => a.price - b.price);
          if (resistanceAbove.length > 0) {
            tpPrice = resistanceAbove[0].price;
            label = `Resistencia`;
          } else {
             warnings.push('No hay resistencias por encima para usar como TP. Usa otro método adicional.');
          }
        } else {
          const supportBelow = analysis.supports
            .filter(s => s.price < entryPrice)
            .sort((a, b) => b.price - a.price);
          if (supportBelow.length > 0) {
            tpPrice = supportBelow[0].price;
            label = `Soporte`;
          } else {
             warnings.push('No hay soportes por debajo para usar como TP. Usa otro método adicional.');
          }
        }

        if (tpPrice !== null) {
          const tpDistAbs = Math.abs(tpPrice - entryPrice);
          const tpDistPct = (tpDistAbs / entryPrice) * 100;
          const realRatio = slDistanceAbs > 0 ? tpDistAbs / slDistanceAbs : 0;

          tps.push({
            method: 'SUPPORT_RESISTANCE',
            price: tpPrice,
            distancePct: tpDistPct,
            distanceAbs: tpDistAbs,
            realRatio,
            label,
            potentialProfit: 0,
          });
        }
      }

      if (method === 'BOLLINGER') {
        const boll = analysis.bollinger;
        if (boll.upper.length > 0 && boll.lower.length > 0) {
          let tpPrice: number;
          let label: string;

          if (req.direction === 'LONG') {
            tpPrice = boll.upper[boll.upper.length - 1].value;
            label = `Bollinger Superior`;
          } else {
            tpPrice = boll.lower[boll.lower.length - 1].value;
            label = `Bollinger Inferior`;
          }

          const tpDistAbs = Math.abs(tpPrice - entryPrice);
          const tpDistPct = (tpDistAbs / entryPrice) * 100;
          const realRatio = slDistanceAbs > 0 ? tpDistAbs / slDistanceAbs : 0;

          tps.push({
            method: 'BOLLINGER',
            price: tpPrice,
            distancePct: tpDistPct,
            distanceAbs: tpDistAbs,
            realRatio,
            label,
            potentialProfit: 0,
          });
        } else {
            warnings.push('No hay datos suficientes de Bollinger para este cálculo de TP.');
        }
      }
    }

    // Validate TPs and add warning if any TP is negative distance or reverse side
    for (const tp of tps) {
      if (req.direction === 'LONG' && tp.price <= entryPrice) {
        warnings.push(`El TP (${tp.label}) está por debajo del precio de entrada para una posición larga.`);
      }
      if (req.direction === 'SHORT' && tp.price >= entryPrice) {
        warnings.push(`El TP (${tp.label}) está por encima del precio de entrada para una posición corta.`);
      }
    }

    // 5) Risk Management
    const capital = req.capital;
    const riskPctDecimal = req.riskPct / 100;
    const moneyAtRisk = capital * riskPctDecimal;

    let positionSize = 0;
    if (slDistanceAbs > 0) {
      positionSize = moneyAtRisk / slDistanceAbs;
    }
    const positionValue = positionSize * entryPrice;

    if (positionValue > capital) {
      warnings.push('El tamaño de posición supera el capital disponible. Considera reducir el riesgo o aumentar el stop loss.');
    }

    // Calculate potential profit for each TP
    for (const tp of tps) {
      tp.potentialProfit = positionSize * tp.distanceAbs;
    }

    const riskManagement: RiskManagementResult = {
      moneyAtRisk,
      positionSize,
      positionValue,
      riskPctUsed: req.riskPct,
    };

    // 6) Bollinger values for display
    const bollUpper = analysis.bollinger.upper.length > 0
      ? analysis.bollinger.upper[analysis.bollinger.upper.length - 1].value
      : null;
    const bollLower = analysis.bollinger.lower.length > 0
      ? analysis.bollinger.lower[analysis.bollinger.lower.length - 1].value
      : null;

    return {
      symbol: req.symbol.toUpperCase(),
      direction: req.direction,
      interval: req.interval,
      entryPrice,
      entryDate,
      sl,
      slDistancePct,
      slDistanceAbs,
      slMethod: req.slMethod,
      slMethodLabel,
      detectedSLLevel,
      tps,
      riskManagement,
      currency: req.currency,
      warnings,
      candles: candles.map(c => ({
        date: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      })),
      supports: analysis.supports,
      resistances: analysis.resistances,
      bollingerUpper: bollUpper,
      bollingerLower: bollLower,
      sma50: analysis.sma50,
      sma200: analysis.sma200,
      bollingerData: analysis.bollinger.upper.length > 0 ? {
        upper: analysis.bollinger.upper,
        lower: analysis.bollinger.lower,
      } : null,
      analyzedAt: new Date().toISOString(),
    };
  }
}
