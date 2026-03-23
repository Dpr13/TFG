import { useState, useEffect, useMemo } from 'react';
import { operationService, strategyService } from '../services';
import type { Operation, DailyStats, Strategy } from '../types';
import DailyOperationsModal from '../components/DailyOperationsModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================================================
// CALENDAR PAGE
// ============================================================================
// Vista de calendario para visualizar operaciones por día
//
// EXPANSIONES FUTURAS:
// - Vista semanal y anual
// - [HECHO] Heatmap de rentabilidad con gradientes
// - Exportar calendario a PDF/imagen
// - Anotaciones/notas diarias sin operaciones
// - [HECHO] Filtrado por símbolo/estrategia
// - Vista comparativa de múltiples meses
// - Integración con festividades/eventos de mercado
// - Notificaciones de anomalías (mejor/peor día histórico, etc)
// - Análisis de ciclos de luna/planetas (si lo desea)
// - Sincronización con calendarios externos (Google, Outlook)
// ============================================================================

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [operations, setOperations] = useState<Operation[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<Map<string, DailyStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');

  // Filtra las estadísticas por estrategia calculando localmente desde las operaciones
  const filteredStats = useMemo(() => {
    if (!selectedStrategyId) return monthlyStats;
    const filtered = operations.filter((op) => op.strategyId === selectedStrategyId);
    const statsMap = new Map<string, DailyStats>();
    filtered.forEach((op) => {
      const existing = statsMap.get(op.date);
      if (existing) {
        statsMap.set(op.date, {
          ...existing,
          totalPnL: existing.totalPnL + op.pnl,
          operationCount: existing.operationCount + 1,
          isProfit: existing.totalPnL + op.pnl > 0,
        });
      } else {
        statsMap.set(op.date, {
          date: op.date,
          totalPnL: op.pnl,
          totalPnLPercentage: op.pnlPercentage ?? 0,
          operationCount: 1,
          isProfit: op.pnl > 0,
        });
      }
    });
    return statsMap;
  }, [selectedStrategyId, operations, monthlyStats]);

  const maxAbsPnL = useMemo(() => {
    let max = 0;
    filteredStats.forEach((stat) => {
      if (Math.abs(stat.totalPnL) > max) max = Math.abs(stat.totalPnL);
    });
    return max || 1;
  }, [filteredStats]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayOperations, setSelectedDayOperations] = useState<Operation[]>([]);
  const [selectedDayStats, setSelectedDayStats] = useState<DailyStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    strategyService.getAllStrategies().then(setStrategies).catch(console.error);
  }, []);

  // Fetch monthly data
  useEffect(() => {
    fetchMonthlyData();
  }, [currentDate]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const stats = await operationService.getMonthlyStats(year, month);
      const statsMap = new Map<string, DailyStats>();
      stats.forEach((stat) => {
        statsMap.set(stat.date, stat);
      });
      setMonthlyStats(statsMap);

      // Fetch all operations for the month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const opsData = await operationService.getOperationsByDateRange(startDate, endDate);
      setOperations(opsData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = async (day: number) => {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setSelectedDate(dateStr);

    const dayOps = operations.filter(
      (op) => op.date === dateStr && (!selectedStrategyId || op.strategyId === selectedStrategyId)
    );
    setSelectedDayOperations(dayOps);

    const stats = filteredStats.get(dateStr);
    setSelectedDayStats(stats || null);

    setIsModalOpen(true);
  };

  const handleOperationAdded = async () => {
    await fetchMonthlyData();
    if (selectedDate) {
      const dayOps = operations.filter(
        (op) => op.date === selectedDate && (!selectedStrategyId || op.strategyId === selectedStrategyId)
      );
      setSelectedDayOperations(dayOps);
    }
  };

  const handleOperationDeleted = async () => {
    await fetchMonthlyData();
    if (selectedDate) {
      const dayOps = operations.filter(
        (op) => op.date === selectedDate && (!selectedStrategyId || op.strategyId === selectedStrategyId)
      );
      setSelectedDayOperations(dayOps);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Convertir de 0=Domingo a 0=Lunes para coincidir con las cabeceras
    return (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  if (loading && operations.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Calendario de Operaciones
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Calendar Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {monthName}
            </h2>

            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Strategy Filter */}
          {strategies.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Estrategia:
              </label>
              <select
                value={selectedStrategyId}
                onChange={(e) => setSelectedStrategyId(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todas</option>
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {selectedStrategyId && (
                <button
                  onClick={() => setSelectedStrategyId('')}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
                >
                  Limpiar
                </button>
              )}
            </div>
          )}

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square"></div>;
              }

              const dateStr = formatDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              );
              const stats = filteredStats.get(dateStr);
              const isProfit = stats && stats.totalPnL > 0;
              const isLoss = stats && stats.totalPnL < 0;

              const intensity = stats ? Math.min(Math.abs(stats.totalPnL) / maxAbsPnL, 1) : 0;
              const alpha = stats ? (0.15 + intensity * 0.75).toFixed(2) : '0';
              const bgStyle = stats
                ? { backgroundColor: isProfit ? `rgba(34,197,94,${alpha})` : `rgba(239,68,68,${alpha})` }
                : undefined;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  style={bgStyle}
                  className={`aspect-square p-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary-400 transition-all cursor-pointer ${!stats ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                >
                  <div className="h-full flex flex-col items-start justify-start">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {day}
                    </span>
                    {stats && (
                      <div className="mt-auto text-xs">
                        <div
                          className={
                            isProfit
                              ? 'text-green-600 dark:text-green-400 font-semibold'
                              : isLoss
                                ? 'text-red-600 dark:text-red-400 font-semibold'
                                : 'text-gray-600 dark:text-gray-400'
                          }
                        >
                          €{stats.totalPnL.toFixed(0)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {stats.operationCount} op
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Día rentable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Día con pérdidas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Sin operaciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedDate && (
        <DailyOperationsModal
          date={selectedDate}
          operations={selectedDayOperations}
          stats={selectedDayStats}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onOperationAdded={handleOperationAdded}
          onOperationDeleted={handleOperationDeleted}
        />
      )}
    </div>
  );
}
