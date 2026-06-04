export type BotStrategy = 'momentum' | 'mean-reversion';
export type BotStatus = 'running' | 'paused' | 'stopped';
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
  // RSI confirmation filter (applies to any strategy)
  useRsi?: boolean;
  rsiPeriod?: number;
  rsiOverbought?: number;
  rsiOversold?: number;
  // Risk management
  stopLossPct?: number;
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
  totalPnl: number;       // PnL realizado (solo operaciones cerradas)
  unrealizedPnl: number;  // PnL de la posición abierta al precio actual
  effectiveCapital: number; // cash + valor de mercado de la posición abierta
  pnlPct: number;
  totalCommissions: number;
  currentCapital: number; // solo el cash disponible
  positionSize: number;
  positionEntryPrice: number | null;
}
