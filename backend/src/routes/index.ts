import { Router } from 'express';
import usersRouter from './users.routes';
import assetsRouter from './assets.routes';
import priceRouter from './price.routes';
import riskRouter from './risk.routes';
import operationsRouter from './operations.routes';
import strategiesRouter from './strategies.routes';
import psychoanalysisRouter from './psychoanalysis.routes';
import newsRouter from './news.routes';
import watchlistRouter from './watchlist.routes';
import recommendationRouter from './recommendation.routes'; // Added
import iaRouter from './ia.routes';

const router = Router();

// Public routes first (no auth required)
router.use('/', usersRouter);

// Protected routes
router.use('/', assetsRouter);
router.use('/', priceRouter);
router.use('/', riskRouter);
router.use('/', operationsRouter);
router.use('/', strategiesRouter);
router.use('/', psychoanalysisRouter);
router.use('/', newsRouter);
router.use('/', watchlistRouter);
router.use('/', recommendationRouter); // Added
router.use('/', iaRouter);

export default router;
