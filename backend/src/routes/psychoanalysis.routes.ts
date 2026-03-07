import { Router } from 'express';
import { psychoanalysisController } from '../controllers/psychoanalysis.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/psychoanalysis', requireAuth, psychoanalysisController.analyze);
router.get('/psychoanalysis/range', requireAuth, psychoanalysisController.analyzeByDateRange);

export default router;
