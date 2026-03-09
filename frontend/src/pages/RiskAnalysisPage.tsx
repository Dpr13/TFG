import { useState } from 'react';
import {
  Search, TrendingUp, Loader2, AlertTriangle,
  ShieldCheck, ShieldAlert, BarChart2, Activity,
  Star, Clock, Info,
} from 'lucide-react';
import { riskService } from '@services/index';
import { useWatchlist } from '@hooks/useWatchlist';
import { formatPercentage } from '@utils/format';
import type { RiskMetrics } from '../types';

// ── Constants ────────────────────────────────────────────────────────────────

const QUICK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY'];

const RISK_CONFIG = {
  LOW: {
    label: 'Bajo',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    bar: 'bg-green-500',
    icon: ShieldCheck,
    gaugeColor: '#22c55e',
    score: 20,
  },
  MEDIUM: {
    label: 'Moderado',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700',
    bar: 'bg-yellow-500',
    icon: AlertTriangle,
    gaugeColor: '#eab308',
    score: 55,
  },
  HIGH: {
    label: 'Alto',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    bar: 'bg-red-500',
    icon: ShieldAlert,
    gaugeColor: '#ef4444',
    score: 85,
  },
};

// ── Risk Gauge ────────────────────────────────────────────────────────────────
// Semicircle gauge: LEFT = LOW risk, RIGHT = HIGH risk

function RiskGauge({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const config = RISK_CONFIG[level];
  const r = 54;
  const cx = 80, cy = 76;

  // fillAngle: 0° = far-left (low risk), 180° = far-right (high risk)
  const fillAngle = (config.score / 100) * 180;

  // Convert gauge angle to standard math angle (0=right, CCW+), flip SVG y-axis
  const mathRad = ((180 - fillAngle) * Math.PI) / 180;
  const endX = cx + r * Math.cos(mathRad);
  const endY = cy - r * Math.sin(mathRad);

  const leftX = cx - r, leftY = cy;
  const rightX = cx + r, rightY = cy;
  const largeArc = fillAngle > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 160 95" className="w-44 h-auto select-none">
      {/* Background track */}
      <path
        d={`M ${leftX} ${leftY} A ${r} ${r} 0 0 1 ${rightX} ${rightY}`}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Colored fill track */}
      <path
        d={`M ${leftX} ${leftY} A ${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`}
        fill="none"
        stroke={config.gaugeColor}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={endX.toFixed(2)} y2={endY.toFixed(2)}
        stroke={config.gaugeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="5" fill={config.gaugeColor} />
      {/* Labels */}
      <text x={leftX} y={leftY + 14} fontSize="8" fill="#9ca3af" textAnchor="middle">BAJO</text>
      <text x={cx} y="16" fontSize="8" fill="#9ca3af" textAnchor="middle">MEDIO</text>
      <text x={rightX} y={rightY + 14} fontSize="8" fill="#9ca3af" textAnchor="middle">ALTO</text>
    </svg>
  );
}

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
      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

export default function RiskAnalysisPage() {
  const [symbol, setSymbol] = useState('');
  const [riskData, setRiskData] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<'6mo' | '1y' | '3y' | '5y'>('1y');
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('risk_history') ?? '[]'); } catch { return []; }
  });
  const { watchlist } = useWatchlist();

  const analyze = async (sym: string, range?: '6mo' | '1y' | '3y' | '5y') => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    const rangeToUse = range || selectedRange;
    setSymbol(s);
    setLoading(true);
    setError(null);

    try {
      const data = await riskService.calculateRisk(s, rangeToUse);
      setRiskData(data);
      setHistory((prev) => {
        const next = [s, ...prev.filter((x) => x !== s)].slice(0, 6);
        localStorage.setItem('risk_history', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular riesgo');
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  const risk = riskData ? RISK_CONFIG[riskData.riskLevel] : null;
  const RiskIcon = risk?.icon ?? ShieldCheck;

  const sharpeLabel = (v?: number) =>
    v === undefined ? undefined : v > 2 ? 'Excelente' : v > 1 ? 'Bueno' : v > 0 ? 'Aceptable' : 'Negativo';
  const sharpePct = (v?: number) =>
    v === undefined ? undefined : Math.min(100, Math.max(0, ((v + 1) / 4) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Análisis de Riesgo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Calcula métricas de riesgo avanzadas para cualquier activo financiero
        </p>
      </div>

      {/* Search panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        {/* Range selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Período:</span>
          {(['6mo', '1y', '3y', '5y'] as const).map((range) => {
            const labels = { '6mo': '6 meses', '1y': '1 año', '3y': '3 años', '5y': '5 años' };
            return (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {labels[range]}
              </button>
            );
          })}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Símbolo del activo (ej: AAPL, BTC-USD, MSFT)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyze(symbol)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button
            onClick={() => analyze(symbol)}
            disabled={loading || !symbol.trim()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                       disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                       transition-colors flex items-center gap-2 font-medium"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Analizando...</span></>
              : <><TrendingUp className="w-5 h-5" /><span>Analizar</span></>
            }
          </button>
        </div>

        {/* Popular symbols */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">Populares:</span>
          {QUICK_SYMBOLS.map((s) => (
            <QuickBadge key={s} label={s} onClick={() => analyze(s)} variant="default" />
          ))}
        </div>

        {/* Watchlist shortcuts */}
        {watchlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Seguimiento:
            </span>
            {watchlist.slice(0, 8).map((a) => (
              <QuickBadge key={a.symbol} label={a.symbol} onClick={() => analyze(a.symbol)} variant="watchlist" />
            ))}
          </div>
        )}

        {/* Recent history */}
        {history.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
              <Clock className="w-3 h-3" /> Recientes:
            </span>
            {history.map((s) => (
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

          {/* Risk hero banner */}
          <div className={`${risk.bg} ${risk.border} border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6`}>
            <div className="flex-shrink-0">
              <RiskGauge level={riskData.riskLevel} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                Activo analizado
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{riskData.symbol}</h3>
              {riskData.period && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {riskData.period.start} — {riskData.period.end} &middot; {riskData.dataPoints} observaciones
                </p>
              )}
              <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full border ${risk.bg} ${risk.border}`}>
                <RiskIcon className={`w-5 h-5 ${risk.color}`} />
                <span className={`text-base font-bold ${risk.color}`}>Riesgo {risk.label}</span>
              </div>
            </div>

            {/* Bar meter */}
            <div className="w-full sm:w-44 space-y-1.5 flex-shrink-0">
              <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Bajo</span>
                <span>Alto</span>
              </div>
              <div className="h-3 bg-white/60 dark:bg-gray-700/60 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
                  style={{ width: `${RISK_CONFIG[riskData.riskLevel].score}%` }}
                />
              </div>
              <p className={`text-center text-xs font-semibold ${risk.color}`}>{risk.label}</p>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              label="Volatilidad Anualizada"
              value={formatPercentage(riskData.volatility)}
              sub={
                riskData.volatility > 0.5 ? 'Muy alta'
                : riskData.volatility > 0.3 ? 'Alta'
                : riskData.volatility > 0.15 ? 'Moderada'
                : 'Baja'
              }
              color={
                riskData.volatility > 0.4
                  ? 'text-red-600 dark:text-red-400'
                  : riskData.volatility > 0.2
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }
              barPct={Math.min(100, riskData.volatility * 150)}
              tooltip="Desviación estándar anualizada de los retornos diarios. Mide cuánto fluctúa el precio. <15% baja · 15-40% moderada · >40% alta."
            />

            <MetricCard
              label="Máximo Drawdown"
              value={`-${formatPercentage(riskData.maxDrawdown)}`}
              sub="Mayor caída desde un máximo"
              color="text-red-600 dark:text-red-400"
              barPct={Math.min(100, riskData.maxDrawdown * 150)}
              tooltip="La mayor caída porcentual desde un pico hasta un valle histórico. Indica el peor escenario al que se enfrentó el activo."
            />

            {riskData.sharpeRatio !== undefined && (
              <MetricCard
                label="Sharpe Ratio"
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
                tooltip="Rentabilidad por unidad de riesgo. >2 excelente · 1-2 bueno · 0-1 aceptable · <0 pérdidas ajustadas al riesgo."
              />
            )}

            {riskData.valueAtRisk95 !== undefined && (
              <MetricCard
                label="VaR (95%)"
                value={formatPercentage(riskData.valueAtRisk95)}
                sub="Pérdida máxima diaria esperada"
                color="text-orange-600 dark:text-orange-400"
                barPct={Math.min(100, riskData.valueAtRisk95 * 300)}
                tooltip="Con 95% de confianza, la pérdida diaria no superará este porcentaje en condiciones normales de mercado."
              />
            )}

            {riskData.sortinoRatio !== undefined && (
              <MetricCard
                label="Sortino Ratio"
                value={riskData.sortinoRatio.toFixed(2)}
                sub={
                  riskData.sortinoRatio > 2 ? 'Excelente'
                  : riskData.sortinoRatio > 1 ? 'Bueno'
                  : riskData.sortinoRatio > 0 ? 'Aceptable'
                  : 'Negativo'
                }
                color={
                  riskData.sortinoRatio > 1
                    ? 'text-green-600 dark:text-green-400'
                    : riskData.sortinoRatio > 0
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }
                barPct={Math.min(100, Math.max(0, ((riskData.sortinoRatio + 1) / 4) * 100))}
                tooltip="Igual que Sharpe, pero solo penaliza la volatilidad bajista. Más preciso para activos con retornos asimétricos."
              />
            )}

            {riskData.calmarRatio !== undefined && (
              <MetricCard
                label="Calmar Ratio"
                value={riskData.calmarRatio.toFixed(2)}
                sub={riskData.calmarRatio > 1 ? 'Beneficio justifica el riesgo' : 'Beneficio bajo'}
                color={
                  riskData.calmarRatio > 1
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }
                tooltip="Rentabilidad anual dividida entre el Máximo Drawdown. Valores >1 indican que el beneficio compensa la mayor caída sufrida."
              />
            )}
          </div>

          {/* Interpretation guide */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary-500" />
              Guía de Interpretación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
              {[
                { name: 'Volatilidad',   desc: 'Variabilidad de los retornos. <15% baja · 15–40% moderada · >40% alta.' },
                { name: 'Sharpe Ratio',  desc: 'Rentabilidad ajustada al riesgo. >1 bueno · >2 excelente · <0 indica pérdidas.' },
                { name: 'Max Drawdown',  desc: 'Peor caída histórica. Indica la resistencia del activo en escenarios adversos.' },
                { name: 'VaR (95%)',     desc: 'Pérdida máxima esperada en un día normal con un 95% de confianza estadística.' },
                { name: 'Sortino Ratio', desc: 'Penaliza solo la volatilidad bajista. Mejor indicador del riesgo real de pérdida.' },
                { name: 'Calmar Ratio',  desc: 'Rentabilidad vs peor caída. >1 indica que el beneficio compensa el riesgo máximo.' },
              ].map(({ name, desc }) => (
                <div key={name} className="flex gap-2">
                  <Activity className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  <p><strong className="text-gray-900 dark:text-white">{name}:</strong> {desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!riskData && !loading && !error && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <TrendingUp className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Introduce un símbolo para analizar su riesgo
          </p>
          <p className="text-sm mt-1">
            Prueba con <span className="font-medium">AAPL</span>,{' '}
            <span className="font-medium">BTC-USD</span> o cualquier activo de tu seguimiento
          </p>
        </div>
      )}
    </div>
  );
}
