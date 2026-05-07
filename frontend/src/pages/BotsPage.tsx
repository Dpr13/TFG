import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot as BotIcon, Play, Square, Trash2, Plus, TrendingUp, TrendingDown, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';
import { botService, autocompleteService, botStrategyService } from '../services';
import type { Bot, BotTrade, BotMetrics, CreateBotDTO, BotStrategy } from '../services';
import { useLanguage } from '../context/LanguageContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number, decimals = 2) => n.toFixed(decimals);
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n);

function PnlBadge({ value, pct }: { value: number; pct?: number }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      {positive ? '+' : ''}{fmt(value)} $
      {pct !== undefined && (
        <span className="opacity-75">({positive ? '+' : ''}{fmt(pct, 2)}%)</span>
      )}
    </span>
  );
}

// ─── Create Bot Modal ─────────────────────────────────────────────────────────

const DEFAULT_FORM: CreateBotDTO = {
  name: '',
  symbol: '',
  strategy: 'momentum',
  initialCapital: 10000,
};

function SymbolAutocomplete({ value, onChange }: { value: string; onChange: (symbol: string) => void }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string; type: string; exchange: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await autocompleteService.search(query);
        setSuggestions(results);
        setOpen(results.length > 0);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = (symbol: string) => {
    onChange(symbol);
    setQuery(symbol);
    setOpen(false);
    setSuggestions([]);
  };

  const typeLabels = t.bots.typeLabels as Record<string, string>;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value.toUpperCase()); onChange(''); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={t.bots.symbolSearchPlaceholder}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm pr-8"
        />
        {searching && (
          <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map(s => (
            <button
              key={s.symbol}
              type="button"
              onClick={() => select(s.symbol)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">{s.symbol}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px] inline-block align-bottom">{s.name}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-gray-400 dark:text-gray-500">{s.exchange}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                  {typeLabels[s.type] ?? s.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateBotModal({ onClose, onCreate }: { onClose: () => void; onCreate: (dto: CreateBotDTO) => Promise<void> }) {
  const { t } = useLanguage();
  const [form, setForm] = useState<CreateBotDTO>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedStrategies, setSavedStrategies] = useState<BotStrategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');

  useEffect(() => {
    botStrategyService.getAll().then(setSavedStrategies).catch(() => {});
  }, []);

  const applyStrategy = (id: string) => {
    setSelectedStrategyId(id);
    if (!id) return;
    const s = savedStrategies.find(s => s.id === id);
    if (s) setForm(f => ({ ...f, strategy: s.algorithm, params: s.params }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError(t.bots.nameRequired); return; }
    if (!form.symbol.trim()) { setError(t.bots.symbolRequired); return; }
    setLoading(true);
    setError(null);
    try {
      await onCreate(form);
      onClose();
    } catch {
      setError(t.bots.createError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BotIcon className="w-5 h-5 text-primary-600" />
            {t.bots.modalTitle}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.bots.nameLabel}</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t.bots.namePlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.bots.symbolLabel}</label>
            <SymbolAutocomplete
              value={form.symbol}
              onChange={symbol => setForm(f => ({ ...f, symbol }))}
            />
            <p className="mt-1 text-xs text-gray-400">{t.bots.symbolHint}</p>
          </div>

          {savedStrategies.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary-500" /> {t.bots.useSavedStrategy}
              </label>
              <select
                value={selectedStrategyId}
                onChange={e => applyStrategy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              >
                <option value="">{t.bots.noSavedStrategy}</option>
                {savedStrategies.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.algorithm})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.bots.algorithmLabel}</label>
            <select
              value={form.strategy}
              onChange={e => { setSelectedStrategyId(''); setForm(f => ({ ...f, strategy: e.target.value as any })); }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              <option value="momentum">{t.bots.momentumAlgo}</option>
              <option value="mean-reversion">{t.bots.meanReversionAlgo}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.bots.capitalLabel}</label>
            <input
              type="number"
              min={100}
              step={100}
              value={form.initialCapital}
              onChange={e => setForm(f => ({ ...f, initialCapital: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t.bots.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? t.bots.creating : t.bots.createBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Bot Detail Panel ─────────────────────────────────────────────────────────

function BotDetail({ bot }: { bot: Bot }) {
  const { t } = useLanguage();
  const [trades, setTrades] = useState<BotTrade[]>([]);
  const [metrics, setMetrics] = useState<BotMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [tr, m] = await Promise.all([
        botService.getTrades(bot.id),
        botService.getMetrics(bot.id),
      ]);
      setTrades(tr);
      setMetrics(m);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [bot.id]);

  useEffect(() => {
    load();
    if (bot.status === 'running') {
      const interval = setInterval(load, 3000);
      return () => clearInterval(interval);
    }
  }, [load, bot.status]);

  if (loading) return <div className="p-4 text-sm text-gray-400 animate-pulse">{t.bots.loading}</div>;

  return (
    <div className="space-y-4 p-4">
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t.bots.currentCapital, value: fmtCurrency(metrics.currentCapital) },
            { label: t.bots.totalPnl, value: <PnlBadge value={metrics.totalPnl} pct={metrics.pnlPct} /> },
            { label: t.bots.winRate, value: `${fmt(metrics.winRate * 100)}%` },
            { label: t.bots.tradesLabel, value: `${metrics.totalTrades}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{t.bots.tradeHistory}</h4>
        {trades.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">{t.bots.noTrades}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-left">{t.bots.colSide}</th>
                  <th className="px-3 py-2 text-right">{t.bots.colQuantity}</th>
                  <th className="px-3 py-2 text-right">{t.bots.colPrice}</th>
                  <th className="px-3 py-2 text-right">{t.bots.colPnl}</th>
                  <th className="px-3 py-2 text-left">{t.bots.colTime}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {trades.slice(0, 50).map(tr => (
                  <tr key={tr.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-2">
                      <span className={`font-semibold ${tr.side === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tr.side}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{fmt(tr.quantity, 4)}</td>
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{fmt(tr.fillPrice, 4)}</td>
                    <td className="px-3 py-2 text-right">
                      {tr.pnl !== null ? (() => {
                        const positive = tr.pnl >= 0;
                        const entryPrice = tr.fillPrice - tr.pnl / tr.quantity;
                        const pct = (tr.pnl / (entryPrice * tr.quantity)) * 100;
                        return (
                          <span className={positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {positive ? '+' : ''}{fmt(tr.pnl)} $
                            <span className="opacity-75 ml-1">({positive ? '+' : ''}{fmt(pct, 2)}%)</span>
                          </span>
                        );
                      })() : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                      {new Date(tr.executedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bot Card ─────────────────────────────────────────────────────────────────

function BotCard({ bot, onStart, onStop, onDelete }: {
  bot: Bot;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const running = bot.status === 'running';
  const positionValue = bot.positionSize > 0 && bot.currentPrice != null && bot.currentPrice > 0
    ? bot.positionSize * bot.currentPrice
    : 0;
  const totalValue = bot.currentCapital + positionValue;
  const pnl = totalValue - bot.initialCapital;

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      if (running) await onStop(bot.id);
      else await onStart(bot.id);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${running ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white truncate">{bot.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium">
              {bot.symbol}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {bot.strategy}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{t.bots.valueLabel}: {fmtCurrency(totalValue)}</span>
            {bot.positionSize > 0 && (
              <span className="text-gray-400 dark:text-gray-500">
                ({t.bots.cashLabel} {fmtCurrency(bot.currentCapital)})
              </span>
            )}
            <PnlBadge value={pnl} pct={(pnl / bot.initialCapital) * 100} />
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {bot.currentPrice != null && bot.currentPrice > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md font-mono">
                <span className="text-gray-500 dark:text-gray-400">{t.bots.priceLabel} {bot.symbol}:</span>
                <span className="text-gray-900 dark:text-white font-bold">${fmt(bot.currentPrice, 4)}</span>
              </span>
            )}
            {running && bot.lastSignal && (
              <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                bot.lastSignal === 'BUY'  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                bot.lastSignal === 'SELL' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {bot.lastSignal}
              </span>
            )}
            {bot.positionSize > 0 && bot.positionEntryPrice != null && bot.currentPrice != null && bot.currentPrice > 0 && (() => {
              const unrealized = (bot.currentPrice - bot.positionEntryPrice) * bot.positionSize;
              const positive = unrealized >= 0;
              return (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-mono ${
                  positive ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                           : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  <span className="opacity-70">{t.bots.entryLabel} ${fmt(bot.positionEntryPrice, 4)} →</span>
                  <span className="font-bold">{positive ? '+' : ''}{fmt(unrealized, 2)}$</span>
                </span>
              );
            })()}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleToggle}
            disabled={actionLoading}
            title={running ? t.bots.stopTitle : t.bots.startTitle}
            className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${running
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
            }`}
          >
            {running ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(bot.id)}
            disabled={running}
            title={t.bots.deleteTitle}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <BotDetail bot={bot} />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BotsPage() {
  const { t } = useLanguage();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchBots = useCallback(async () => {
    try {
      const data = await botService.getBots();
      setBots(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
    const interval = setInterval(fetchBots, 3000);
    return () => clearInterval(interval);
  }, [fetchBots]);

  const handleCreate = async (dto: CreateBotDTO) => {
    const bot = await botService.createBot(dto);
    setBots(prev => [bot, ...prev]);
  };

  const handleStart = async (id: string) => {
    const bot = await botService.startBot(id);
    setBots(prev => prev.map(b => b.id === id ? bot : b));
  };

  const handleStop = async (id: string) => {
    const bot = await botService.stopBot(id);
    setBots(prev => prev.map(b => b.id === id ? bot : b));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.bots.deleteConfirm)) return;
    await botService.deleteBot(id);
    setBots(prev => prev.filter(b => b.id !== id));
  };

  const runningCount = bots.filter(b => b.status === 'running').length;
  const activeLabel = (runningCount === 1 ? t.bots.activeCount : t.bots.activeCountPlural)
    .replace('{n}', String(runningCount));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BotIcon className="w-7 h-7 text-primary-600" />
            {t.bots.pageTitle}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.bots.subtitle} · {t.bots.activeCount.replace('{n}', '') === t.bots.activeCountPlural.replace('{n}', '') ? activeLabel : activeLabel}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t.bots.newBot}
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
        {t.bots.infoBanner}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bots.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
          <BotIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t.bots.noBotsTitle}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t.bots.createPractice}</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {t.bots.createMyFirst}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bots.map(bot => (
            <BotCard
              key={bot.id}
              bot={bot}
              onStart={handleStart}
              onStop={handleStop}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateBotModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
