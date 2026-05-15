import { Request, Response } from 'express';
import { buffettIndicatorService } from '../services/buffettIndicator.service';

/**
 * GET /api/market/buffett?country=US
 * Returns Buffett Indicator (market cap / GDP) for supported markets.
 */
export const getBuffettIndicator = async (req: Request, res: Response) => {
  const country = (req.query.country as string) || 'US';

  try {
    const result = await buffettIndicatorService.get(country);

    if (!result) {
      res.status(404).json({
        error: 'NOT_SUPPORTED',
        message: `Buffett indicator not available for country '${country}'.`,
      });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating Buffett indicator:', error);
    res.status(500).json({
      error: 'FAILED_TO_CALCULATE',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
