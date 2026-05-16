import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { saveBrokerCredential, listBrokerCredentials, deleteBrokerCredential, getBrokerBalance } from '../controllers/broker_credential.controller';

const router = Router();

router.get('/broker-credentials', requireAuth, listBrokerCredentials);
router.post('/broker-credentials', requireAuth, saveBrokerCredential);
router.delete('/broker-credentials/:broker', requireAuth, deleteBrokerCredential);
router.get('/broker-credentials/:broker/balance', requireAuth, getBrokerBalance);

export default router;
