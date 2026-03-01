import { Router } from 'express';
import assetsRouter from './assets.routes';
import priceRouter from './price.routes';
import riskRouter from './risk.routes';
import operationsRouter from './operations.routes';
import strategiesRouter from './strategies.routes';
import psychoanalysisRouter from './psychoanalysis.routes';

const router = Router();

router.use('/', assetsRouter);
router.use('/', priceRouter);
router.use('/', riskRouter);
router.use('/', operationsRouter);
router.use('/', strategiesRouter);
router.use('/', psychoanalysisRouter);

export default router;
