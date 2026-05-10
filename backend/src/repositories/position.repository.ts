import { pool } from '../config';
import type { Position, PositionTrade, PositionStatus } from '../models/position';

function mapPosition(row: any): Position {
  return {
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    direction: row.direction,
    status: row.status,
    quantityTotal: Number(row.quantity_total),
    quantityOpen: Number(row.quantity_open),
    avgEntryPrice: Number(row.avg_entry_price),
    strategyId: row.strategy_id ?? undefined,
    notes: row.notes ?? undefined,
    openedAt: row.opened_at instanceof Date ? row.opened_at.toISOString().slice(0, 10) : row.opened_at,
    closedAt: row.closed_at ? (row.closed_at instanceof Date ? row.closed_at.toISOString().slice(0, 10) : row.closed_at) : undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

function mapTrade(row: any): PositionTrade {
  return {
    id: row.id,
    positionId: row.position_id,
    userId: row.user_id,
    action: row.action,
    quantity: Number(row.quantity),
    price: Number(row.price),
    pnl: row.pnl !== null && row.pnl !== undefined ? Number(row.pnl) : undefined,
    pnlPct: row.pnl_pct !== null && row.pnl_pct !== undefined ? Number(row.pnl_pct) : undefined,
    executedAt: row.executed_at instanceof Date ? row.executed_at.toISOString().slice(0, 10) : row.executed_at,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    symbol: row.symbol ?? undefined,
    direction: row.direction ?? undefined,
  };
}

export class PositionRepository {
  async create(userId: string, dto: {
    symbol: string; direction: string; quantity: number;
    price: number; openedAt: string; strategyId?: string; notes?: string;
  }): Promise<Position> {
    const result = await pool.query(
      `INSERT INTO positions
         (user_id, symbol, direction, quantity_total, quantity_open, avg_entry_price, strategy_id, notes, opened_at)
       VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, dto.symbol.toUpperCase(), dto.direction, dto.quantity, dto.price,
       dto.strategyId ?? null, dto.notes ?? null, dto.openedAt]
    );
    return mapPosition(result.rows[0]);
  }

  async recordTrade(data: {
    positionId: string; userId: string; action: string;
    quantity: number; price: number; pnl?: number; pnlPct?: number; executedAt: string;
  }): Promise<PositionTrade> {
    const result = await pool.query(
      `INSERT INTO position_trades (position_id, user_id, action, quantity, price, pnl, pnl_pct, executed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [data.positionId, data.userId, data.action, data.quantity, data.price,
       data.pnl ?? null, data.pnlPct ?? null, data.executedAt]
    );
    return mapTrade(result.rows[0]);
  }

  async updateAfterClose(positionId: string, quantityOpen: number, closedAt?: string): Promise<Position> {
    const status: PositionStatus = quantityOpen === 0 ? 'closed' : 'open';
    const result = await pool.query(
      `UPDATE positions SET quantity_open=$1, status=$2, closed_at=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [quantityOpen, status, closedAt ?? null, positionId]
    );
    return mapPosition(result.rows[0]);
  }

  async findById(id: string, userId: string): Promise<Position | null> {
    const result = await pool.query(
      'SELECT * FROM positions WHERE id=$1 AND user_id=$2', [id, userId]
    );
    return result.rows[0] ? mapPosition(result.rows[0]) : null;
  }

  async findOpenByUser(userId: string): Promise<Position[]> {
    const result = await pool.query(
      "SELECT * FROM positions WHERE user_id=$1 AND status='open' ORDER BY opened_at DESC, created_at DESC",
      [userId]
    );
    return result.rows.map(mapPosition);
  }

  async findAllByUser(userId: string): Promise<Position[]> {
    const result = await pool.query(
      'SELECT * FROM positions WHERE user_id=$1 ORDER BY opened_at DESC, created_at DESC', [userId]
    );
    return result.rows.map(mapPosition);
  }

  async findTradesByPosition(positionId: string, userId: string): Promise<PositionTrade[]> {
    const result = await pool.query(
      `SELECT pt.*, p.symbol, p.direction
       FROM position_trades pt JOIN positions p ON pt.position_id=p.id
       WHERE pt.position_id=$1 AND pt.user_id=$2 ORDER BY pt.executed_at ASC, pt.created_at ASC`,
      [positionId, userId]
    );
    return result.rows.map(mapTrade);
  }

  async findDailyTrades(userId: string, date: string): Promise<PositionTrade[]> {
    const result = await pool.query(
      `SELECT pt.*, p.symbol, p.direction
       FROM position_trades pt JOIN positions p ON pt.position_id=p.id
       WHERE pt.user_id=$1 AND pt.executed_at=$2::date AND pt.action='close'
       ORDER BY pt.created_at ASC`,
      [userId, date]
    );
    return result.rows.map(mapTrade);
  }

  async getMonthlyStats(userId: string, year: number, month: number): Promise<
    { date: string; totalPnL: number; totalPnLPercentage: number; tradeCount: number; isProfit: boolean }[]
  > {
    const result = await pool.query(
      `SELECT
         executed_at::text              AS date,
         COALESCE(SUM(pnl), 0)         AS total_pnl,
         COALESCE(AVG(pnl_pct), 0)     AS avg_pnl_pct,
         COUNT(*)                       AS trade_count
       FROM position_trades
       WHERE user_id=$1
         AND action='close'
         AND EXTRACT(YEAR  FROM executed_at)=$2
         AND EXTRACT(MONTH FROM executed_at)=$3
       GROUP BY executed_at
       ORDER BY executed_at`,
      [userId, year, month]
    );
    return result.rows.map(row => ({
      date: row.date,
      totalPnL: Number(row.total_pnl),
      totalPnLPercentage: Number(row.avg_pnl_pct),
      tradeCount: Number(row.trade_count),
      isProfit: Number(row.total_pnl) > 0,
    }));
  }

  async delete(id: string, userId: string): Promise<void> {
    await pool.query('DELETE FROM positions WHERE id=$1 AND user_id=$2', [id, userId]);
  }
}
