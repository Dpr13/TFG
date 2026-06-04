import { useState, useEffect, useRef } from 'react';
import { X, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { positionService, quoteService, strategyService, autocompleteService } from '../services';
import type { OpenPositionDTO, PositionDirection, Strategy } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  defaultDate: string;
  onClose: () => void;
  onOpened: () => void;
}

export default function OpenPositionModal({ defaultDate, onClose, onOpened }: Props) {
  const { t, language } = useLanguage();
  const [direction, setDirection] = useState<PositionDirection>('long');
  const [symbol, setSymbol] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [openedAt, setOpenedAt] = useState(defaultDate);
  const [strategyId, setStrategyId] = useState('');
  const [notes, setNotes] = useState('');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { strategyService.getAllStrategies().then(setStrategies).catch(() => {}); }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowSugg(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await autocompleteService.search(query).catch(() => []);
      setSuggestions(results);
      setShowSugg(results.length > 0);
    }, 300);
  }, [query]);

  const selectSymbol = async (sym: string) => {
    setSymbol(sym);
    setQuery(sym);
    setShowSugg(false);
    setSuggestions([]);
    setFetchingPrice(true);
    const p = await quoteService.getPrice(sym).catch(() => null);
    if (p !== null) setPrice(String(p));
    setFetchingPrice(false);
  };

  const totalCost = quantity && price ? (Number(quantity) * Number(price)).toFixed(2) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) { setError(t.positions.selectSymbol); return; }
    setLoading(true);
    setError(null);
    try {
      const dto: OpenPositionDTO = {
        symbol,
        direction,
        quantity: Number(quantity),
        price: Number(price),
        openedAt,
        strategyId: strategyId || undefined,
        notes: notes || undefined,
      };
      await positionService.openPosition(dto);
      onOpened();
      onClose();
    } catch {
      setError(t.positions.errorOpen);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.positions.openTitle}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['long', 'short'] as const).map(d => (
              <button key={d} type="button" onClick={() => setDirection(d)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                  direction === d
                    ? d === 'long' ? 'bg-green-600 border-green-600 text-white' : 'bg-red-600 border-red-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                }`}>
                {d === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {d === 'long' ? t.positions.longLabel : t.positions.shortLabel}
              </button>
            ))}
          </div>

          <div ref={containerRef} className="relative">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.positions.symbolLabel}</label>
            <input
              type="text" value={query} placeholder={t.positions.symbolPlaceholder}
              onChange={e => { setQuery(e.target.value.toUpperCase()); setSymbol(''); setPrice(''); }}
              onFocus={() => suggestions.length > 0 && setShowSugg(true)}
              className={inputCls} required
            />
            {showSugg && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                {suggestions.map(s => (
                  <button key={s.symbol} type="button" onClick={() => selectSymbol(s.symbol)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{s.symbol}</span>
                    <span className="text-xs text-gray-400 truncate max-w-[160px]">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.positions.quantityLabel}</label>
              <input type="number" min="0" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} className={inputCls} placeholder="100" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                {t.positions.entryPriceLabel}
                {fetchingPrice && <Loader2 className="w-3 h-3 animate-spin text-primary-500" />}
              </label>
              <input type="number" min="0" step="any" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} placeholder="0.00" required />
            </div>
          </div>

          {totalCost && (
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
              {t.positions.estimatedCost} <span className="font-semibold text-gray-900 dark:text-white">${Number(totalCost).toLocaleString(language, { minimumFractionDigits: 2 })}</span>
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.positions.openDateLabel}</label>
            <input type="date" value={openedAt} onChange={e => setOpenedAt(e.target.value)} className={inputCls} required />
          </div>

          {strategies.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.positions.strategyOptional}</label>
              <select value={strategyId} onChange={e => setStrategyId(e.target.value)} className={inputCls}>
                <option value="">{t.positions.noStrategy}</option>
                {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.positions.notesLabel}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputCls} rows={2} placeholder={t.positions.notesPlaceholder} />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {t.calendar.cancel}
            </button>
            <button type="submit" disabled={loading || !symbol}
              className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${direction === 'long' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {loading ? t.positions.opening : direction === 'long' ? t.positions.openLong : t.positions.openShort}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
