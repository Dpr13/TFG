import { operationRepository } from '../repositories/operation.repository';
import { CreateOperationDTO, UpdateOperationDTO, Operation, DailyStats } from '../models/operation';

// ============================================================================
// OPERATION SERVICE
// ============================================================================
// Lógica de negocio para operaciones de trading
//
// EXPANSIONES FUTURAS:
// - Validación de operaciones (ej: cantidad mínima, máximo open trades)
// - Cálculo de comisiones automáticas
// - Validación de precios (no permitir operaciones sin sentido)
// - Búsqueda avanzada de operaciones (por rango de PnL, por símbolo incluído, etc)
// - Exportación a formatos (CSV, JSON, Excel)
// - Análisis técnico al momento de crear operación
// - Auditoría de cambios en operaciones
// - Sincronización con brokers (API)
// - Notificaciones de operaciones anómalas
// ============================================================================

export const operationService = {
  async createOperation(dto: CreateOperationDTO): Promise<Operation> {
    // EXPANSIÓN: Aquí iría validación de datos de entrada
    // EXPANSIÓN: Aquí iría cálculo automático de comisiones
    return operationRepository.create(dto);
  },

  async getOperationById(id: string): Promise<Operation | undefined> {
    return operationRepository.findById(id);
  },

  async getOperationsByDate(date: string): Promise<Operation[]> {
    return operationRepository.findByDate(date);
  },

  async getOperationsByDateRange(startDate: string, endDate: string): Promise<Operation[]> {
    return operationRepository.findByDateRange(startDate, endDate);
  },

  async getAllOperations(): Promise<Operation[]> {
    return operationRepository.findAll();
  },

  async getOperationsByStrategyId(strategyId: string): Promise<Operation[]> {
    return operationRepository.findByStrategyId(strategyId);
  },

  async updateOperation(id: string, dto: UpdateOperationDTO): Promise<Operation | undefined> {
    // EXPANSIÓN: Auditoría de cambios
    // EXPANSIÓN: Validación de cambios
    return operationRepository.update(id, dto);
  },

  async deleteOperation(id: string): Promise<boolean> {
    // EXPANSIÓN: Soft delete en lugar de eliminación permanente
    return operationRepository.delete(id);
  },

  async deleteOperationsByDate(date: string): Promise<number> {
    return operationRepository.deleteByDate(date);
  },

  // EXPANSIÓN: Búsqueda avanzada
  /*
  async searchOperations(filters: {
    symbol?: string;
    minPnL?: number;
    maxPnL?: number;
    strategy?: string;
    winOnly?: boolean;
  }): Promise<Operation[]> {
    // Implementar búsqueda con múltiples filtros
  }
  */

  // EXPANSIÓN: Exportación de datos
  /*
  async exportToCSV(startDate: string, endDate: string): Promise<string> {
    // Generar CSV con operaciones
  }
  */

  async getDailyStats(date: string): Promise<DailyStats> {
    const operations = await operationRepository.findByDate(date);

    const totalPnL = operations.reduce((sum, op) => sum + op.pnl, 0);
    const totalInvested = operations.reduce((sum, op) => sum + op.buyPrice * op.quantity, 0);
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return {
      date,
      totalPnL,
      totalPnLPercentage,
      operationCount: operations.length,
      isProfit: totalPnL > 0,
    };
  },

  async getMonthlyStats(year: number, month: number): Promise<DailyStats[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const operations = await operationRepository.findByDateRange(startDate, endDate);

    // Group by date
    const operationsByDate = new Map<string, Operation[]>();
    operations.forEach(op => {
      if (!operationsByDate.has(op.date)) {
        operationsByDate.set(op.date, []);
      }
      operationsByDate.get(op.date)!.push(op);
    });

    // EXPANSIÓN: Cachear resultados para performance
    // Calculate stats for each date
    const stats: DailyStats[] = [];
    operationsByDate.forEach((ops, date) => {
      const totalPnL = ops.reduce((sum, op) => sum + op.pnl, 0);
      const totalInvested = ops.reduce((sum, op) => sum + op.buyPrice * op.quantity, 0);
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      stats.push({
        date,
        totalPnL,
        totalPnLPercentage,
        operationCount: ops.length,
        isProfit: totalPnL > 0,
      });
    });

    return stats.sort((a, b) => a.date.localeCompare(b.date));
  },
};
