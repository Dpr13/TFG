import { Router } from 'express';
import assetsRouter from './assets.routes';
import priceRouter from './price.routes';

const router = Router();

router.use('/', assetsRouter);
router.use('/', priceRouter);

export default router;
