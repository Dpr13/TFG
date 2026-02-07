import { Router } from 'express';
import assetsRouter from './assets.routes';
import priceRouter from './price.routes';
import riskRouter from './risk.routes';

const router = Router();

router.use('/', assetsRouter);
router.use('/', priceRouter);
router.use('/', riskRouter);

export default router;
