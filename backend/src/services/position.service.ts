import { PositionRepository } from '../repositories/position.repository';
import { operationRepository } from '../repositories/operation.repository';
import type { Position, PositionTrade, OpenPositionDTO, ClosePositionDTO, PositionDailyStats } from '../models/position';

const repo = new PositionRepository();

export const positionService = {
  async openPosition(userId: string, dto: OpenPositionDTO): Promise<{ position: Position; trade: PositionTrade }> {
    const position = await repo.create(userId, dto);
    const trade = await repo.recordTrade({
      positionId: position.id,
      userId,
      action: 'open',
      quantity: dto.quantity,
      price: dto.price,
      executedAt: dto.openedAt,
    });
    return { position, trade };
  },

  async closePosition(
    positionId: string,
    userId: string,
    dto: ClosePositionDTO
  ): Promise<{ position: Position; trade: PositionTrade }> {
    const position = await repo.findById(positionId, userId);
    if (!position) throw new Error('Posición no encontrada');
    if (position.status === 'closed') throw new Error('La posición ya está cerrada');
    if (dto.quantity > position.quantityOpen) {
      throw new Error(`Solo puedes cerrar hasta ${position.quantityOpen} unidades`);
    }

    const pnl = position.direction === 'long'
      ? (dto.price - position.avgEntryPrice) * dto.quantity
      : (position.avgEntryPrice - dto.price) * dto.quantity;
    const pnlPct = position.direction === 'long'
      ? ((dto.price - position.avgEntryPrice) / position.avgEntryPrice) * 100
      : ((position.avgEntryPrice - dto.price) / position.avgEntryPrice) * 100;

    const trade = await repo.recordTrade({
      positionId,
      userId,
      action: 'close',
      quantity: dto.quantity,
      price: dto.price,
      pnl,
      pnlPct,
      executedAt: dto.executedAt,
    });

    const newQuantityOpen = Number((position.quantityOpen - dto.quantity).toFixed(8));
    const closedAt = newQuantityOpen === 0 ? dto.executedAt : undefined;
    const updated = await repo.updateAfterClose(positionId, newQuantityOpen, closedAt);

    // Mirror to operations table so psychoanalysis, strategies and risk stay in sync.
    // Long:  buyPrice=entry, sellPrice=exit  → pnl = (exit - entry) * qty ✓
    // Short: buyPrice=cover, sellPrice=entry → pnl = (entry - cover) * qty ✓
    const buyPrice  = position.direction === 'long' ? position.avgEntryPrice : dto.price;
    const sellPrice = position.direction === 'long' ? dto.price : position.avgEntryPrice;
    await operationRepository.create({
      userId,
      date: dto.executedAt,
      symbol: position.symbol,
      type: position.direction,
      quantity: dto.quantity,
      buyPrice,
      sellPrice,
      strategyId: position.strategyId,
      notes: position.notes,
    });

    return { position: updated, trade };
  },

  async getOpenPositions(userId: string): Promise<Position[]> {
    return repo.findOpenByUser(userId);
  },

  async getAllPositions(userId: string): Promise<Position[]> {
    return repo.findAllByUser(userId);
  },

  async getPosition(positionId: string, userId: string): Promise<Position> {
    const p = await repo.findById(positionId, userId);
    if (!p) throw new Error('Posición no encontrada');
    return p;
  },

  async getPositionTrades(positionId: string, userId: string): Promise<PositionTrade[]> {
    await positionService.getPosition(positionId, userId);
    return repo.findTradesByPosition(positionId, userId);
  },

  async getDailyTrades(userId: string, date: string): Promise<PositionTrade[]> {
    return repo.findDailyTrades(userId, date);
  },

  async getMonthlyStats(userId: string, year: number, month: number): Promise<PositionDailyStats[]> {
    return repo.getMonthlyStats(userId, year, month);
  },

  async deletePosition(positionId: string, userId: string): Promise<void> {
    const p = await repo.findById(positionId, userId);
    if (!p) throw new Error('Posición no encontrada');
    await repo.delete(positionId, userId);
  },
};
