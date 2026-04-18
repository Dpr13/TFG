import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createBot, getUserBots, startBot, stopBot, getBotTrades, getBotMetrics, deleteBot } from '../controllers/bot.controller';

const router = Router();

router.get('/bots', requireAuth, getUserBots);
router.post('/bots', requireAuth, createBot);
router.post('/bots/:id/start', requireAuth, startBot);
router.post('/bots/:id/stop', requireAuth, stopBot);
router.get('/bots/:id/trades', requireAuth, getBotTrades);
router.get('/bots/:id/metrics', requireAuth, getBotMetrics);
router.delete('/bots/:id', requireAuth, deleteBot);

export default router;
