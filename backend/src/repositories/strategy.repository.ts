import { pool } from '../config';
import { Strategy, CreateStrategyDTO, UpdateStrategyDTO } from '../models/strategy';
import crypto from 'crypto';

function mapStrategyFromDb(row: any): Strategy {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * ESTRATEGIA REPOSITORY
 * 
 * EXPANSIÓN: Actualmente usa almacenamiento en JSON (development).
 * Para producción, considerar:
 * - Base de datos MongoDB con relaciones a Operations
 * - Versionado de estrategias (v1.0, v2.0, etc.)
 * - Soporte para estrategias compartidas entre usuarios
 * - Template system para crear nuevas estrategias desde templates
 * - Estrategias predefinidas del sistema (templates default)
 * - Scoring/ranking de estrategias más rentables
 * - Archive de estrategias inactivas
 * - Benchmark comparativo entre estrategias
 */


export const strategyRepository = {
  async create(dto: CreateStrategyDTO): Promise<Strategy> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const query = `INSERT INTO strategies (id, user_id, name, description, color, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const values = [id, dto.userId, dto.name, dto.description ?? null, dto.color || '#3b82f6', now, now];
    const result = await pool.query(query, values);
    return mapStrategyFromDb(result.rows[0]);
  },

  async findById(id: string, userId: string): Promise<Strategy | undefined> {
    const result = await pool.query('SELECT * FROM strategies WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0] ? mapStrategyFromDb(result.rows[0]) : undefined;
  },

  async findAll(userId: string): Promise<Strategy[]> {
    const result = await pool.query('SELECT * FROM strategies WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
    return result.rows.map(mapStrategyFromDb);
  },

  async update(id: string, userId: string, dto: UpdateStrategyDTO): Promise<Strategy | undefined> {
    const now = new Date().toISOString();
    const current = await pool.query('SELECT * FROM strategies WHERE id = $1 AND user_id = $2', [id, userId]);
    if (current.rows.length === 0) return undefined;
    const s = current.rows[0];
    const query = `UPDATE strategies SET
      name = $3, description = $4, color = $5, updated_at = $6
      WHERE id = $1 AND user_id = $2 RETURNING *`;
    const values = [id, userId, dto.name ?? s.name, dto.description ?? s.description, dto.color ?? s.color, now];
    const result = await pool.query(query, values);
    return result.rows[0] ? mapStrategyFromDb(result.rows[0]) : undefined;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM strategies WHERE id = $1 AND user_id = $2', [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },
};
