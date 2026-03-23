import { Router } from 'express';
import { calculateRecommendation } from '../controllers/recommendation.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/recommendation/calculate
// We use optionalAuth to allow both guests and logged-in users to use it (similar to technical-analysis)
router.post('/recommendation/calculate', optionalAuth, calculateRecommendation);

export default router;
