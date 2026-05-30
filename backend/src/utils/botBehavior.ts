import { calcCommission } from '../brokers/commission.config';
import { momentumSignal, meanReversionSignal, rsiSignal } from './botSignals';
import type { BotSignalParams, Signal } from './botSignals';
import type { BrokerMode } from '../models/broker_credential';

export type { Signal };

export type BotStrategy = 'momentum' | 'meanReversion' | 'rsi';

export function isStopLossTriggered(entryPrice: number, currentPrice: number, stopLossPct: number): boolean {
  const dropPct = (entryPrice - currentPrice) / entryPrice * 100;
  return dropPct >= stopLossPct;
}

export function calcPnL(fillPrice: number, entryPrice: number, filledQty: number, commission: number): number {
  return (fillPrice - entryPrice) * filledQty - commission;
}

export function calcPositionSize(capital: number, fillPrice: number): number {
  return Number(((capital * 0.95) / fillPrice).toFixed(6));
}

export function calcCapitalAfterBuy(capital: number, quantity: number, fillPrice: number, commission: number): number {
  const cost = quantity * fillPrice;
  return capital - cost - commission;
}

export function calcCapitalAfterSell(capital: number, filledQty: number, fillPrice: number, commission: number): number {
  const proceeds = filledQty * fillPrice;
  return capital + proceeds - commission;
}

export function paperFillPrice(marketPrice: number, side: 'BUY' | 'SELL'): number {
  const slippage = Math.random() * 0.0005;
  const factor = side === 'BUY' ? 1 + slippage : 1 - slippage;
  return Number((marketPrice * factor).toFixed(5));
}

export function selectSignal(strategy: BotStrategy, prices: number[], params: BotSignalParams): Signal {
  if (strategy === 'momentum') return momentumSignal(prices, params);
  if (strategy === 'rsi') return rsiSignal(prices, params);
  return meanReversionSignal(prices, params);
}

export { calcCommission };
export type { BrokerMode };
