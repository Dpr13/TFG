import { Router } from 'express';
import { getPriceHistory } from '../controllers/price.controller';

const router = Router();

// GET /api/assets/:symbol/history
router.get('/assets/:symbol/history', getPriceHistory);

export default router;
