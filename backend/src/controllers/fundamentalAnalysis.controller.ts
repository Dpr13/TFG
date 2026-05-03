import { Request, Response } from 'express';
import { FundamentalAnalysisService } from '../services/fundamentalAnalysis.service';
import { getLanguage, Language } from '../utils/i18n';

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

  const { range, lang: queryLang } = req.query;
  const selectedRange = (range as string) || '1y';
  const lang: Language = (queryLang as Language) || getLanguage(req.headers['accept-language'] as string);

  try {
    const analysis = await analysisService.analyze(symbol, lang, selectedRange);

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
