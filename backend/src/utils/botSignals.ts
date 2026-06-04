export type Signal = 'BUY' | 'SELL' | 'HOLD';

export interface BotSignalParams {
  fastWindow?: number;
  slowWindow?: number;
  thresholdPct?: number;
  window?: number;
  k?: number;
  // RSI filter (confirmation layer, not a standalone strategy)
  useRsi?: boolean;
  rsiPeriod?: number;
  rsiOverbought?: number;
  rsiOversold?: number;
}

export function momentumSignal(prices: number[], params: BotSignalParams): Signal {
  const fast = params.fastWindow ?? 5;
  const slow = params.slowWindow ?? 20;
  const threshold = params.thresholdPct ?? 0.001;
  if (prices.length < slow) return 'HOLD';
  const maFast = prices.slice(-fast).reduce((a, b) => a + b, 0) / fast;
  const maSlow = prices.slice(-slow).reduce((a, b) => a + b, 0) / slow;
  if (maFast > maSlow * (1 + threshold)) return 'BUY';
  if (maFast < maSlow * (1 - threshold)) return 'SELL';
  return 'HOLD';
}

export function meanReversionSignal(prices: number[], params: BotSignalParams): Signal {
  const window = params.window ?? 20;
  const k = params.k ?? 2;
  if (prices.length < window) return 'HOLD';
  const slice = prices.slice(-window);
  const mean = slice.reduce((a, b) => a + b, 0) / window;
  const std = Math.sqrt(slice.map(p => (p - mean) ** 2).reduce((a, b) => a + b, 0) / window);
  const price = prices[prices.length - 1];
  if (price < mean - k * std) return 'BUY';
  if (price > mean + k * std) return 'SELL';
  return 'HOLD';
}

export function rsiSignal(prices: number[], params: BotSignalParams): Signal {
  const period = params.rsiPeriod ?? 14;
  const overbought = params.rsiOverbought ?? 70;
  const oversold = params.rsiOversold ?? 30;
  if (prices.length < period + 1) return 'HOLD';
  const changes = prices
    .slice(-(period + 1))
    .map((p, i, arr) => (i === 0 ? 0 : p - arr[i - 1]))
    .slice(1);
  const avgGain = changes.map(c => Math.max(c, 0)).reduce((a, b) => a + b, 0) / period;
  const avgLoss = changes.map(c => Math.max(-c, 0)).reduce((a, b) => a + b, 0) / period;
  if (avgLoss === 0) return avgGain > 0 ? 'SELL' : 'HOLD';
  const rsi = 100 - 100 / (1 + avgGain / avgLoss);
  if (rsi < oversold) return 'BUY';
  if (rsi > overbought) return 'SELL';
  return 'HOLD';
}
