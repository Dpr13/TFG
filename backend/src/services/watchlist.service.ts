import { watchlistRepository } from '../repositories/watchlist.repository';
import type { CreateWatchlistDTO, WatchlistItem } from '../models/watchlist';

export const watchlistService = {
  /**
   * Obtener la watchlist completa de un usuario
   */
  async getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
    return await watchlistRepository.getUserWatchlist(userId);
  },

  /**
   * Agregar un activo a la watchlist
   */
  async addToWatchlist(userId: string, data: CreateWatchlistDTO): Promise<WatchlistItem> {
    // Validar que el símbolo no esté vacío
    if (!data.assetSymbol || !data.assetName) {
      throw new Error('El símbolo y nombre del activo son requeridos');
    }

    // Validar tipo de activo
    const validTypes = ['stock', 'crypto', 'forex'];
    if (!validTypes.includes(data.assetType)) {
      throw new Error(`Tipo de activo inválido. Debe ser: ${validTypes.join(', ')}`);
    }

    const result = await watchlistRepository.addToWatchlist(userId, data);
    
    if (!result) {
      throw new Error('El activo ya está en tu lista de seguimiento');
    }

    return {
      symbol: result.assetSymbol,
      name: result.assetName,
      type: result.assetType,
      addedAt: result.addedAt,
    };
  },

  /**
   * Eliminar un activo de la watchlist
   */
  async removeFromWatchlist(userId: string, assetSymbol: string): Promise<{ success: boolean }> {
    const removed = await watchlistRepository.removeFromWatchlist(userId, assetSymbol);
    
    if (!removed) {
      throw new Error('El activo no se encontró en tu lista de seguimiento');
    }

    return { success: true };
  },

  /**
   * Verificar si un activo está en la watchlist
   */
  async isInWatchlist(userId: string, assetSymbol: string): Promise<{ inWatchlist: boolean }> {
    const exists = await watchlistRepository.isInWatchlist(userId, assetSymbol);
    return { inWatchlist: exists };
  },

  /**
   * Limpiar toda la watchlist
   */
  async clearWatchlist(userId: string): Promise<{ success: boolean }> {
    await watchlistRepository.clearWatchlist(userId);
    return { success: true };
  },
};
