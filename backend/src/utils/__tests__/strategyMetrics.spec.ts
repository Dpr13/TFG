import { describe, it, expect } from 'vitest';
import { calculateStrategyMetrics } from '../strategyMetrics';
import type { Operation } from '../../models/operation';

function makeOp(overrides: Partial<Operation> = {}): Operation {
  return {
    id: '1',
    userId: 'user-test',
    date: '2024-01-15',
    symbol: 'AAPL',
    type: 'long',
    quantity: 10,
    buyPrice: 100,
    sellPrice: 110,
    pnl: 100,
    pnlPercentage: 10,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    ...overrides,
  };
}

// ─── Sin operaciones ──────────────────────────────────────────────────────────

describe('calculateStrategyMetrics — sin operaciones', () => {
  it('devuelve todos los valores a cero', () => {
    const result = calculateStrategyMetrics([]);
    expect(result.totalOperations).toBe(0);
    expect(result.totalPnL).toBe(0);
    expect(result.winRate).toBe(0);
    expect(result.maxDrawdown).toBe(0);
    expect(result.profitFactor).toBe(0);
  });
});

// ─── WinRate ─────────────────────────────────────────────────────────────────

describe('calculateStrategyMetrics — winRate', () => {
  it('100% con todas las operaciones ganadoras', () => {
    const ops = [makeOp({ id: '1', pnl: 50 }), makeOp({ id: '2', pnl: 80 })];
    expect(calculateStrategyMetrics(ops).winRate).toBe(100);
  });

  it('0% con todas las operaciones perdedoras', () => {
    const ops = [makeOp({ id: '1', pnl: -30 }), makeOp({ id: '2', pnl: -50 })];
    expect(calculateStrategyMetrics(ops).winRate).toBe(0);
  });

  it('50% con la mitad ganadora y la mitad perdedora', () => {
    const ops = [makeOp({ id: '1', pnl: 100 }), makeOp({ id: '2', pnl: -100 })];
    expect(calculateStrategyMetrics(ops).winRate).toBe(50);
  });
});

// ─── PnL y promedios ─────────────────────────────────────────────────────────

describe('calculateStrategyMetrics — PnL', () => {
  it('suma correctamente ganancias y pérdidas', () => {
    const ops = [
      makeOp({ id: '1', pnl: 200 }),
      makeOp({ id: '2', pnl: -80 }),
      makeOp({ id: '3', pnl: 50 }),
    ];
    expect(calculateStrategyMetrics(ops).totalPnL).toBe(170);
  });

  it('calcula avgPnL dividiendo por el número de operaciones', () => {
    const ops = [makeOp({ id: '1', pnl: 60 }), makeOp({ id: '2', pnl: 40 })];
    expect(calculateStrategyMetrics(ops).avgPnL).toBe(50);
  });

  it('identifica bestTrade y worstTrade correctamente', () => {
    const ops = [
      makeOp({ id: '1', pnl: 300 }),
      makeOp({ id: '2', pnl: -150 }),
      makeOp({ id: '3', pnl: 50 }),
    ];
    const result = calculateStrategyMetrics(ops);
    expect(result.bestTrade).toBe(300);
    expect(result.worstTrade).toBe(-150);
  });
});

// ─── Profit Factor ────────────────────────────────────────────────────────────

describe('calculateStrategyMetrics — profitFactor', () => {
  it('devuelve 9999 cuando no hay pérdidas', () => {
    const ops = [makeOp({ id: '1', pnl: 100 }), makeOp({ id: '2', pnl: 50 })];
    expect(calculateStrategyMetrics(ops).profitFactor).toBe(9999);
  });

  it('calcula el ratio correctamente: 200 ganancia / 100 pérdida = 2', () => {
    const ops = [
      makeOp({ id: '1', pnl: 200 }),
      makeOp({ id: '2', pnl: -100 }),
    ];
    expect(calculateStrategyMetrics(ops).profitFactor).toBe(2);
  });
});

// ─── Max Drawdown ─────────────────────────────────────────────────────────────

describe('calculateStrategyMetrics — maxDrawdown', () => {
  it('es 0 cuando todas las operaciones son ganadoras', () => {
    const ops = [makeOp({ id: '1', pnl: 50 }), makeOp({ id: '2', pnl: 80 })];
    expect(calculateStrategyMetrics(ops).maxDrawdown).toBe(0);
  });

  it('detecta la caída máxima desde el pico', () => {
    // Acumulado: 100 → 200 (pico) → 150 → 100 → drawdown máximo = -100
    const ops = [
      makeOp({ id: '1', date: '2024-01-01', pnl: 100 }),
      makeOp({ id: '2', date: '2024-01-02', pnl: 100 }),
      makeOp({ id: '3', date: '2024-01-03', pnl: -50 }),
      makeOp({ id: '4', date: '2024-01-04', pnl: -50 }),
    ];
    expect(calculateStrategyMetrics(ops).maxDrawdown).toBe(-100);
  });
});
