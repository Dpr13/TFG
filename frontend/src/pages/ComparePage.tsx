import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TrendingUp, Loader2, AlertTriangle, Plus, X,
  BarChart2, Shield, Activity, Star, Clock, Sparkles, Search,
} from 'lucide-react';
import { useWatchlist } from '@hooks/useWatchlist';

// ── Types ──────────────────────────────────────────────────────────────────

interface ComparisonFundamental {
  market_cap: number | null;
  pe_ratio: number | null;
  roe: number | null;
  margen_neto: number | null;
  dividendo: number | null;
  eps: number | null;
  precio_book: number | null;
  deuda_equity: number | null;
  tipo: string;
  nombre: string;
}

interface ComparisonTechnical {
  precio_actual: number;
  cambio_periodo_pct: number;
  rsi: number;
  macd_alcista: boolean;
  sobre_sma50: boolean;
  sobre_sma200: boolean;
  tendencia: string;
  puntuacion_tecnica: number;
}

interface ComparisonRisk {
  volatilidad_anual: number;
  retorno_anualizado: number;
  sharpe_ratio: number;
  var_95: number;
  max_drawdown: number;
  beta: number | null;
}

interface ComparisonResult {
  ticker: string;
  nombre: string;
  tipo: string;
  fundamental: ComparisonFundamental | null;
  tecnico: ComparisonTechnical | null;
  riesgo: ComparisonRisk | null;
  error: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────

const QUICK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY'];

const HORIZON_OPTIONS = [
  { value: '6mo', label: '6 meses' },
  { value: '1y', label: '1 año' },
  { value: '3y', label: '3 años' },
  { value: '5y', label: '5 años' },
];

const ASSET_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  EQUITY: { label: 'Stock', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  CRYPTOCURRENCY: { label: 'Crypto', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  ETF: { label: 'ETF', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatLargeNumber(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return 'N/D';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function fmt(v: number | null | undefined, decimals = 2, suffix = ''): string {
  if (v == null || isNaN(v)) return 'N/D';
  return `${v.toFixed(decimals)}${suffix}`;
}

function fmtPct(v: number | null | undefined): string {
  return fmt(v, 2, '%');
}

// ── Winner Logic ────────────────────────────────────────────────────────────

type WinResult = 'win' | 'lose' | 'neutral';

function pickWinner(values: (number | null)[], higherIsBetter: boolean): WinResult[] {
  const valid = values.map((v, i) => ({ v, i })).filter(x => x.v != null) as { v: number; i: number }[];
  if (valid.length < 2) return values.map(() => 'neutral');

  const best = higherIsBetter
    ? valid.reduce((a, b) => (a.v > b.v ? a : b))
    : valid.reduce((a, b) => (a.v < b.v ? a : b));

  const worst = higherIsBetter
    ? valid.reduce((a, b) => (a.v < b.v ? a : b))
    : valid.reduce((a, b) => (a.v > b.v ? a : b));

  return values.map((_, i) => {
    if (values[i] == null) return 'neutral';
    if (i === best.i) return 'win';
    if (i === worst.i && valid.length > 1) return 'lose';
    return 'neutral';
  });
}

function rsiWinner(values: (number | null)[]): WinResult[] {
  return values.map(v => {
    if (v == null) return 'neutral';
    if (v >= 40 && v <= 60) return 'win';
    if (v > 70 || v < 30) return 'lose';
    return 'neutral';
  });
}

function boolWinner(values: (boolean | null | undefined)[]): WinResult[] {
  return values.map(v => {
    if (v == null) return 'neutral';
    return v ? 'win' : 'lose';
  });
}

function trendWinner(values: (string | null | undefined)[]): WinResult[] {
  return values.map(v => {
    if (!v) return 'neutral';
    return v === 'alcista' ? 'win' : 'lose';
  });
}

// ── Cell Colors ─────────────────────────────────────────────────────────────

function cellClasses(result: WinResult): string {
  switch (result) {
    case 'win': return 'bg-green-900/20 text-green-400';
    case 'lose': return 'bg-red-900/20 text-red-400';
    default: return 'text-gray-300';
  }
}

// ── Components ──────────────────────────────────────────────────────────────

function QuickBadge({ label, onClick, variant = 'default' }: {
  label: string; onClick: () => void; variant?: 'default' | 'watchlist' | 'history';
}) {
  const styles = {
    default: 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-900/20 dark:hover:border-primary-600',
    watchlist: 'border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
    history: 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
  };
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${i === count - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

// ── Comparison Table ────────────────────────────────────────────────────────

interface TableRow {
  label: string;
  values: string[];
  winners: WinResult[];
}

function ComparisonTable({ title, description, icon: Icon, rows, tickers }: {
  title: string;
  description: string;
  icon: any;
  rows: TableRow[];
  tickers: string[];
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">
                Métrica
              </th>
              {tickers.map(t => (
                <th key={t} className="px-6 py-3 text-center text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b border-gray-50 dark:border-gray-700/50 ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/20'}`}>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium">{row.label}</td>
                {row.values.map((val, j) => (
                  <td key={j} className={`px-6 py-3 text-center font-semibold ${cellClasses(row.winners[j])}`}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const { watchlist } = useWatchlist();

  // Asset slots
  const initialTicker = searchParams.get('ticker')?.toUpperCase() || '';
  const [slot1, setSlot1] = useState(initialTicker);
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [showSlot3, setShowSlot3] = useState(false);

  // Horizon
  const [horizonte, setHorizonte] = useState('1y');

  // Results
  const [resultados, setResultados] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Verdict
  const [veredicto, setVeredicto] = useState<string | null>(null);
  const [veredictoLoading, setVeredictoLoading] = useState(false);
  const [veredictoError, setVeredictoError] = useState<string | null>(null);

  // History
  const [history] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('risk_history') ?? '[]'); } catch { return []; }
  });

  // Active slot for quick badges
  const [activeSlot, setActiveSlot] = useState<1 | 2 | 3>(initialTicker ? 2 : 1);

  const tickers = [slot1, slot2, ...(showSlot3 ? [slot3] : [])].map(s => s.trim().toUpperCase()).filter(Boolean);
  const canCompare = new Set(tickers).size >= 2;

  const handleCompare = async () => {
    if (!canCompare) return;
    const uniqueTickers = [...new Set(tickers)];

    setLoading(true);
    setError(null);
    setResultados([]);
    setVeredicto(null);
    setVeredictoError(null);

    try {
      const token = localStorage.getItem('tfg_auth_token') || sessionStorage.getItem('tfg_auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/comparar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tickers: uniqueTickers, horizonte }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al comparar activos');
      }

      const data = await res.json();
      setResultados(data.resultados || []);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleVeredicto = async () => {
    if (resultados.filter(r => !r.error).length < 2) return;

    setVeredictoLoading(true);
    setVeredictoError(null);

    try {
      const token = localStorage.getItem('tfg_auth_token') || sessionStorage.getItem('tfg_auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/comparar/veredicto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ resultados, horizonte }),
      });

      const data = await res.json();
      if (data.ok) {
        setVeredicto(data.veredicto);
      } else {
        setVeredictoError(data.error || 'Error al generar veredicto');
      }
    } catch {
      setVeredictoError('Error de conexión con el servicio de IA');
    } finally {
      setVeredictoLoading(false);
    }
  };

  const setSlotByActive = (value: string) => {
    if (activeSlot === 1) setSlot1(value);
    else if (activeSlot === 2) setSlot2(value);
    else setSlot3(value);
  };

  // ── Compute table data ─────────────────────────────────────────────────

  const validResults = resultados.filter(r => !r.error);
  const validTickers = validResults.map(r => r.ticker);

  // Mixed type check
  const types = new Set(validResults.map(r => r.tipo));
  const isMixedType = types.size > 1;

  // Count wins per asset
  function countWins(): { ticker: string; wins: number; total: number; tipo: string; tendencia: string }[] {
    if (validResults.length < 2) return [];

    const counts = validResults.map(r => ({ ticker: r.ticker, wins: 0, total: 0, tipo: r.tipo, tendencia: r.tecnico?.tendencia || 'N/D' }));

    const allRows = [...buildFundamentalRows(), ...buildTechnicalRows(), ...buildRiskRows()];
    for (const row of allRows) {
      row.winners.forEach((w, i) => {
        if (i < counts.length) {
          if (w === 'win') { counts[i].wins++; counts[i].total++; }
          else if (w === 'lose') { counts[i].total++; }
          else if (w === 'neutral' && row.values[i] !== 'N/D') { counts[i].total++; }
        }
      });
    }

    return counts;
  }

  function buildFundamentalRows(): TableRow[] {
    if (validResults.length < 2) return [];
    const f = validResults.map(r => r.fundamental);

    return [
      {
        label: 'Market Cap',
        values: f.map(fd => formatLargeNumber(fd?.market_cap)),
        winners: pickWinner(f.map(fd => fd?.market_cap ?? null), true),
      },
      {
        label: 'P/E Ratio',
        values: f.map(fd => fd?.pe_ratio != null && fd.pe_ratio > 0 ? fmt(fd.pe_ratio) : fd?.pe_ratio != null ? fmt(fd.pe_ratio) : 'N/D'),
        winners: pickWinner(f.map(fd => fd?.pe_ratio != null && fd.pe_ratio > 0 ? fd.pe_ratio : null), false),
      },
      {
        label: 'ROE',
        values: f.map(fd => fmtPct(fd?.roe)),
        winners: pickWinner(f.map(fd => fd?.roe ?? null), true),
      },
      {
        label: 'Margen Neto',
        values: f.map(fd => fmtPct(fd?.margen_neto)),
        winners: pickWinner(f.map(fd => fd?.margen_neto ?? null), true),
      },
      {
        label: 'Dividendo',
        values: f.map(fd => fmtPct(fd?.dividendo)),
        winners: pickWinner(f.map(fd => fd?.dividendo ?? null), true),
      },
      {
        label: 'EPS',
        values: f.map(fd => fmt(fd?.eps)),
        winners: pickWinner(f.map(fd => fd?.eps ?? null), true),
      },
      {
        label: 'Price/Book',
        values: f.map(fd => fmt(fd?.precio_book)),
        winners: pickWinner(f.map(fd => fd?.precio_book != null && fd.precio_book > 0 ? fd.precio_book : null), false),
      },
      {
        label: 'Deuda/Equity',
        values: f.map(fd => fmt(fd?.deuda_equity)),
        winners: pickWinner(f.map(fd => fd?.deuda_equity ?? null), false),
      },
    ];
  }

  function buildTechnicalRows(): TableRow[] {
    if (validResults.length < 2) return [];
    const t = validResults.map(r => r.tecnico);

    return [
      {
        label: 'Cambio en el período',
        values: t.map(td => fmtPct(td?.cambio_periodo_pct)),
        winners: pickWinner(t.map(td => td?.cambio_periodo_pct ?? null), true),
      },
      {
        label: 'RSI (14)',
        values: t.map(td => fmt(td?.rsi)),
        winners: rsiWinner(t.map(td => td?.rsi ?? null)),
      },
      {
        label: 'Tendencia',
        values: t.map(td => td?.tendencia ? td.tendencia.charAt(0).toUpperCase() + td.tendencia.slice(1) : 'N/D'),
        winners: trendWinner(t.map(td => td?.tendencia)),
      },
      {
        label: 'Sobre SMA50',
        values: t.map(td => td?.sobre_sma50 != null ? (td.sobre_sma50 ? 'Sí' : 'No') : 'N/D'),
        winners: boolWinner(t.map(td => td?.sobre_sma50)),
      },
      {
        label: 'Sobre SMA200',
        values: t.map(td => td?.sobre_sma200 != null ? (td.sobre_sma200 ? 'Sí' : 'No') : 'N/D'),
        winners: boolWinner(t.map(td => td?.sobre_sma200)),
      },
      {
        label: 'MACD',
        values: t.map(td => td?.macd_alcista != null ? (td.macd_alcista ? 'Alcista' : 'Bajista') : 'N/D'),
        winners: boolWinner(t.map(td => td?.macd_alcista)),
      },
      {
        label: 'Puntuación técnica',
        values: t.map(td => td?.puntuacion_tecnica != null ? `${td.puntuacion_tecnica}/100` : 'N/D'),
        winners: pickWinner(t.map(td => td?.puntuacion_tecnica ?? null), true),
      },
    ];
  }

  function buildRiskRows(): TableRow[] {
    if (validResults.length < 2) return [];
    const r = validResults.map(res => res.riesgo);

    return [
      {
        label: 'Volatilidad anual',
        values: r.map(rk => fmtPct(rk?.volatilidad_anual)),
        winners: pickWinner(r.map(rk => rk?.volatilidad_anual ?? null), false),
      },
      {
        label: 'Retorno anualizado',
        values: r.map(rk => fmtPct(rk?.retorno_anualizado)),
        winners: pickWinner(r.map(rk => rk?.retorno_anualizado ?? null), true),
      },
      {
        label: 'Sharpe Ratio',
        values: r.map(rk => fmt(rk?.sharpe_ratio)),
        winners: pickWinner(r.map(rk => rk?.sharpe_ratio ?? null), true),
      },
      {
        label: 'VaR 95%',
        values: r.map(rk => fmtPct(rk?.var_95)),
        winners: pickWinner(r.map(rk => rk?.var_95 ?? null), true), // less negative = better = higher
      },
      {
        label: 'Max Drawdown',
        values: r.map(rk => fmtPct(rk?.max_drawdown)),
        winners: pickWinner(r.map(rk => rk?.max_drawdown ?? null), true), // less negative = better = higher
      },
      {
        label: 'Beta',
        values: r.map(rk => fmt(rk?.beta)),
        winners: r.map(() => 'neutral' as WinResult), // Beta shown without coloring
      },
    ];
  }

  const fundamentalRows = buildFundamentalRows();
  const technicalRows = buildTechnicalRows();
  const riskRows = buildRiskRows();
  const winCounts = countWins();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Comparativa de Activos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Compara hasta 3 activos financieros en dimensión fundamental, técnica y cuantitativa
        </p>
      </div>

      {/* Selection Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        {/* Horizon selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Horizonte:</span>
          {HORIZON_OPTIONS.map(h => (
            <button
              key={h.value}
              onClick={() => setHorizonte(h.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                horizonte === h.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        {/* Asset Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Slot 1 */}
          <div className={`relative ${activeSlot === 1 ? 'ring-2 ring-primary-500 rounded-lg' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Activo 1</span>
              {slot1 && resultados.find(r => r.ticker === slot1.toUpperCase()) && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  ASSET_TYPE_LABELS[resultados.find(r => r.ticker === slot1.toUpperCase())?.tipo || 'EQUITY']?.color || 'bg-gray-100 text-gray-600'
                }`}>
                  {ASSET_TYPE_LABELS[resultados.find(r => r.ticker === slot1.toUpperCase())?.tipo || 'EQUITY']?.label || 'Stock'}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ej: AAPL"
                value={slot1}
                onChange={e => setSlot1(e.target.value)}
                onFocus={() => setActiveSlot(1)}
                onKeyDown={e => e.key === 'Enter' && canCompare && handleCompare()}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Slot 2 */}
          <div className={`relative ${activeSlot === 2 ? 'ring-2 ring-primary-500 rounded-lg' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Activo 2</span>
              {slot2 && resultados.find(r => r.ticker === slot2.toUpperCase()) && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  ASSET_TYPE_LABELS[resultados.find(r => r.ticker === slot2.toUpperCase())?.tipo || 'EQUITY']?.color || 'bg-gray-100 text-gray-600'
                }`}>
                  {ASSET_TYPE_LABELS[resultados.find(r => r.ticker === slot2.toUpperCase())?.tipo || 'EQUITY']?.label || 'Stock'}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ej: MSFT"
                value={slot2}
                onChange={e => setSlot2(e.target.value)}
                onFocus={() => setActiveSlot(2)}
                onKeyDown={e => e.key === 'Enter' && canCompare && handleCompare()}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Slot 3 */}
          {showSlot3 ? (
            <div className={`relative ${activeSlot === 3 ? 'ring-2 ring-primary-500 rounded-lg' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Activo 3</span>
                  {slot3 && resultados.find(r => r.ticker === slot3.toUpperCase()) && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      ASSET_TYPE_LABELS[resultados.find(r => r.ticker === slot3.toUpperCase())?.tipo || 'EQUITY']?.color || 'bg-gray-100 text-gray-600'
                    }`}>
                      {ASSET_TYPE_LABELS[resultados.find(r => r.ticker === slot3.toUpperCase())?.tipo || 'EQUITY']?.label || 'Stock'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setShowSlot3(false); setSlot3(''); }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar tercer activo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej: GOOGL"
                  value={slot3}
                  onChange={e => setSlot3(e.target.value)}
                  onFocus={() => setActiveSlot(3)}
                  onKeyDown={e => e.key === 'Enter' && canCompare && handleCompare()}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setShowSlot3(true); setActiveSlot(3); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg
                         text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500 dark:hover:text-primary-400
                         transition-colors self-end h-[42px] mt-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Añadir activo</span>
            </button>
          )}
        </div>

        {/* Compare button */}
        <div className="flex gap-3">
          <button
            onClick={handleCompare}
            disabled={!canCompare || loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                       disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                       transition-colors flex items-center gap-2 font-medium"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Comparando...</span></>
              : <><BarChart2 className="w-5 h-5" /><span>Comparar</span></>
            }
          </button>
        </div>

        {/* Popular symbols */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">Populares:</span>
          {QUICK_SYMBOLS.map(s => (
            <QuickBadge key={s} label={s} onClick={() => setSlotByActive(s)} variant="default" />
          ))}
        </div>

        {/* Watchlist shortcuts */}
        {watchlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Seguimiento:
            </span>
            {watchlist.slice(0, 8).map(a => (
              <QuickBadge key={a.symbol} label={a.symbol} onClick={() => setSlotByActive(a.symbol)} variant="watchlist" />
            ))}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
              <Clock className="w-3 h-3" /> Recientes:
            </span>
            {history.map(s => (
              <QuickBadge key={s} label={s} onClick={() => setSlotByActive(s)} variant="history" />
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {validResults.length >= 2 && (
        <div className="space-y-6">

          {/* Mixed type warning */}
          {isMixedType && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                Estás comparando activos de tipos distintos. Algunas métricas no son directamente comparables.
              </p>
            </div>
          )}

          {/* Winner summary cards */}
          <div className={`grid gap-4 ${winCounts.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            {winCounts.map(wc => {
              const pct = wc.total > 0 ? (wc.wins / wc.total) * 100 : 0;
              const trendColor = wc.tendencia === 'alcista' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                wc.tendencia === 'bajista' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';

              return (
                <div key={wc.ticker} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{wc.ticker}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${ASSET_TYPE_LABELS[wc.tipo]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {ASSET_TYPE_LABELS[wc.tipo]?.label || 'Stock'}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${trendColor}`}>
                      {wc.tendencia === 'alcista' ? '▲ Alcista' : wc.tendencia === 'bajista' ? '▼ Bajista' : 'Neutral'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-bold text-primary-600 dark:text-primary-400">{wc.wins}</span>/{wc.total} métricas favorables
                  </p>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error columns */}
          {resultados.filter(r => r.error).map(r => (
            <div key={r.ticker} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 text-sm">
                No se pudieron cargar los datos de <strong>{r.ticker}</strong>: {r.error}
              </p>
            </div>
          ))}

          {/* Comparison Tables */}
          <ComparisonTable
            title="Análisis Fundamental"
            description="Métricas de valoración y rentabilidad empresarial"
            icon={TrendingUp}
            rows={fundamentalRows}
            tickers={validTickers}
          />

          <ComparisonTable
            title="Análisis Técnico"
            description="Señales de precio y momentum en el período seleccionado"
            icon={Activity}
            rows={technicalRows}
            tickers={validTickers}
          />

          <ComparisonTable
            title="Análisis Cuantitativo"
            description="Volatilidad, drawdown y métricas de riesgo/retorno"
            icon={Shield}
            rows={riskRows}
            tickers={validTickers}
          />

          {/* AI Verdict */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Veredicto IA</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold">
                  Groq · Llama 3.3
                </span>
              </div>

              {!veredicto && !veredictoLoading && (
                <button
                  onClick={handleVeredicto}
                  disabled={validResults.length < 2}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                             disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                             transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Generar veredicto IA
                </button>
              )}
            </div>

            <div className="px-6 py-5">
              {veredictoLoading && <SkeletonLines count={4} />}

              {veredictoError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {veredictoError}
                </div>
              )}

              {veredicto && (
                <div className="space-y-4">
                  {veredicto.split('\n\n').filter(Boolean).map((paragraph, i) => (
                    <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700 italic">
                    Generado automáticamente por IA a partir de datos calculados. No constituye asesoramiento financiero.
                  </p>
                </div>
              )}

              {!veredicto && !veredictoLoading && !veredictoError && (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  Pulsa "Generar veredicto IA" para obtener un análisis comparativo generado por inteligencia artificial.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Not enough valid results */}
      {resultados.length > 0 && validResults.length < 2 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium">
            Se necesitan al menos 2 activos válidos para comparar
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            Verifica los tickers introducidos e inténtalo de nuevo.
          </p>
        </div>
      )}
    </div>
  );
}
