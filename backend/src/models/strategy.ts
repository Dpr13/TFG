// ============================================================================
// STRATEGY MODEL
// ============================================================================
// Define la estructura para una estrategia de trading que agrupa operaciones
//
// EXPANSIONES FUTURAS:
// - Parámetros de la estrategia (ATR, período, tipo de movimiento promedio)
// - Reglas de entrada/salida predefinidas
// - Nivel de confianza mínimo
// - Tiempo mínimo/máximo de operación
// - Relación riesgo/recompensa esperada
// - Activos permitidos para la estrategia
// - Rendimiento histórico acumulado
// - Correlación con otras estrategias
// - Alertas cuando la estrategia se desactiva automáticamente
// ============================================================================

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  color?: string; // Para visualización en el frontend
  createdAt: string;
  updatedAt: string;
  // EXPANSIÓN: parameters?: StrategyParameters;
  // EXPANSIÓN: rules?: TradingRules;
  // EXPANSIÓN: minConfidenceLevel?: number; // 0-100
  // EXPANSIÓN: minTradeDuration?: number; // minutes
  // EXPANSIÓN: maxTradeDuration?: number; // minutes
  // EXPANSIÓN: expectedRiskRewardRatio?: number;
  // EXPANSIÓN: allowedSymbols?: string[];
  // EXPANSIÓN: isActive?: boolean;
}

export interface CreateStrategyDTO {
  name: string;
  description?: string;
  color?: string;
  // EXPANSIÓN: parameters?: StrategyParameters;
  // EXPANSIÓN: rules?: TradingRules;
}

export interface UpdateStrategyDTO {
  name?: string;
  description?: string;
  color?: string;
  // EXPANSIÓN: parameters?: StrategyParameters;
  // EXPANSIÓN: isActive?: boolean;
}

// EXPANSIÓN FUTURA: Interfaz para parámetros de estrategia
/*
export interface StrategyParameters {
  atrPeriod?: number;
  movingAveragePeriod?: number;
  rsiThreshold?: { overbought: number; oversold: number };
  candlePatterns?: string[];
}

export interface TradingRules {
  entryConditions: string[];
  exitConditions: string[];
  stopLossPercentage?: number;
  takeProfitPercentage?: number;
}
*/

export interface StrategyPerformance {
  strategyId: string;
  totalOperations: number;
  totalPnL: number;
  winRate: number;
  avgPnL: number;
  avgPnLPercentage: number;
  bestTrade: number;
  worstTrade: number;
  totalInvested: number;
}
