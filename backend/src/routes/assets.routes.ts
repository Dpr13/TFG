import { Router } from 'express';
import { getAssets } from '../controllers/asset.controller';

const router = Router();

// GET /api/assets
router.get('/assets', getAssets);

export default router;
