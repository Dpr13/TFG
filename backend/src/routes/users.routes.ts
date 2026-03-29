import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/users/register', userController.register);
router.post('/users/login', userController.login);
router.post('/users/verificar-email', userController.verificarEmail);
router.post('/users/reenviar-codigo', userController.reenviarCodigo);

// Protected routes
router.get('/users/profile', authenticateToken, userController.getProfile);
router.put('/users/profile', authenticateToken, userController.updateProfile);
router.post('/users/change-password', authenticateToken, userController.changePassword);

export default router;
