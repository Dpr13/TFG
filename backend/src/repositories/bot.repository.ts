import { pool } from '../config';
import type { Bot, BotTrade, BotStatus, TradeSide, BotParams } from '../models/bot';
import type { BrokerMode } from '../models/broker_credential';

function mapBot(row: any): Bot {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    symbol: row.symbol,
    strategy: row.strategy,
    status: row.status,
    brokerMode: row.broker_mode ?? 'simulated',
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
    commission: Number(row.commission ?? 0),
    executedAt: row.executed_at,
  };
}

export class BotRepository {
  async create(userId: string, dto: { name: string; symbol: string; strategy: string; brokerMode?: BrokerMode; initialCapital?: number; params?: BotParams }): Promise<Bot> {
    const capital = dto.initialCapital ?? 10000;
    const brokerMode = dto.brokerMode ?? 'simulated';
    const result = await pool.query(
      `INSERT INTO bots (user_id, name, symbol, strategy, broker_mode, initial_capital, current_capital, params)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7) RETURNING *`,
      [userId, dto.name, dto.symbol.toUpperCase(), dto.strategy, brokerMode, capital, JSON.stringify(dto.params ?? {})]
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

  async findAllRunning(): Promise<Bot[]> {
    const result = await pool.query("SELECT * FROM bots WHERE status = 'running'");
    return result.rows.map(mapBot);
  }

  async findAllActive(): Promise<Bot[]> {
    const result = await pool.query("SELECT * FROM bots WHERE status IN ('running', 'paused')");
    return result.rows.map(mapBot);
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

  async recordTrade(botId: string, side: TradeSide, quantity: number, fillPrice: number, pnl: number | null, commission: number = 0): Promise<BotTrade> {
    const result = await pool.query(
      'INSERT INTO bot_trades (bot_id, side, quantity, fill_price, pnl, commission) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [botId, side, quantity, fillPrice, pnl, commission]
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

  async getMonthlyStats(userId: string, year: number, month: number, botId?: string): Promise<{ date: string; totalPnL: number; tradeCount: number; isProfit: boolean }[]> {
    const result = await pool.query(
      `SELECT
         DATE(bt.executed_at)::text AS date,
         COALESCE(SUM(bt.pnl), 0)  AS total_pnl,
         COUNT(*)                  AS trade_count
       FROM bot_trades bt
       JOIN bots b ON bt.bot_id = b.id
       WHERE b.user_id = $1
         AND bt.pnl IS NOT NULL
         AND EXTRACT(YEAR  FROM bt.executed_at) = $2
         AND EXTRACT(MONTH FROM bt.executed_at) = $3
         AND ($4::uuid IS NULL OR bt.bot_id = $4)
       GROUP BY DATE(bt.executed_at)
       ORDER BY DATE(bt.executed_at)`,
      [userId, year, month, botId ?? null]
    );
    return result.rows.map(row => ({
      date: row.date,
      totalPnL: Number(row.total_pnl),
      tradeCount: Number(row.trade_count),
      isProfit: Number(row.total_pnl) > 0,
    }));
  }

  async getDailyTrades(userId: string, date: string, botId?: string): Promise<(BotTrade & { botName: string; symbol: string })[]> {
    const result = await pool.query(
      `SELECT bt.*, b.name AS bot_name, b.symbol
       FROM bot_trades bt
       JOIN bots b ON bt.bot_id = b.id
       WHERE b.user_id = $1
         AND DATE(bt.executed_at) = $2::date
         AND ($3::uuid IS NULL OR bt.bot_id = $3)
       ORDER BY bt.executed_at ASC`,
      [userId, date, botId ?? null]
    );
    return result.rows.map(row => ({
      ...mapTrade(row),
      botName: row.bot_name,
      symbol: row.symbol,
    }));
  }

  async delete(botId: string, userId: string): Promise<void> {
    await pool.query('DELETE FROM bots WHERE id = $1 AND user_id = $2', [botId, userId]);
  }
}
