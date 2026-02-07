import { Request, Response } from 'express';
import { PriceService } from '../services/price.service';

// Create a single instance of PriceService
const priceService = new PriceService();

/**
 * Controller for price-related endpoints
 * Handles HTTP request/response only, delegates business logic to service
 */
export const getPriceHistory = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol || typeof symbol !== 'string') {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }

  try {
    const result = await priceService.getPriceHistory(symbol);

    if (!result) {
      res.status(404).json({ error: `Asset with symbol '${symbol}' not found` });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      error: 'Failed to fetch price history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
