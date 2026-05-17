import { strategyRepository } from '../repositories/strategy.repository';
import { CreateStrategyDTO, UpdateStrategyDTO, Strategy, StrategyPerformance } from '../models/strategy';
import type { Operation } from '../models/operation';

// ============================================================================
// STRATEGY SERVICE
// ============================================================================
// Lógica de negocio para estrategias de trading
//
// EXPANSIONES FUTURAS:
// - Cálculo de rendimiento agregado por estrategia
// - Comparativa entre estrategias
// - Backtesting de estrategias
// - Validación de parámetros de estrategia
// - Tagging automático de operaciones a estrategias por reglas
// - Análisis de correlación entre estrategias
// - Clonación de estrategias exitosas
// - Archivado de estrategias inactivas
// - Exportación de configuración de estrategia
// - Sugerencias de mejoría basadas en histórico
// ============================================================================

export const strategyService = {
  async createStrategy(dto: CreateStrategyDTO): Promise<Strategy> {
    return strategyRepository.create(dto);
  },

  async getStrategyById(id: string, userId: string): Promise<Strategy | undefined> {
    return strategyRepository.findById(id, userId);
  },

  async getAllStrategies(userId: string): Promise<Strategy[]> {
    return strategyRepository.findAll(userId);
  },

  async updateStrategy(id: string, userId: string, dto: UpdateStrategyDTO): Promise<Strategy | undefined> {
    return strategyRepository.update(id, userId, dto);
  },

  async deleteStrategy(id: string, userId: string): Promise<boolean> {
    return strategyRepository.delete(id, userId);
  },

  async getStrategyOperations(strategyId: string, userId: string): Promise<Operation[]> {
    const { operationRepository } = await import('../repositories/operation.repository');
    return operationRepository.findByStrategyId(strategyId, userId);
  },

  async getStrategyPerformance(strategyId: string, userId: string): Promise<StrategyPerformance> {
    const { operationRepository } = await import('../repositories/operation.repository');
    const operations = await operationRepository.findByStrategyId(strategyId, userId);
    
    if (operations.length === 0) {
      return {
        strategyId,
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
    const totalInvested = operations.reduce((sum, op) => sum + (op.buyPrice * op.quantity), 0);
    const winningOps = operations.filter(op => op.pnl > 0);
    const winRate = (winningOps.length / operations.length) * 100;
    const avgPnL = totalPnL / operations.length;
    const avgPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const bestTrade = Math.max(...operations.map(op => op.pnl));
    const worstTrade = Math.min(...operations.map(op => op.pnl));

    const sorted = [...operations].sort((a, b) => a.date.localeCompare(b.date));
    let peak = 0;
    let cumulative = 0;
    let maxDrawdown = 0;
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
      strategyId,
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
  },

  // EXPANSIÓN: Análisis de performance de estrategia
  /*
  async getStrategyPerformance(strategyId: string, startDate?: string, endDate?: string) {
    // Calcular: Win rate, PnL total, Sharpe ratio, Drawdown máximo, etc
  }
  */

  // EXPANSIÓN: Comparación entre estrategias
  /*
  async compareStrategies(strategyIds: string[], metrics?: string[]): Promise<StrategyComparison> {
    // Comparar rendimiento de múltiples estrategias
  }
  */

  // EXPANSIÓN: Backtesting
  /*
  async backtest(strategyId: string, historicalData: HistoricalData[]): Promise<BacktestResult> {
    // Ejecutar backtest con histórico de mercado
  }
  */

  // EXPANSIÓN: Sugerencias de mejora
  /*
  async getSuggestions(strategyId: string): Promise<Suggestion[]> {
    // Basado en histórico, sugerir mejoras a la estrategia
  }
  */
};
