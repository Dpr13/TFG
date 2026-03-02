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
    // EXPANSIÓN: Validar nombre único
    // EXPANSIÓN: Validar parámetros de entrada
    return strategyRepository.create(dto);
  },

  async getStrategyById(id: string): Promise<Strategy | undefined> {
    return strategyRepository.findById(id);
  },

  async getAllStrategies(): Promise<Strategy[]> {
    return strategyRepository.findAll();
  },

  async updateStrategy(id: string, dto: UpdateStrategyDTO): Promise<Strategy | undefined> {
    // EXPANSIÓN: Auditoría de cambios en estrategia
    // EXPANSIÓN: Validar cambios no invaliden operaciones existentes
    return strategyRepository.update(id, dto);
  },

  async deleteStrategy(id: string): Promise<boolean> {
    // EXPANSIÓN: Soft delete para no perder histórico
    // EXPANSIÓN: Validar que no haya operaciones asociadas
    // EXPANSIÓN: O reasignar operaciones a estrategia por defecto
    return strategyRepository.delete(id);
  },

  async getStrategyOperations(strategyId: string): Promise<Operation[]> {
    const { operationRepository } = await import('../repositories/operation.repository');
    return operationRepository.findByStrategyId(strategyId);
  },

  async getStrategyPerformance(strategyId: string): Promise<StrategyPerformance> {
    const { operationRepository } = await import('../repositories/operation.repository');
    const operations = await operationRepository.findByStrategyId(strategyId);
    
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
      };
    }

    const totalPnL = operations.reduce((sum, op) => sum + op.pnl, 0);
    const totalInvested = operations.reduce((sum, op) => sum + (op.buyPrice * op.quantity), 0);
    const winningOps = operations.filter(op => op.pnl > 0);
    const winRate = (winningOps.length / operations.length) * 100;
    const avgPnL = totalPnL / operations.length;
    const avgPnLPercentage = operations.reduce((sum, op) => sum + op.pnlPercentage, 0) / operations.length;
    const bestTrade = Math.max(...operations.map(op => op.pnl));
    const worstTrade = Math.min(...operations.map(op => op.pnl));

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
