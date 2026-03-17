import { Request, Response } from 'express';
import { FundamentalAnalysisService } from '../services/fundamentalAnalysis.service';

const analysisService = new FundamentalAnalysisService();

/**
 * GET /api/assets/:symbol/fundamental-analysis
 * Returns a structured fundamental analysis for the given symbol
 */
export const getFundamentalAnalysis = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol || typeof symbol !== 'string') {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }

  try {
    const analysis = await analysisService.analyze(symbol);

    if (!analysis) {
      res.status(404).json({
        error: `No se encontraron datos financieros para '${symbol}'`,
      });
      return;
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error generating fundamental analysis:', error);
    res.status(500).json({
      error: 'Failed to generate fundamental analysis',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
