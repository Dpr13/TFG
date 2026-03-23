import { useState, useEffect } from 'react';
import { strategyService } from '../services';
import type { Strategy, CreateStrategyDTO, StrategyPerformance, Operation } from '../types';
import { Trash2, Plus, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// ============================================================================
// STRATEGIES PAGE
// ============================================================================
// Gestión de estrategias de trading
//
// EXPANSIONES FUTURAS:
// - Backtesting de estrategias (simulación histórica)
// - [HECHO] Performance dashboard por estrategia
// - [HECHO] Comparación entre estrategias
// - Archivado de estrategias inactivas
// - Clonación de estrategias exitosas
// - Tags para categorización (scalping, swing, posición, etc)
// - [HECHO] Ranking de estrategias por rentabilidad (tabla comparativa)
// - Alertas cuando estrategia tiene desempeño bajo
// - Exportación de parámetros de estrategia
// - Validación automática de coherencia de parámetros
// - Histórico de versiones de estrategia
// - Sugerencias de mejora basadas en histórico
// - Integración con brokers para ejecución automática
// ============================================================================

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [performances, setPerformances] = useState<Record<string, StrategyPerformance>>({});
  const [strategyOps, setStrategyOps] = useState<Record<string, Operation[]>>({});
  const [expandedCharts, setExpandedCharts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateStrategyDTO>({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await strategyService.getAllStrategies();
      setStrategies(data);
      const perfEntries = await Promise.all(
        data.map((s) => strategyService.getStrategyPerformance(s.id).then((p) => [s.id, p] as const))
      );
      setPerformances(Object.fromEntries(perfEntries));
    } catch (err) {
      setError('Error al cargar las estrategias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update strategy
        await strategyService.updateStrategy(editingId, formData);
        setEditingId(null);
      } else {
        // Create strategy
        await strategyService.createStrategy(formData);
      }

      setFormData({ name: '', description: '', color: '#3b82f6' });
      setShowForm(false);
      await fetchStrategies();
    } catch (err) {
      setError(editingId ? 'Error al actualizar la estrategia' : 'Error al crear la estrategia');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar esta estrategia?')) return;

    setLoading(true);
    setError(null);

    try {
      await strategyService.deleteStrategy(id);
      await fetchStrategies();
    } catch (err) {
      setError('Error al eliminar la estrategia');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChart = async (strategyId: string) => {
    const next = new Set(expandedCharts);
    if (next.has(strategyId)) {
      next.delete(strategyId);
      setExpandedCharts(next);
      return;
    }
    next.add(strategyId);
    setExpandedCharts(next);
    if (!strategyOps[strategyId]) {
      try {
        const ops = await strategyService.getStrategyOperations(strategyId);
        setStrategyOps((prev) => ({ ...prev, [strategyId]: ops }));
      } catch {
        // si falla, simplemente no se muestra el gráfico
      }
    }
  };

  const handleEdit = (strategy: Strategy) => {
    setEditingId(strategy.id);
    setFormData({
      name: strategy.name,
      description: strategy.description,
      color: strategy.color,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', color: '#3b82f6' });
  };

  if (loading && strategies.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando estrategias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estrategias</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" /> Nueva Estrategia
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Editar Estrategia' : 'Nueva Estrategia'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Ej: Trading en horario de mercado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Describe tu estrategia..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-gray-600 dark:text-gray-400">{formData.color}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Strategies Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            💡 Acerca de las Estrategias
          </h3>
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Las estrategias te permiten categorizar y monitorear tus operaciones de trading. En el
            futuro, podrás asignar operaciones a estrategias específicas y analizar su rendimiento
            de forma independiente.
          </p>
        </div>

        {/* Strategies Grid */}
        {strategies.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No hay estrategias creadas</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" /> Crear Primera Estrategia
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: strategy.color || '#3b82f6' }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {strategy.name}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(strategy)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(strategy.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {strategy.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {strategy.description}
                  </p>
                )}

                {performances[strategy.id] && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(() => {
                      const p = performances[strategy.id];
                      return (
                        <>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className={`text-sm font-bold ${p.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              €{p.totalPnL.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PnL total</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className={`text-sm font-bold ${p.winRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {p.winRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Win rate</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {p.totalOperations}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Operaciones</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Creada el {new Date(strategy.createdAt).toLocaleDateString('es-ES')}
                  </div>
                  {performances[strategy.id]?.totalOperations > 0 && (
                    <button
                      onClick={() => toggleChart(strategy.id)}
                      className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {expandedCharts.has(strategy.id) ? (
                        <><ChevronUp className="w-3 h-3" /> Ocultar evolución</>
                      ) : (
                        <><ChevronDown className="w-3 h-3" /> Ver evolución</>
                      )}
                    </button>
                  )}
                </div>

                {expandedCharts.has(strategy.id) && (() => {
                  const ops = strategyOps[strategy.id];
                  if (!ops || ops.length === 0) {
                    return <p className="text-xs text-gray-400 mt-3 text-center">Cargando...</p>;
                  }
                  const sorted = [...ops].sort((a, b) => a.date.localeCompare(b.date));
                  let cumPnL = 0;
                  const chartData = sorted.map((op) => {
                    cumPnL += op.pnl;
                    return { date: op.date.slice(5), pnL: parseFloat(cumPnL.toFixed(2)) };
                  });
                  return (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">PnL acumulado</p>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={45} />
                          <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                          <Line
                            type="monotone"
                            dataKey="pnL"
                            stroke={strategy.color || '#3b82f6'}
                            dot={false}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {/* Comparativa entre estrategias */}
        {strategies.length >= 2 && Object.keys(performances).length >= 2 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              📊 Comparativa entre Estrategias
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PnL Total */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">PnL Total (€)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={strategies.filter((s) => performances[s.id]).map((s) => ({
                    name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
                    PnL: parseFloat((performances[s.id]?.totalPnL ?? 0).toFixed(2)),
                    color: s.color || '#3b82f6',
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                    <Bar dataKey="PnL" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {strategies.filter((s) => performances[s.id]).map((s) => (
                        <rect key={s.id} fill={s.color || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Win Rate */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Win Rate (%)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={strategies.filter((s) => performances[s.id]).map((s) => ({
                    name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
                    'Win Rate': parseFloat((performances[s.id]?.winRate ?? 0).toFixed(1)),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="Win Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla resumen */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Estrategia</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Ops</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">PnL Total</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Win Rate</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Mejor trade</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Peor trade</th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.filter((s) => performances[s.id]).map((s) => {
                    const p = performances[s.id];
                    return (
                      <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s.color || '#3b82f6' }} />
                          {s.name}
                        </td>
                        <td className="text-right py-2 text-gray-700 dark:text-gray-300">{p.totalOperations}</td>
                        <td className={`text-right py-2 font-semibold ${p.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          €{p.totalPnL.toFixed(2)}
                        </td>
                        <td className={`text-right py-2 ${p.winRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {p.winRate.toFixed(1)}%
                        </td>
                        <td className="text-right py-2 text-green-600 dark:text-green-400">€{p.bestTrade.toFixed(2)}</td>
                        <td className="text-right py-2 text-red-600 dark:text-red-400">€{p.worstTrade.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
