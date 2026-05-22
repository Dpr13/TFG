import { Router } from 'express';
import { getPriceHistory, getQuote } from '../controllers/price.controller';

const router = Router();

router.get('/assets/:symbol/history', getPriceHistory);
router.get('/quote/:symbol', getQuote);

export default router;
