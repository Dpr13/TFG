import { Request, Response } from 'express';
import { TechnicalAnalysisService } from '../services/technicalAnalysis.service';
import { getLanguage, Language } from '../utils/i18n';

const analysisService = new TechnicalAnalysisService();

/**
 * GET /api/assets/:symbol/technical-analysis
 * Returns full technical analysis with indicators and signal
 */
export const getTechnicalAnalysis = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol || typeof symbol !== 'string') {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }

  const { range, interval, lang: queryLang } = req.query;
  const selectedRange = (range as string) || '1y';
  const lang: Language = (queryLang as Language) || getLanguage(req.headers['accept-language'] as string);

  try {
    const analysis = await analysisService.analyze(symbol, selectedRange, interval as string, lang);
    res.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('No hay suficientes datos')) {
      res.status(422).json({ error: message });
      return;
    }

    console.error('Error generating technical analysis:', error);
    res.status(500).json({
      error: 'Failed to generate technical analysis',
      message,
    });
  }
};
