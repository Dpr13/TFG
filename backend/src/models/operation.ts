// ============================================================================
// OPERATION MODEL
// ============================================================================
// Define la estructura de datos para una operación de trading individual
// 
// EXPANSIONES FUTURAS:
// - Comisiones por operación (para cálculos más precisos)
// - Tipo de orden (LIMIT, MARKET, STOP)
// - Duración de la operación (sesión, intradiaria, swing)
// - Análisis técnico en el momento de la operación (RSI, MACD, etc)
// - Tags personalizados para categorización avanzada
// - Análisis de razón riesgo/recompensa esperada vs actual
// ============================================================================

export interface Operation {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  symbol: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  pnl: number; // Profit/Loss in currency
  pnlPercentage: number; // Profit/Loss in percentage
  strategyId?: string; // For future strategy implementation
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // EXPANSIÓN: commission?: number;
  // EXPANSIÓN: orderType?: 'LIMIT' | 'MARKET' | 'STOP';
  // EXPANSIÓN: timeframe?: 'intraday' | 'swing' | 'position';
  // EXPANSIÓN: technicalIndicators?: TechnicalIndicators;
  // EXPANSIÓN: tags?: string[];
}

export interface CreateOperationDTO {
  userId: string;
  date: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  strategyId?: string;
  notes?: string;
  // EXPANSIÓN: commission?: number;
  // EXPANSIÓN: orderType?: 'LIMIT' | 'MARKET' | 'STOP';
}

export interface UpdateOperationDTO {
  symbol?: string;
  quantity?: number;
  buyPrice?: number;
  sellPrice?: number;
  strategyId?: string;
  notes?: string;
  // EXPANSIÓN: commission?: number;
}

export interface DailyStats {
  date: string;
  totalPnL: number;
  totalPnLPercentage: number;
  operationCount: number;
  isProfit: boolean; // true if totalPnL > 0
  // EXPANSIÓN: maxDrawdownIntraday?: number;
  // EXPANSIÓN: sharpeRatioDiario?: number;
  // EXPANSIÓN: consecutiveWins?: number;
}

