import { describe, it, expect } from 'vitest';
import { psychoanalysisService } from '../psychoanalysis.service';
import type { Operation } from '../../models/operation';

let _id = 0;
function makeOp(overrides: Partial<Operation> = {}): Operation {
  _id++;
  return {
    id: String(_id),
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

// ─── Casos base ───────────────────────────────────────────────────────────────

describe('psychoanalysisService — casos base', () => {
  it('devuelve cero operaciones con array vacío', async () => {
    const r = await psychoanalysisService.analyzeOperations([]);
    expect(r.generalStats.totalOperations).toBe(0);
  });

  it('cuenta correctamente el total de operaciones', async () => {
    const ops = [makeOp(), makeOp(), makeOp()];
    const r = await psychoanalysisService.analyzeOperations(ops);
    expect(r.generalStats.totalOperations).toBe(3);
  });

  it('devuelve arrays vacíos de recomendaciones y alertas con array vacío', async () => {
    const r = await psychoanalysisService.analyzeOperations([]);
    expect(Array.isArray(r.recommendations)).toBe(true);
    expect(Array.isArray(r.alerts)).toBe(true);
  });
});

// ─── Win Rate ─────────────────────────────────────────────────────────────────

describe('psychoanalysisService — winRate', () => {
  it('100% cuando todas las operaciones son ganadoras', async () => {
    const ops = [makeOp({ pnl: 100 }), makeOp({ pnl: 50 }), makeOp({ pnl: 200 })];
    const r = await psychoanalysisService.analyzeOperations(ops);
    expect(r.generalStats.winRate).toBe(100);
  });

  it('0% cuando todas las operaciones son perdedoras', async () => {
    const ops = [makeOp({ pnl: -50 }), makeOp({ pnl: -30 })];
    const r = await psychoanalysisService.analyzeOperations(ops);
    expect(r.generalStats.winRate).toBe(0);
  });

  it('75% con 3 ganancias y 1 pérdida', async () => {
    const ops = [
      makeOp({ pnl: 100 }),
      makeOp({ pnl: 50 }),
      makeOp({ pnl: 75 }),
      makeOp({ pnl: -30 }),
    ];
    const r = await psychoanalysisService.analyzeOperations(ops);
    expect(r.generalStats.winRate).toBe(75);
  });
});

// ─── PnL total ────────────────────────────────────────────────────────────────

describe('psychoanalysisService — totalPnL', () => {
  it('suma correctamente ganancias y pérdidas', async () => {
    const ops = [makeOp({ pnl: 100 }), makeOp({ pnl: -40 }), makeOp({ pnl: 60 })];
    const r = await psychoanalysisService.analyzeOperations(ops);
    expect(r.generalStats.totalPnL).toBe(120);
  });

  it('es negativo cuando las pérdidas superan las ganancias', async () => {
    const ops = [makeOp({ pnl: 50 }), makeOp({ pnl: -200 })];
    const r = await psychoanalysisService.analyzeOperations(ops);
    expect(r.generalStats.totalPnL).toBeLessThan(0);
  });
});

// ─── Estadísticas por activo ──────────────────────────────────────────────────

describe('psychoanalysisService — assetStats', () => {
  it('agrupa operaciones por símbolo correctamente', async () => {
    const ops = [
      makeOp({ symbol: 'AAPL', pnl: 100 }),
      makeOp({ symbol: 'AAPL', pnl: 50 }),
      makeOp({ symbol: 'TSLA', pnl: -30 }),
    ];
    const r = await psychoanalysisService.analyzeOperations(ops);
    const symbols = r.assetStats.map(s => s.symbol);
    expect(symbols).toContain('AAPL');
    expect(symbols).toContain('TSLA');
    expect(r.assetStats).toHaveLength(2);
  });

  it('calcula correctamente el total de operaciones por activo', async () => {
    const ops = [
      makeOp({ symbol: 'AAPL', pnl: 100 }),
      makeOp({ symbol: 'AAPL', pnl: 80 }),
      makeOp({ symbol: 'MSFT', pnl: 50 }),
    ];
    const r = await psychoanalysisService.analyzeOperations(ops);
    const aapl = r.assetStats.find(s => s.symbol === 'AAPL');
    expect(aapl?.operations).toBe(2);
  });
});

// ─── Discipline Score ─────────────────────────────────────────────────────────

describe('psychoanalysisService — disciplineScore', () => {
  it('siempre está entre 0 y 100', async () => {
    const ops = [makeOp({ pnl: 200 }), makeOp({ pnl: -150 }), makeOp({ pnl: -80 })];
    const r = await psychoanalysisService.analyzeOperations(ops);
    expect(r.disciplineScore).toBeGreaterThanOrEqual(0);
    expect(r.disciplineScore).toBeLessThanOrEqual(100);
  });

  it('es un número (no NaN ni undefined)', async () => {
    const r = await psychoanalysisService.analyzeOperations([makeOp()]);
    expect(typeof r.disciplineScore).toBe('number');
    expect(Number.isNaN(r.disciplineScore)).toBe(false);
  });
});

// ─── Overtrading ──────────────────────────────────────────────────────────────

describe('psychoanalysisService — overtrading', () => {
  it('el overtradingScore es mayor cuando hay un día pico sobre el umbral', async () => {
    // 5 días normales (1 op/día) + 1 día con 8 ops
    // avgDayOps ≈ 2.17 → threshold = max(8, round(2.17*3)) = 8
    // El día pico tiene exactamente 8 ops → supera el umbral → score > 0
    const withSpike = [
      makeOp({ date: '2024-01-01' }),
      makeOp({ date: '2024-01-02' }),
      makeOp({ date: '2024-01-03' }),
      makeOp({ date: '2024-01-04' }),
      makeOp({ date: '2024-01-05' }),
      ...Array.from({ length: 8 }, () => makeOp({ date: '2024-01-06' })),
    ];
    // 1 op por día durante 5 días → threshold = max(8,3) = 8, nunca alcanzado
    const withoutSpike = Array.from({ length: 5 }, (_, i) =>
      makeOp({ date: `2024-01-0${i + 1}` })
    );

    const rSpike = await psychoanalysisService.analyzeOperations(withSpike);
    const rNormal = await psychoanalysisService.analyzeOperations(withoutSpike);

    expect(rSpike.behaviorStats.overtradingScore).toBeGreaterThan(
      rNormal.behaviorStats.overtradingScore
    );
  });
});
