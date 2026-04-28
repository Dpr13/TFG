import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Loader2, AlertTriangle, Download, Eye, EyeOff, Sparkles,
} from 'lucide-react';
import { assetService, iaService } from '@services/index';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TechnicalAnalysisResult, TechnicalSignalClass, SignalBreakdown } from '@/types/index';

// ── Lightweight Charts global ────────────────────────────────────────────
declare const LightweightCharts: any;

// ── Constants ────────────────────────────────────────────────────────────
const SIGNAL_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  'COMPRA FUERTE': { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-100/80 dark:bg-green-900/40', border: 'border-green-200 dark:border-green-800' },
  'COMPRA':        { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50/80 dark:bg-green-900/30', border: 'border-green-100 dark:border-green-900/50' },
  'NEUTRAL':       { text: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800/50' },
  'VENTA':         { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-100 dark:border-red-900/50' },
  'VENTA FUERTE':  { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100/80 dark:bg-red-900/40', border: 'border-red-200 dark:border-red-800' },
};

// ── Format helper: abbreviated numbers (OBV, Volume) ─────────────────────
function formatOBV(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(2) + 'B';
  if (abs >= 1_000_000)     return sign + (abs / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000)         return sign + (abs / 1_000).toFixed(1) + 'K';
  return sign + abs.toFixed(0);
}

// ── Signal Score Gauge (SVG arc) ─────────────────────────────────────────
function SignalGauge({ score, classification }: { score: number; classification: TechnicalSignalClass }) {
  const { darkMode } = useTheme();
  const radius = 44;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 80 ? '#22c55e' :
    score >= 60 ? '#4ade80' :
    score >= 40 ? '#eab308' :
    score >= 20 ? '#ef4444' : '#dc2626';

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <svg width="110" height="65" viewBox="0 0 110 65">
        <path d="M11,58 A44,44 0 0,1 99,58" fill="none" stroke={darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"} strokeWidth="9" strokeLinecap="round" />
        <path d="M11,58 A44,44 0 0,1 99,58" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`} />
        <text x="55" y="52" textAnchor="middle" fontSize="22" fontWeight="bold" fill={darkMode ? "white" : "#1f2937"}>{score}</text>
        <text x="55" y="63" textAnchor="middle" fontSize="8" fill={darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"}>/100</text>
      </svg>
      <span className="text-xs font-bold mt-1" style={{ color }}>{classification}</span>
    </div>
  );
}

// ── Breakdown Bar ────────────────────────────────────────────────────────
function BreakdownBar({ item }: { item: SignalBreakdown }) {
  const pct = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs transition-colors">
        <span className="text-gray-200 dark:text-gray-300 font-medium">{item.name}</span>
        <span className="text-gray-400 dark:text-gray-400">{item.score}/{item.maxScore}</span>
      </div>
      <div className="h-1.5 bg-black/20 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10.5px] text-gray-200/70 dark:text-gray-400 leading-tight font-medium">{item.detail}</p>
    </div>
  );
}

// ── Helper: parse date to Lightweight Charts format ──────────────────────
function toChartTime(dateStr: string, isIntraday: boolean = false): string | number {
  if (isIntraday) {
    return Math.floor(Date.parse(dateStr) / 1000);
  }
  return dateStr.split('T')[0];
}

// ══════════════════════════════════════════════════════════════════════════
// TECHNICAL ANALYSIS PANEL
// ══════════════════════════════════════════════════════════════════════════

interface TechnicalAnalysisPanelProps {
  symbol: string;
  selectedRange: string;
  interval?: string;
}

export default function TechnicalAnalysisPanel({ symbol, selectedRange, interval }: TechnicalAnalysisPanelProps) {
  const { darkMode } = useTheme();
  const { language, t } = useLanguage();
  const [data, setData] = useState<TechnicalAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overlay toggles
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [showEMA20, setShowEMA20] = useState(false);
  const [showEMA50, setShowEMA50] = useState(false);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

  // Side panel for SR levels
  const [hoveredSR, setHoveredSR] = useState<{ type: 'R' | 'S', price: number, date: string } | null>(null);

  // AI Summary State
  const [iaResumen, setIaResumen] = useState<string | null>(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState<string | null>(null);

  // Limit banner state
  const [showLimitBanner, setShowLimitBanner] = useState(false);

  // Calculate precision based on first price
  const firstPrice = data?.candles?.[0]?.close || 0;
  const precision = firstPrice < 1 ? 6 : firstPrice < 100 ? 4 : 2;
  const minMove = 1 / Math.pow(10, precision);

  useEffect(() => {
    if (!interval) return;
    const limits = { '1m': 7, '5m': 60, '15m': 60 };
    if (interval in limits) {
      const dismissed = sessionStorage.getItem(`dismissed_limit_${interval}`);
      if (!dismissed) {
        setShowLimitBanner(true);
      } else {
        setShowLimitBanner(false);
      }
    } else {
      setShowLimitBanner(false);
    }
  }, [interval]);

  const dismissBanner = () => {
    if (!interval) return;
    sessionStorage.setItem(`dismissed_limit_${interval}`, 'true');
    setShowLimitBanner(false);
  };

  // Chart refs
  const mainChartRef = useRef<HTMLDivElement>(null);
  const volumeChartRef = useRef<HTMLDivElement>(null);
  const rsiChartRef = useRef<HTMLDivElement>(null);
  const macdChartRef = useRef<HTMLDivElement>(null);
  const chartsContainerRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<any[]>([]);
  const mainSeriesRefs = useRef<{ type: string, series: any, lastValue: number, color: string, priority: number }[]>([]);

  const getSafeChartWidth = useCallback((el: HTMLElement | null) => {
    const elWidth = el?.getBoundingClientRect?.().width ?? 0;
    const containerWidth = chartsContainerRef.current?.getBoundingClientRect?.().width ?? 0;
    const viewportWidth = document.documentElement?.clientWidth || window.innerWidth || 0;
    const fallbackWidth = viewportWidth > 0 ? viewportWidth - 32 : 0;

    const width = Math.max(1, Math.floor(elWidth || containerWidth || fallbackWidth || 0));
    return viewportWidth > 0 ? Math.min(width, viewportWidth) : width;
  }, []);

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    assetService.getTechnicalAnalysis(symbol, selectedRange, interval)
      .then((result) => { 
        if (!cancelled) {
          setData(result); 
          // Reset AI state when asset/interval/range changes
          setIaResumen(null);
          setIaError(null);
          setIaLoading(false);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.error || err?.message || t.technicalAnalysis.analysisError);
          setData(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol, selectedRange, interval]);

  // ── Build charts ──────────────────────────────────────────────────────

  const buildCharts = useCallback(() => {
    if (!data || typeof LightweightCharts === 'undefined') return;

    chartsRef.current.forEach(c => { try { c.remove(); } catch {} });
    chartsRef.current = [];
    mainSeriesRefs.current = [];

    const isIntraday = ['1m', '5m', '15m', '1h', '4h'].includes(data.interval || interval || '1d');

    const isMobile = window.innerWidth < 768;
    const mainHeight = isMobile ? 250 : 420;
    const subHeight = isMobile ? 80 : 120;

    const chartTheme = darkMode ? {
      layout: { background: { color: '#1f2937' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#4b5563' },
      timeScale: { borderColor: '#4b5563', timeVisible: isIntraday },
    } : {
      layout: { background: { color: '#ffffff' }, textColor: '#4b5563' },
      grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#e5e7eb' },
      timeScale: { borderColor: '#e5e7eb', timeVisible: isIntraday },
    };

    const candles = data.candles.map(c => ({
      time: toChartTime(c.date, isIntraday),
      open: c.open, high: c.high, low: c.low, close: c.close,
    }));

    const lastClose = data.candles.length > 0 ? data.candles[data.candles.length - 1].close : 0;

    // ── Main Chart ──
    if (mainChartRef.current) {
      mainChartRef.current.innerHTML = '';
      const containerWidth = getSafeChartWidth(mainChartRef.current);
      
      const chartWrapper = document.createElement('div');
      chartWrapper.style.position = 'relative';
      chartWrapper.style.width = '100%';
      chartWrapper.style.height = `${mainHeight}px`;
      chartWrapper.style.overflow = 'hidden';
      mainChartRef.current.appendChild(chartWrapper);

      const chart = LightweightCharts.createChart(chartWrapper, {
        ...chartTheme,
        width: containerWidth,
        height: mainHeight,
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      });
      chartsRef.current.push(chart);

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350',
        borderUpColor: '#26a69a', borderDownColor: '#ef5350',
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
        priceFormat: {
          type: 'price',
          precision: precision,
          minMove: minMove,
        },
      });
      candleSeries.setData(candles);

      // Overlays
      const addOverlay = (seriesData: any[], color: string, style: number, width: number, title?: string, conf?: any) => {
        if (!seriesData || seriesData.length === 0) return null;
        const line = chart.addLineSeries({ color, lineWidth: width, lineStyle: style, title, ...conf });
        line.setData(seriesData.map((p: any) => ({ time: toChartTime(p.time, isIntraday), value: p.value })));
        return line;
      };

      if (showSMA20) {
        const s = addOverlay(data.sma20, '#93c5fd', 0, 1, 'SMA20');
        if (s && data.sma20.length > 0) {
          mainSeriesRefs.current.push({ type: 'SMA20', series: s, lastValue: data.sma20[data.sma20.length - 1].value, color: '#93c5fd', priority: 5 });
        }
      }
      if (showSMA50) {
        const s = addOverlay(data.sma50, '#fb923c', 0, 1, 'SMA50');
        if (s && data.sma50.length > 0) {
          mainSeriesRefs.current.push({ type: 'SMA50', series: s, lastValue: data.sma50[data.sma50.length - 1].value, color: '#fb923c', priority: 7 });
        }
      }
      if (showSMA200) {
        const s = addOverlay(data.sma200, '#ef4444', 0, 2, 'SMA200');
        if (s && data.sma200.length > 0) {
          mainSeriesRefs.current.push({ type: 'SMA200', series: s, lastValue: data.sma200[data.sma200.length - 1].value, color: '#ef4444', priority: 8 });
        }
      }
      if (showEMA20) {
        const s = addOverlay(data.ema20, '#60a5fa', 1, 1, 'EMA20');
        if (s && data.ema20.length > 0) {
          mainSeriesRefs.current.push({ type: 'EMA20', series: s, lastValue: data.ema20[data.ema20.length - 1].value, color: '#60a5fa', priority: 1 });
        }
      }
      if (showEMA50) {
        const s = addOverlay(data.ema50, '#a78bfa', 1, 1, 'EMA50');
        if (s && data.ema50.length > 0) {
          mainSeriesRefs.current.push({ type: 'EMA50', series: s, lastValue: data.ema50[data.ema50.length - 1].value, color: '#a78bfa', priority: 2 });
        }
      }

      // Bollinger Bands (custom blue style & filled area)
      let bbuPrice = 0, bblPrice = 0;
      if (showBollinger && data.bollinger.upper.length > 0) {
        bbuPrice = data.bollinger.upper[data.bollinger.upper.length - 1].value;
        bblPrice = data.bollinger.lower[data.bollinger.lower.length - 1].value;
        
        // Lower band (hidden label)
        addOverlay(data.bollinger.lower, 'rgba(100, 160, 255, 0.9)', 2, 1.5, 'BBL', { lastValueVisible: false, priceLineVisible: false });

        // Area Fill
        const fillSeries = chart.addAreaSeries({
          topColor: 'rgba(100, 160, 255, 0.12)',
          bottomColor: 'rgba(100, 160, 255, 0.04)',
          lineColor: 'rgba(0,0,0,0)',
          lineWidth: 0,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        fillSeries.setData(data.bollinger.upper.map((p) => ({ 
          time: toChartTime(p.time, isIntraday), 
          value: p.value 
        })));
        
        // Upper band (custom formatted label)
        const sUp = addOverlay(data.bollinger.upper, 'rgba(100, 160, 255, 0.9)', 2, 1.5, 'BBU', {
          priceFormat: {
            type: 'custom',
            formatter: () => `BB ↑${bbuPrice.toFixed(precision)} / ↓${bblPrice.toFixed(precision)}`,
          },
          lastValueVisible: true,
          priceLineVisible: false,
        });
        mainSeriesRefs.current.push({ type: 'BB', series: sUp, lastValue: bbuPrice, color: 'rgba(100, 160, 255, 0.9)', priority: 6 });
      }

      // Hide/Show labels based on collision logic (run on scale changes)
      const updateAxisLabelVisibility = () => {
        const scale = chart.priceScale('right');
        if (!scale || typeof scale.getVisiblePriceRange !== 'function') return;
        
        const visibleRange = scale.getVisiblePriceRange();
        if (!visibleRange) return;

        // Collect all potentially visible series (only those whose lastValue is within visible scale)
        const activeItems = mainSeriesRefs.current.map(item => {
          const y = scale.priceToCoordinate(item.lastValue);
          const isVisible = y !== null && item.lastValue >= visibleRange.bottom && item.lastValue <= visibleRange.top;
          return { ...item, y, isVisible };
        });

        // Filter and sort by priority (highest first)
        const sortedItems = [...activeItems]
          .filter(i => i.isVisible && i.y !== null)
          .sort((a, b) => b.priority - a.priority);

        const drawnItems: typeof sortedItems = [];
        const LABEL_MIN_DIST = 22; // px

        for (const item of activeItems) {
          if (!item.isVisible || item.y === null) {
            item.series.applyOptions({ lastValueVisible: false });
            continue;
          }

          // Search in sorted order
          const sortedMatch = sortedItems.find(x => x.type === item.type);
          if (!sortedMatch) continue;

          // Check if it collides with an already accepted high-priority item
          const collision = drawnItems.some(drawn => Math.abs(drawn.y! - item.y!) < LABEL_MIN_DIST);

          if (collision) {
            item.series.applyOptions({ lastValueVisible: false });
          } else {
            drawnItems.push(item);
            item.series.applyOptions({ lastValueVisible: true });
          }
        }
      };

      // Connect to logical range changes
      chart.timeScale().subscribeVisibleLogicalRangeChange(updateAxisLabelVisibility);
      setTimeout(updateAxisLabelVisibility, 100); // 1st pass

      // ── S&R lines — max 2 nearest of each ──
      const sortByProximity = (levels: any[]) =>
        [...levels].sort((a, b) => Math.abs(a.price - lastClose) - Math.abs(b.price - lastClose)).slice(0, 2);

      const topSupports = sortByProximity(data.supports);
      const topResistances = sortByProximity(data.resistances);
      const srLines: { price: number, type: 'S'|'R', date: string }[] = [];

      topSupports.forEach(level => {
        candleSeries.createPriceLine({
          price: level.price, color: '#22c55e', lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Dashed, axisLabelVisible: false,
        });
        srLines.push({ price: level.price, type: 'S', date: level.date });
      });

      topResistances.forEach(level => {
        candleSeries.createPriceLine({
          price: level.price, color: '#ef4444', lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Dashed, axisLabelVisible: false,
        });
        srLines.push({ price: level.price, type: 'R', date: level.date });
      });

      // Show SR info on hover (crosshair move)
      chart.subscribeCrosshairMove((param: any) => {
        if (!param.point) {
          setHoveredSR(null);
          return;
        }
        const scale = chart.priceScale('right');
        if (!scale || typeof scale.coordinateToPrice !== 'function') return;
        
        const priceAtMouse = scale.coordinateToPrice(param.point.y);
        if (priceAtMouse === null) return;
        
        const closeSR = srLines.find(sr => Math.abs(sr.price - priceAtMouse) / sr.price < 0.015);
        if (closeSR) setHoveredSR({ type: closeSR.type, price: closeSR.price, date: closeSR.date });
        else setHoveredSR(null);
      });

      // Legend on crosshair
      const legendEl = document.createElement('div');
      legendEl.style.cssText = `position:absolute;top:8px;left:12px;z-index:10;font-size:11px;color:${darkMode ? '#d1d5db' : '#4b5563'};pointer-events:none;font-family:monospace;`;
      chartWrapper.appendChild(legendEl);

      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !param.seriesData) {
          legendEl.textContent = '';
          return;
        }
        const d = param.seriesData.get(candleSeries);
        if (d) {
          const vol = data.candles.find(c => toChartTime(c.date, isIntraday) === param.time)?.volume;
          legendEl.textContent = `${symbol} · ${data.interval} | O: ${d.open?.toFixed(precision)}  H: ${d.high?.toFixed(precision)}  L: ${d.low?.toFixed(precision)}  C: ${d.close?.toFixed(precision)}  V: ${vol != null ? formatOBV(vol) : '-'}`;
        }
      });

      chart.timeScale().fitContent();
    }

    // ── Volume Chart with formatted OBV ──
    if (volumeChartRef.current && data.hasVolume) {
      volumeChartRef.current.innerHTML = '';
      const containerWidth = getSafeChartWidth(volumeChartRef.current);
      
      const chart = LightweightCharts.createChart(volumeChartRef.current, {
        ...chartTheme,
        width: containerWidth,
        height: subHeight,
        rightPriceScale: { borderColor: darkMode ? '#4b5563' : '#e5e7eb' },
      });
      chartsRef.current.push(chart);

      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => formatOBV(price),
        },
        priceScaleId: 'vol',
      });
      volumeSeries.setData(data.candles.map(c => ({
        time: toChartTime(c.date, isIntraday),
        value: c.volume,
        color: c.close >= c.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)',
      })));

      if (data.obv.length > 0) {
        const obvSeries = chart.addLineSeries({
          color: '#818cf8', lineWidth: 1, title: 'OBV',
          priceScaleId: 'obv',
          priceFormat: {
            type: 'custom',
            formatter: (price: number) => formatOBV(price),
          },
        });
        chart.priceScale('obv').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
        obvSeries.setData(data.obv.map(p => ({ time: toChartTime(p.time, isIntraday), value: p.value })));
      }

      chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      chart.timeScale().fitContent();
    }

    // ── RSI Chart ──
    if (rsiChartRef.current && showRSI && data.rsi.length > 0) {
      rsiChartRef.current.innerHTML = '';
      const containerWidth = getSafeChartWidth(rsiChartRef.current);
      
      const chart = LightweightCharts.createChart(rsiChartRef.current, {
        ...chartTheme,
        width: containerWidth,
        height: subHeight
      });
      chartsRef.current.push(chart);

      const rsiSeries = chart.addLineSeries({ color: '#a78bfa', lineWidth: 1.5, title: 'RSI(14)' });
      rsiSeries.setData(data.rsi.map(p => ({ time: toChartTime(p.time, isIntraday), value: p.value })));

      rsiSeries.createPriceLine({ price: 70, color: '#ef4444', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '' });
      rsiSeries.createPriceLine({ price: 30, color: '#22c55e', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '' });
      rsiSeries.createPriceLine({ price: 50, color: '#6b7280', lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: '' });

      chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.05, bottom: 0.05 } });
      chart.timeScale().fitContent();
    }

    // ── MACD Chart ──
    if (macdChartRef.current && showMACD && data.macd.macdLine.length > 0) {
      macdChartRef.current.innerHTML = '';
      const containerWidth = getSafeChartWidth(macdChartRef.current);
      
      const chart = LightweightCharts.createChart(macdChartRef.current, {
        ...chartTheme,
        width: containerWidth,
        height: subHeight
      });
      chartsRef.current.push(chart);

      const histSeries = chart.addHistogramSeries({ priceScaleId: 'macd', title: 'Hist' });
      histSeries.setData(data.macd.histogram.map(p => ({
        time: toChartTime(p.time, isIntraday), value: p.value,
        color: p.value >= 0 ? 'rgba(38,166,154,0.7)' : 'rgba(239,83,80,0.7)',
      })));

      const macdLine = chart.addLineSeries({ color: '#60a5fa', lineWidth: 1.5, title: 'MACD', priceScaleId: 'macd' });
      macdLine.setData(data.macd.macdLine.map(p => ({ time: toChartTime(p.time, isIntraday), value: p.value })));

      const sigLine = chart.addLineSeries({ color: '#fb923c', lineWidth: 1, title: 'Signal', priceScaleId: 'macd' });
      sigLine.setData(data.macd.signalLine.map(p => ({ time: toChartTime(p.time, isIntraday), value: p.value })));

      macdLine.createPriceLine({ price: 0, color: '#6b7280', lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: '' });
      chart.priceScale('macd').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      chart.timeScale().fitContent();
    }

    // ── Sync time scales ──
    if (chartsRef.current.length > 1) {
      const primary = chartsRef.current[0];
      chartsRef.current.slice(1).forEach(ch => {
        primary.timeScale().subscribeVisibleLogicalRangeChange((range: any) => { if (range) ch.timeScale().setVisibleLogicalRange(range); });
        ch.timeScale().subscribeVisibleLogicalRangeChange((range: any) => { if (range) primary.timeScale().setVisibleLogicalRange(range); });
      });
    }
  }, [data, showSMA20, showSMA50, showSMA200, showEMA20, showEMA50, showBollinger, showRSI, showMACD, symbol, interval, darkMode, getSafeChartWidth]);

  useEffect(() => {
    buildCharts();
    return () => {
      chartsRef.current.forEach(c => { try { c.remove(); } catch {} });
      chartsRef.current = [];
    };
  }, [buildCharts]);

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        chartsRef.current.forEach((chart, idx) => {
          const refs = [mainChartRef, volumeChartRef, rsiChartRef, macdChartRef];
          const ref = refs[idx];
          if (ref?.current) {
            const containerWidth = getSafeChartWidth(ref.current);
            try {
              chart.applyOptions({ width: containerWidth });
            } catch (e) {
              console.warn('Failed to resize chart', e);
            }
          }
        });
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [getSafeChartWidth]);

  const exportPNG = () => {
    if (!chartsContainerRef.current) return;
    const totalHeight = Array.from(chartsContainerRef.current.children).reduce((h, el) => h + (el as HTMLElement).offsetHeight, 0);
    const width = (chartsContainerRef.current.firstElementChild as HTMLElement)?.offsetWidth || 800;

    const canvas = document.createElement('canvas');
    canvas.width = width * 2; canvas.height = totalHeight * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2); ctx.fillStyle = darkMode ? '#1f2937' : '#ffffff'; ctx.fillRect(0, 0, width, totalHeight);

    let yOffset = 0;
    chartsRef.current.forEach(c => {
      try {
        const map = c.takeScreenshot();
        ctx.drawImage(map, 0, yOffset, width, map.height * (width / map.width));
        yOffset += map.height * (width / map.width);
      } catch {}
    });

    const link = document.createElement('a');
    link.download = `${data?.symbol || 'chart'}_technical_${selectedRange}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ── IA Summary ─────────────────────────────────────────────────────────
  const generateIASummary = async () => {
    if (!data) return;
    setIaLoading(true);
    setIaError(null);

    const payload = {
      ticker: data.symbol,
      intervalo: data.interval,
      horizonte: data.range,
      datos_tecnicos: {
        rsi: data.rsi.length > 0 ? data.rsi[data.rsi.length - 1].value : null,
        macd_hist: data.macd.histogram.length > 0 ? data.macd.histogram[data.macd.histogram.length - 1].value : 0,
        sobre_sma50: data.candles.length > 0 && data.sma50.length > 0 && data.candles[data.candles.length - 1].close > data.sma50[data.sma50.length - 1].value,
        sobre_sma200: data.candles.length > 0 && data.sma200.length > 0 && data.candles[data.candles.length - 1].close > data.sma200[data.sma200.length - 1].value,
        sma50_sobre_sma200: data.sma50.length > 0 && data.sma200.length > 0 && data.sma50[data.sma50.length - 1].value > data.sma200[data.sma200.length - 1].value,
        bb_posicion: data.candles.length > 0 && data.bollinger.upper.length > 0 && data.bollinger.lower.length > 0
          ? (data.candles[data.candles.length - 1].close > data.bollinger.upper[data.bollinger.upper.length - 1].value 
              ? (language === 'en' ? 'above' : 'por encima')
              : data.candles[data.candles.length - 1].close < data.bollinger.lower[data.bollinger.lower.length - 1].value 
                ? (language === 'en' ? 'below' : 'por debajo')
                : (language === 'en' ? 'inside' : 'dentro'))
          : (language === 'en' ? 'inside' : 'dentro'),
        obv_tendencia: data.obv.length > 5 
          ? (data.obv[data.obv.length - 1].value > data.obv[data.obv.length - 5].value 
              ? (language === 'en' ? 'bullish' : 'alcista') 
              : (language === 'en' ? 'bearish' : 'bajista')) 
          : (language === 'en' ? 'sideways' : 'lateral'),
        señal: (t.technicalAnalysis.signals as any)[data.signal.classification] || data.signal.classification,
        puntuacion: data.signal.score,
        soporte_cercano: data.supports.length > 0 ? data.supports.reduce((prev, curr) => Math.abs(curr.price - data.candles[data.candles.length - 1].close) < Math.abs(prev.price - data.candles[data.candles.length - 1].close) ? curr : prev).price : null,
        resistencia_cercana: data.resistances.length > 0 ? data.resistances.reduce((prev, curr) => Math.abs(curr.price - data.candles[data.candles.length - 1].close) < Math.abs(prev.price - data.candles[data.candles.length - 1].close) ? curr : prev).price : null,
      }
    };

    try {
      const result = await iaService.getTechnicalSummary(payload);
      if (result.ok && result.resumen) {
        setIaResumen(result.resumen);
      } else {
        setIaError(result.error || t.technicalAnalysis.summaryGenerationError);
      }
    } catch (e: any) {
      setIaError(t.technicalAnalysis.serviceUnavailable);
    } finally {
      setIaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500 mr-3" />
        <span className="text-gray-500 dark:text-gray-400">{t.technicalAnalysis.generating}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const signalStyle = SIGNAL_COLORS[data.signal.classification];

  return (
    <div className="space-y-6">
      {/* ── Signal card ── */}
      <div className={`rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5 ${signalStyle.bg} border ${signalStyle.border} shadow-sm transition-colors duration-300`}>
        <SignalGauge score={data.signal.score} classification={(t.technicalAnalysis.signals as any)[data.signal.classification]} />
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 dark:text-white text-sm leading-relaxed">{data.signal.explanation}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {data.signal.breakdown.map((item, idx) => <BreakdownBar key={idx} item={item} />)}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-gray-500 dark:text-gray-500 leading-relaxed px-1 -mt-4 text-right">
        {t.technicalAnalysis.disclaimer}
      </p>

      {/* ── Limit Banner ── */}
      {showLimitBanner && interval && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              ⚠ {t.technicalAnalysis.dataLimitWarning.replace('{interval}', interval).replace('{days}', interval === '1m' ? '7' : '60')}
            </p>
          </div>
          <button onClick={dismissBanner} className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-500 dark:hover:text-yellow-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* ── AI Summary Module ── */}
      <div className="flex flex-col gap-4">
        {/* Generar botón */}
        <div>
          <button
            onClick={generateIASummary}
            disabled={iaLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
              iaLoading || (iaResumen && !iaError) 
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {iaLoading ? <Loader2 className="w-4 h-4 animate-spin text-purple-500" /> : <Sparkles className="w-4 h-4 text-purple-500" />}
            {iaLoading ? t.technicalAnalysis.generating : iaResumen ? t.technicalAnalysis.regenerateSummary : t.technicalAnalysis.generateSummary}
            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[10px] font-bold">
              Groq · Llama 3.3
            </span>
          </button>
        </div>

        {/* Tarjeta de Resumen */}
        {(iaLoading || iaResumen || iaError) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-500/20 p-5 relative overflow-hidden shadow-sm transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t.technicalAnalysis.aiSummary}</h4>
              </div>
              <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded text-[10px] font-bold border border-purple-200 dark:border-purple-700/40">
                Groq · Llama 3.3
              </span>
            </div>

            {iaLoading ? (
              <div className="space-y-3">
                <div className="h-3.5 bg-gray-100 dark:bg-gray-700/60 rounded animate-pulse w-full"></div>
                <div className="h-3.5 bg-gray-100 dark:bg-gray-700/60 rounded animate-pulse w-11/12"></div>
                <div className="h-3.5 bg-gray-100 dark:bg-gray-700/60 rounded animate-pulse w-4/5"></div>
              </div>
            ) : iaError ? (
              <p className="text-sm text-red-500 dark:text-red-400">{iaError}</p>
            ) : iaResumen ? (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {iaResumen.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {!iaLoading && !iaError && iaResumen && (
              <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                {t.technicalAnalysis.aiDisclaimer}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 min-w-max md:min-w-0 flex-wrap md:flex-nowrap">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mr-0.5 sm:mr-1 whitespace-nowrap">{t.technicalAnalysis.overlays}</span>
            {[
              { label: 'SMA 20', checked: showSMA20, set: setShowSMA20, color: '#93c5fd', style: 'solid' as const },
              { label: 'SMA 50', checked: showSMA50, set: setShowSMA50, color: '#fb923c', style: 'solid' as const },
              { label: 'SMA 200', checked: showSMA200, set: setShowSMA200, color: '#ef4444', style: 'solid' as const },
              { label: 'EMA 20', checked: showEMA20, set: setShowEMA20, color: '#60a5fa', style: 'dashed' as const },
              { label: 'EMA 50', checked: showEMA50, set: setShowEMA50, color: '#a78bfa', style: 'dashed' as const },
              { label: 'Bollinger', checked: showBollinger, set: setShowBollinger, color: 'rgba(100,160,255,1)', style: 'dashed' as const },
            ].map(({ label, checked, set, color, style }) => (
              <label key={label} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => set(!checked)}
                  className="rounded border-gray-300 dark:border-gray-500 text-primary-500 focus:ring-primary-500 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-gray-50 dark:bg-gray-700"
                />
                <span
                  className="w-3 sm:w-4 h-0.5 rounded opacity-90"
                  style={{
                    backgroundColor: color,
                    borderBottom: style === 'dashed' ? `2px dashed ${color}` : 'none',
                    height: style === 'dashed' ? 0 : 2,
                  }}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setShowRSI(!showRSI)} className={`flex items-center justify-center sm:justify-start gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors ${showRSI ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {showRSI ? <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <EyeOff className="w-3 sm:w-3.5 h-3 sm:h-3.5" />} <span className="hidden sm:inline">RSI</span>
            </button>
            <button onClick={() => setShowMACD(!showMACD)} className={`flex items-center justify-center sm:justify-start gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors ${showMACD ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {showMACD ? <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <EyeOff className="w-3 sm:w-3.5 h-3 sm:h-3.5" />} <span className="hidden sm:inline">MACD</span>
            </button>
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 ml-auto" />

          <button onClick={exportPNG} className="flex items-center justify-center sm:justify-start gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-auto sm:ml-0">
            <Download className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> <span className="hidden sm:inline">{t.technicalAnalysis.export}</span>
          </button>
        </div>
      </div>

      {/* ── Panel split (Charts + Hover Info) ── */}
      <div className="flex gap-4 min-w-0 overflow-hidden">
        <div ref={chartsContainerRef} className="space-y-1 flex-1 min-w-0 overflow-hidden">
          {/* Main candlestick */}
          <div className="bg-white dark:bg-gray-800 rounded-t-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative shadow-sm transition-colors min-w-0">
            <div ref={mainChartRef} className="w-full" style={{ minHeight: '250px' }} />
            {/* Side tooltip for SR */}
            {hoveredSR && (
              <div className="absolute right-14 top-4 bg-white/95 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 text-xs px-3 py-2 rounded-lg shadow-xl z-20 pointer-events-none fade-in">
                <p className={`font-bold uppercase tracking-wider mb-1 ${hoveredSR.type === 'R' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                  {hoveredSR.type === 'R' ? t.technicalAnalysis.sr.resistance : t.technicalAnalysis.sr.support}
                </p>
                <div className="text-gray-800 dark:text-gray-200 space-y-0.5 font-mono">
                  <p>$$ {hoveredSR.price.toFixed(precision)}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[10px]">{hoveredSR.date.split('T')[0]}</p>
                </div>
              </div>
            )}
          </div>
          {/* Volume */}
          {data.hasVolume && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden border-x border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors min-w-0">
              <div ref={volumeChartRef} className="w-full" style={{ minHeight: '80px' }} />
            </div>
          )}
          {/* RSI */}
          {showRSI && data.rsi.length > 0 && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden border-x border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors min-w-0">
              <div className="px-3 pt-1.5 pb-0"><span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">RSI (14)</span></div>
              <div ref={rsiChartRef} className="w-full" style={{ minHeight: '80px' }} />
            </div>
          )}
          {/* MACD */}
          {showMACD && data.macd.macdLine.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-b-xl overflow-hidden border-x border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors min-w-0">
              <div className="px-3 pt-1.5 pb-0"><span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">MACD (12, 26, 9)</span></div>
              <div ref={macdChartRef} className="w-full" style={{ minHeight: '80px' }} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
