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
    return operationRepository.create(dto);
  },

  async getOperationById(id: string, userId: string): Promise<Operation | undefined> {
    return operationRepository.findById(id, userId);
  },

  async getOperationsByDate(date: string, userId: string): Promise<Operation[]> {
    return operationRepository.findByDate(date, userId);
  },

  async getOperationsByDateRange(startDate: string, endDate: string, userId: string): Promise<Operation[]> {
    return operationRepository.findByDateRange(startDate, endDate, userId);
  },

  async getAllOperations(userId: string): Promise<Operation[]> {
    return operationRepository.findAll(userId);
  },

  async getOperationsByStrategyId(strategyId: string, userId: string): Promise<Operation[]> {
    return operationRepository.findByStrategyId(strategyId, userId);
  },

  async updateOperation(id: string, userId: string, dto: UpdateOperationDTO): Promise<Operation | undefined> {
    return operationRepository.update(id, userId, dto);
  },

  async deleteOperation(id: string, userId: string): Promise<boolean> {
    return operationRepository.delete(id, userId);
  },

  async deleteOperationsByDate(date: string, userId: string): Promise<number> {
    return operationRepository.deleteByDate(date, userId);
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

  async getDailyStats(date: string, userId: string): Promise<DailyStats> {
    const operations = await operationRepository.findByDate(date, userId);

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

  async getMonthlyStats(year: number, month: number, userId: string): Promise<DailyStats[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    // month viene como 1-12, pero new Date espera 0-11, así que usamos month directamente para obtener el último día del mes anterior
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const operations = await operationRepository.findByDateRange(startDate, endDate, userId);

    // Group by date
    const operationsByDate = new Map<string, Operation[]>();
    operations.forEach(op => {
      if (!operationsByDate.has(op.date)) operationsByDate.set(op.date, []);
      operationsByDate.get(op.date)!.push(op);
    });

    const stats: DailyStats[] = [];
    operationsByDate.forEach((ops, date) => {
      const totalPnL = ops.reduce((sum, op) => sum + op.pnl, 0);
      const totalInvested = ops.reduce((sum, op) => sum + op.buyPrice * op.quantity, 0);
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
      stats.push({ date, totalPnL, totalPnLPercentage, operationCount: ops.length, isProfit: totalPnL > 0 });
    });

    return stats.sort((a, b) => a.date.localeCompare(b.date));
  },
};
