import { Router } from 'express';
import { strategyController } from '../controllers/strategy.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/strategies', requireAuth, strategyController.create);
router.get('/strategies', requireAuth, strategyController.getAll);
router.get('/strategies/:id', requireAuth, strategyController.getById);
router.put('/strategies/:id', requireAuth, strategyController.update);
router.delete('/strategies/:id', requireAuth, strategyController.delete);
router.get('/strategies/:id/operations', requireAuth, strategyController.getOperations);
router.get('/strategies/:id/performance', requireAuth, strategyController.getPerformance);

export default router;
