import { TechnicalAnalysisService } from './technicalAnalysis.service';
import { i18n, Language } from '../utils/i18n';
import type {
  RecommendationRequest,
  RecommendationResult,
  TPResult,
  RiskManagementResult,
} from '../models/recommendation';

const technicalService = new TechnicalAnalysisService();

// Map intervals to ranges that Yahoo Finance supports
const INTERVAL_RANGE_MAP: Record<string, string> = {
  '1m': '7d', // using '7d' logic, actually service caps to 6d automatically
  '5m': '60d', // actually 6mo is allowed for 5m? No, Yahoo limits to 60d. To map, we can use '60d' or '6mo' (which gets capped). Let's use '60d' equivalent or let the cap handle it.
  '15m': '60d',
  '1h': '730d',
  '4h': '60d', // using 60d
  '1d': '1y',
  '1wk': '1y',
  '1mo': '1y',
};

export class RecommendationService {

  async calculate(req: RecommendationRequest, lang: Language = 'es'): Promise<RecommendationResult> {
    const range = req.range || INTERVAL_RANGE_MAP[req.interval] || '1y';
    const t = i18n[lang].recommendation;

    // 1) Get full technical analysis (OHLCV + indicators)
    const analysis = await technicalService.analyze(req.symbol, range, req.interval, lang);

    const candles = analysis.candles;
    if (candles.length === 0) {
      throw new Error(t.errors.noData);
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
      slMethodLabel = t.labels.fixedPct;
    } else if (req.slMethod === 'DYNAMIC_ATR') {
      const atrValue = analysis.atr && analysis.atr.length > 0 ? analysis.atr[analysis.atr.length - 1].value : 0;
      if (atrValue === 0) {
        throw new Error(t.errors.failedATR);
      }
      sl = req.direction === 'LONG'
        ? entryPrice - (atrValue * 1.5)
        : entryPrice + (atrValue * 1.5);
      slMethodLabel = t.labels.dynamicATR;
      detectedSLLevel = t.labels.atrDetected.replace('${atr}', atrValue.toFixed(4));
    } else {
      // SUPPORT_RESISTANCE
      if (req.direction === 'LONG') {
        // Find closest support BELOW entry price
        const supportBelow = analysis.supports
          .filter(s => s.price < entryPrice)
          .sort((a, b) => b.price - a.price);
        if (supportBelow.length > 0) {
          sl = supportBelow[0].price;
          detectedSLLevel = t.labels.supportDetected.replace('${price}', sl.toFixed(2));
        } else {
          throw new Error(t.errors.noSupport);
        }
      } else {
        // SHORT: find closest resistance ABOVE entry price
        const resistanceAbove = analysis.resistances
          .filter(r => r.price > entryPrice)
          .sort((a, b) => a.price - b.price);
        if (resistanceAbove.length > 0) {
          sl = resistanceAbove[0].price;
          detectedSLLevel = t.labels.resistanceDetected.replace('${price}', sl.toFixed(2));
        } else {
          throw new Error(t.errors.noResistance);
        }
      }
      slMethodLabel = req.direction === 'LONG' ? t.labels.support : t.labels.resistance;
    }

    // 3) Validate SL
    if (req.direction === 'LONG' && sl >= entryPrice) {
      throw new Error(t.errors.slAboveLong);
    }
    if (req.direction === 'SHORT' && sl <= entryPrice) {
      throw new Error(t.errors.slBelowShort);
    }

    const slDistanceAbs = Math.abs(entryPrice - sl);
    const slDistancePct = (slDistanceAbs / entryPrice) * 100;

    if (slDistancePct < 0.1) {
      warnings.push(t.warnings.tightSL);
    }
    if (slDistancePct > 15) {
      warnings.push(t.warnings.wideSL);
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
          label: t.labels.riskReward.replace('{ratio}', ratio.toString()),
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
            label = t.labels.resistance;
          } else {
             warnings.push(t.warnings.noResisTP);
          }
        } else {
          const supportBelow = analysis.supports
            .filter(s => s.price < entryPrice)
            .sort((a, b) => b.price - a.price);
          if (supportBelow.length > 0) {
            tpPrice = supportBelow[0].price;
            label = t.labels.support;
          } else {
             warnings.push(t.warnings.noSupportTP);
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
            label = t.labels.bollingerUpper;
          } else {
            tpPrice = boll.lower[boll.lower.length - 1].value;
            label = t.labels.bollingerLower;
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
            warnings.push(t.warnings.noATRTP);
        }
      }
    }

    // Validate TPs and add warning if any TP is negative distance or reverse side
    let validTps = tps.filter(tp => {
      if (req.direction === 'LONG' && tp.price <= entryPrice) {
        warnings.push(t.warnings.tpBelowLong.replace('{label}', tp.label));
        return false;
      }
      if (req.direction === 'SHORT' && tp.price >= entryPrice) {
        warnings.push(t.warnings.tpAboveShort.replace('{label}', tp.label));
        return false;
      }
      return true;
    });

    // 4) Selección final de TP
    if (validTps.length > 1) {
      validTps.sort((a, b) => a.distanceAbs - b.distanceAbs);
      validTps = [validTps[0]]; // Pick the closest and most conservative
    } else if (validTps.length === 0) {
      warnings.push(t.warnings.noValidTP);
    }
    
    // Additional validations
    if (validTps.length > 0 && validTps[0].realRatio > 0 && validTps[0].realRatio < 1.5) {
      warnings.push(t.warnings.lowQuality);
    }

    const atrValue = analysis.atr && analysis.atr.length > 0 ? analysis.atr[analysis.atr.length - 1].value : 0;
    if (atrValue > 0 && slDistanceAbs < 0.5 * atrValue) {
      warnings.push(t.warnings.veryTightSL);
    }
    if (atrValue > 0 && atrValue < entryPrice * 0.005) {
      warnings.push(t.warnings.lowVol);
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
      warnings.push(t.warnings.insufficientCapital);
    }

    // Calculate potential profit for each TP
    for (const tp of validTps) {
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

    // 7) Confidence and Reasoning
    let confidence = analysis.signal.score;
    if (req.direction === 'LONG' && ['COMPRA FUERTE', 'COMPRA'].includes(analysis.signal.classification)) confidence += 15;
    else if (req.direction === 'SHORT' && ['VENTA FUERTE', 'VENTA'].includes(analysis.signal.classification)) confidence += 15;
    else if (req.direction === 'LONG' && ['VENTA FUERTE', 'VENTA'].includes(analysis.signal.classification)) confidence -= 20;
    else if (req.direction === 'SHORT' && ['COMPRA FUERTE', 'COMPRA'].includes(analysis.signal.classification)) confidence -= 20;

    if (atrValue > 0 && atrValue < entryPrice * 0.005) {
      confidence -= 15;
    }

    if (tps.length > 1) {
      confidence += 5; // Confluence of multiple initial TP targets
    }

    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    let reasoning = t.reasoning.base.replace('{confidence}', confidence.toString());
    if (confidence >= 70) reasoning += t.reasoning.high;
    else if (confidence < 40) reasoning += t.reasoning.low;
    else reasoning += t.reasoning.mixed;

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
      tps: validTps,
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
      signal: analysis.signal,
      confidence,
      reasoning,
      atr: atrValue,
      analyzedAt: new Date().toISOString(),
    };
  }
}
