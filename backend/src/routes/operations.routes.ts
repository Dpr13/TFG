import { Router } from 'express';
import { operationController } from '../controllers/operation.controller';

/**
 * OPERACIONES ROUTES
 * 
 * EXPANSIÓN: Rutas adicionales a considerar:
 * - GET /operations/stats/yearly - Estadísticas anuales
 * - GET /operations/export - CSV/Excel export
 * - POST /operations/import - Bulk import desde CSV
 * - GET /operations/search - Search con filters complejos (símbolo, rango PnL, etc.)
 * - GET /operations/strategy/:strategyId - Operaciones de una estrategia específica
 * - PATCH /operations/:id - Partial updates (actualizar solo campos específicos)
 * - GET /operations/trending - Top gainers/losers (últimas N operaciones)
 * - POST /operations/batch - Crear múltiples operaciones en una llamada
 */

const router = Router();

// CRUD operations
router.post('/operations', operationController.create);
router.get('/operations', operationController.getAll);
router.get('/operations/:id', operationController.getById);
router.put('/operations/:id', operationController.update);
router.delete('/operations/:id', operationController.delete);

// Date-based queries
router.get('/operations/date/:date', operationController.getByDate);
router.delete('/operations/date/:date', operationController.deleteByDate);

// Stats
router.get('/operations/stats/daily/:date', operationController.getDailyStats);
router.get('/operations/stats/monthly', operationController.getMonthlyStats);

// Date range query
router.get('/operations/range', operationController.getByDateRange);

// Strategy-based queries
router.get('/operations/strategy/:strategyId', operationController.getByStrategyId);

export default router;
