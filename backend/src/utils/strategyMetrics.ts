import type { Operation } from '../models/operation';

export interface StrategyMetrics {
  totalOperations: number;
  totalPnL: number;
  winRate: number;
  avgPnL: number;
  avgPnLPercentage: number;
  bestTrade: number;
  worstTrade: number;
  totalInvested: number;
  maxDrawdown: number;
  profitFactor: number;
}

export function calculateStrategyMetrics(operations: Operation[]): StrategyMetrics {
  if (operations.length === 0) {
    return {
      totalOperations: 0,
      totalPnL: 0,
      winRate: 0,
      avgPnL: 0,
      avgPnLPercentage: 0,
      bestTrade: 0,
      worstTrade: 0,
      totalInvested: 0,
      maxDrawdown: 0,
      profitFactor: 0,
    };
  }

  const totalPnL = operations.reduce((sum, op) => sum + op.pnl, 0);
  const totalInvested = operations.reduce((sum, op) => sum + op.buyPrice * op.quantity, 0);
  const winRate = (operations.filter(op => op.pnl > 0).length / operations.length) * 100;
  const avgPnL = totalPnL / operations.length;
  const avgPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const bestTrade = Math.max(...operations.map(op => op.pnl));
  const worstTrade = Math.min(...operations.map(op => op.pnl));

  const sorted = [...operations].sort((a, b) => a.date.localeCompare(b.date));
  let peak = 0, cumulative = 0, maxDrawdown = 0;
  for (const op of sorted) {
    cumulative += op.pnl;
    if (cumulative > peak) peak = cumulative;
    const drawdown = cumulative - peak;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  }

  const grossProfit = operations.filter(op => op.pnl > 0).reduce((sum, op) => sum + op.pnl, 0);
  const grossLoss = Math.abs(operations.filter(op => op.pnl < 0).reduce((sum, op) => sum + op.pnl, 0));
  const profitFactor = grossLoss === 0 ? 9999 : grossProfit / grossLoss;

  return {
    totalOperations: operations.length,
    totalPnL,
    winRate,
    avgPnL,
    avgPnLPercentage,
    bestTrade,
    worstTrade,
    totalInvested,
    maxDrawdown,
    profitFactor,
  };
}
