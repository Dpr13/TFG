import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import type { RecommendationRequest } from '../models/recommendation';

const recommendationService = new RecommendationService();

/**
 * POST /api/recommendation/calculate
 * Calculates Stop Loss, Take Profit, and risk management for a given asset and operation parameters.
 */
export const calculateRecommendation = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as Partial<RecommendationRequest>;

    // Basic validation
    if (!payload.symbol || typeof payload.symbol !== 'string') {
      res.status(400).json({ error: 'El símbolo es obligatorio' });
      return;
    }
    if (!payload.direction || !['LONG', 'SHORT'].includes(payload.direction)) {
      res.status(400).json({ error: 'La dirección debe ser LONG o SHORT' });
      return;
    }
    if (!payload.slMethod || !['FIXED_PCT', 'SUPPORT_RESISTANCE'].includes(payload.slMethod)) {
      res.status(400).json({ error: 'Método de Stop Loss no válido' });
      return;
    }
    if (!payload.tpMethods || !Array.isArray(payload.tpMethods) || payload.tpMethods.length === 0) {
      res.status(400).json({ error: 'Debe seleccionar al menos un método de Take Profit' });
      return;
    }
    if (!payload.capital || payload.capital <= 0) {
      res.status(400).json({ error: 'El capital debe ser mayor que 0' });
      return;
    }
    if (!payload.riskPct || payload.riskPct <= 0 || payload.riskPct > 100) {
      res.status(400).json({ error: 'El porcentaje de riesgo debe estar entre 0.1 y 100' });
      return;
    }

    const request: RecommendationRequest = {
      symbol: payload.symbol,
      direction: payload.direction as 'LONG' | 'SHORT',
      interval: payload.interval || '1d',
      range: payload.range || '1y',
      slMethod: payload.slMethod as 'FIXED_PCT' | 'SUPPORT_RESISTANCE',
      slPct: payload.slPct,
      tpMethods: payload.tpMethods as any[],
      customRatio: payload.customRatio,
      rrRatio: payload.rrRatio,
      capital: Number(payload.capital),
      riskPct: Number(payload.riskPct),
      currency: payload.currency || 'USD',
    };

    const result = await recommendationService.calculate(request);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    if (message.includes('No se encontraron datos') || message.includes('No hay suficientes datos')) {
      res.status(422).json({ error: message });
      return;
    }

    // Business rule errors from service
    if (
      message.includes('El stop loss debe estar') ||
      message.includes('No se detectaron')
    ) {
      res.status(400).json({ error: message });
      return;
    }

    console.error('Error calculating recommendation:', error);
    res.status(500).json({
      error: 'Error interno al calcular la recomendación',
      message,
    });
  }
};
