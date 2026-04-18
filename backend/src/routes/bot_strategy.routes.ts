import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createBotStrategy, getBotStrategies, getBotStrategy, updateBotStrategy, deleteBotStrategy } from '../controllers/bot_strategy.controller';

const router = Router();

router.get('/bot-strategies', requireAuth, getBotStrategies);
router.post('/bot-strategies', requireAuth, createBotStrategy);
router.get('/bot-strategies/:id', requireAuth, getBotStrategy);
router.put('/bot-strategies/:id', requireAuth, updateBotStrategy);
router.delete('/bot-strategies/:id', requireAuth, deleteBotStrategy);

export default router;
