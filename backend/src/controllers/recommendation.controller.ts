import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { getLanguage, i18n } from '../utils/i18n';
import type { RecommendationRequest } from '../models/recommendation';

const recommendationService = new RecommendationService();

/**
 * POST /api/recommendation/calculate
 * Calculates Stop Loss, Take Profit, and risk management for a given asset and operation parameters.
 */
export const calculateRecommendation = async (req: Request, res: Response): Promise<void> => {
  const lang = getLanguage(req.headers['accept-language']);
  const t = i18n[lang].recommendation;

  try {
    const payload = req.body as Partial<RecommendationRequest>;

    // Basic validation
    if (!payload.symbol || typeof payload.symbol !== 'string') {
      res.status(400).json({ error: t.errors.symbolRequired });
      return;
    }
    if (!payload.direction || !['LONG', 'SHORT'].includes(payload.direction)) {
      res.status(400).json({ error: t.errors.invalidDirection });
      return;
    }
    if (!payload.slMethod || !['FIXED_PCT', 'SUPPORT_RESISTANCE', 'DYNAMIC_ATR'].includes(payload.slMethod)) {
      res.status(400).json({ error: t.errors.invalidSLMethod });
      return;
    }
    if (!payload.tpMethods || !Array.isArray(payload.tpMethods) || payload.tpMethods.length === 0) {
      res.status(400).json({ error: t.errors.tpMethodRequired });
      return;
    }
    if (!payload.capital || payload.capital <= 0) {
      res.status(400).json({ error: t.errors.invalidCapital });
      return;
    }
    if (!payload.riskPct || payload.riskPct <= 0 || payload.riskPct > 100) {
      res.status(400).json({ error: t.errors.invalidRisk });
      return;
    }

    const request: RecommendationRequest = {
      symbol: payload.symbol,
      direction: payload.direction as 'LONG' | 'SHORT',
      interval: payload.interval || '1d',
      range: payload.range || '',
      slMethod: payload.slMethod as 'FIXED_PCT' | 'SUPPORT_RESISTANCE' | 'DYNAMIC_ATR',
      slPct: payload.slPct,
      tpMethods: payload.tpMethods as any[],
      customRatio: payload.customRatio,
      rrRatio: payload.rrRatio,
      capital: Number(payload.capital),
      riskPct: Number(payload.riskPct),
      currency: payload.currency || 'USD',
    };

    const result = await recommendationService.calculate(request, lang);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    // Errors from service are already localized or caught here
    if (message === t.errors.noData) {
      res.status(422).json({ error: message });
      return;
    }

    // Business rule errors from service (already localized in service)
    if (
      message === t.errors.slAboveLong ||
      message === t.errors.slBelowShort ||
      message === t.errors.noSupport ||
      message === t.errors.noResistance
    ) {
      res.status(400).json({ error: message });
      return;
    }

    console.error('Error calculating recommendation:', error);
    res.status(500).json({
      error: t.errors.internal,
      message,
    });
  }
};
