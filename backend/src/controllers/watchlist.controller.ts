import { Response } from 'express';
import { watchlistService } from '../services/watchlist.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * WATCHLIST CONTROLLER
 * Maneja las operaciones de la lista de seguimiento de activos del usuario
 */

/**
 * GET /watchlist
 * Obtener toda la watchlist del usuario autenticado
 */
export const getUserWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const watchlist = await watchlistService.getUserWatchlist(userId);
    res.json(watchlist);
  } catch (error) {
    console.error('Error getting watchlist:', error);
    res.status(500).json({ 
      error: 'Error al obtener la lista de seguimiento',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * POST /watchlist
 * Agregar un activo a la watchlist
 */
export const addToWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { assetSymbol, assetName, assetType } = req.body;

    if (!assetSymbol || !assetName || !assetType) {
      res.status(400).json({ 
        error: 'Datos incompletos', 
        message: 'Se requieren assetSymbol, assetName y assetType' 
      });
      return;
    }

    const result = await watchlistService.addToWatchlist(userId, {
      assetSymbol,
      assetName,
      assetType,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    
    if (message.includes('ya está en')) {
      res.status(409).json({ error: message });
    } else {
      res.status(500).json({ 
        error: 'Error al agregar a la lista de seguimiento',
        message 
      });
    }
  }
};

/**
 * DELETE /watchlist/:symbol
 * Eliminar un activo de la watchlist
 */
export const removeFromWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const symbol = typeof req.params.symbol === 'string' ? req.params.symbol : req.params.symbol[0];

    if (!symbol) {
      res.status(400).json({ error: 'Símbolo requerido' });
      return;
    }

    const result = await watchlistService.removeFromWatchlist(userId, symbol);
    res.json(result);
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    
    if (message.includes('no se encontró')) {
      res.status(404).json({ error: message });
    } else {
      res.status(500).json({ 
        error: 'Error al eliminar de la lista de seguimiento',
        message 
      });
    }
  }
};

/**
 * GET /watchlist/check/:symbol
 * Verificar si un activo está en la watchlist
 */
export const checkInWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const symbol = typeof req.params.symbol === 'string' ? req.params.symbol : req.params.symbol[0];

    if (!symbol) {
      res.status(400).json({ error: 'Símbolo requerido' });
      return;
    }

    const result = await watchlistService.isInWatchlist(userId, symbol);
    res.json(result);
  } catch (error) {
    console.error('Error checking watchlist:', error);
    res.status(500).json({ 
      error: 'Error al verificar la lista de seguimiento',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * DELETE /watchlist
 * Limpiar toda la watchlist del usuario
 */
export const clearWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const result = await watchlistService.clearWatchlist(userId);
    res.json(result);
  } catch (error) {
    console.error('Error clearing watchlist:', error);
    res.status(500).json({ 
      error: 'Error al limpiar la lista de seguimiento',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
