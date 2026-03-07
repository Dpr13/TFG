import { Router } from 'express';
import { operationController } from '../controllers/operation.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/operations', requireAuth, operationController.create);
router.get('/operations', requireAuth, operationController.getAll);
router.get('/operations/range', requireAuth, operationController.getByDateRange);
router.get('/operations/stats/daily/:date', requireAuth, operationController.getDailyStats);
router.get('/operations/stats/monthly', requireAuth, operationController.getMonthlyStats);
router.get('/operations/strategy/:strategyId', requireAuth, operationController.getByStrategyId);
router.get('/operations/date/:date', requireAuth, operationController.getByDate);
router.delete('/operations/date/:date', requireAuth, operationController.deleteByDate);
router.get('/operations/:id', requireAuth, operationController.getById);
router.put('/operations/:id', requireAuth, operationController.update);
router.delete('/operations/:id', requireAuth, operationController.delete);

export default router;
