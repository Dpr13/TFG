import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TrendingUp, Loader2, AlertTriangle,
  ShieldCheck, ShieldAlert, BarChart2, Activity,
  Star, Clock, Info, ChevronDown, ChevronUp, PieChart, DollarSign, TrendingUp as GrowthIcon, Shield, Hourglass,
} from 'lucide-react';
import { riskService, assetService } from '@services/index';
import { useWatchlist } from '@hooks/useWatchlist';
import { useLanguage } from '../context/LanguageContext';
import { formatPercentage, formatCompactNumber, formatCurrency, formatDateSimple } from '@utils/format';
import AnalysisSummaryCard, { AnalysisVariant } from '@components/AnalysisSummaryCard';
import type { RiskMetrics, FinancialData, FundamentalAnalysis } from '../types';
import TechnicalAnalysisPanel from '../components/TechnicalAnalysisPanel';
import SymbolAutocomplete from '../components/SymbolAutocomplete';

// ── Constants ────────────────────────────────────────────────────────────────

const QUICK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY'];

const RISK_VARIANTS: Record<string, AnalysisVariant> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
};


const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d', '1wk', '1mo'] as const;
type IntervalMode = typeof INTERVALS[number];

const VALID_RANGES: Record<IntervalMode, string[]> = {
  '1m': ['6mo'],
  '5m': ['6mo'],
  '15m': ['6mo'],
  '1h': ['6mo', '1y'],
  '4h': ['6mo', '1y'],
  '1d': ['6mo', '1y', '3y', '5y', '10y'],
  '1wk': ['1y', '3y', '5y', '10y'],
  '1mo': ['3y', '5y', '10y'],
};

const DEFAULT_INTERVAL: Record<string, IntervalMode> = {
  '6mo': '1d',
  '1y': '1d',
  '3y': '1wk',
  '5y': '1wk',
  '10y': '1mo',
};

// ── Risk Gauge ────────────────────────────────────────────────────────────────
// Semicircle gauge: LEFT = LOW risk, RIGHT = HIGH risk

// RiskGauge removed in favor of AnalysisSummaryCard

// Helper to render **bold** text in analysis content
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// Score gauge component (SVG arc) for Fundamental Analysis
// FundamentalScoreGauge removed in favor of AnalysisSummaryCard

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, color, barPct, tooltip,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  barPct?: number;
  tooltip?: string;
}) {
  const [showTip, setShowTip] = useState(false);

  const barColor = color?.includes('green')
    ? 'bg-green-500'
    : color?.includes('yellow')
    ? 'bg-yellow-500'
    : color?.includes('red')
    ? 'bg-red-500'
    : color?.includes('orange')
    ? 'bg-orange-500'
    : 'bg-primary-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {tooltip && (
          <div
            className="relative ml-1 flex-shrink-0"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
          >
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            {showTip && (
              <div className="absolute right-0 top-5 w-56 bg-gray-900 text-white text-xs rounded-lg p-2.5 z-10 shadow-xl leading-relaxed">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold ${color ?? 'text-gray-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
      {barPct !== undefined && (
        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }}
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          />
        </div>
      )}
    </div>
  );
}

// ── Quick Badge ───────────────────────────────────────────────────────────────

function QuickBadge({
  label, onClick, variant = 'default',
}: {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'watchlist' | 'history';
}) {
  const styles = {
    default:
      'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-900/20 dark:hover:border-primary-600',
    watchlist:
      'border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
    history:
      'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
  };
  return (
    <button
      onClick={onClick}
      className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

// ── Education Panel Component ──────────────────────────────────────────────────

function EducationPanel({ children, isOpen, onToggle }: { children: React.ReactNode; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
      <button
        onClick={onToggle}
        title={isOpen ? 'Ocultar explicación' : '¿Qué significa esto?'}
        className="flex items-center gap-1.5 p-1 -m-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
      >
        <Info className="w-4 h-4" />
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 pb-6 border border-gray-100 dark:border-gray-800 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RiskAnalysisPage() {
  const { language, t } = useLanguage();
  const [symbol, setSymbol] = useState('');
  const [riskData, setRiskData] = useState<RiskMetrics | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [fundamentalAnalysis, setFundamentalAnalysis] = useState<FundamentalAnalysis | null>(null);
  const [fundsLoading, setFundsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'QUANTS' | 'FUNDS' | 'TECH'>('TECH');
  const [searchParams, _setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'tecnico') setActiveTab('TECH');
    else if (tabParam === 'fundamental') setActiveTab('FUNDS');
    else if (tabParam === 'cuantitativo') setActiveTab('QUANTS');
  }, [tabParam]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<'6mo' | '1y' | '3y' | '5y' | '10y'>('1y');
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('risk_history') ?? '[]'); } catch { return []; }
  });
  const { watchlist } = useWatchlist();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<IntervalMode>('1d');
  const [intervalToast, setIntervalToast] = useState<string | null>(null);

  // Auto-adjust interval if global range changes to an incompatible one (e.g., from another tab)
  useEffect(() => {
    if (activeTab === 'TECH') {
      const validForCurrentInterval = VALID_RANGES[selectedInterval].includes(selectedRange);
      if (!validForCurrentInterval) {
        const newInterval = DEFAULT_INTERVAL[selectedRange];
        setSelectedInterval(newInterval);
        setIntervalToast(`Intervalo ajustado a ${newInterval}`);
        const t = setTimeout(() => setIntervalToast(null), 4000);
        return () => clearTimeout(t);
      }
    }
  }, [selectedRange, activeTab, selectedInterval]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleHelp = (key: string) => {
    setOpenHelp(prev => (prev === key ? null : key));
  };

  const analyze = async (sym: string, range?: '6mo' | '1y' | '3y' | '5y' | '10y') => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    const rangeToUse = range || selectedRange;
    setSymbol(s);
    setLoading(true);
    setError(null);
    window.dispatchEvent(new CustomEvent('activoAnalizado', { detail: { ticker: s } }));

    try {
      const [riskRes, finRes] = await Promise.allSettled([
        riskService.calculateRisk(s, rangeToUse),
        assetService.getFinancialData(s),
      ]);

      if (riskRes.status === 'rejected') {
        throw new Error(riskRes.reason instanceof Error ? riskRes.reason.message : 'Error al calcular riesgo');
      }

      setRiskData(riskRes.value);
      setFinancialData(finRes.status === 'fulfilled' ? finRes.value : null);

      // Fetch fundamental analysis in the background (don't block)
      setFundsLoading(true);
      assetService.getFundamentalAnalysis(s, rangeToUse)
        .then((analysis) => setFundamentalAnalysis(analysis))
        .catch(() => setFundamentalAnalysis(null))
        .finally(() => setFundsLoading(false));

      setHistory((prev) => {
        const next = [s, ...prev.filter((x) => x !== s)].slice(0, 6);
        localStorage.setItem('risk_history', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar el activo');
      setRiskData(null);
      setFinancialData(null);
      setFundamentalAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const sharpeLabel = (v?: number) => {
    if (v === undefined) return undefined;
    if (v > 2) return t.riskAnalysis.quantitative.sharpe.sub.excellent;
    if (v > 1) return t.riskAnalysis.quantitative.sharpe.sub.good;
    if (v > 0) return t.riskAnalysis.quantitative.sharpe.sub.acceptable;
    return t.riskAnalysis.quantitative.sharpe.sub.negative;
  };
  const sharpePct = (v?: number) =>
    v === undefined ? undefined : Math.min(100, Math.max(0, ((v + 1) / 4) * 100));

  // Dynamic RISK_CONFIG with translations
  const dynamicRiskConfig = {
    LOW: {
      label: t.riskAnalysis.riskLow,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      bar: 'bg-green-500',
      icon: ShieldCheck,
      gaugeColor: '#22c55e',
      score: 20,
    },
    MEDIUM: {
      label: t.riskAnalysis.riskMedium,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-700',
      bar: 'bg-yellow-500',
      icon: AlertTriangle,
      gaugeColor: '#eab308',
      score: 55,
    },
    HIGH: {
      label: t.riskAnalysis.riskHigh,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-700',
      bar: 'bg-orange-500',
      icon: ShieldAlert,
      gaugeColor: '#f97316',
      score: 85,
    },
  };

  const risk = riskData ? dynamicRiskConfig[riskData.riskLevel] : null;
  const RiskIcon = risk?.icon ?? ShieldCheck;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {activeTab === 'TECH' ? t.riskAnalysis.detailedTitleTechnical : 
           activeTab === 'FUNDS' ? t.riskAnalysis.detailedTitleFundamental : 
           t.riskAnalysis.detailedTitleQuantitative}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t.riskAnalysis.description}
        </p>
      </div>

      {/* Search panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4">
        {/* Range selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 sm:mx-0 px-4 sm:px-0">
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 whitespace-nowrap">{t.riskAnalysis.period}</span>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            {(['6mo', '1y', '3y', '5y', '10y'] as const).map((range) => {
              const labels = { '6mo': t.riskAnalysis.sixMonths, '1y': t.riskAnalysis.oneYear, '3y': t.riskAnalysis.threeYears, '5y': t.riskAnalysis.fiveYears, '10y': t.riskAnalysis.tenYears };
              const isRangeValid = activeTab === 'TECH' ? VALID_RANGES[selectedInterval].includes(range) : true;
              return (
                <div
                  key={range}
                  className="relative flex items-center"
                  title={!isRangeValid ? `No compatible con intervalo ${selectedInterval}` : undefined}
                >
                  <button
                    onClick={() => isRangeValid && setSelectedRange(range)}
                    disabled={!isRangeValid}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedRange === range
                        ? 'bg-primary-600 text-white'
                        : !isRangeValid
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 opacity-40 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {labels[range]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interval Selector (Only in TECH tab) */}
        {activeTab === 'TECH' && (
          <div className="flex flex-wrap items-center mt-2 sm:mt-3 p-2 sm:p-3 gap-1.5 sm:gap-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 relative">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mr-1 sm:mr-2 w-full sm:w-auto">{t.riskAnalysis.interval}</span>
            {INTERVALS.map((inv) => (
              <button
                key={inv}
                onClick={() => {
                  setSelectedInterval(inv);
                  if (!VALID_RANGES[inv].includes(selectedRange)) {
                    const validRanges = VALID_RANGES[inv];
                    const nextRange = validRanges.includes('1y') && !validRanges.includes('3y') ? '1y' 
                                    : validRanges.includes('10y') ? '10y' : validRanges[0];
                    setSelectedRange(nextRange as any);
                  }
                }}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-colors ${
                  selectedInterval === inv
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {inv}
              </button>
            ))}
            
            {intervalToast && (
              <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300 px-3 py-1.5 rounded-md text-xs font-medium animate-pulse">
                {intervalToast}
              </div>
            )}
            {intervalToast && (
              <div className="sm:hidden text-[10px] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded font-medium w-full text-center">
                {intervalToast}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <SymbolAutocomplete
            value={symbol}
            onChange={(sym) => {
              setSymbol(sym);
              if (sym) analyze(sym);
            }}
            onSubmit={(sym) => analyze(sym)}
            placeholder={t.riskAnalysis.searchPlaceholder}
            className="flex-1"
            showSearchIcon
            inputClassName="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
          <button
            onClick={() => analyze(symbol)}
            disabled={loading || !symbol.trim()}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                       disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                       transition-colors flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 font-medium text-sm sm:text-base flex-shrink-0"
          >
            {loading
              ? <><Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" /><span className="hidden sm:inline">{t.riskAnalysis.analyzing}</span></>
              : <><TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" /><span className="hidden sm:inline">{t.riskAnalysis.analyze}</span></>
            }
          </button>
        </div>

        {/* Popular symbols */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs text-gray-400 mr-0.5 sm:mr-1">{t.riskAnalysis.popular}</span>
          {QUICK_SYMBOLS.slice(0, 6).map((s) => (
            <QuickBadge key={s} label={s} onClick={() => analyze(s)} variant="default" />
          ))}
        </div>

        {/* Watchlist shortcuts */}
        {watchlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mr-0.5 sm:mr-1">
              <Star className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-yellow-400 fill-yellow-400" /> {t.riskAnalysis.tracking}
            </span>
            {watchlist.slice(0, 5).map((a) => (
              <QuickBadge key={a.symbol} label={a.symbol} onClick={() => analyze(a.symbol)} variant="watchlist" />
            ))}
          </div>
        )}

        {/* Recent history */}
        {history.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mr-0.5 sm:mr-1">
              <Clock className="w-2.5 sm:w-3 h-2.5 sm:h-3" /> {t.riskAnalysis.recent}
            </span>
            {history.slice(0, 5).map((s) => (
              <QuickBadge key={s} label={s} onClick={() => analyze(s)} variant="history" />
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
      {riskData && risk && (
        <div className="space-y-5">

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('TECH')}
              className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'TECH'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t.riskAnalysis.tabTechnical}
            </button>
            <button
              onClick={() => setActiveTab('FUNDS')}
              className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'FUNDS'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t.riskAnalysis.tabFundamental}
            </button>
            <button
              onClick={() => setActiveTab('QUANTS')}
              className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'QUANTS'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t.riskAnalysis.tabQuantitative}
            </button>
          </div>

          {activeTab === 'QUANTS' && (
            <>
              <AnalysisSummaryCard
                score={dynamicRiskConfig[riskData.riskLevel].score}
                classification={t.riskAnalysis.riskTitle.replace('{label}', risk.label)}
                variant={RISK_VARIANTS[riskData.riskLevel]}
                explanation={
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RiskIcon className="w-5 h-5" />
                      <span className="text-xl font-bold">{riskData.symbol}</span>
                      {riskData.period && (
                        <span className="text-xs text-gray-500 font-normal">
                          ({formatDateSimple(riskData.period.start)} - {formatDateSimple(riskData.period.end)})
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">
                      {riskData.explanation ? (
                        <RichText text={riskData.explanation} />
                      ) : (
                        <>
                          {t.common.basedOn} {' '}
                          <strong>
                            {riskData.volatility > 0.30 ? t.riskAnalysis.volatility.high : 
                             riskData.volatility > 0.15 ? t.riskAnalysis.volatility.moderate : 
                             t.riskAnalysis.volatility.low}
                          </strong> ({formatPercentage(riskData.volatility)}) {t.common.and}{' '}
                          <strong>
                            {riskData.maxDrawdown > 0.25 ? t.riskAnalysis.drawdown.high : 
                             riskData.maxDrawdown > 0.10 ? t.riskAnalysis.drawdown.moderate : 
                             t.riskAnalysis.drawdown.low}
                          </strong> ({formatPercentage(riskData.maxDrawdown)} Max Drawdown).
                        </>
                      )}
                    </p>
                  </div>
                }
              >
                <div className="w-full sm:w-64 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    <span>{t.riskAnalysis.riskLow}</span>
                    <span>{t.riskAnalysis.riskHigh}</span>
                  </div>
                  <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
                      style={{ width: `${dynamicRiskConfig[riskData.riskLevel].score}%` }}
                    />
                  </div>
                </div>
              </AnalysisSummaryCard>

              {/* Metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              label={t.riskAnalysis.quantitative.volatility.label}
              value={formatPercentage(riskData.volatility)}
              sub={
                riskData.volatility > 0.5 ? t.riskAnalysis.quantitative.volatility.sub.veryHigh
                : riskData.volatility > 0.3 ? t.riskAnalysis.quantitative.volatility.sub.high
                : riskData.volatility > 0.15 ? t.riskAnalysis.quantitative.volatility.sub.moderate
                : t.riskAnalysis.quantitative.volatility.sub.low
              }
              color={
                riskData.volatility > 0.4
                  ? 'text-red-600 dark:text-red-400'
                  : riskData.volatility > 0.2
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }
              barPct={Math.min(100, riskData.volatility * 150)}
              tooltip={t.riskAnalysis.quantitative.volatility.tooltip}
            />

            <MetricCard
              label={t.riskAnalysis.quantitative.drawdown.label}
              value={`-${formatPercentage(riskData.maxDrawdown)}`}
              sub={t.riskAnalysis.quantitative.drawdown.sub}
              color="text-red-600 dark:text-red-400"
              barPct={Math.min(100, riskData.maxDrawdown * 150)}
              tooltip={t.riskAnalysis.quantitative.drawdown.tooltip}
            />

            {riskData.sharpeRatio !== undefined && (
              <MetricCard
                label={t.riskAnalysis.quantitative.sharpe.label}
                value={riskData.sharpeRatio.toFixed(2)}
                sub={sharpeLabel(riskData.sharpeRatio)}
                color={
                  riskData.sharpeRatio > 1
                    ? 'text-green-600 dark:text-green-400'
                    : riskData.sharpeRatio > 0
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }
                barPct={sharpePct(riskData.sharpeRatio)}
                tooltip={t.riskAnalysis.quantitative.sharpe.tooltip}
              />
            )}

            {riskData.valueAtRisk95 !== undefined && (
              <MetricCard
                label={t.riskAnalysis.quantitative.var.label}
                value={formatPercentage(riskData.valueAtRisk95)}
                sub={t.riskAnalysis.quantitative.var.sub}
                color="text-orange-600 dark:text-orange-400"
                barPct={Math.min(100, riskData.valueAtRisk95 * 300)}
                tooltip={t.riskAnalysis.quantitative.var.tooltip}
              />
            )}

            {riskData.sortinoRatio !== undefined && (
              <MetricCard
                label={t.riskAnalysis.quantitative.sortino.label}
                value={riskData.sortinoRatio.toFixed(2)}
                sub={
                  riskData.sortinoRatio > 2 ? t.riskAnalysis.quantitative.sharpe.sub.excellent
                  : riskData.sortinoRatio > 1 ? t.riskAnalysis.quantitative.sharpe.sub.good
                  : riskData.sortinoRatio > 0 ? t.riskAnalysis.quantitative.sharpe.sub.acceptable
                  : t.riskAnalysis.quantitative.sharpe.sub.negative
                }
                color={
                  riskData.sortinoRatio > 1
                    ? 'text-green-600 dark:text-green-400'
                    : riskData.sortinoRatio > 0
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }
                barPct={Math.min(100, Math.max(0, ((riskData.sortinoRatio + 1) / 4) * 100))}
                tooltip={t.riskAnalysis.quantitative.sortino.tooltip}
              />
            )}

            {riskData.calmarRatio !== undefined && (
              <MetricCard
                label={t.riskAnalysis.quantitative.calmar.label}
                value={riskData.calmarRatio.toFixed(2)}
                sub={
                  riskData.calmarRatio > 1 ? t.riskAnalysis.quantitative.sharpe.sub.good
                  : riskData.calmarRatio > 0.5 ? t.riskAnalysis.quantitative.sharpe.sub.acceptable
                  : t.riskAnalysis.quantitative.sharpe.sub.negative
                }
                color={
                  riskData.calmarRatio > 1
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }
                tooltip={t.riskAnalysis.quantitative.calmar.tooltip}
              />
            )}
          </div>

          {/* Interpretation guide */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary-500" />
              {t.riskAnalysis.quantitative.guideTitle}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
              {[
                { name: t.riskAnalysis.quantitative.volatility.label, desc: t.riskAnalysis.quantitative.guide.volatility },
                { name: t.riskAnalysis.quantitative.sharpe.label,     desc: t.riskAnalysis.quantitative.guide.sharpe },
                { name: t.riskAnalysis.quantitative.drawdown.label,   desc: t.riskAnalysis.quantitative.guide.drawdown },
                { name: t.riskAnalysis.quantitative.var.label,        desc: t.riskAnalysis.quantitative.guide.var },
                { name: t.riskAnalysis.quantitative.sortino.label,    desc: t.riskAnalysis.quantitative.guide.sortino },
                { name: t.riskAnalysis.quantitative.calmar.label,     desc: t.riskAnalysis.quantitative.guide.calmar },
              ].map(({ name, desc }) => (
                <div key={name} className="flex gap-2">
                  <Activity className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  <p><strong className="text-gray-900 dark:text-white">{name}:</strong> {desc}</p>
                </div>
              ))}
            </div>
          </div>
          </>
          )}

          {activeTab === 'FUNDS' && (
            <div className="space-y-6">
              {/* Metric cards row */}
              {financialData && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">
                      Datos actuales — independientes del horizonte seleccionado
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(() => {
                      const qType = financialData.quoteType?.toUpperCase() || 'EQUITY';
                      
                      if (qType === 'CRYPTOCURRENCY') {
                        const f = financialData as any;
                        return (
                          <>
                            <MetricCard label={t.riskAnalysis.metrics.marketCap.label} value={formatCompactNumber(f.marketCap)} />
                            <MetricCard label={t.riskAnalysis.metrics.circulatingSupply.label} value={formatCompactNumber(f.circulatingSupply)} />
                            <MetricCard label={t.riskAnalysis.metrics.maxSupply.label} value={f.maxSupply ? formatCompactNumber(f.maxSupply) : t.common.unlimited} />
                            <MetricCard label={t.riskAnalysis.metrics.volume24h.label} value={formatCompactNumber(f.volume24h)} />
                            <MetricCard 
                              label={t.riskAnalysis.metrics.week52Range.label} 
                              value={`${formatCurrency(f.fiftyTwoWeekLow)} - ${formatCurrency(f.fiftyTwoWeekHigh)}`} 
                            />
                            <MetricCard 
                              label={t.common.yearlyChange} 
                              value={formatPercentage(f.fiftyTwoWeekChange)} 
                              color={(f.fiftyTwoWeekChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}
                            />
                          </>
                        );
                      }

                      if (qType === 'ETF') {
                        const f = financialData as any;
                        return (
                          <>
                            <MetricCard label={t.riskAnalysis.metrics.totalAssets.label} value={formatCompactNumber(f.totalAssets)} tooltip={t.riskAnalysis.metrics.totalAssets.desc} />
                            <MetricCard label={t.riskAnalysis.metrics.peRatio.label} value={f.peRatio?.toFixed(2) || 'N/A'} tooltip={t.riskAnalysis.metrics.peRatio.desc} />
                            <MetricCard label={t.riskAnalysis.metrics.dividend.label} value={formatPercentage(f.dividendYield)} tooltip={t.riskAnalysis.metrics.dividend.desc} />
                            <MetricCard label={t.riskAnalysis.metrics.navPrice.label} value={formatCurrency(f.navPrice)} tooltip={t.riskAnalysis.metrics.navPrice.desc} />
                            <MetricCard label={t.riskAnalysis.metrics.beta3Year.label} value={f.beta3Year?.toFixed(2) || 'N/A'} tooltip={t.riskAnalysis.metrics.beta3Year.desc} />
                            <MetricCard label={t.riskAnalysis.metrics.fiveYearAverageReturn.label} value={formatPercentage(f.fiveYearAverageReturn)} tooltip={t.riskAnalysis.metrics.fiveYearAverageReturn.desc} />
                            <MetricCard label={t.riskAnalysis.metrics.ytdReturn.label} value={formatPercentage(f.ytdReturn)} tooltip={t.riskAnalysis.metrics.ytdReturn.desc} />
                            <MetricCard label={t.riskAnalysis.metrics.annualReportExpenseRatio.label} value={formatPercentage(f.annualReportExpenseRatio, 2)} tooltip={t.riskAnalysis.metrics.annualReportExpenseRatio.desc} />
                          </>
                        );
                      }

                      // Default (EQUITY)
                      return (
                        <>
                          {financialData.marketCap != null && (
                            <MetricCard label={t.riskAnalysis.metrics.marketCap.label} value={formatCompactNumber(financialData.marketCap)} />
                          )}
                          {'peRatio' in financialData && financialData.peRatio != null && (
                            <MetricCard label={t.riskAnalysis.metrics.peRatio.label} value={financialData.peRatio.toFixed(2)} />
                          )}
                          {'beta' in financialData && financialData.beta != null && (
                            <MetricCard label={t.riskAnalysis.metrics.beta.label} value={financialData.beta.toFixed(2)} />
                          )}
                          {'eps' in financialData && financialData.eps != null && (
                            <MetricCard label={t.riskAnalysis.metrics.eps.label} value={formatCurrency(financialData.eps)} />
                          )}
                          {'profitMargin' in financialData && financialData.profitMargin != null && (
                            <MetricCard label={t.riskAnalysis.metrics.netMargin.label} value={formatPercentage(financialData.profitMargin, 2)} />
                          )}
                          {'roe' in financialData && financialData.roe != null && (
                            <MetricCard label={t.riskAnalysis.metrics.roe.label} value={formatPercentage(financialData.roe, 2)} />
                          )}
                          {'dividendYield' in financialData && financialData.dividendYield != null && (
                            <MetricCard label={t.riskAnalysis.metrics.dividend.label} value={formatPercentage(financialData.dividendYield, 2)} />
                          )}
                          {financialData.fiftyTwoWeekHigh != null && financialData.fiftyTwoWeekLow != null && (
                            <MetricCard
                              label={t.riskAnalysis.metrics.week52Range.label}
                              value={`${formatCurrency(financialData.fiftyTwoWeekLow)} - ${formatCurrency(financialData.fiftyTwoWeekHigh)}`}
                            />
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Glossary Layer */}
                  <EducationPanel isOpen={openHelp === 'glossary'} onToggle={() => toggleHelp('glossary')}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.keys(t.riskAnalysis.metrics).filter(key => {
                          const f = financialData as any;
                          const val = key === 'week52Range' ? f.fiftyTwoWeekHigh :
                                      key === 'netMargin' ? f.profitMargin :
                                      key === 'dividend' ? f.dividendYield : f[key];
                          return val !== null && val !== undefined && val !== '' && val !== 'N/A';
                        }).map((key) => {
                          const item = (t.riskAnalysis.metrics as any)[key];
                          return (
                            <div key={key} className="space-y-1">
                              <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{item.label}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Missing Metrics */}
                      {Object.keys(t.riskAnalysis.metrics).filter(key => {
                        const f = financialData as any;
                        const val = key === 'week52Range' ? f.fiftyTwoWeekHigh :
                                    key === 'netMargin' ? f.profitMargin :
                                    key === 'dividend' ? f.dividendYield : f[key];
                        return val === null || val === undefined || val === '' || val === 'N/A';
                      }).length > 0 && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-3">
                            {t.riskAnalysis.missingMetrics}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 opacity-60">
                            {Object.keys(t.riskAnalysis.metrics).filter(key => {
                              const f = financialData as any;
                              const val = key === 'week52Range' ? f.fiftyTwoWeekHigh :
                                          key === 'netMargin' ? f.profitMargin :
                                          key === 'dividend' ? f.dividendYield : f[key];
                              return val === null || val === undefined || val === '' || val === 'N/A';
                            }).map((key) => {
                              const item = (t.riskAnalysis.metrics as any)[key];
                              const qType = financialData?.quoteType?.toUpperCase() || 'EQUITY';
                              const assetType = qType.includes('ETF') ? 'ETF' : qType.includes('CRYPTO') ? 'CRYPTOCURRENCY' : 'EQUITY';
                              const note = (t.riskAnalysis.missingNotes[assetType] as any)?.[key] || t.riskAnalysis.missingNotes.GENERIC.default;
                              
                              return (
                                <div key={key} className="space-y-0.5">
                                  <p className="font-semibold text-gray-500 dark:text-gray-400 text-[11px]">{item.label}</p>
                                  <p className="text-gray-400 dark:text-gray-500 text-[10px] italic leading-snug">— {note}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </EducationPanel>
                </div>
              )}

              {/* Loading state for analysis */}
              {fundsLoading && (
                <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500 mr-3" />
                  <span className="text-gray-500 dark:text-gray-400">{t.riskAnalysis.fundamental.generating}</span>
                </div>
              )}

              {/* Structured Fundamental Analysis */}
              {!fundsLoading && fundamentalAnalysis && (
                <div className="space-y-4">
                  <AnalysisSummaryCard
                    score={fundamentalAnalysis.outlookScore}
                    classification={t.riskAnalysis.fundamental.perspectiva
                      .replace('{range}', (t.riskAnalysis.fundamental.ranges as any)[selectedRange] || selectedRange)
                      .replace('{outlook}', (t.riskAnalysis.fundamental.outlooks as any)[fundamentalAnalysis.outlook])
                    }
                    variant={fundamentalAnalysis.outlook === 'STRONG' ? 'success' : fundamentalAnalysis.outlook === 'MODERATE' ? 'warning' : 'danger'}
                    explanation={<RichText text={fundamentalAnalysis.sections.summary?.content || ''} />}
                    footer={
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {t.common.analyzedOn} {new Date(fundamentalAnalysis.analyzedAt).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')}
                      </div>
                    }
                  />

                      <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800 flex items-start gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg text-primary-600 dark:text-primary-400">
                          <Hourglass className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-primary-900 dark:text-primary-100 text-sm">
                            {fundamentalAnalysis.sections.horizon.title}
                          </h4>
                          <p className="text-primary-800 dark:text-primary-200 text-xs leading-relaxed mt-1 italic">
                            {fundamentalAnalysis.sections.horizon.content}
                          </p>
                        </div>
                      </div>

                  {/* Section Cards */}
                  <div className="flex flex-col gap-4">
                    {Object.entries(fundamentalAnalysis.sections)
                      .filter(([key]) => !['summary', 'horizon'].includes(key))
                      .map(([key, section], idx) => {
                        const icons: Record<string, React.ReactNode> = {
                          overview:      <Activity className="w-4 h-4" />,
                          valuation:     <PieChart className="w-4 h-4" />,
                          profitability: <DollarSign className="w-4 h-4" />,
                          growth:        <GrowthIcon className="w-4 h-4" />,
                          stability:     <Shield className="w-4 h-4" />,
                          risks:         <AlertTriangle className="w-4 h-4" />,
                        };

                        const BLUE_PATTERN = [
                          { color: 'text-blue-400 dark:text-blue-300', bg: 'bg-blue-50/50 dark:bg-blue-800/10', border: 'border-blue-100 dark:border-blue-800/20' },
                          { color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-800/20',     border: 'border-blue-200 dark:border-blue-700/30' },
                          { color: 'text-blue-600 dark:text-blue-300', bg: 'bg-blue-100/60 dark:bg-blue-700/20', border: 'border-blue-200 dark:border-blue-600/30' },
                          { color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-800/20',     border: 'border-blue-200 dark:border-blue-700/30' },
                        ];

                        const style = BLUE_PATTERN[idx % BLUE_PATTERN.length];
                        const icon = icons[key] || <Activity className="w-4 h-4" />;
                        const isExpanded = expandedSections[key] ?? false;

                        return (
                          <div key={key} className={`rounded-xl border ${style.border} overflow-hidden`}>
                            <button
                              onClick={() => toggleSection(key)}
                              className={`w-full flex items-center justify-between px-4 py-3 ${style.bg} text-left transition-colors hover:brightness-95`}
                            >
                              <div className={`flex items-center gap-2 font-semibold text-sm ${style.color}`}>
                                {icon}
                                <span className="text-gray-900 dark:text-white">{section.title}</span>
                              </div>
                              {isExpanded
                                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                                : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>

                            {isExpanded && (
                              <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  <RichText text={section.content} />
                                </p>

                                {/* Section Education Layer */}
                                <EducationPanel
                                  isOpen={openHelp === `section-${key}`}
                                  onToggle={() => toggleHelp(`section-${key}`)}
                                >
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-primary-500/70 tracking-tight mb-1">{t.riskAnalysis.sections.helpWhat}</p>
                                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {(t.riskAnalysis.sections as any)[key]?.desc || t.common.detailedAnalysis}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-primary-500/70 tracking-tight mb-1">{t.riskAnalysis.sections.helpImportance}</p>
                                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                        {['6mo', '1y'].includes(selectedRange) ? ((t.riskAnalysis.sections as any)[key]?.short || t.common.shortTermFactor) :
                                         selectedRange === '3y' ? ((t.riskAnalysis.sections as any)[key]?.mid || t.common.midTermFactor) : 
                                         ((t.riskAnalysis.sections as any)[key]?.long || t.common.longTermFactor)}
                                      </p>
                                    </div>
                                  </div>
                                </EducationPanel>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* No data at all */}
              {!fundsLoading && !fundamentalAnalysis && !financialData && (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">{t.riskAnalysis.noData}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'TECH' && (
            <TechnicalAnalysisPanel symbol={symbol} selectedRange={selectedRange} interval={selectedInterval} />
          )}
        </div>
      )}

      {/* Empty state */}
      {!riskData && !loading && !error && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <TrendingUp className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            {t.riskAnalysis.noDataAll}
          </p>
          <p className="text-sm mt-1">
            {t.riskAnalysis.tryWith} <span className="font-medium">AAPL</span>,{' '}
            <span className="font-medium">BTC-USD</span> {t.common.or} {t.assets.watchlist.toLowerCase()} {t.common.of} {t.sidebar.news.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}
