import { Router } from 'express';
import { getNews, getMarketNews, getAssetNews } from '../controllers/news.controller';

const router = Router();

/**
 * GET /api/news
 * Noticias financieras desde Yahoo Finance
 * Query: q (término), count (número de artículos, max 20)
 */
router.get('/news', getNews);

// Nuevos endpoints para Sidebar
router.get('/noticias/mercados', getMarketNews);
router.get('/noticias/activo/:ticker', getAssetNews);

export default router;
