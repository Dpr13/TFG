import { pool } from '../config';
import type { Bot, BotTrade, BotStatus, TradeSide, BotParams } from '../models/bot';

function mapBot(row: any): Bot {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    symbol: row.symbol,
    strategy: row.strategy,
    status: row.status,
    initialCapital: Number(row.initial_capital),
    currentCapital: Number(row.current_capital),
    positionSize: Number(row.position_size),
    positionEntryPrice: row.position_entry_price !== null ? Number(row.position_entry_price) : null,
    params: row.params ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTrade(row: any): BotTrade {
  return {
    id: row.id,
    botId: row.bot_id,
    side: row.side,
    quantity: Number(row.quantity),
    fillPrice: Number(row.fill_price),
    pnl: row.pnl !== null ? Number(row.pnl) : null,
    executedAt: row.executed_at,
  };
}

export class BotRepository {
  async create(userId: string, dto: { name: string; symbol: string; strategy: string; initialCapital?: number; params?: BotParams }): Promise<Bot> {
    const capital = dto.initialCapital ?? 10000;
    const result = await pool.query(
      `INSERT INTO bots (user_id, name, symbol, strategy, initial_capital, current_capital, params)
       VALUES ($1, $2, $3, $4, $5, $5, $6) RETURNING *`,
      [userId, dto.name, dto.symbol.toUpperCase(), dto.strategy, capital, JSON.stringify(dto.params ?? {})]
    );
    return mapBot(result.rows[0]);
  }

  async findByUser(userId: string): Promise<Bot[]> {
    const result = await pool.query(
      'SELECT * FROM bots WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(mapBot);
  }

  async findById(botId: string): Promise<Bot | null> {
    const result = await pool.query('SELECT * FROM bots WHERE id = $1', [botId]);
    return result.rows[0] ? mapBot(result.rows[0]) : null;
  }

  async setStatus(botId: string, status: BotStatus): Promise<Bot> {
    const result = await pool.query(
      'UPDATE bots SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, botId]
    );
    return mapBot(result.rows[0]);
  }

  async updatePosition(botId: string, data: { positionSize: number; positionEntryPrice: number | null; currentCapital: number }): Promise<void> {
    await pool.query(
      'UPDATE bots SET position_size = $1, position_entry_price = $2, current_capital = $3, updated_at = NOW() WHERE id = $4',
      [data.positionSize, data.positionEntryPrice, data.currentCapital, botId]
    );
  }

  async recordTrade(botId: string, side: TradeSide, quantity: number, fillPrice: number, pnl: number | null): Promise<BotTrade> {
    const result = await pool.query(
      'INSERT INTO bot_trades (bot_id, side, quantity, fill_price, pnl) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [botId, side, quantity, fillPrice, pnl]
    );
    return mapTrade(result.rows[0]);
  }

  async getTrades(botId: string): Promise<BotTrade[]> {
    const result = await pool.query(
      'SELECT * FROM bot_trades WHERE bot_id = $1 ORDER BY executed_at DESC',
      [botId]
    );
    return result.rows.map(mapTrade);
  }

  async delete(botId: string, userId: string): Promise<void> {
    await pool.query('DELETE FROM bots WHERE id = $1 AND user_id = $2', [botId, userId]);
  }
}
