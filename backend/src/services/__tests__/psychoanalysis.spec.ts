import { describe, it, expect } from 'vitest';
import { psychoanalysisService } from '../psychoanalysis.service';
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

describe('psychoanalysisService.analyzeOperations', () => {
  it('devuelve cero operaciones cuando el array está vacío', async () => {
    const result = await psychoanalysisService.analyzeOperations([]);
    expect(result.generalStats.totalOperations).toBe(0);
  });

  it('calcula el winRate correctamente: 3 ganancias y 1 pérdida = 75%', async () => {
    const ops: Operation[] = [
      makeOp({ id: '1', pnl: 100 }),
      makeOp({ id: '2', pnl: 50 }),
      makeOp({ id: '3', pnl: 75 }),
      makeOp({ id: '4', pnl: -30 }),
    ];
    const result = await psychoanalysisService.analyzeOperations(ops);
    expect(result.generalStats.winRate).toBe(75);
  });

  it('calcula el totalPnL sumando todas las operaciones', async () => {
    const ops: Operation[] = [
      makeOp({ id: '1', pnl: 100 }),
      makeOp({ id: '2', pnl: -40 }),
      makeOp({ id: '3', pnl: 60 }),
    ];
    const result = await psychoanalysisService.analyzeOperations(ops);
    expect(result.generalStats.totalPnL).toBe(120);
  });

  it('el disciplineScore siempre está entre 0 y 100', async () => {
    const ops: Operation[] = [
      makeOp({ id: '1', pnl: 200 }),
      makeOp({ id: '2', pnl: -150 }),
      makeOp({ id: '3', pnl: -80 }),
    ];
    const result = await psychoanalysisService.analyzeOperations(ops);
    expect(result.disciplineScore).toBeGreaterThanOrEqual(0);
    expect(result.disciplineScore).toBeLessThanOrEqual(100);
  });

  it('devuelve recomendaciones cuando hay operaciones', async () => {
    const ops: Operation[] = [makeOp({ id: '1' }), makeOp({ id: '2', pnl: -20 })];
    const result = await psychoanalysisService.analyzeOperations(ops);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});
