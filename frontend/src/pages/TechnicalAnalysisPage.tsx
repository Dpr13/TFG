import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Loader2, AlertTriangle, Download, Eye, EyeOff,
} from 'lucide-react';
import { assetService } from '@services/index';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import AnalysisSummaryCard, { AnalysisVariant } from '@components/AnalysisSummaryCard';
import type { TechnicalAnalysisResult, TechnicalSignalClass, SignalBreakdown } from '../types';

// ── Lightweight Charts global ────────────────────────────────────────────
declare const LightweightCharts: any;

// ── Constants ────────────────────────────────────────────────────────────
const SIGNAL_VARIANTS: Record<TechnicalSignalClass, AnalysisVariant> = {
  'COMPRA FUERTE': 'success',
  'COMPRA':        'success',
  'NEUTRAL':       'warning',
  'VENTA':         'danger',
  'VENTA FUERTE':  'danger',
};

// ── Format helper: abbreviated numbers (OBV, Volume) ─────────────────────
function formatCompactValue(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(2) + 'B';
  if (abs >= 1_000_000)     return sign + (abs / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000)         return sign + (abs / 1_000).toFixed(1) + 'K';
  return sign + abs.toFixed(0);
}

// ── Signal Score Gauge (SVG arc) ─────────────────────────────────────────
// SignalGauge removed in favor of AnalysisSummaryCard

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
      <p className="text-[10px] text-gray-200/70 dark:text-gray-500 leading-tight">{item.detail}</p>
    </div>
  );
}

// ── Helper: parse date to Lightweight Charts format ──────────────────────
function toChartTime(dateStr: string): string {
  return dateStr.split('T')[0];
}

// ══════════════════════════════════════════════════════════════════════════
// TECHNICAL ANALYSIS PANEL — embedded inside RiskAnalysisPage as a tab
// Props: symbol + selectedRange already set by the parent page
// ══════════════════════════════════════════════════════════════════════════

interface TechnicalAnalysisPanelProps {
  symbol: string;
  selectedRange: string;
}

export default function TechnicalAnalysisPanel({ symbol, selectedRange }: TechnicalAnalysisPanelProps) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
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

  // Chart refs
  const mainChartRef = useRef<HTMLDivElement>(null);
  const volumeChartRef = useRef<HTMLDivElement>(null);
  const rsiChartRef = useRef<HTMLDivElement>(null);
  const macdChartRef = useRef<HTMLDivElement>(null);
  const chartsContainerRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<any[]>([]);

  const getSafeChartWidth = useCallback((el: HTMLElement | null) => {
    const elWidth = el?.getBoundingClientRect?.().width ?? 0;
    const containerWidth = chartsContainerRef.current?.getBoundingClientRect?.().width ?? 0;
    const viewportWidth = document.documentElement?.clientWidth || window.innerWidth || 0;
    const fallbackWidth = viewportWidth > 0 ? viewportWidth - 32 : 0;

    const width = Math.max(1, Math.floor(elWidth || containerWidth || fallbackWidth || 0));
    return viewportWidth > 0 ? Math.min(width, viewportWidth) : width;
  }, []);

  // Calculate precision based on first price
  const firstPrice = data?.candles?.[0]?.close || 0;
  const precision = firstPrice < 1 ? 6 : firstPrice < 100 ? 4 : 2;
  const minMove = 1 / Math.pow(10, precision);

  // ── Fetch data when symbol or range changes ───────────────────────────
  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    assetService.getTechnicalAnalysis(symbol, selectedRange)
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.error || err?.message || 'Error al analizar el activo');
          setData(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol, selectedRange]);

  // ── Build charts ──────────────────────────────────────────────────────

  const buildCharts = useCallback(() => {
    if (!data || typeof LightweightCharts === 'undefined') return;

    // Clean up
    chartsRef.current.forEach(c => { try { c.remove(); } catch {} });
    chartsRef.current = [];

    const isMobile = window.innerWidth < 768;
    const mainHeight = isMobile ? 250 : 420;
    const subHeight = isMobile ? 80 : 120;

    const chartTheme = darkMode ? {
      layout: { background: { color: '#1f2937' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#4b5563' },
      timeScale: { borderColor: '#4b5563', timeVisible: false },
    } : {
      layout: { background: { color: '#ffffff' }, textColor: '#4b5563' },
      grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#e5e7eb' },
      timeScale: { borderColor: '#e5e7eb', timeVisible: false },
    };

    const candles = data.candles.map(c => ({
      time: toChartTime(c.date),
      open: c.open, high: c.high, low: c.low, close: c.close,
    }));

    const lastClose = data.candles.length > 0 ? data.candles[data.candles.length - 1].close : 0;

    // ── Main Chart ──
    if (mainChartRef.current) {
      mainChartRef.current.innerHTML = '';
      const containerWidth = getSafeChartWidth(mainChartRef.current);
      
      const chart = LightweightCharts.createChart(mainChartRef.current, {
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

      // ── Moving Average Overlays (hide axis labels to reduce clutter) ──
      if (showSMA20 && data.sma20.length > 0) {
        const s = chart.addLineSeries({ color: '#93c5fd', lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
        s.setData(data.sma20.map(p => ({ time: toChartTime(p.time), value: p.value })));
      }
      if (showSMA50 && data.sma50.length > 0) {
        const s = chart.addLineSeries({ color: '#fb923c', lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
        s.setData(data.sma50.map(p => ({ time: toChartTime(p.time), value: p.value })));
      }
      if (showSMA200 && data.sma200.length > 0) {
        const s = chart.addLineSeries({ color: '#ef4444', lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
        s.setData(data.sma200.map(p => ({ time: toChartTime(p.time), value: p.value })));
      }
      if (showEMA20 && data.ema20.length > 0) {
        const s = chart.addLineSeries({ color: '#60a5fa', lineWidth: 1, lineStyle: 1, lastValueVisible: false, priceLineVisible: false });
        s.setData(data.ema20.map(p => ({ time: toChartTime(p.time), value: p.value })));
      }
      if (showEMA50 && data.ema50.length > 0) {
        const s = chart.addLineSeries({ color: '#a78bfa', lineWidth: 1, lineStyle: 1, lastValueVisible: false, priceLineVisible: false });
        s.setData(data.ema50.map(p => ({ time: toChartTime(p.time), value: p.value })));
      }

      // ── Bollinger Bands (brighter, dashed, with area fill) ──
      if (showBollinger && data.bollinger.upper.length > 0) {
        const sUp = chart.addLineSeries({
          color: 'rgba(100, 160, 255, 0.9)', lineWidth: 1, lineStyle: 2,
          lastValueVisible: false, priceLineVisible: false,
        });
        sUp.setData(data.bollinger.upper.map(p => ({ time: toChartTime(p.time), value: p.value })));

        const sLow = chart.addLineSeries({
          color: 'rgba(100, 160, 255, 0.9)', lineWidth: 1, lineStyle: 2,
          lastValueVisible: false, priceLineVisible: false,
        });
        sLow.setData(data.bollinger.lower.map(p => ({ time: toChartTime(p.time), value: p.value })));

        // Area fill between bands using areaSeries on upper band
        const fillSeries = chart.addAreaSeries({
          topColor: 'rgba(100, 160, 255, 0.12)',
          bottomColor: 'rgba(100, 160, 255, 0.04)',
          lineColor: 'rgba(0,0,0,0)',
          lineWidth: 0,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        fillSeries.setData(data.bollinger.upper.map(p => ({ time: toChartTime(p.time), value: p.value })));
      }

      // ── Support / Resistance — max 2 closest to price, hidden axis labels ──
      const sortByProximity = (levels: typeof data.supports) =>
        [...levels].sort((a, b) => Math.abs(a.price - lastClose) - Math.abs(b.price - lastClose)).slice(0, 2);

      sortByProximity(data.supports).forEach(level => {
        candleSeries.createPriceLine({
          price: level.price,
          color: '#22c55e',
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: false,
          title: `S ${level.price.toFixed(precision)}`,
        });
      });
      sortByProximity(data.resistances).forEach(level => {
        candleSeries.createPriceLine({
          price: level.price,
          color: '#ef4444',
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: false,
          title: `R ${level.price.toFixed(precision)}`,
        });
      });

      // Legend on crosshair
      const legendEl = document.createElement('div');
      legendEl.style.cssText = `position:absolute;top:8px;left:12px;z-index:10;font-size:11px;color:${darkMode ? '#d1d5db' : '#4b5563'};pointer-events:none;font-family:monospace;`;
      mainChartRef.current.style.position = 'relative';
      mainChartRef.current.appendChild(legendEl);

      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !param.seriesData) {
          legendEl.textContent = '';
          return;
        }
        const d = param.seriesData.get(candleSeries);
        if (d) {
          const vol = data.candles.find(c => toChartTime(c.date) === param.time as string)?.volume;
          legendEl.textContent = `O: ${d.open?.toFixed(precision)}  H: ${d.high?.toFixed(precision)}  L: ${d.low?.toFixed(precision)}  C: ${d.close?.toFixed(precision)}  V: ${vol != null ? formatCompactValue(vol) : '-'}`;
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
          formatter: (price: number) => formatCompactValue(price),
        },
        priceScaleId: 'vol',
      });
      volumeSeries.setData(data.candles.map(c => ({
        time: toChartTime(c.date),
        value: c.volume,
        color: c.close >= c.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)',
      })));

      // OBV line with custom formatter
      if (data.obv.length > 0) {
        const obvSeries = chart.addLineSeries({
          color: '#818cf8', lineWidth: 1, title: 'OBV',
          priceScaleId: 'obv',
          priceFormat: {
            type: 'custom',
            formatter: (price: number) => formatCompactValue(price),
          },
        });
        chart.priceScale('obv').applyOptions({
          scaleMargins: { top: 0.1, bottom: 0.1 },
        });
        obvSeries.setData(data.obv.map(p => ({ time: toChartTime(p.time), value: p.value })));
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
        height: subHeight,
      });
      chartsRef.current.push(chart);

      const rsiSeries = chart.addLineSeries({ color: '#a78bfa', lineWidth: 1.5, title: 'RSI(14)' });
      rsiSeries.setData(data.rsi.map(p => ({ time: toChartTime(p.time), value: p.value })));

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
        height: subHeight,
      });
      chartsRef.current.push(chart);

      const histSeries = chart.addHistogramSeries({ priceScaleId: 'macd', title: 'Hist' });
      histSeries.setData(data.macd.histogram.map(p => ({
        time: toChartTime(p.time),
        value: p.value,
        color: p.value >= 0 ? 'rgba(38,166,154,0.7)' : 'rgba(239,83,80,0.7)',
      })));

      const macdLine = chart.addLineSeries({ color: '#60a5fa', lineWidth: 1.5, title: 'MACD', priceScaleId: 'macd' });
      macdLine.setData(data.macd.macdLine.map(p => ({ time: toChartTime(p.time), value: p.value })));

      const sigLine = chart.addLineSeries({ color: '#fb923c', lineWidth: 1, title: 'Signal', priceScaleId: 'macd' });
      sigLine.setData(data.macd.signalLine.map(p => ({ time: toChartTime(p.time), value: p.value })));

      macdLine.createPriceLine({ price: 0, color: '#6b7280', lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: '' });
      chart.priceScale('macd').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      chart.timeScale().fitContent();
    }

    // ── Sync time scales ──
    if (chartsRef.current.length > 1) {
      const primary = chartsRef.current[0];
      chartsRef.current.slice(1).forEach(ch => {
        primary.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
          if (range) ch.timeScale().setVisibleLogicalRange(range);
        });
        ch.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
          if (range) primary.timeScale().setVisibleLogicalRange(range);
        });
      });
    }
  }, [data, showSMA20, showSMA50, showSMA200, showEMA20, showEMA50, showBollinger, showRSI, showMACD, darkMode, getSafeChartWidth]);

  useEffect(() => {
    buildCharts();
    return () => {
      chartsRef.current.forEach(c => { try { c.remove(); } catch {} });
      chartsRef.current = [];
    };
  }, [buildCharts]);

  // Resize handler
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

  // ── Export PNG ─────────────────────────────────────────────────────────
  const exportPNG = () => {
    if (!chartsContainerRef.current) return;
    const totalHeight = Array.from(chartsContainerRef.current.children).reduce((h, el) => h + (el as HTMLElement).offsetHeight, 0);
    const width = (chartsContainerRef.current.firstElementChild as HTMLElement)?.offsetWidth || 800;

    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = width * 2;
    mergedCanvas.height = totalHeight * 2;
    const ctx = mergedCanvas.getContext('2d')!;
    ctx.scale(2, 2);
    ctx.fillStyle = darkMode ? '#1f2937' : '#ffffff';
    ctx.fillRect(0, 0, width, totalHeight);

    let yOffset = 0;
    chartsRef.current.forEach(chart => {
      try {
        const canvas = chart.takeScreenshot();
        ctx.drawImage(canvas, 0, yOffset, width, canvas.height * (width / canvas.width));
        yOffset += canvas.height * (width / canvas.width);
      } catch {}
    });

    const link = document.createElement('a');
    link.download = `${data?.symbol || 'chart'}_technical_${selectedRange}.png`;
    link.href = mergedCanvas.toDataURL('image/png');
    link.click();
  };

  // ── Render ─────────────────────────────────────────────────────────────

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

  if (!data) {
    return (
      <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">{t.technicalAnalysis.noData}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Signal card ── */}
      <AnalysisSummaryCard
        score={data.signal.score}
        classification={data.signal.classification}
        explanation={data.signal.explanation}
        variant={SIGNAL_VARIANTS[data.signal.classification]}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {data.signal.breakdown.map((item, idx) => (
            <BreakdownBar key={idx} item={item} />
          ))}
        </div>
      </AnalysisSummaryCard>

      {/* Legal disclaimer */}
      <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed px-1">
        {t.technicalAnalysis.signalDisclaimer}
      </p>

      {/* ── Controls bar ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 p-4 min-w-max md:min-w-0">
          {/* MA checkboxes */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Medias:</span>
            {[
              { label: 'SMA 20', checked: showSMA20, set: setShowSMA20, color: '#93c5fd', style: 'solid' as const },
              { label: 'SMA 50', checked: showSMA50, set: setShowSMA50, color: '#fb923c', style: 'solid' as const },
              { label: 'SMA 200', checked: showSMA200, set: setShowSMA200, color: '#ef4444', style: 'solid' as const },
              { label: 'EMA 20', checked: showEMA20, set: setShowEMA20, color: '#60a5fa', style: 'dashed' as const },
              { label: 'EMA 50', checked: showEMA50, set: setShowEMA50, color: '#a78bfa', style: 'dashed' as const },
              { label: 'Bollinger', checked: showBollinger, set: setShowBollinger, color: 'rgba(100,160,255,0.9)', style: 'dashed' as const },
            ].map(({ label, checked, set, color, style }) => (
              <label key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => set(!checked)}
                  className="rounded border-gray-300 dark:border-gray-500 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <span
                  className="w-4 h-0.5 rounded"
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

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Panel toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showRSI ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {showRSI ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              RSI
            </button>
            <button
              onClick={() => setShowMACD(!showMACD)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showMACD ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {showMACD ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              MACD
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Export */}
          <button
            onClick={exportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar PNG
          </button>
        </div>
      </div>

      {/* ── Charts area ── */}
      <div ref={chartsContainerRef} className="space-y-1 min-w-0 overflow-hidden">
        {/* Main candlestick chart */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-colors min-w-0">
          <div ref={mainChartRef} className="w-full" style={{ minHeight: '250px' }} />
        </div>

        {/* Volume chart */}
        {data.hasVolume && (
          <div className="bg-white dark:bg-gray-800 overflow-hidden border-x border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors min-w-0">
            <div ref={volumeChartRef} className="w-full" style={{ minHeight: '80px' }} />
          </div>
        )}

        {/* RSI chart */}
        {showRSI && data.rsi.length > 0 && (
          <div className="bg-white dark:bg-gray-800 overflow-hidden border-x border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors min-w-0">
            <div className="px-3 pt-1.5 pb-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">RSI (14)</span>
            </div>
            <div ref={rsiChartRef} className="w-full" style={{ minHeight: '80px' }} />
          </div>
        )}

        {/* MACD chart */}
        {showMACD && data.macd.macdLine.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-b-xl overflow-hidden border-x border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors min-w-0">
            <div className="px-3 pt-1.5 pb-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">MACD (12, 26, 9)</span>
            </div>
            <div ref={macdChartRef} className="w-full" style={{ minHeight: '80px' }} />
          </div>
        )}
      </div>

      {/* ── Support / Resistance table ── */}
      {(data.supports.length > 0 || data.resistances.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
            {t.technicalAnalysis.sr.title}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supports */}
            <div>
              <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">{t.technicalAnalysis.sr.supports}</p>
              {data.supports.length === 0 ? (
                <p className="text-xs text-gray-500">{t.technicalAnalysis.sr.noSupports}</p>
              ) : (
                <div className="space-y-1.5">
                  {data.supports.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 rounded-lg px-3 py-2 border border-green-100 dark:border-transparent">
                      <span className="text-sm font-mono font-semibold text-green-600 dark:text-green-400">${s.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{s.date.split('T')[0]}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{t.technicalAnalysis.sr.strength} {s.strength}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Resistances */}
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">{t.technicalAnalysis.sr.resistances}</p>
              {data.resistances.length === 0 ? (
                <p className="text-xs text-gray-500">{t.technicalAnalysis.sr.noResistances}</p>
              ) : (
                <div className="space-y-1.5">
                  {data.resistances.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-red-50 dark:bg-red-900/10 rounded-lg px-3 py-2 border border-red-100 dark:border-transparent">
                      <span className="text-sm font-mono font-semibold text-red-600 dark:text-red-400">${r.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.date.split('T')[0]}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{t.technicalAnalysis.sr.strength} {r.strength}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
