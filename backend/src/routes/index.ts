import { Router } from 'express';
import assetsRouter from './assets.routes';
import priceRouter from './price.routes';
import riskRouter from './risk.routes';
import newsRouter from './news.routes';

const router = Router();

router.use('/', assetsRouter);
router.use('/', priceRouter);
router.use('/', riskRouter);
router.use('/', newsRouter);

export default router;
