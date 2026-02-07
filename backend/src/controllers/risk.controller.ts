import { Request, Response } from 'express';
import { RiskService } from '../services/risk.service';
import { InsufficientDataError } from '../models/risk';

// Create a single instance of RiskService
const riskService = new RiskService();

/**
 * Controller for risk-related endpoints
 * Handles HTTP request/response only, delegates business logic to service
 */
export const getRiskMetrics = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol || typeof symbol !== 'string') {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }

  try {
    const riskMetrics = await riskService.calculateRiskMetrics(symbol);
    res.json(riskMetrics);
  } catch (error) {
    // Handle insufficient data error
    if (error instanceof InsufficientDataError) {
      res.status(422).json({
        error: 'Insufficient data for risk calculation',
        message: error.message,
      });
      return;
    }

    // Handle asset not found (from price service)
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        error: `Asset with symbol '${symbol}' not found`,
      });
      return;
    }

    // Handle unexpected errors
    console.error('Error calculating risk metrics:', error);
    res.status(500).json({
      error: 'Failed to calculate risk metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
