import { Router } from 'express';
import { compararActivos, veredictoComparativa } from '../controllers/comparison.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/comparar — Compare 2-3 assets
router.post('/comparar', optionalAuth, compararActivos);

// POST /api/comparar/veredicto — Generate AI verdict for comparison
router.post('/comparar/veredicto', optionalAuth, veredictoComparativa);

export default router;
