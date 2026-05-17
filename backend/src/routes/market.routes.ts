import { Router } from 'express';
import { getBuffettIndicator } from '../controllers/buffett.controller';

const router = Router();

// GET /api/market/buffett?country=ES
router.get('/market/buffett', getBuffettIndicator);

export default router;
