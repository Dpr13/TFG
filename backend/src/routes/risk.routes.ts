import { Router } from 'express';
import { getRiskMetrics } from '../controllers/risk.controller';

const router = Router();

// GET /api/assets/:symbol/risk
router.get('/assets/:symbol/risk', getRiskMetrics);

export default router;
