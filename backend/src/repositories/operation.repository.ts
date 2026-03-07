import { pool } from '../config';
import { Operation, CreateOperationDTO, UpdateOperationDTO } from '../models/operation';
import crypto from 'crypto';

function mapOperationFromDb(row: any): Operation {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
    symbol: row.symbol,
    quantity: parseFloat(row.quantity),
    buyPrice: parseFloat(row.buy_price),
    sellPrice: parseFloat(row.sell_price),
    pnl: parseFloat(row.pnl),
    pnlPercentage: parseFloat(row.pnl_percentage),
    strategyId: row.strategy_id,
    notes: row.notes,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

/**
 * OPERACIÓN REPOSITORY
 * 
 * EXPANSIÓN: Actualmente usa almacenamiento en JSON (development).
 * Para producción, considerar:
 * - Base de datos MongoDB para escalabilidad
 * - Caché en Redis para operaciones frecuentes
 * - Indexación de búsquedas por fecha y símbolo
 * - Replicación de datos para backup automático
 * - Audit trail para cada cambio
 * - Pagination para grandes resultados
 * - Full-text search en notas y símbolos
 * - Compresión de datos históricos (>1 año)
 */


export const operationRepository = {
  async create(dto: CreateOperationDTO): Promise<Operation> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const pnl = (dto.sellPrice - dto.buyPrice) * dto.quantity;
    const pnlPercentage = ((dto.sellPrice - dto.buyPrice) / dto.buyPrice) * 100;
    const query = `INSERT INTO operations (id, user_id, date, symbol, quantity, buy_price, sell_price, pnl, pnl_percentage, strategy_id, notes, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`;
    const values = [id, dto.userId, dto.date, dto.symbol, dto.quantity, dto.buyPrice, dto.sellPrice, pnl, pnlPercentage, dto.strategyId ?? null, dto.notes ?? null, now, now];
    const result = await pool.query(query, values);
    return mapOperationFromDb(result.rows[0]);
  },

  async findById(id: string, userId: string): Promise<Operation | undefined> {
    const result = await pool.query('SELECT * FROM operations WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0] ? mapOperationFromDb(result.rows[0]) : undefined;
  },

  async findByDate(date: string, userId: string): Promise<Operation[]> {
    const result = await pool.query('SELECT * FROM operations WHERE date = $1 AND user_id = $2 ORDER BY created_at ASC', [date, userId]);
    return result.rows.map(mapOperationFromDb);
  },

  async findByDateRange(startDate: string, endDate: string, userId: string): Promise<Operation[]> {
    const result = await pool.query('SELECT * FROM operations WHERE date >= $1 AND date <= $2 AND user_id = $3 ORDER BY date ASC', [startDate, endDate, userId]);
    return result.rows.map(mapOperationFromDb);
  },

  async findByStrategyId(strategyId: string, userId: string): Promise<Operation[]> {
    const result = await pool.query('SELECT * FROM operations WHERE strategy_id = $1 AND user_id = $2 ORDER BY date ASC', [strategyId, userId]);
    return result.rows.map(mapOperationFromDb);
  },

  async findAll(userId: string): Promise<Operation[]> {
    const result = await pool.query('SELECT * FROM operations WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
    return result.rows.map(mapOperationFromDb);
  },

  async update(id: string, userId: string, dto: UpdateOperationDTO): Promise<Operation | undefined> {
    const now = new Date().toISOString();
    const current = await pool.query('SELECT * FROM operations WHERE id = $1 AND user_id = $2', [id, userId]);
    if (current.rows.length === 0) return undefined;
    const op = current.rows[0];
    const buyPrice = dto.buyPrice ?? op.buy_price;
    const sellPrice = dto.sellPrice ?? op.sell_price;
    const quantity = dto.quantity ?? op.quantity;
    const pnl = (sellPrice - buyPrice) * quantity;
    const pnlPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;
    const query = `UPDATE operations SET
      date = $3, symbol = $4, quantity = $5, buy_price = $6, sell_price = $7,
      pnl = $8, pnl_percentage = $9, strategy_id = $10, notes = $11, updated_at = $12
      WHERE id = $1 AND user_id = $2 RETURNING *`;
    const values = [id, userId, (dto as any).date ?? op.date, dto.symbol ?? op.symbol, quantity, buyPrice, sellPrice, pnl, pnlPercentage, dto.strategyId ?? op.strategy_id, dto.notes ?? op.notes, now];
    const result = await pool.query(query, values);
    return result.rows[0] ? mapOperationFromDb(result.rows[0]) : undefined;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM operations WHERE id = $1 AND user_id = $2', [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },

  async deleteByDate(date: string, userId: string): Promise<number> {
    const result = await pool.query('DELETE FROM operations WHERE date = $1 AND user_id = $2', [date, userId]);
    return result.rowCount ?? 0;
  },
};
