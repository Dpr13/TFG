import { Router } from 'express';
import { getNews } from '../controllers/news.controller';

const router = Router();

/**
 * GET /api/news
 * Noticias financieras desde Yahoo Finance
 * Query: q (término), count (número de artículos, max 20)
 */
router.get('/news', getNews);

export default router;
