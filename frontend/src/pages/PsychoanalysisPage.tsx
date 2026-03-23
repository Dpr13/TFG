import { useState, useEffect } from 'react';
import type { PsychoAnalysisSummary, Strategy } from '../types';
import { psychoanalysisService, strategyService } from '../services';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

// ============================================================================
// PSYCHOANALYSIS PAGE
// ============================================================================
// Análisis psicológico/comportamental del trader
//
// EXPANSIONES FUTURAS:
// - Scoring de disciplina (0-100)
// - Análisis predictivo de comportamiento futuro
// - [HECHO] Detección automática de anomalías (sobre-trading, revenge trading)
// - Recomendaciones personalizadas en tiempo real
// - [HECHO] Notificaciones/alertas de comportamiento riesgoso
// - Análisis por hora del día (best trading hours)
// - Gamificación: badges y logros por mejoras
// - Histórico gráfico de evolución psicológica
// - Correlación: emociones vs rentabilidad
// - Exportación de reports a PDF
// - Comparativa con otros traders (benchmarking)
// - ML para predicción de win rate futuro
// - Análisis de ciclos emocionales
// - [HECHO] Filtro por rango de fechas
// ============================================================================

export default function PsychoanalysisPage() {
  const [data, setData] = useState<PsychoAnalysisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    strategyService.getAllStrategies().then(setStrategies).catch(console.error);
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [selectedStrategyId, startDate, endDate]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      let analysis;
      if (selectedStrategyId) {
        analysis = await psychoanalysisService.getAnalysisByStrategy(selectedStrategyId);
      } else if (startDate && endDate) {
        analysis = await psychoanalysisService.getAnalysisByDateRange(startDate, endDate);
      } else {
        analysis = await psychoanalysisService.getAnalysis();
      }
      setData(analysis);
    } catch (err) {
      setError('Error al cargar el análisis psicológico');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Analizando operaciones...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'No hay datos disponibles'}
          </div>
        </div>
      </div>
    );
  }

  const { generalStats, assetStats, temporalStats, behaviorStats, alerts } = data;

  const topAssets = assetStats.filter((a) => a.totalPnL > 0).slice(0, 5);
  const topSymbols = new Set(topAssets.map((a) => a.symbol));
  const remaining = [...assetStats].reverse().filter((a) => !topSymbols.has(a.symbol));
  const negativeAssets = remaining.filter((a) => a.totalPnL < 0).slice(0, 5);
  const worstAssets = negativeAssets.length > 0 ? negativeAssets : remaining.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            🧠 Análisis Psicológico del Operador
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Estrategia:
              </label>
              <select
                value={selectedStrategyId}
                onChange={(e) => { setSelectedStrategyId(e.target.value); setStartDate(''); setEndDate(''); }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">General (todas)</option>
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Desde:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setSelectedStrategyId(''); }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Hasta:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setSelectedStrategyId(''); }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {(startDate || endDate || selectedStrategyId) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setSelectedStrategyId(''); }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        {/* 
          EXPANSIÓN: Los KPI Cards pueden extenderse con:
          - Cambios porcentuales (vs día anterior, semana anterior)
          - Sparkline charts mostrando tendencias
          - Targeting goals personalizados
          - Badges por logros (1er mes rentable, 50 ops sin stop loss, etc.)
          - Comparación con benchmarks (S&P 500, índices)
        */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total PnL"
            value={`€${generalStats.totalPnL.toFixed(2)}`}
            color={generalStats.totalPnL > 0 ? 'green' : 'red'}
            icon={generalStats.totalPnL > 0 ? <TrendingUp /> : <TrendingDown />}
          />
          <KPICard
            title="Tasa de Ganancia"
            value={`${generalStats.winRate.toFixed(1)}%`}
            color={generalStats.winRate > 50 ? 'green' : 'red'}
            icon={<Target />}
          />
          <KPICard
            title="Total Operaciones"
            value={generalStats.totalOperations.toString()}
            color="blue"
            icon={<Zap />}
          />
          <KPICard
            title="Mejor Día"
            value={`€${generalStats.bestDay.pnl.toFixed(2)}`}
            color="green"
            icon={<TrendingUp />}
          />
        </div>

        {/* Main Grid */}
        {/* 
          EXPANSIÓN: Gráficos adicionales a implementar:
          - Heat map por hora del día (detectar horas pico)
          - Gráfico de ciclos emocionales (ánimo vs rentabilidad)
          - Correlación con indicadores técnicos
          - Análisis de volatilidad por período
          - Comparativa mes a mes (evolución)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Día de la Semana */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📊 Rentabilidad por Día de la Semana
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={temporalStats.dayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return `€${value.toFixed(2)}`;
                    }
                    return value;
                  }}
                />
                <Bar dataKey="totalPnL" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Mejor día:</strong> {temporalStats.bestDayOfWeek}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Peor día:</strong> {temporalStats.worstDayOfWeek}
              </p>
            </div>
          </div>

          {/* Win Rate por Activo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Tasa de Ganancia por Activo
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetStats.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return `${value.toFixed(1)}%`;
                    }
                    return value;
                  }}
                />
                <Bar dataKey="winRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comportamiento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Rachas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔥 Rachas
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {behaviorStats.longestWinStreak}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Racha ganadora más larga</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {behaviorStats.longestLossStreak}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Racha perdedora más larga</p>
              </div>
            </div>
          </div>

          {/* Recuperación */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💪 Recuperación
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {behaviorStats.recoveryAttempts}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Intentos de recuperación</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {behaviorStats.recoverySuccessRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tasa de éxito</p>
              </div>
            </div>
          </div>

          {/* Operaciones Promedio */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📈 Promedio de Operaciones
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {behaviorStats.opsAfterWin.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Ops después de ganancia</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {behaviorStats.opsAfterLoss.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Ops después de pérdida</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mejores y Peores Activos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Assets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⭐ Mejores Activos
            </h2>
            <div className="space-y-2">
              {topAssets.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Aún no hay activos con rentabilidad positiva.
                </p>
              ) : topAssets.map((asset, idx) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {idx + 1}. {asset.symbol}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.operations} op - {asset.winRate.toFixed(1)}% ganancia
                    </p>
                  </div>
                  <span
                    className={`font-bold ${asset.totalPnL > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    €{asset.totalPnL.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Peores Activos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⚠️ Activos que Necesitan Atención
            </h2>
            <div className="space-y-2">
              {worstAssets.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Solo hay un activo operado, ya aparece en la lista de mejores.
                </p>
              ) : worstAssets.map((asset, idx) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {idx + 1}. {asset.symbol}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.operations} op - {asset.winRate.toFixed(1)}% ganancia
                    </p>
                  </div>
                  <span
                    className={`font-bold ${asset.totalPnL > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    €{asset.totalPnL.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        {/* Alertas de riesgo automáticas */}
        {alerts && alerts.length > 0 && (
          <div className="mt-8 rounded-lg p-6 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🚨 Alertas de Comportamiento Detectadas
            </h2>
            <div className="space-y-3">
              {alerts.map((alert, idx) => {
                const severityStyles = {
                  high: 'bg-red-100 dark:bg-red-900/40 border-red-400 text-red-800 dark:text-red-300',
                  medium: 'bg-orange-100 dark:bg-orange-900/40 border-orange-400 text-orange-800 dark:text-orange-300',
                  low: 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 text-yellow-800 dark:text-yellow-300',
                };
                const typeLabel = {
                  overtrading: '📈 Over-trading',
                  revenge_trading: '😤 Revenge Trading',
                  loss_spiral: '📉 Espiral de Pérdidas',
                };
                const severityLabel = { high: 'Alta', medium: 'Media', low: 'Baja' };
                return (
                  <div key={idx} className={`p-4 rounded-lg border ${severityStyles[alert.severity]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{typeLabel[alert.type]}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
                        Severidad: {severityLabel[alert.severity]}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Insights de Comportamiento
          </h2>
          {/* 
            EXPANSIÓN: Aquí iría generación automática de insights más compleja
            - Machine Learning para detectar patrones anómalos
            - Comparación con benchmarks de la industria
            - Predicciones de comportamiento futuro
            - Recomendaciones personalizadas AI-powered
            - Scoring de psicología del trader (0-100)
            - Badges y gamificación por mejoras
          */}
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {generalStats.winRate > 50 ? (
              <p>✅ Tu tasa de ganancia es superior al 50%, buen desempeño general.</p>
            ) : (
              <p>⚠️ Tu tasa de ganancia está por debajo del 50%, considera revisar tu estrategia.</p>
            )}

            {behaviorStats.recoverySuccessRate > 60 ? (
              <p>✅ Recuperas bien de las pérdidas ({behaviorStats.recoverySuccessRate}% de éxito).</p>
            ) : (
              <p>
                ⚠️ Tus intentos de recuperación tienen baja tasa de éxito (
                {behaviorStats.recoverySuccessRate}%). Evita operar emocionalmente.
              </p>
            )}

            {behaviorStats.opsAfterLoss > behaviorStats.opsAfterWin ? (
              <p>
                ⚠️ Haces más operaciones después de pérdidas que después de ganancias. Potencial
                sobre-trading emocional.
              </p>
            ) : (
              <p>✅ Tu comportamiento es controlado: menos operaciones después de pérdidas.</p>
            )}

            {generalStats.bestAsset.symbol && (
              <p>
                ⭐ Tu mejor activo es <strong>{generalStats.bestAsset.symbol}</strong> con €
                {generalStats.bestAsset.pnl.toFixed(2)}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  color: 'green' | 'red' | 'blue' | 'purple';
  icon?: React.ReactNode;
}

function KPICard({ title, value, color, icon }: KPICardProps) {
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };

  const textColors = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`rounded-lg p-6 border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${textColors[color]}`}>{value}</p>
        </div>
        {icon && <div className={`text-3xl ${textColors[color]}`}>{icon}</div>}
      </div>
    </div>
  );
}
