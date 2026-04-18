import { useState, useEffect } from 'react';
import { strategyService, botStrategyService } from '../services';
import type { Strategy, CreateStrategyDTO, StrategyPerformance, Operation } from '../types';
import type { BotStrategy, CreateBotStrategyDTO, BotStrategyParams } from '../services';
import { Trash2, Plus, Edit2, ChevronDown, ChevronUp, Bot, BookOpen, X, Info } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

// ─── Plantillas por defecto ───────────────────────────────────────────────────

const TEMPLATES: Omit<BotStrategy, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Momentum — Doble Media Móvil',
    algorithm: 'momentum',
    description: 'Compra cuando la media rápida cruza por encima de la lenta y vende cuando la cruza por debajo. Funciona bien en mercados con tendencia clara.',
    params: { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 },
  },
  {
    name: 'Mean Reversion — Bandas de Bollinger',
    algorithm: 'mean-reversion',
    description: 'Compra cuando el precio cae por debajo de la banda inferior (sobrevendido) y vende cuando vuelve a la media. Funciona bien en mercados laterales.',
    params: { window: 20, k: 2 },
  },
];

const PARAM_META: Record<string, { label: string; description: string; min: number; max: number; step: number }> = {
  fastWindow:   { label: 'Ventana rápida',         description: 'Periodos de la media móvil rápida',              min: 2,    max: 50,   step: 1     },
  slowWindow:   { label: 'Ventana lenta',           description: 'Periodos de la media móvil lenta',               min: 5,    max: 200,  step: 1     },
  thresholdPct: { label: 'Umbral (%)',              description: 'Diferencia mínima entre medias para señal',      min: 0,    max: 0.05, step: 0.001 },
  window:       { label: 'Ventana',                 description: 'Periodos para calcular media y desviación',      min: 5,    max: 100,  step: 1     },
  k:            { label: 'Multiplicador (k)',        description: 'Amplitud de las bandas (k × desviación típica)', min: 0.5,  max: 5,    step: 0.1   },
};

const ALGO_PARAMS: Record<string, (keyof BotStrategyParams)[]> = {
  'momentum':       ['fastWindow', 'slowWindow', 'thresholdPct'],
  'mean-reversion': ['window', 'k'],
};

// ─── Bot Strategy Form ────────────────────────────────────────────────────────

const EMPTY_FORM: CreateBotStrategyDTO = {
  name: '',
  algorithm: 'momentum',
  description: '',
  params: { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 },
};

function BotStrategyForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: BotStrategy;
  onSave: (dto: CreateBotStrategyDTO) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateBotStrategyDTO>(
    initial
      ? { name: initial.name, algorithm: initial.algorithm, description: initial.description ?? '', params: { ...initial.params } }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAlgoChange = (algo: 'momentum' | 'mean-reversion') => {
    const defaults = algo === 'momentum'
      ? { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 }
      : { window: 20, k: 2 };
    setForm(f => ({ ...f, algorithm: algo, params: defaults }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
    } catch {
      setError('Error al guardar la estrategia');
    } finally {
      setLoading(false);
    }
  };

  const paramKeys = ALGO_PARAMS[form.algorithm];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Mi estrategia momentum agresiva"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* Algoritmo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Algoritmo base</label>
        <div className="grid grid-cols-2 gap-3">
          {(['momentum', 'mean-reversion'] as const).map(algo => (
            <button
              key={algo}
              type="button"
              onClick={() => handleAlgoChange(algo)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                form.algorithm === algo
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-semibold">{algo === 'momentum' ? 'Momentum' : 'Mean Reversion'}</div>
              <div className="text-xs opacity-70 mt-0.5">{algo === 'momentum' ? 'Doble Media Móvil' : 'Bandas de Bollinger'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Parámetros */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Parámetros</label>
        <div className="space-y-4">
          {paramKeys.map(key => {
            const meta = PARAM_META[key];
            const val = (form.params as any)[key] ?? meta.min;
            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{meta.label}</span>
                  <span className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">{val}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{meta.description}</p>
                <input
                  type="range"
                  min={meta.min}
                  max={meta.max}
                  step={meta.step}
                  value={val}
                  onChange={e => setForm(f => ({ ...f, params: { ...f.params, [key]: parseFloat(e.target.value) } }))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <span>{meta.min}</span>
                  <span>{meta.max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (opcional)</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Notas sobre cuándo usar esta estrategia..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando…' : initial ? 'Actualizar' : 'Crear estrategia'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Tab: Estrategias para Bots ───────────────────────────────────────────────

function BotStrategiesTab() {
  const [strategies, setStrategies] = useState<BotStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BotStrategy | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setStrategies(await botStrategyService.getAll()); }
    finally { setLoading(false); }
  };

  const handleSave = async (dto: CreateBotStrategyDTO) => {
    if (editing) {
      await botStrategyService.update(editing.id, dto);
    } else {
      await botStrategyService.create(dto);
    }
    setShowForm(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta estrategia?')) return;
    await botStrategyService.delete(id);
    await load();
  };

  const startEdit = (s: BotStrategy) => { setEditing(s); setShowForm(true); };
  const cancelForm = () => { setShowForm(false); setEditing(null); };

  const cloneTemplate = (t: typeof TEMPLATES[0]) => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowTemplates(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Plantillas de referencia</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">(parámetros por defecto)</span>
          </div>
          {showTemplates ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showTemplates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
            {TEMPLATES.map(t => (
              <div key={t.algorithm} className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{t.algorithm}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{t.name}</h4>
                  </div>
                  <button
                    onClick={() => cloneTemplate(t)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex-shrink-0 ml-2"
                  >
                    + Crear basada en esta
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t.description}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(t.params).map(([k, v]) => (
                    <span key={k} className="inline-flex items-center gap-1 text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg px-2 py-1">
                      <span className="text-gray-500 dark:text-gray-400">{PARAM_META[k]?.label ?? k}:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{v}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">
            {editing ? 'Editar estrategia' : 'Nueva estrategia para bots'}
          </h3>
          <BotStrategyForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={cancelForm}
          />
        </div>
      )}

      {/* Lista de estrategias del usuario */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Mis estrategias</h3>
          {!showForm && (
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Nueva
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />)}
          </div>
        ) : strategies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
            <Bot className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Sin estrategias personalizadas</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Crea una basada en las plantillas de arriba</p>
          </div>
        ) : (
          <div className="space-y-3">
            {strategies.map(s => (
              <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">{s.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.algorithm === 'momentum'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                      }`}>
                        {s.algorithm}
                      </span>
                    </div>
                    {s.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(s.params).map(([k, v]) => (
                        <span key={k} className="inline-flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-0.5">
                          <span className="text-gray-500 dark:text-gray-400">{PARAM_META[k]?.label ?? k}:</span>
                          <span className="font-mono font-bold text-gray-900 dark:text-white">{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(s)} className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Estrategias Manuales ────────────────────────────────────────────────

function ManualStrategiesTab() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [performances, setPerformances] = useState<Record<string, StrategyPerformance>>({});
  const [strategyOps, setStrategyOps] = useState<Record<string, Operation[]>>({});
  const [expandedCharts, setExpandedCharts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateStrategyDTO>({ name: '', description: '', color: '#3b82f6' });

  useEffect(() => { fetchStrategies(); }, []);

  const fetchStrategies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await strategyService.getAllStrategies();
      setStrategies(data);
      const perfEntries = await Promise.all(
        data.map(s => strategyService.getStrategyPerformance(s.id).then(p => [s.id, p] as const))
      );
      setPerformances(Object.fromEntries(perfEntries));
    } catch { setError('Error al cargar las estrategias'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) { await strategyService.updateStrategy(editingId, formData); setEditingId(null); }
      else { await strategyService.createStrategy(formData); }
      setFormData({ name: '', description: '', color: '#3b82f6' });
      setShowForm(false);
      await fetchStrategies();
    } catch { setError(editingId ? 'Error al actualizar' : 'Error al crear'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta estrategia?')) return;
    try { await strategyService.deleteStrategy(id); await fetchStrategies(); }
    catch { setError('Error al eliminar'); }
  };

  const toggleChart = async (strategyId: string) => {
    const next = new Set(expandedCharts);
    if (next.has(strategyId)) { next.delete(strategyId); setExpandedCharts(next); return; }
    next.add(strategyId);
    setExpandedCharts(next);
    if (!strategyOps[strategyId]) {
      const ops = await strategyService.getStrategyOperations(strategyId).catch(() => []);
      setStrategyOps(prev => ({ ...prev, [strategyId]: ops }));
    }
  };

  const handleEdit = (s: Strategy) => {
    setEditingId(s.id);
    setFormData({ name: s.name, description: s.description, color: s.color });
    setShowForm(true);
  };

  if (loading && strategies.length === 0) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">{editingId ? 'Editar estrategia' : 'Nueva estrategia manual'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Ej: Scalping en apertura" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Describe tu estrategia..." rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{formData.color}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 bg-primary-600 text-white py-2 rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm font-semibold">
                {loading ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: '', description: '', color: '#3b82f6' }); }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-sm border border-gray-200 dark:border-gray-600">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 text-sm font-semibold">
            <Plus className="w-4 h-4" /> Nueva estrategia
          </button>
        </div>
      )}

      {strategies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Sin estrategias manuales</p>
          <button onClick={() => setShowForm(true)} className="mt-3 inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 text-sm font-semibold">
            <Plus className="w-4 h-4" /> Crear primera estrategia
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map(strategy => (
              <div key={strategy.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: strategy.color || '#3b82f6' }} />
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{strategy.name}</h3>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(strategy)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(strategy.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {strategy.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{strategy.description}</p>}
                {performances[strategy.id] && (() => {
                  const p = performances[strategy.id];
                  return (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className={`text-sm font-bold ${p.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>€{p.totalPnL.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PnL total</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className={`text-sm font-bold ${p.winRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{p.winRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Win rate</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{p.totalOperations}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Operaciones</p>
                      </div>
                    </div>
                  );
                })()}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Creada {new Date(strategy.createdAt).toLocaleDateString('es-ES')}</span>
                  {(performances[strategy.id]?.totalOperations ?? 0) > 0 && (
                    <button onClick={() => toggleChart(strategy.id)} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                      {expandedCharts.has(strategy.id) ? <><ChevronUp className="w-3 h-3" /> Ocultar</> : <><ChevronDown className="w-3 h-3" /> Ver evolución</>}
                    </button>
                  )}
                </div>
                {expandedCharts.has(strategy.id) && (() => {
                  const ops = strategyOps[strategy.id];
                  if (!ops || ops.length === 0) return <p className="text-xs text-gray-400 mt-3 text-center">Cargando...</p>;
                  const sorted = [...ops].sort((a, b) => a.date.localeCompare(b.date));
                  let cum = 0;
                  const data = sorted.map(op => { cum += op.pnl; return { date: op.date.slice(5), pnL: parseFloat(cum.toFixed(2)) }; });
                  return (
                    <div className="mt-3">
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={45} />
                          <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                          <Line type="monotone" dataKey="pnL" stroke={strategy.color || '#3b82f6'} dot={false} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>

          {strategies.length >= 2 && Object.keys(performances).length >= 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Comparativa entre estrategias</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">PnL Total (€)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={strategies.filter(s => performances[s.id]).map(s => ({ name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name, PnL: parseFloat((performances[s.id]?.totalPnL ?? 0).toFixed(2)) }))}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} /><Bar dataKey="PnL" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Win Rate (%)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={strategies.filter(s => performances[s.id]).map(s => ({ name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name, 'Win Rate': parseFloat((performances[s.id]?.winRate ?? 0).toFixed(1)) }))}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} /><Legend /><Bar dataKey="Win Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Estrategia</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Ops</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">PnL Total</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Win Rate</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Mejor</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Peor</th>
                  </tr></thead>
                  <tbody>
                    {strategies.filter(s => performances[s.id]).map(s => {
                      const p = performances[s.id];
                      return (
                        <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color || '#3b82f6' }} />{s.name}</td>
                          <td className="text-right py-2 text-gray-700 dark:text-gray-300">{p.totalOperations}</td>
                          <td className={`text-right py-2 font-semibold ${p.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>€{p.totalPnL.toFixed(2)}</td>
                          <td className={`text-right py-2 ${p.winRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{p.winRate.toFixed(1)}%</td>
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
        </>
      )}
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function StrategiesPage() {
  const [tab, setTab] = useState<'manual' | 'bots'>('manual');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Estrategias</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setTab('manual')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'manual'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Manuales
          </button>
          <button
            onClick={() => setTab('bots')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'bots'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Bot className="w-4 h-4" /> Para Bots
          </button>
        </div>

        {tab === 'manual' ? <ManualStrategiesTab /> : <BotStrategiesTab />}
      </div>
    </div>
  );
}
