import { Router } from 'express';
import { strategyController } from '../controllers/strategy.controller';

/**
 * ESTRATEGIAS ROUTES
 * 
 * EXPANSIÓN: Rutas adicionales a considerar:
 * - GET /strategies/:id/performance - Performance metrics de una estrategia
 * - GET /strategies/:id/backtest - Backtest de una estrategia (simulación histórica)
 * - POST /strategies/:id/clone - Clonar estrategia existente
 * - GET /strategies/comparison - Comparar múltiples estrategias
 * - GET /strategies/trending - Top strategies por rentabilidad
 * - GET /strategies/templates - Templates predefinidas del sistema
 * - PATCH /strategies/:id - Partial update
 * - GET /strategies/:id/operations - Operaciones asociadas a una estrategia
 */

const router = Router();

router.post('/strategies', strategyController.create);
router.get('/strategies', strategyController.getAll);
router.get('/strategies/:id', strategyController.getById);
router.put('/strategies/:id', strategyController.update);
router.delete('/strategies/:id', strategyController.delete);

// Strategy operations and performance
router.get('/strategies/:id/operations', strategyController.getOperations);
router.get('/strategies/:id/performance', strategyController.getPerformance);

export default router;
