import { pool } from '../config';
import type { Asset } from '../models/asset';

export interface SearchedAssetDTO {
  assetSymbol: string;
  assetName: string;
  assetType: 'stock' | 'crypto' | 'forex';
}

export const searchedAssetsRepository = {
  /**
   * Obtener todos los activos buscados de un usuario
   */
  async getUserSearchedAssets(userId: string): Promise<Asset[]> {
    const result = await pool.query(
      `SELECT 
        asset_symbol as "symbol", 
        asset_name as "name", 
        asset_type as "type"
      FROM user_searched_assets 
      WHERE user_id = $1 
      ORDER BY searched_at DESC`,
      [userId]
    );
    return result.rows.map((row: any, idx: number) => ({
      id: idx.toString(),
      symbol: row.symbol,
      name: row.name,
      type: row.type,
    }));
  },

  /**
   * Agregar un activo a los buscados del usuario
   */
  async addSearchedAsset(userId: string, data: SearchedAssetDTO): Promise<Asset> {
    const result = await pool.query(
      `INSERT INTO user_searched_assets (user_id, asset_symbol, asset_name, asset_type)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, asset_symbol) DO UPDATE 
      SET searched_at = CURRENT_TIMESTAMP
      RETURNING 
        asset_symbol as "symbol", 
        asset_name as "name", 
        asset_type as "type"`,
      [userId, data.assetSymbol, data.assetName, data.assetType]
    );
    return {
      id: '1',
      symbol: result.rows[0].symbol,
      name: result.rows[0].name,
      type: result.rows[0].type,
    };
  },

  /**
   * Eliminar un activo de los buscados
   */
  async removeSearchedAsset(userId: string, assetSymbol: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM user_searched_assets 
      WHERE user_id = $1 AND asset_symbol = $2
      RETURNING id`,
      [userId, assetSymbol]
    );
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Verificar si un activo está en los buscados del usuario
   */
  async isSearched(userId: string, assetSymbol: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM user_searched_assets 
      WHERE user_id = $1 AND asset_symbol = $2`,
      [userId, assetSymbol]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
