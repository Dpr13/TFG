import { useState, useEffect } from 'react';
import { strategyService, botStrategyService } from '../services';
import type { Strategy, CreateStrategyDTO, StrategyPerformance, Operation } from '../types';
import type { BotAlgorithm, BotStrategy, CreateBotStrategyDTO, BotStrategyParams } from '../services';
import { Trash2, Plus, Edit2, ChevronDown, ChevronUp, Bot, BookOpen, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

// ─── Static data (no i18n needed) ────────────────────────────────────────────

const PARAM_RANGES: Record<string, { min: number; max: number; step: number; defaultValue: number }> = {
  fastWindow:    { min: 2,   max: 50,   step: 1,     defaultValue: 5     },
  slowWindow:    { min: 5,   max: 200,  step: 1,     defaultValue: 20    },
  thresholdPct:  { min: 0,   max: 0.05, step: 0.001, defaultValue: 0.001 },
  window:        { min: 5,   max: 100,  step: 1,     defaultValue: 20    },
  k:             { min: 0.5, max: 5,    step: 0.1,   defaultValue: 2     },
  rsiPeriod:     { min: 2,   max: 50,   step: 1,     defaultValue: 14    },
  rsiOverbought: { min: 50,  max: 100,  step: 1,     defaultValue: 70    },
  rsiOversold:   { min: 0,   max: 50,   step: 1,     defaultValue: 30    },
};

const ALGO_DEFAULTS: Record<BotAlgorithm, BotStrategyParams> = {
  'momentum':       { fastWindow: 5, slowWindow: 20, thresholdPct: 0.001 },
  'mean-reversion': { window: 20, k: 2 },
  'rsi':            { rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30 },
};

const EMPTY_FORM: CreateBotStrategyDTO = {
  name: '',
  algorithm: 'momentum',
  description: '',
  params: { ...ALGO_DEFAULTS['momentum'] },
};

// ─── Bot Strategy Form ────────────────────────────────────────────────────────

function BotStrategyForm({
  initial,
  initialDto,
  onSave,
  onCancel,
}: {
  initial?: BotStrategy;
  initialDto?: CreateBotStrategyDTO;
  onSave: (dto: CreateBotStrategyDTO) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const paramLabels = t.strategies.paramLabels as Record<string, string>;
  const paramDescriptions = t.strategies.paramDescriptions as Record<string, string>;

  const paramMeta = Object.fromEntries(
    Object.entries(PARAM_RANGES).map(([key, ranges]) => [
      key,
      { ...ranges, label: paramLabels[key] ?? key, description: paramDescriptions[key] ?? '' },
    ])
  );

  const [form, setForm] = useState<CreateBotStrategyDTO>(
    initial
      ? { name: initial.name, algorithm: initial.algorithm, description: initial.description ?? '', params: { ...initial.params } }
      : initialDto ?? EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showParamPicker, setShowParamPicker] = useState(false);

  const activeParamKeys = Object.keys(form.params).filter(k => form.params[k] !== undefined);
  const availableParamKeys = Object.keys(paramMeta).filter(k => form.params[k] === undefined);

  const handleAlgoChange = (algo: BotAlgorithm) => {
    setForm(f => ({ ...f, algorithm: algo, params: { ...ALGO_DEFAULTS[algo] } }));
    setShowParamPicker(false);
  };

  const addParam = (key: string) => {
    setForm(f => ({ ...f, params: { ...f.params, [key]: paramMeta[key].defaultValue } }));
    setShowParamPicker(false);
  };

  const removeParam = (key: string) => {
    const next = { ...form.params };
    delete next[key];
    setForm(f => ({ ...f, params: next }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError(t.strategies.nameRequired); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
    } catch {
      setError(t.strategies.saveError);
    } finally {
      setLoading(false);
    }
  };

  const algos = [
    { id: 'momentum',       label: t.strategies.algoMomentum, sub: t.strategies.algoMomentumSub, disabled: false },
    { id: 'mean-reversion', label: t.strategies.algoMeanRev,  sub: t.strategies.algoMeanRevSub,  disabled: false },
    { id: 'rsi',            label: t.strategies.algoRsi,      sub: t.strategies.algoRsiSub,      disabled: true  },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.strategies.nameLabel}</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder={t.strategies.namePlaceholder}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.strategies.algorithmLabel}</label>
        <div className="grid grid-cols-3 gap-2">
          {algos.map(algo => (
            <button
              key={algo.id}
              type="button"
              disabled={algo.disabled}
              onClick={() => handleAlgoChange(algo.id as BotAlgorithm)}
              className={`px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                algo.disabled
                  ? 'border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : form.algorithm === algo.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-semibold">{algo.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{algo.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t.strategies.paramsLabel}</label>
        <div className="space-y-3">
          {activeParamKeys.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">{t.strategies.noParams}</p>
          )}
          {activeParamKeys.map(key => {
            const meta = paramMeta[key];
            if (!meta) return null;
            const val = form.params[key] ?? meta.defaultValue;
            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{meta.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">{val}</span>
                    <button
                      type="button"
                      onClick={() => removeParam(key)}
                      className="text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-colors text-base leading-none"
                      title={t.strategies.removeParam}
                    >✕</button>
                  </div>
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

        {availableParamKeys.length > 0 && (
          <div className="mt-3 relative">
            <button
              type="button"
              onClick={() => setShowParamPicker(v => !v)}
              className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> {t.strategies.addParam}
            </button>
            {showParamPicker && (
              <div className="absolute z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-2 flex flex-col gap-1 min-w-48">
                {availableParamKeys.map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addParam(key)}
                    className="text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <span className="font-medium">{paramMeta[key].label}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({paramMeta[key].defaultValue})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.strategies.descriptionOptional}</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder={t.strategies.descriptionPlaceholder}
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
          {loading ? t.strategies.saving : initial ? t.strategies.updateBtn : t.strategies.createBtn}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 transition-colors"
        >
          {t.strategies.cancelBtn}
        </button>
      </div>
    </form>
  );
}

// ─── Tab: Estrategias para Bots ───────────────────────────────────────────────

function BotStrategiesTab() {
  const { t } = useLanguage();
  const paramLabels = t.strategies.paramLabels as Record<string, string>;

  const templates = [
    { algorithm: 'momentum' as BotAlgorithm, name: t.strategies.templateMomentumName, description: t.strategies.templateMomentumDesc, params: ALGO_DEFAULTS['momentum'] },
    { algorithm: 'mean-reversion' as BotAlgorithm, name: t.strategies.templateMeanRevName, description: t.strategies.templateMeanRevDesc, params: ALGO_DEFAULTS['mean-reversion'] },
  ];

  const [strategies, setStrategies] = useState<BotStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BotStrategy | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<CreateBotStrategyDTO | null>(null);
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
    setPendingTemplate(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.strategies.deleteConfirm)) return;
    await botStrategyService.delete(id);
    await load();
  };

  const startEdit = (s: BotStrategy) => { setEditing(s); setPendingTemplate(null); setShowForm(true); };
  const cancelForm = () => { setShowForm(false); setEditing(null); setPendingTemplate(null); };

  const cloneTemplate = (tmpl: typeof templates[0]) => {
    setEditing(null);
    setPendingTemplate({ name: tmpl.name, algorithm: tmpl.algorithm, description: tmpl.description ?? '', params: { ...tmpl.params } });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowTemplates(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{t.strategies.templates}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{t.strategies.templatesDefault}</span>
          </div>
          {showTemplates ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showTemplates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
            {templates.map(tmpl => (
              <div key={tmpl.algorithm} className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{tmpl.algorithm}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{tmpl.name}</h4>
                  </div>
                  <button
                    onClick={() => cloneTemplate(tmpl)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex-shrink-0 ml-2"
                  >
                    {t.strategies.createFromTemplate}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{tmpl.description}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tmpl.params).map(([k, v]) => (
                    <span key={k} className="inline-flex items-center gap-1 text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg px-2 py-1">
                      <span className="text-gray-500 dark:text-gray-400">{paramLabels[k] ?? k}:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{v}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">
            {editing ? t.strategies.editTitle : t.strategies.newBotStrategyTitle}
          </h3>
          <BotStrategyForm
            initial={editing ?? undefined}
            initialDto={pendingTemplate ?? undefined}
            onSave={handleSave}
            onCancel={cancelForm}
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{t.strategies.myStrategies}</h3>
          {!showForm && (
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> {t.strategies.newBtn}
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
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.strategies.noCustomStrategies}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t.strategies.createFromTemplatesHint}</p>
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
                          : s.algorithm === 'rsi'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
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
                          <span className="text-gray-500 dark:text-gray-400">{paramLabels[k] ?? k}:</span>
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
  const { t } = useLanguage();
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
    } catch { setError(t.strategies.loadError); }
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
    } catch { setError(editingId ? t.strategies.updateError : t.strategies.createError2); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.strategies.deleteConfirm)) return;
    try { await strategyService.deleteStrategy(id); await fetchStrategies(); }
    catch { setError(t.strategies.deleteError); }
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
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            {editingId ? t.strategies.editTitle : t.strategies.newManualTitle}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.strategies.nameLabel}</label>
              <input type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder={t.strategies.namePlaceholderManual} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.strategies.description}</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder={t.strategies.descriptionPlaceholderManual} rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.strategies.color}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{formData.color}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 bg-primary-600 text-white py-2 rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm font-semibold">
                {loading ? t.strategies.saving : editingId ? t.strategies.updateBtn : t.strategies.createBtn}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: '', description: '', color: '#3b82f6' }); }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-sm border border-gray-200 dark:border-gray-600">
                {t.strategies.cancelBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 text-sm font-semibold">
            <Plus className="w-4 h-4" /> {t.strategies.newStrategy}
          </button>
        </div>
      )}

      {strategies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.strategies.noManual}</p>
          <button onClick={() => setShowForm(true)} className="mt-3 inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 text-sm font-semibold">
            <Plus className="w-4 h-4" /> {t.strategies.createFirst2}
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
                  const pfDisplay = p.profitFactor >= 9999 ? '∞' : p.profitFactor.toFixed(2);
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className={`text-sm font-bold ${p.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>€{p.totalPnL.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.strategies.pnlTotal}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className={`text-sm font-bold ${p.winRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{p.winRate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.strategies.winRate}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{p.totalOperations}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.strategies.operationsLabel}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className={`text-sm font-bold ${p.maxDrawdown === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                            {p.maxDrawdown === 0 ? '—' : `€${p.maxDrawdown.toFixed(2)}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.strategies.maxDrawdown}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className={`text-sm font-bold ${p.profitFactor >= 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {pfDisplay}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.strategies.profitFactor}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{t.strategies.createdOn} {new Date(strategy.createdAt).toLocaleDateString()}</span>
                  {(performances[strategy.id]?.totalOperations ?? 0) > 0 && (
                    <button onClick={() => toggleChart(strategy.id)} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                      {expandedCharts.has(strategy.id)
                        ? <><ChevronUp className="w-3 h-3" /> {t.strategies.hideChart}</>
                        : <><ChevronDown className="w-3 h-3" /> {t.strategies.showChart}</>}
                    </button>
                  )}
                </div>
                {expandedCharts.has(strategy.id) && (() => {
                  const ops = strategyOps[strategy.id];
                  if (!ops || ops.length === 0) return <p className="text-xs text-gray-400 mt-3 text-center">{t.strategies.loadingChart}</p>;
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
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">{t.strategies.comparison}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t.strategies.pnlTotalEur}</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={strategies.filter(s => performances[s.id]).map(s => ({ name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name, PnL: parseFloat((performances[s.id]?.totalPnL ?? 0).toFixed(2)) }))}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} /><Bar dataKey="PnL" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t.strategies.winRatePct}</p>
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
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">{t.strategies.colStrategy}</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">{t.strategies.colOps}</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">{t.strategies.colPnlTotal}</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">{t.strategies.colWinRate}</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">{t.strategies.colBest}</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">{t.strategies.colWorst}</th>
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
  const { t } = useLanguage();
  const [tab, setTab] = useState<'manual' | 'bots'>('manual');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.strategies.pageTitle}</h1>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setTab('manual')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'manual'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> {t.strategies.tabManual}
          </button>
          <button
            onClick={() => setTab('bots')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'bots'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Bot className="w-4 h-4" /> {t.strategies.tabBots}
          </button>
        </div>

        {tab === 'manual' ? <ManualStrategiesTab /> : <BotStrategiesTab />}
      </div>
    </div>
  );
}
