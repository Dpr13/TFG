import { useState } from 'react';
import {
  Search, TrendingUp, Loader2, AlertTriangle,
  ShieldCheck, ShieldAlert, BarChart2, Activity,
  Star, Clock, Info, ChevronDown, ChevronUp, PieChart, DollarSign, TrendingUp as GrowthIcon, Shield, Hourglass,
} from 'lucide-react';
import { riskService, assetService } from '@services/index';
import { useWatchlist } from '@hooks/useWatchlist';
import { formatPercentage, formatCompactNumber, formatCurrency, formatDateSimple } from '@utils/format';
import type { RiskMetrics, FinancialData, FundamentalAnalysis } from '../types';

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
    label: 'Elevado',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-700',
    bar: 'bg-orange-500',
    icon: ShieldAlert,
    gaugeColor: '#f97316',
    score: 85,
  },
};

const METRIC_DEFINITIONS = {
  marketCap: {
    label: "Market Cap",
    definition: "Valor total de mercado del activo. En acciones, precio × acciones en circulación. En crypto, indica el tamaño relativo del proyecto en el ecosistema."
  },
  peRatio: {
    label: "P/E Ratio (PER)",
    definition: "Cuántas veces se pagan los beneficios por acción. Un PER bajo puede indicar infravaloración si el negocio es sólido. En ETFs, es la media ponderada de sus componentes."
  },
  beta: {
    label: "Beta",
    definition: "Mide la volatilidad respecto al mercado. <1 es menos volátil, >1 es más volátil. Clave para entender el riesgo sistemático."
  },
  eps: {
    label: "EPS (Beneficio por Acción)",
    definition: "Beneficio neto dividido entre el número de acciones. Indica la rentabilidad que genera cada título."
  },
  netMargin: {
    label: "Margen Neto",
    definition: "Porcentaje de ingresos que queda tras todos los gastos. Un margen alto refleja eficiencia operativa y poder de fijación de precios."
  },
  roe: {
    label: "ROE (Rentabilidad sobre Capital)",
    definition: "Mide la eficiencia con la que la empresa usa el dinero de sus accionistas para generar beneficios."
  },
  dividend: {
    label: "Rentabilidad por Dividendo",
    definition: "Porcentaje del precio que se reparte anualmente. Importante para estrategias de ingresos pasivos."
  },
  week52Range: {
    label: "Rango 52 semanas",
    definition: "Mínimo y máximo del último año. Ayuda a ver si el activo está en zona de máximos (sobrecompra) o mínimos (posible oportunidad)."
  },
  circulatingSupply: {
    label: "Oferta Circulante",
    definition: "Tokens o monedas disponibles para el público. Influye en la escasez y el valor del activo."
  },
  maxSupply: {
    label: "Oferta Máxima",
    definition: "Límite máximo de emisión. Si no tiene límite, el activo puede ser inflacionario a largo plazo."
  },
  volume24h: {
    label: "Volumen 24h",
    definition: "Valor transaccionado en el último día. Refleja el interés actual y la facilidad para entrar o salir de la posición."
  },
  fiftyTwoWeekChange: {
    label: "Cambio Anual (%)",
    definition: "Variación del precio en el último año. Muestra el rendimiento relativo a 365 días."
  },
  totalAssets: {
    label: "Activos Totales (AUM)",
    definition: "Valor bajo gestión del ETF. Fondos grandes suelen ser más líquidos y estables."
  },
  expenseRatio: {
    label: "Ratio de Gastos (TER)",
    definition: "Comisión anual de gestión. Un ratio bajo es vital para no erosionar el beneficio compuesto a largo plazo."
  },
  beta3Year: {
    label: "Beta (3 años)",
    definition: "Volatilidad del ETF respecto a su índice en un periodo de 3 años."
  },
  fiveYearReturn: {
    label: "Retorno (5 años)",
    definition: "Rendimiento anualizado en el último lustro. Indica la solidez histórica de la estrategia del fondo."
  },
  ytdReturn: {
    label: "Retorno YTD",
    definition: "Crecimiento acumulado desde el inicio del año actual."
  },
  navPrice: {
    label: "Precio NAV",
    definition: "Valor Liquidativo Neto por participación. Comprobarlo vs precio de mercado para ver si hay primas o descuentos."
  }
};

const MISSING_METRIC_NOTES: Record<string, any> = {
  CRYPTOCURRENCY: {
    peRatio: "Las criptos no generan beneficios contables corporativos; su valor es especulativo o por utilidad de red.",
    eps: "No existen 'ganancias por acción' en activos descentralizados.",
    beta: "La correlación con el mercado tradicional varía, a menudo invalidando la beta estándar.",
    netMargin: "No hay estructura corporativa para calcular márgenes de beneficio.",
    roe: "No existe capital accionarial sobre el cual calcular la eficiencia operativa.",
    dividend: "Las cryptos no pagan dividendos; el rendimiento viene por apreciación o staking."
  },
  ETF: {
    eps: "Un fondo es un vehículo de inversión, no genera un EPS propio e independiente.",
    netMargin: "Los márgenes de beneficio corresponden a las empresas dentro del fondo, no al ETF.",
    roe: "El ROE no es aplicable a estructuras de inversión colectiva como los ETFs."
  },
  EQUITY: {
    dividend: "Esta empresa no reparte dividendos actualmente (estatal de crecimiento o dificultades).",
    peRatio: "No se puede calcular si la empresa está en pérdidas (EPS negativo).",
    pegRatio: "Requiere estimaciones de crecimiento futuro no disponibles actualmente."
  },
  GENERIC: {
    default: "Dato no disponible en Yahoo Finance para este símbolo en este momento."
  }
};

const SECTION_HELP: Record<string, { what: string; short: string; mid: string; long: string }> = {
  overview: {
    what: 'Resumen del contexto del activo bajo el prisma del horizonte seleccionado.',
    short: 'Punto de partida crucial para entender el momentum inmediato.',
    mid: 'Contexto necesario para validar la dirección de la inversión.',
    long: 'Visión estructural que define el papel del activo en la cartera.'
  },
  valuation: {
    what: 'Analiza si el precio actual es razonable (acciones/ETFs) o el posicionamiento de mercado (crypto).',
    short: 'Muy relevante — el mercado reacciona a múltiplos y posicionamiento en el corto plazo.',
    mid: 'Relevante para equilibrar el precio de entrada con el potencial futuro.',
    long: 'Importante como punto de entrada, aunque la calidad del activo prima sobre el precio exacto.'
  },
  profitability: {
    what: 'Analiza la capacidad de generar beneficios (acciones) o la actividad y uso de red (crypto).',
    short: 'Importante para detectar señales de mejora o deterioro en la actividad reciente.',
    mid: 'Crucial para evaluar la sostenibilidad del modelo o la adopción de la red.',
    long: 'Factor estructural — sin rentabilidad o actividad real, un activo no crea valor a largo plazo.'
  },
  growth: {
    what: 'Analiza la evolución de ingresos/beneficios (acciones) o eficiencia de costes (ETFs).',
    short: 'Relevante si hay catalizadores inmediatos o cambios en la estructura de costes.',
    mid: 'Confirma que la tesis de crecimiento o eficiencia se está ejecutando.',
    long: 'El motor principal de creación de valor compuesto en décadas.'
  },
  stability: {
    what: 'Analiza la tendencia, volatilidad y riesgos específicos del activo.',
    short: 'Crucial para el timing y la gestión del riesgo de caída inmediata.',
    mid: 'Ayuda a diferenciar la volatilidad normal de cambios en la tendencia estructural.',
    long: 'Fundamental para asegurar que el activo puede sobrevivir a múltiples ciclos de mercado.'
  },
  risks: {
    what: 'Identifica las amenazas externas, regulatorias o competitivas más críticas.',
    short: 'Enfoque en catalizadores que podrían causar caídas bruscas repentinas.',
    mid: 'Enfoque en cambios en el sector o competencia que erosionen la ventaja.',
    long: 'Enfoque en riesgos existenciales, regulatorios o de obsolescencia del activo.'
  }
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
function FundamentalScoreGauge({ score, outlook }: { score: number; outlook: string }) {
  const radius = 40;
  const circumference = Math.PI * radius; // half circle
  const progress = (score / 100) * circumference;
  const colorClass =
    outlook === 'STRONG' ? '#22c55e' :
    outlook === 'MODERATE' ? '#f59e0b' : '#ef4444';
  const trackColor = 'rgba(255,255,255,0.15)';
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="60" viewBox="0 0 100 60">
        <path
          d="M10,55 A40,40 0 0,1 90,55"
          fill="none" stroke={trackColor} strokeWidth="10" strokeLinecap="round"
        />
        <path
          d="M10,55 A40,40 0 0,1 90,55"
          fill="none" stroke={colorClass} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
        <text x="50" y="52" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">{score}</text>
      </svg>
      <span className="text-xs mt-1" style={{ color: colorClass }}>
        {outlook === 'STRONG' ? 'Fuerte' : outlook === 'MODERATE' ? 'Moderada' : 'Débil'}
      </span>
    </div>
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
  const [symbol, setSymbol] = useState('');
  const [riskData, setRiskData] = useState<RiskMetrics | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [fundamentalAnalysis, setFundamentalAnalysis] = useState<FundamentalAnalysis | null>(null);
  const [fundsLoading, setFundsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'QUANTS' | 'FUNDS'>('FUNDS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<'6mo' | '1y' | '3y' | '5y' | '10y'>('1y');
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('risk_history') ?? '[]'); } catch { return []; }
  });
  const { watchlist } = useWatchlist();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [openHelp, setOpenHelp] = useState<string | null>(null);

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
          {(['6mo', '1y', '3y', '5y', '10y'] as const).map((range) => {
            const labels = { '6mo': '6 meses', '1y': '1 año', '3y': '3 años', '5y': '5 años', '10y': '10 años' };
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

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('FUNDS')}
              className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'FUNDS'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Análisis Fundamental
            </button>
            <button
              onClick={() => setActiveTab('QUANTS')}
              className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'QUANTS'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Análisis Cuantitativo
            </button>
          </div>

          {/* Risk hero banner */}
          {activeTab === 'QUANTS' && (
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
                    {formatDateSimple(riskData.period.start)} - {formatDateSimple(riskData.period.end)} &middot; {riskData.dataPoints} observaciones
                  </p>
                )}
                <div className={`inline-flex items-center gap-2 mt-3 mb-2 px-4 py-2 rounded-full border ${risk.bg} ${risk.border}`}>
                  <RiskIcon className={`w-5 h-5 ${risk.color}`} />
                  <span className={`text-base font-bold ${risk.color}`}>Riesgo {risk.label}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mt-1 mx-auto sm:mx-0 leading-relaxed">
                  Clasificación basada en su {' '}
                  <strong>{riskData.volatility > 0.30 ? 'alta volatilidad' : riskData.volatility > 0.15 ? 'volatilidad moderada' : 'baja volatilidad'}</strong> ({formatPercentage(riskData.volatility)}) y{' '}
                  <strong>{riskData.maxDrawdown > 0.25 ? 'fuertes caídas históricas' : riskData.maxDrawdown > 0.10 ? 'caídas históricas moderadas' : 'caídas limitadas'}</strong> ({formatPercentage(riskData.maxDrawdown)} Max Drawdown).
                </p>
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
          )}

          {activeTab === 'QUANTS' && (
            <>

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
                            <MetricCard label="Market Cap" value={formatCompactNumber(f.marketCap)} />
                            <MetricCard label="Oferta Circulante" value={formatCompactNumber(f.circulatingSupply)} />
                            <MetricCard label="Oferta Máxima" value={f.maxSupply ? formatCompactNumber(f.maxSupply) : 'Sin límite'} />
                            <MetricCard label="Volumen 24h" value={formatCompactNumber(f.volume24h)} />
                            <MetricCard 
                              label="Rango 52 Sem." 
                              value={`${formatCurrency(f.fiftyTwoWeekLow)} - ${formatCurrency(f.fiftyTwoWeekHigh)}`} 
                            />
                            <MetricCard 
                              label="Cambio Anual" 
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
                            <MetricCard label="Activos (AUM)" value={formatCompactNumber(f.totalAssets)} tooltip="Valor total bajo gestión" />
                            <MetricCard label="P/E (Ponderado)" value={f.peRatio?.toFixed(2) || 'N/A'} tooltip="Media ponderada del P/E de los activos" />
                            <MetricCard label="Div. Yield" value={formatPercentage(f.dividendYield)} tooltip="Rentabilidad por dividendo distribuida" />
                            <MetricCard label="Precio NAV" value={formatCurrency(f.navPrice)} tooltip="Valor Liquidativo Neto" />
                            <MetricCard label="Beta (3 años)" value={f.beta3Year?.toFixed(2) || 'N/A'} tooltip="Volatilidad respecto a su Benchmark" />
                            <MetricCard label="Retorno 5 años" value={formatPercentage(f.fiveYearAverageReturn)} tooltip="Rentabilidad media anualizada" />
                            <MetricCard label="Retorno YTD" value={formatPercentage(f.ytdReturn)} tooltip="Retorno en el año actual" />
                            <MetricCard label="Gastos (TER)" value={formatPercentage(f.annualReportExpenseRatio, 2)} tooltip="Comisión total de gestión anual" />
                          </>
                        );
                      }

                      // Default (EQUITY)
                      return (
                        <>
                          {financialData.marketCap != null && (
                            <MetricCard label="Market Cap (Actual)" value={formatCompactNumber(financialData.marketCap)} />
                          )}
                          {'peRatio' in financialData && financialData.peRatio != null && (
                            <MetricCard label="P/E Ratio (Actual)" value={financialData.peRatio.toFixed(2)} />
                          )}
                          {'beta' in financialData && financialData.beta != null && (
                            <MetricCard label="Beta (Actual)" value={financialData.beta.toFixed(2)} />
                          )}
                          {'eps' in financialData && financialData.eps != null && (
                            <MetricCard label="EPS (Actual)" value={formatCurrency(financialData.eps)} />
                          )}
                          {'profitMargin' in financialData && financialData.profitMargin != null && (
                            <MetricCard label="Margen Neto (Actual)" value={formatPercentage(financialData.profitMargin, 2)} />
                          )}
                          {'roe' in financialData && financialData.roe != null && (
                            <MetricCard label="ROE (Actual)" value={formatPercentage(financialData.roe, 2)} />
                          )}
                          {'dividendYield' in financialData && financialData.dividendYield != null && (
                            <MetricCard label="Dividendo (Actual)" value={formatPercentage(financialData.dividendYield, 2)} />
                          )}
                          {financialData.fiftyTwoWeekHigh != null && financialData.fiftyTwoWeekLow != null && (
                            <MetricCard
                              label="Rango 52 Sem. (Actual)"
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
                        {Object.keys(METRIC_DEFINITIONS).filter(key => {
                          const f = financialData as any;
                          const val = key === 'week52Range' ? f.fiftyTwoWeekHigh :
                                      key === 'netMargin' ? f.profitMargin :
                                      key === 'dividend' ? f.dividendYield : f[key];
                          return val !== null && val !== undefined && val !== '' && val !== 'N/A';
                        }).map((key) => {
                          const item = (METRIC_DEFINITIONS as any)[key];
                          return (
                            <div key={key} className="space-y-1">
                              <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{item.label}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.definition}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Missing Metrics */}
                      {Object.keys(METRIC_DEFINITIONS).filter(key => {
                        const f = financialData as any;
                        const val = key === 'week52Range' ? f.fiftyTwoWeekHigh :
                                    key === 'netMargin' ? f.profitMargin :
                                    key === 'dividend' ? f.dividendYield : f[key];
                        return val === null || val === undefined || val === '' || val === 'N/A';
                      }).length > 0 && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-3">
                            Métricas no disponibles para este activo
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 opacity-60">
                            {Object.keys(METRIC_DEFINITIONS).filter(key => {
                              const f = financialData as any;
                              const val = key === 'week52Range' ? f.fiftyTwoWeekHigh :
                                          key === 'netMargin' ? f.profitMargin :
                                          key === 'dividend' ? f.dividendYield : f[key];
                              return val === null || val === undefined || val === '' || val === 'N/A';
                            }).map((key) => {
                              const item = (METRIC_DEFINITIONS as any)[key];
                              const qType = financialData?.quoteType?.toUpperCase() || 'EQUITY';
                              const assetType = qType.includes('ETF') ? 'ETF' : qType.includes('CRYPTO') ? 'CRYPTOCURRENCY' : 'EQUITY';
                              const note = (MISSING_METRIC_NOTES[assetType] as any)?.[key] || MISSING_METRIC_NOTES.GENERIC.default;
                              
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
                  <span className="text-gray-500 dark:text-gray-400">Generando análisis fundamental...</span>
                </div>
              )}

              {/* Structured Fundamental Analysis */}
              {!fundsLoading && fundamentalAnalysis && (
                <div className="space-y-4">
                  {/* Outlook badge */}
                  <div className={`rounded-xl p-5 flex items-center gap-5 ${
                    fundamentalAnalysis.outlook === 'STRONG'
                      ? 'bg-gradient-to-r from-green-700 to-green-600'
                      : fundamentalAnalysis.outlook === 'MODERATE'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500'
                      : 'bg-gradient-to-r from-red-700 to-red-600'
                  }`}>
                    <FundamentalScoreGauge score={fundamentalAnalysis.outlookScore} outlook={fundamentalAnalysis.outlook} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm leading-relaxed">
                        <RichText text={fundamentalAnalysis.sections.summary?.content || ''} />
                      </p>
                      <p className="text-white/60 text-xs mt-2">
                        Analizado: {new Date(fundamentalAnalysis.analyzedAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {/* Horizon Logic summary */}
                  {fundamentalAnalysis.sections.horizon && (
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
                  )}

                  {/* Section Cards */}
                  <div className="flex flex-col gap-4">
                    {Object.entries(fundamentalAnalysis.sections)
                      .filter(([key]) => !['summary', 'horizon'].includes(key))
                      .map(([key, section]) => {
                        const styleMap: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
                          overview:      { icon: <Activity className="w-4 h-4" />,  color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-200 dark:border-blue-800' },
                          valuation:     { icon: <PieChart className="w-4 h-4" />,  color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
                          profitability: { icon: <DollarSign className="w-4 h-4" />,color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',   border: 'border-green-200 dark:border-green-800' },
                          growth:        { icon: <GrowthIcon className="w-4 h-4" />, color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20',     border: 'border-teal-200 dark:border-teal-800' },
                          stability:     { icon: <Shield className="w-4 h-4" />,    color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20',  border: 'border-indigo-200 dark:border-indigo-800' },
                          risks:         { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800' },
                        };
                        
                        const style = styleMap[key] || styleMap.overview;
                        const isExpanded = expandedSections[key] ?? false;

                        return (
                          <div key={key} className={`rounded-xl border ${style.border} overflow-hidden`}>
                            <button
                              onClick={() => toggleSection(key)}
                              className={`w-full flex items-center justify-between px-4 py-3 ${style.bg} text-left transition-colors hover:brightness-95`}
                            >
                              <div className={`flex items-center gap-2 font-semibold text-sm ${style.color}`}>
                                {style.icon}
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
                                      <p className="text-[10px] uppercase font-bold text-primary-500/70 tracking-tight mb-1">Qué analiza esta sección</p>
                                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {SECTION_HELP[key]?.what || 'Análisis detallado de este factor para el activo.'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-primary-500/70 tracking-tight mb-1">Por qué importa en este horizonte</p>
                                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                        {['6mo', '1y'].includes(selectedRange) ? (SECTION_HELP[key]?.short || 'Factor relevante a corto plazo.') :
                                         selectedRange === '3y' ? (SECTION_HELP[key]?.mid || 'Factor relevante a medio plazo.') : 
                                         (SECTION_HELP[key]?.long || 'Factor determinante a largo plazo.')}
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
                  <p className="text-gray-500 dark:text-gray-400">Datos fundamentales no disponibles para este activo.</p>
                </div>
              )}
            </div>
          )}
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
