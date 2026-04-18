import { Router } from 'express';
import { getAssets, searchAsset, getUserSearchedAssets, saveSearchedAsset, autocompleteAssets } from '../controllers/asset.controller';
import { getFinancialData } from '../controllers/financialData.controller';
import { getFundamentalAnalysis } from '../controllers/fundamentalAnalysis.controller';
import { getTechnicalAnalysis } from '../controllers/technicalAnalysis.controller';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/assets
router.get('/assets', getAssets);

// GET /api/assets/search/:symbol
router.get('/assets/search/:symbol', searchAsset);

// GET /api/assets/autocomplete?q=term
router.get('/assets/autocomplete', autocompleteAssets);

// GET /api/assets/searched - Get user's searched assets (optional auth)
router.get('/assets/searched', optionalAuth, getUserSearchedAssets);

// POST /api/assets/searched - Save a searched asset (requires auth)
router.post('/assets/searched', requireAuth, saveSearchedAsset);

// GET /api/assets/:symbol/financial
router.get('/assets/:symbol/financial', getFinancialData);

// GET /api/assets/:symbol/fundamental-analysis
router.get('/assets/:symbol/fundamental-analysis', getFundamentalAnalysis);

// GET /api/assets/:symbol/technical-analysis
router.get('/assets/:symbol/technical-analysis', getTechnicalAnalysis);

export default router;
