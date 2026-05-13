import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { openPosition, closePosition, getOpenPositions, getAllPositions, getPositionTrades, getDailyTrades, getMonthlyStats, deletePosition } from '../controllers/position.controller';

const router = Router();

router.get('/positions',                requireAuth, getAllPositions);
router.get('/positions/open',           requireAuth, getOpenPositions);
router.get('/positions/trades/daily',   requireAuth, getDailyTrades);
router.get('/positions/stats/monthly',  requireAuth, getMonthlyStats);
router.post('/positions',               requireAuth, openPosition);
router.post('/positions/:id/close',     requireAuth, closePosition);
router.get('/positions/:id/trades',     requireAuth, getPositionTrades);
router.delete('/positions/:id',         requireAuth, deletePosition);

export default router;
