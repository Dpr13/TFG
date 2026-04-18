import { pool } from '../config';
import type { BotStrategy, CreateBotStrategyDTO } from '../models/bot_strategy';

function mapRow(row: any): BotStrategy {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    algorithm: row.algorithm,
    description: row.description ?? undefined,
    params: row.params ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class BotStrategyRepository {
  async create(userId: string, dto: CreateBotStrategyDTO): Promise<BotStrategy> {
    const result = await pool.query(
      `INSERT INTO bot_strategies (user_id, name, algorithm, description, params)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, dto.name, dto.algorithm, dto.description ?? null, JSON.stringify(dto.params ?? {})]
    );
    return mapRow(result.rows[0]);
  }

  async findByUser(userId: string): Promise<BotStrategy[]> {
    const result = await pool.query(
      'SELECT * FROM bot_strategies WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string, userId: string): Promise<BotStrategy | null> {
    const result = await pool.query(
      'SELECT * FROM bot_strategies WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async update(id: string, userId: string, dto: Partial<CreateBotStrategyDTO>): Promise<BotStrategy | null> {
    const current = await this.findById(id, userId);
    if (!current) return null;
    const result = await pool.query(
      `UPDATE bot_strategies
       SET name = $1, algorithm = $2, description = $3, params = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [
        dto.name ?? current.name,
        dto.algorithm ?? current.algorithm,
        dto.description ?? current.description ?? null,
        JSON.stringify(dto.params ?? current.params),
        id,
        userId,
      ]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string, userId: string): Promise<void> {
    await pool.query('DELETE FROM bot_strategies WHERE id = $1 AND user_id = $2', [id, userId]);
  }
}
