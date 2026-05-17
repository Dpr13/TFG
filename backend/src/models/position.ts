export type PositionDirection = 'long' | 'short';
export type PositionStatus   = 'open' | 'closed';
export type TradeAction      = 'open' | 'close';

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  direction: PositionDirection;
  status: PositionStatus;
  quantityTotal: number;
  quantityOpen: number;
  avgEntryPrice: number;
  strategyId?: string;
  notes?: string;
  openedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PositionTrade {
  id: string;
  positionId: string;
  userId: string;
  action: TradeAction;
  quantity: number;
  price: number;
  pnl?: number;
  pnlPct?: number;
  executedAt: string;
  createdAt: string;
  // Joined fields (for display)
  symbol?: string;
  direction?: PositionDirection;
}

export interface OpenPositionDTO {
  symbol: string;
  direction: PositionDirection;
  quantity: number;
  price: number;
  openedAt: string;
  strategyId?: string;
  notes?: string;
}

export interface ClosePositionDTO {
  quantity: number;
  price: number;
  executedAt: string;
}

export interface PositionDailyStats {
  date: string;
  totalPnL: number;
  totalPnLPercentage: number;
  tradeCount: number;
  isProfit: boolean;
}
