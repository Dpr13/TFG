import { describe, it, expect } from 'vitest';
import { momentumSignal, meanReversionSignal, rsiSignal } from '../botSignals';

// Genera un array de N precios constantes
const flat = (price: number, n: number) => Array(n).fill(price);

// ─── momentumSignal ───────────────────────────────────────────────────────────

describe('momentumSignal', () => {
  it('devuelve HOLD cuando no hay suficientes precios', () => {
    expect(momentumSignal([100, 101], { fastWindow: 5, slowWindow: 20 })).toBe('HOLD');
  });

  it('devuelve BUY cuando la media rápida supera claramente la lenta', () => {
    // Precios bajos los primeros 15, luego subida fuerte en los últimos 5
    const prices = [...flat(100, 15), 115, 120, 125, 130, 135];
    expect(momentumSignal(prices, { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 })).toBe('BUY');
  });

  it('devuelve SELL cuando la media rápida cae claramente bajo la lenta', () => {
    const prices = [...flat(130, 15), 115, 110, 105, 100, 95];
    expect(momentumSignal(prices, { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 })).toBe('SELL');
  });

  it('devuelve HOLD cuando las medias están dentro del umbral', () => {
    // Precios casi planos: medias prácticamente iguales
    const prices = flat(100, 20);
    expect(momentumSignal(prices, { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 })).toBe('HOLD');
  });
});

// ─── meanReversionSignal ──────────────────────────────────────────────────────

describe('meanReversionSignal', () => {
  it('devuelve HOLD cuando no hay suficientes precios', () => {
    expect(meanReversionSignal([100], { window: 20, k: 2 })).toBe('HOLD');
  });

  it('devuelve BUY cuando el precio cae por debajo de la banda inferior', () => {
    // Media = 100, std ≈ 0 → precio 70 está muy por debajo con k=2
    const prices = [...flat(100, 19), 70];
    expect(meanReversionSignal(prices, { window: 20, k: 2 })).toBe('BUY');
  });

  it('devuelve SELL cuando el precio supera la banda superior', () => {
    const prices = [...flat(100, 19), 130];
    expect(meanReversionSignal(prices, { window: 20, k: 2 })).toBe('SELL');
  });

  it('devuelve HOLD cuando el precio está dentro de las bandas', () => {
    const prices = flat(100, 20);
    expect(meanReversionSignal(prices, { window: 20, k: 2 })).toBe('HOLD');
  });
});

// ─── rsiSignal ────────────────────────────────────────────────────────────────

describe('rsiSignal', () => {
  it('devuelve HOLD cuando no hay suficientes precios', () => {
    expect(rsiSignal([100, 101], { rsiPeriod: 14 })).toBe('HOLD');
  });

  it('devuelve BUY cuando el RSI está en sobreventa', () => {
    // Serie de bajadas continuas → RSI muy bajo
    const prices = [100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72];
    expect(rsiSignal(prices, { rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30 })).toBe('BUY');
  });

  it('devuelve SELL cuando el RSI está en sobrecompra', () => {
    // Serie de subidas continuas → RSI muy alto
    const prices = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128];
    expect(rsiSignal(prices, { rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30 })).toBe('SELL');
  });
});
