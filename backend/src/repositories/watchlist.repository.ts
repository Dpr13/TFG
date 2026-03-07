import { pool } from '../config';
import type { Watchlist, CreateWatchlistDTO, WatchlistItem } from '../models/watchlist';

export const watchlistRepository = {
  /**
   * Obtener toda la watchlist de un usuario
   */
  async getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
    const result = await pool.query(
      `SELECT 
        asset_symbol as symbol, 
        asset_name as name, 
        asset_type as type, 
        added_at as "addedAt"
      FROM user_watchlists 
      WHERE user_id = $1 
      ORDER BY added_at DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * Agregar un activo a la watchlist
   */
  async addToWatchlist(userId: string, data: CreateWatchlistDTO): Promise<Watchlist> {
    const result = await pool.query(
      `INSERT INTO user_watchlists (user_id, asset_symbol, asset_name, asset_type)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, asset_symbol) DO NOTHING
      RETURNING 
        id, 
        user_id as "userId", 
        asset_symbol as "assetSymbol", 
        asset_name as "assetName", 
        asset_type as "assetType", 
        added_at as "addedAt"`,
      [userId, data.assetSymbol, data.assetName, data.assetType]
    );
    return result.rows[0];
  },

  /**
   * Eliminar un activo de la watchlist
   */
  async removeFromWatchlist(userId: string, assetSymbol: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM user_watchlists 
      WHERE user_id = $1 AND asset_symbol = $2
      RETURNING id`,
      [userId, assetSymbol]
    );
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Verificar si un activo está en la watchlist del usuario
   */
  async isInWatchlist(userId: string, assetSymbol: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM user_watchlists 
      WHERE user_id = $1 AND asset_symbol = $2`,
      [userId, assetSymbol]
    );
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Limpiar toda la watchlist de un usuario
   */
  async clearWatchlist(userId: string): Promise<void> {
    await pool.query(
      `DELETE FROM user_watchlists WHERE user_id = $1`,
      [userId]
    );
  },
};
