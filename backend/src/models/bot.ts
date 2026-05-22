export type BotStrategy = 'momentum' | 'mean-reversion';
export type BotStatus = 'running' | 'stopped';
export type TradeSide = 'BUY' | 'SELL';

import type { BrokerMode } from './broker_credential';

export interface Bot {
  id: string;
  userId: string;
  name: string;
  symbol: string;
  strategy: BotStrategy;
  status: BotStatus;
  brokerMode: BrokerMode;
  initialCapital: number;
  currentCapital: number;
  positionSize: number;
  positionEntryPrice: number | null;
  currentPrice?: number;
  lastSignal?: 'BUY' | 'SELL' | 'HOLD';
  params: BotParams;
  createdAt: string;
  updatedAt: string;
}

export interface BotParams {
  // Momentum params
  fastWindow?: number;
  slowWindow?: number;
  thresholdPct?: number;
  // Mean-reversion params
  window?: number;
  k?: number;
}

export interface BotTrade {
  id: string;
  botId: string;
  side: TradeSide;
  quantity: number;
  fillPrice: number;
  pnl: number | null;
  commission: number;
  executedAt: string;
}

export interface CreateBotDTO {
  name: string;
  symbol: string;
  strategy: BotStrategy;
  brokerMode?: BrokerMode;
  initialCapital?: number;
  params?: BotParams;
}

export interface BotMetrics {
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  totalPnl: number;
  pnlPct: number;
  totalCommissions: number;
  currentCapital: number;
  positionSize: number;
}
