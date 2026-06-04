import { describe, it, expect } from 'vitest';
import {
  isStopLossTriggered,
  calcPnL,
  calcPositionSize,
  calcCapitalAfterBuy,
  calcCapitalAfterSell,
  paperFillPrice,
  selectSignal,
  calcCommission,
} from '../botBehavior';

// ─── Stop Loss ────────────────────────────────────────────────────────────────

describe('isStopLossTriggered', () => {
  it('se dispara cuando la caída iguala el umbral', () => {
    // entryPrice=100, currentPrice=95 → dropPct=5%
    expect(isStopLossTriggered(100, 95, 5)).toBe(true);
  });

  it('se dispara cuando la caída supera el umbral', () => {
    // entryPrice=100, currentPrice=90 → dropPct=10% >= 5%
    expect(isStopLossTriggered(100, 90, 5)).toBe(true);
  });

  it('no se dispara cuando la caída es menor que el umbral', () => {
    // entryPrice=100, currentPrice=98 → dropPct=2% < 5%
    expect(isStopLossTriggered(100, 98, 5)).toBe(false);
  });

  it('no se dispara cuando el precio sube por encima de entrada', () => {
    // entryPrice=100, currentPrice=110 → dropPct negativo
    expect(isStopLossTriggered(100, 110, 5)).toBe(false);
  });

  it('no se dispara con caída exactamente por debajo del umbral', () => {
    // entryPrice=200, currentPrice=192 → dropPct=4% < 4.1%
    expect(isStopLossTriggered(200, 192, 4.1)).toBe(false);
  });
});

// ─── PnL ─────────────────────────────────────────────────────────────────────

describe('calcPnL', () => {
  it('trade rentable sin comisión', () => {
    // compra a 100, vende a 120, cantidad 10 → pnl = (120-100)*10 = 200
    expect(calcPnL(120, 100, 10, 0)).toBe(200);
  });

  it('trade perdedor sin comisión', () => {
    // compra a 100, vende a 80, cantidad 5 → pnl = (80-100)*5 = -100
    expect(calcPnL(80, 100, 5, 0)).toBe(-100);
  });

  it('la comisión reduce el pnl positivo', () => {
    // pnl bruto = (110-100)*10 = 100; comisión = 1.1 → pnl neto ≈ 98.9
    expect(calcPnL(110, 100, 10, 1.1)).toBeCloseTo(98.9, 5);
  });

  it('la comisión aumenta la pérdida', () => {
    // pnl bruto = (90-100)*10 = -100; comisión = 0.9 → pnl neto = -100.9
    expect(calcPnL(90, 100, 10, 0.9)).toBeCloseTo(-100.9, 5);
  });

  it('pnl es cero si vende al mismo precio de entrada sin comisión', () => {
    expect(calcPnL(100, 100, 15, 0)).toBe(0);
  });
});

// ─── Position Sizing ──────────────────────────────────────────────────────────

describe('calcPositionSize', () => {
  it('usa el 95% del capital disponible', () => {
    // capital=10000, price=100 → qty = (10000*0.95)/100 = 95
    expect(calcPositionSize(10000, 100)).toBe(95);
  });

  it('aumenta la cantidad cuando el precio baja', () => {
    const qtyHighPrice = calcPositionSize(10000, 200);
    const qtyLowPrice  = calcPositionSize(10000, 100);
    expect(qtyLowPrice).toBeGreaterThan(qtyHighPrice);
  });

  it('es proporcional al capital disponible', () => {
    const qty1 = calcPositionSize(5000, 100);
    const qty2 = calcPositionSize(10000, 100);
    expect(qty2).toBeCloseTo(qty1 * 2, 4);
  });

  it('nunca usa el 100% del capital (protección de liquidez)', () => {
    const fillPrice = 50;
    const qty = calcPositionSize(10000, fillPrice);
    const cost = qty * fillPrice;
    expect(cost).toBeLessThan(10000);
  });
});

// ─── Capital después de operaciones ──────────────────────────────────────────

describe('calcCapitalAfterBuy', () => {
  it('resta coste y comisión al capital', () => {
    // capital=10000, qty=95, price=100 → cost=9500, comm=0 → remaining=500
    expect(calcCapitalAfterBuy(10000, 95, 100, 0)).toBe(500);
  });

  it('la comisión reduce adicionalmente el capital restante', () => {
    // capital=10000, qty=95, price=100, comm=5 → remaining=495
    expect(calcCapitalAfterBuy(10000, 95, 100, 5)).toBe(495);
  });

  it('el capital resultante es siempre menor que el inicial', () => {
    const result = calcCapitalAfterBuy(5000, 40, 100, 0.4);
    expect(result).toBeLessThan(5000);
  });
});

describe('calcCapitalAfterSell', () => {
  it('suma los ingresos menos comisión al capital', () => {
    // capital=500, qty=95, price=110, comm=0 → proceeds=10450 → total=10950
    expect(calcCapitalAfterSell(500, 95, 110, 0)).toBe(10950);
  });

  it('la comisión reduce los ingresos de la venta', () => {
    // capital=500, qty=95, price=110, comm=1.045 → 10950 - 1.045 = 10948.955
    expect(calcCapitalAfterSell(500, 95, 110, 1.045)).toBeCloseTo(10948.955, 3);
  });

  it('una venta con pérdida sigue sumando los ingresos al capital libre', () => {
    // capital=500, qty=95, price=90, comm=0 → proceeds=8550 → total=9050
    expect(calcCapitalAfterSell(500, 95, 90, 0)).toBe(9050);
  });
});

// ─── Comisiones ───────────────────────────────────────────────────────────────

describe('calcCommission', () => {
  it('simulated: comisión siempre cero', () => {
    expect(calcCommission('simulated', 10000)).toBe(0);
    expect(calcCommission('simulated', 0)).toBe(0);
  });

  it('alpaca_paper: comisión siempre cero', () => {
    expect(calcCommission('alpaca_paper', 10000)).toBe(0);
  });

  it('alpaca_live: cobra el 0.01% del valor de la operación', () => {
    // 10000 * 0.0001 = 1
    expect(calcCommission('alpaca_live', 10000)).toBe(1);
  });

  it('alpaca_live: escala con el valor de la operación', () => {
    expect(calcCommission('alpaca_live', 50000)).toBe(5);
  });

  it('alpaca_live: operación pequeña cobra fracción mínima', () => {
    // 100 * 0.0001 = 0.01
    expect(calcCommission('alpaca_live', 100)).toBeCloseTo(0.01, 6);
  });
});

// ─── Paper Fill (dirección del slippage) ─────────────────────────────────────

describe('paperFillPrice', () => {
  it('BUY: precio de ejecución siempre >= precio de mercado (slippage adverso)', () => {
    for (let i = 0; i < 50; i++) {
      expect(paperFillPrice(100, 'BUY')).toBeGreaterThanOrEqual(100);
    }
  });

  it('SELL: precio de ejecución siempre <= precio de mercado (slippage adverso)', () => {
    for (let i = 0; i < 50; i++) {
      expect(paperFillPrice(100, 'SELL')).toBeLessThanOrEqual(100);
    }
  });

  it('el slippage es pequeño (< 0.1% del precio)', () => {
    for (let i = 0; i < 50; i++) {
      const buy  = paperFillPrice(100, 'BUY');
      const sell = paperFillPrice(100, 'SELL');
      expect(buy).toBeLessThan(100 * 1.001);
      expect(sell).toBeGreaterThan(100 * 0.999);
    }
  });
});

// ─── Selección de estrategia ──────────────────────────────────────────────────

describe('selectSignal — enrutamiento de estrategias', () => {
  it('momentum: insuficientes datos → HOLD', () => {
    const prices = Array(5).fill(100);
    expect(selectSignal('momentum', prices, { slowWindow: 20 })).toBe('HOLD');
  });

  it('meanReversion: insuficientes datos → HOLD', () => {
    const prices = Array(5).fill(100);
    expect(selectSignal('meanReversion', prices, { window: 20 })).toBe('HOLD');
  });

  it('momentum: MA rápida claramente superior → BUY', () => {
    const slow = Array(15).fill(100);
    const fast = Array(5).fill(130);
    const prices = [...slow, ...fast];
    expect(selectSignal('momentum', prices, { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 })).toBe('BUY');
  });

  it('momentum: MA rápida claramente inferior → SELL', () => {
    const slow = Array(15).fill(100);
    const fast = Array(5).fill(70);
    const prices = [...slow, ...fast];
    expect(selectSignal('momentum', prices, { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 })).toBe('SELL');
  });

  it('meanReversion: precio muy por debajo de la media → BUY', () => {
    const stable = Array(19).fill(100);
    const prices = [...stable, 60];
    expect(selectSignal('meanReversion', prices, { window: 20, k: 1 })).toBe('BUY');
  });

  it('meanReversion: precio muy por encima de la media → SELL', () => {
    const stable = Array(19).fill(100);
    const prices = [...stable, 140];
    expect(selectSignal('meanReversion', prices, { window: 20, k: 1 })).toBe('SELL');
  });
});

// ─── Filtro RSI de confirmación ───────────────────────────────────────────────

describe('selectSignal — filtro RSI', () => {
  // Momentum BUY + RSI sobrecomprado → bloqueado a HOLD
  it('bloquea BUY cuando el RSI confirma sobrecompra', () => {
    const slow = Array(15).fill(100);
    const fast = Array(5).fill(130); // momentum → BUY
    const rising = [...slow, ...fast]; // RSI en subida → sobrecompra → SELL
    expect(selectSignal('momentum', rising, {
      fastWindow: 5, slowWindow: 20, thresholdPct: 0.001,
      useRsi: true, rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30,
    })).toBe('HOLD');
  });

  // Momentum SELL + RSI sobrevendido → bloqueado a HOLD
  it('bloquea SELL cuando el RSI confirma sobreventa', () => {
    const slow = Array(15).fill(100);
    const fast = Array(5).fill(70); // momentum → SELL
    const falling = [...slow, ...fast]; // RSI en caída → sobreventa → BUY
    expect(selectSignal('momentum', falling, {
      fastWindow: 5, slowWindow: 20, thresholdPct: 0.001,
      useRsi: true, rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30,
    })).toBe('HOLD');
  });

  // Sin filtro RSI, la señal pasa sin modificar
  it('sin filtro RSI, la señal pasa directamente', () => {
    const slow = Array(15).fill(100);
    const fast = Array(5).fill(130);
    const prices = [...slow, ...fast];
    expect(selectSignal('momentum', prices, {
      fastWindow: 5, slowWindow: 20, thresholdPct: 0.001,
    })).toBe('BUY');
  });

  // HOLD principal no se toca aunque RSI esté activo
  it('no modifica HOLD aunque el filtro RSI esté activo', () => {
    const prices = Array(20).fill(100); // momentum → HOLD (medias iguales)
    expect(selectSignal('momentum', prices, {
      fastWindow: 5, slowWindow: 20, thresholdPct: 0.001,
      useRsi: true, rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30,
    })).toBe('HOLD');
  });
});
