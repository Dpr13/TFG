import { Request, Response } from 'express';
import { ComparisonService } from '../services/comparison.service';
import { generarVeredictoComparativa } from '../services/ia.service';
import { i18n, getLanguage, Language } from '../utils/i18n';

const comparisonService = new ComparisonService();

/**
 * POST /api/comparar
 * Compares 2-3 assets in parallel (fundamental + technical + risk)
 */
export const compararActivos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tickers, horizonte = '1y' } = req.body;
    const lang: Language = getLanguage(req.headers['accept-language'] as string);
    const t = i18n[lang];

    if (!Array.isArray(tickers) || tickers.length < 2 || tickers.length > 3) {
      res.status(400).json({ error: t.comparison.errors.selectCount });
      return;
    }

    const cleanTickers = tickers.map((t: string) => t.trim().toUpperCase()).filter(Boolean);
    if (cleanTickers.length < 2) {
      res.status(400).json({ error: t.comparison.errors.selectValid });
      return;
    }

    const resultados = await Promise.all(
      cleanTickers.map((ticker: string) => comparisonService.analyzeForComparison(ticker, horizonte))
    );

    res.json({ resultados, horizonte });
  } catch (error) {
    const lang = getLanguage(req.headers['accept-language']);
    res.status(500).json({ error: i18n[lang].comparison.errors.internal });
  }
};

/**
 * POST /api/comparar/veredicto
 * Generates AI verdict for a comparison
 */
export const veredictoComparativa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resultados, horizonte = '1y', lang: payloadLang } = req.body;
    const lang: Language = (payloadLang as Language) || getLanguage(req.headers['accept-language'] as string);
    const t = i18n[lang];

    if (!Array.isArray(resultados) || resultados.length < 2) {
      res.status(400).json({ veredicto: null, ok: false, error: t.comparison.errors.minTwo });
      return;
    }

    const resultado = await generarVeredictoComparativa(resultados, horizonte, lang);

    if (resultado.ok) {
      res.json(resultado);
    } else {
      res.status(500).json(resultado);
    }
  } catch (error) {
    const lang: Language = getLanguage(req.headers['accept-language'] as string);
    res.status(500).json({ veredicto: null, ok: false, error: i18n[lang].comparison.errors.aiUnavailable });
  }
};
