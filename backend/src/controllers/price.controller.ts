import { Request, Response } from 'express';
import { PriceService } from '../services/price.service';

/**
 * Controller for price-related endpoints
 * Handles HTTP request/response only, delegates business logic to service
 */
export const getPriceHistory = (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol || typeof symbol !== 'string') {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }

  const result = PriceService.getPriceHistory(symbol);

  if (!result) {
    res.status(404).json({ error: `Asset with symbol '${symbol}' not found` });
    return;
  }

  res.json(result);
};
