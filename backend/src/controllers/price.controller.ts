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
  const interval = req.query.interval as string | undefined;

  if (!symbol || typeof symbol !== 'string') {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }
  // Opcional: validar interval
  const allowedIntervals = ['1min','2min','5min','15min','30min','1h','4h','12h','1d','5d','1wk','1mo','3mo'];
  if (interval && !allowedIntervals.includes(interval)) {
    res.status(400).json({ error: `Interval '${interval}' not supported`, allowedIntervals });
    return;
  }

  try {
    const result = await priceService.getPriceHistory(symbol, interval);

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
