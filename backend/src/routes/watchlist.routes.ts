import { Router } from 'express';
import { 
  getUserWatchlist, 
  addToWatchlist, 
  removeFromWatchlist, 
  checkInWatchlist,
  clearWatchlist 
} from '../controllers/watchlist.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * RUTAS DE WATCHLIST
 * Todas las rutas requieren autenticación
 */

// GET /watchlist - Obtener toda la watchlist del usuario
router.get('/watchlist', authenticateToken, getUserWatchlist);

// POST /watchlist - Agregar activo a la watchlist
router.post('/watchlist', authenticateToken, addToWatchlist);

// GET /watchlist/check/:symbol - Verificar si un activo está en la watchlist
router.get('/watchlist/check/:symbol', authenticateToken, checkInWatchlist);

// DELETE /watchlist/:symbol - Eliminar activo de la watchlist
router.delete('/watchlist/:symbol', authenticateToken, removeFromWatchlist);

// DELETE /watchlist - Limpiar toda la watchlist
router.delete('/watchlist', authenticateToken, clearWatchlist);

export default router;
