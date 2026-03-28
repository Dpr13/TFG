import { Request, Response } from 'express';
import axios from 'axios';

interface YahooNewsRaw {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  type: string;
  thumbnail?: {
    resolutions: Array<{ url: string; width: number; height: number; tag: string }>;
  };
  relatedTickers?: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  thumbnail: string | null;
  relatedTickers: string[];
}

/**
 * GET /api/news
 * Obtiene noticias financieras desde Yahoo Finance Search API (sin API key).
 * Query params:
 *   - q: término de búsqueda (default: "financial markets stocks")
 *   - count: número de noticias (default: 8, max 20)
 */
export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || 'financial markets stocks economy';
    const count = Math.min(parseInt(req.query.count as string) || 8, 20);

    const response = await axios.get(
      'https://query1.finance.yahoo.com/v1/finance/search',
      {
        params: {
          q: query,
          newsCount: count,
          lang: 'en-US',
          region: 'US',
          enableNavLinks: false,
          enableEnhancedTrivialQuery: true,
        },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 8000,
      }
    );

    const rawNews: YahooNewsRaw[] = response.data?.news ?? [];

    const articles: NewsArticle[] = rawNews
      .filter((item) => item.type === 'STORY')
      .map((item) => {
        // Prefer 140x140 thumbnail, fallback to first available
        const thumb =
          item.thumbnail?.resolutions?.find((r) => r.tag === '140x140')?.url ??
          item.thumbnail?.resolutions?.[0]?.url ??
          null;

        return {
          id: item.uuid,
          title: item.title,
          publisher: item.publisher,
          url: item.link,
          publishedAt: new Date(item.providerPublishTime * 1000).toISOString(),
          thumbnail: thumb,
          relatedTickers: item.relatedTickers ?? [],
        };
      });

    res.json({ articles, query, count: articles.length });
  } catch (error: any) {
    console.error('Error fetching news from Yahoo Finance:', error.message);
    res.status(502).json({
      error: 'No se pudieron obtener las noticias',
      details: error.message,
    });
  }
};

/**
 * GET /api/noticias/mercados
 * Obtiene noticias financieras de índices de referencia (^GSPC, ^DJI, ^IXIC)
 */
export const getMarketNews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tickers = ['^GSPC', '^DJI', '^IXIC'];
    const newsPromises = tickers.map(t => 
      axios.get('https://query1.finance.yahoo.com/v1/finance/search', {
        params: { q: t, newsCount: 5, lang: 'en-US', region: 'US' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      }).catch(() => ({ data: { news: [] } }))
    );

    const results = await Promise.all(newsPromises);
    const allNews: YahooNewsRaw[] = results.flatMap(r => r.data?.news ?? []);
    
    // Uniq by uuid and sort by time desc
    const seen = new Set();
    const uniqueNews = allNews.filter(n => {
      const duplicate = seen.has(n.uuid);
      seen.add(n.uuid);
      return !duplicate && n.type === 'STORY';
    });

    const articles: NewsArticle[] = uniqueNews
      .sort((a, b) => b.providerPublishTime - a.providerPublishTime)
      .slice(0, 10)
      .map(item => ({
        id: item.uuid,
        title: item.title,
        publisher: item.publisher,
        url: item.link,
        publishedAt: new Date(item.providerPublishTime * 1000).toISOString(),
        thumbnail: item.thumbnail?.resolutions?.[0]?.url ?? null,
        relatedTickers: item.relatedTickers ?? [],
      }));

    res.json(articles);
  } catch (error: any) {
    res.status(502).json({ error: 'Error al obtener noticias de mercado' });
  }
};

/**
 * GET /api/noticias/activo/:ticker
 * Obtiene noticias específicas de un activo
 */
export const getAssetNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticker } = req.params;
    if (!ticker) {
      res.status(400).json({ error: 'Ticker no proporcionado' });
      return;
    }

    const response = await axios.get('https://query1.finance.yahoo.com/v1/finance/search', {
      params: { q: ticker, newsCount: 8, lang: 'en-US', region: 'US' },
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });

    const rawNews: YahooNewsRaw[] = response.data?.news ?? [];
    const articles: NewsArticle[] = rawNews
      .filter(n => n.type === 'STORY')
      .map(item => ({
        id: item.uuid,
        title: item.title,
        publisher: item.publisher,
        url: item.link,
        publishedAt: new Date(item.providerPublishTime * 1000).toISOString(),
        thumbnail: item.thumbnail?.resolutions?.[0]?.url ?? null,
        relatedTickers: item.relatedTickers ?? [],
      }));

    res.json(articles);
  } catch (error: any) {
    res.status(502).json({ error: `Error al obtener noticias de ${req.params.ticker}` });
  }
};
