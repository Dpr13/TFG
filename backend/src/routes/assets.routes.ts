import { Router } from 'express';
import { getAssets, searchAsset } from '../controllers/asset.controller';
import { getFinancialData } from '../controllers/financialData.controller';
import { getFundamentalAnalysis } from '../controllers/fundamentalAnalysis.controller';

const router = Router();

// GET /api/assets
router.get('/assets', getAssets);

// GET /api/assets/search/:symbol
router.get('/assets/search/:symbol', searchAsset);

// GET /api/assets/:symbol/financial
router.get('/assets/:symbol/financial', getFinancialData);

// GET /api/assets/:symbol/fundamental-analysis
router.get('/assets/:symbol/fundamental-analysis', getFundamentalAnalysis);

export default router;
