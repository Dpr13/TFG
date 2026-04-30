import { useState, useRef, useEffect, useCallback } from 'react';
import { Target, Loader2, AlertTriangle, LayoutTemplate, ChevronDown, ChevronUp, Send, Trash2, Sparkles, Bot } from 'lucide-react';
import SymbolAutocomplete from '../components/SymbolAutocomplete';
import { recommendationService, iaService } from '@services/index';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@utils/format';
import type { RecommendationRequest, RecommendationResult, SLMethod, TPMethod, IAChatMessage } from '../types';

// Lightweight Charts global
declare const LightweightCharts: any;

const QUICK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY'];
const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d', '1wk', '1mo'] as const;

export default function RecommendationPage() {
  const { darkMode } = useTheme();
  const { t, language } = useLanguage();
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  // Precision calculation
  const precision = result?.entryPrice && result.entryPrice < 1 ? 6 : (result?.entryPrice && result.entryPrice < 100 ? 4 : 2);
  const minMove = 1 / Math.pow(10, precision);

  // Form State
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [interval, setInterval] = useState<string>('1d');
  const [slMethod, setSlMethod] = useState<SLMethod>('FIXED_PCT');
  const [slPct, setSlPct] = useState<string>('2');
  const [tpMethods, setTpMethods] = useState<TPMethod[]>(['RISK_REWARD']);
  const [rrRatio, setRrRatio] = useState<string>('2');
  const [capital, setCapital] = useState<string>('10000');
  const [riskPct, setRiskPct] = useState<string>('1');
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('USD');

  // Charts
  const mainChartRef = useRef<HTMLDivElement>(null);
  const volumeChartRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<any[]>([]);
  const isCalculatingRef = useRef(false);

  // Toggles
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);

  // IA Module State
  const [iaResumen, setIaResumen] = useState<string | null>(null);
  const [iaJustificacion, setIaJustificacion] = useState<string | null>(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResumenError, setIaResumenError] = useState<string | null>(null);
  const [iaJustificacionError, setIaJustificacionError] = useState<string | null>(null);
  const [showJustificacion, setShowJustificacion] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<IAChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSuggestionsVisible, setChatSuggestionsVisible] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatContextRef = useRef<any>(null);
  const [showBollinger, setShowBollinger] = useState(true);

  // Recalculate Risk if capital or riskPct change (without reloading all data)
  useEffect(() => {
    if (loading) return;

    const capNum = parseFloat(capital);
    const riskNum = parseFloat(riskPct);
    
    if (!isNaN(capNum) && !isNaN(riskNum) && capNum > 0 && riskNum > 0 && riskNum <= 100) {
      setResult((prev: RecommendationResult | null) => {
        if (!prev) return prev;
        
        const moneyAtRisk = capNum * (riskNum / 100);
        let posSize = 0;
        if (prev.slDistanceAbs > 0) {
          posSize = moneyAtRisk / prev.slDistanceAbs;
        }
        const positionValue = posSize * prev.entryPrice;
        
        const warnings = prev.warnings.filter((w: string) => !w.includes(t.recommendation.insufficientCapital));
        if (positionValue > capNum) {
          warnings.push(t.recommendation.insufficientCapital);
        }

        const sameRisk = prev.riskManagement.moneyAtRisk === moneyAtRisk &&
                         prev.riskManagement.positionSize === posSize &&
                         prev.riskManagement.positionValue === positionValue &&
                         prev.riskManagement.riskPctUsed === riskNum;
        const sameCurrency = prev.currency === currency;
        const sameWarnings = warnings.length === prev.warnings.length && 
                             warnings.every((w, i) => w === prev.warnings[i]);

        if (sameRisk && sameCurrency && sameWarnings) {
          return prev;
        }

        const r = { ...prev };
        r.riskManagement = { ...r.riskManagement, moneyAtRisk, positionSize: posSize, positionValue, riskPctUsed: riskNum };
        r.currency = currency;
        r.warnings = warnings;

        r.tps = r.tps.map((tp: any) => ({
          ...tp,
          potentialProfit: posSize * tp.distanceAbs
        }));
        
        return r;
      });
    }
  }, [capital, riskPct, currency, loading]);

  // If SL or TP method changes, we MUST fetch from backend again to get the proper levels
  // We'll auto-fetch if we already have a result and nothing is currently being calculated.
  useEffect(() => {
    if (result && !loading && !isCalculatingRef.current && symbol === result.symbol) {
      calculate();
    }
  }, [direction, slMethod, slPct, tpMethods, rrRatio, interval]);

  const toggleTpMethod = (method: TPMethod) => {
    setTpMethods(prev => {
      if (prev.includes(method)) {
         return prev.length > 1 ? prev.filter(m => m !== method) : prev;
      }
      return [...prev, method];
    });
  };

  const calculate = async (symToUse: string = symbol) => {
    const s = symToUse.trim().toUpperCase();
    if (!s || isCalculatingRef.current) return;
    
    setSymbol(s);
    setLoading(true);
    isCalculatingRef.current = true;
    setError(null);

    try {
      const capNum = parseFloat(capital) || 10000;
      const riskNum = parseFloat(riskPct) || 1;
      const parsedSlPct = parseFloat(slPct) || 2;
      const parsedRrRatio = parseFloat(rrRatio) || 2;

      const req: RecommendationRequest = {
        symbol: s,
        direction,
        interval,
        slMethod,
        slPct: parsedSlPct,
        tpMethods,
        rrRatio: parsedRrRatio,
        capital: capNum,
        riskPct: riskNum,
        currency,
      };

      const res = await recommendationService.calculate(req);
      setResult(res);

      // Fire AI analysis in parallel
      window.dispatchEvent(new CustomEvent('activoAnalizado', { detail: { ticker: s } }));
      setIaLoading(true);
      setIaResumen(null);
      setIaJustificacion(null);
      setIaResumenError(null);
      setIaJustificacionError(null);

      // Build context for IA
      const signal = res.signal;
      const lastRsi = signal?.breakdown?.find((b: any) => b.name === 'RSI');
      const rsiVal = lastRsi ? parseFloat(lastRsi.detail.match(/RSI ([\d.]+)/)?.[1] || '50') : 50;
      const macdBreakdown = signal?.breakdown?.find((b: any) => b.name === 'MACD');
      const macdHist = macdBreakdown ? (macdBreakdown.detail.includes('positivo') ? 1 : -1) : 0;
      const smaBreakdown = signal?.breakdown?.find((b: any) => b.name === 'Medias Móviles');
      const sobre_sma50 = smaBreakdown ? smaBreakdown.detail.includes('Precio > SMA50') : false;
      const sobre_sma200 = smaBreakdown ? smaBreakdown.detail.includes('Precio > SMA200') : false;
      const bbBreakdown = signal?.breakdown?.find((b: any) => b.name === 'Bandas de Bollinger');
      const bb_posicion = bbBreakdown ? (bbBreakdown.detail.includes('por encima') ? 'sobre' : bbBreakdown.detail.includes('por debajo') ? 'bajo' : 'dentro') : 'dentro';
      const obvBreakdown = signal?.breakdown?.find((b: any) => b.name === 'Volumen / OBV');
      const obv_tendencia = obvBreakdown ? (obvBreakdown.detail.includes('alcista') ? 'alcista' : obvBreakdown.detail.includes('bajista') ? 'bajista' : 'lateral') : 'lateral';

      const soporteCercano = res.supports?.length > 0
        ? res.supports.filter((s: any) => s.price < res.entryPrice).sort((a: any, b: any) => b.price - a.price)[0]?.price ?? null
        : null;
      const resistenciaCercana = res.resistances?.length > 0
        ? res.resistances.filter((r: any) => r.price > res.entryPrice).sort((a: any, b: any) => a.price - b.price)[0]?.price ?? null
        : null;

      const iaPayload = {
        ticker: s,
        direccion: direction,
        intervalo: interval,
        horizonte: interval,
        precio_entrada: res.entryPrice,
        sl: res.sl,
        metodo_sl: res.slMethodLabel,
        tps: res.tps.map((tp: any) => ({ precio: tp.price, metodo: tp.label })),
        tps_detalle: res.tps.map((tp: any) => ({
          precio: tp.price,
          metodo: tp.label,
          pct: tp.distancePct,
          ratio: tp.realRatio,
        })),
        risk_management: {
          capital_total: parseFloat(capital) || 10000,
          riesgo_pct: parseFloat(riskPct) || 1,
          capital_riesgo: res.riskManagement.moneyAtRisk,
          tamano_posicion: res.riskManagement.positionSize,
          valor_posicion: res.riskManagement.positionValue,
        },
        datos_tecnicos: {
          rsi: rsiVal,
          macd_hist: macdHist,
          sobre_sma50,
          sobre_sma200,
          señal: signal?.classification || 'NEUTRAL',
          puntuacion: signal?.score || 0,
          bb_posicion,
          obv_tendencia,
          soporte_cercano: soporteCercano,
          resistencia_cercana: resistenciaCercana,
        },
        datos_fundamentales: {},
        lang: language,
      };

      chatContextRef.current = iaPayload;
        .then((iaRes) => {
          setIaResumen(iaRes.resumen);
          setIaJustificacion(iaRes.justificacion);
          if (iaRes.resumenError) setIaResumenError(iaRes.resumenError);
          if (iaRes.justificacionError) setIaJustificacionError(iaRes.justificacionError);
        })
        .catch(() => {
          setIaResumenError(t.recommendation.iaUnavailable);
          setIaJustificacionError(t.recommendation.iaUnavailable);
        })
        .finally(() => setIaLoading(false));

    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || t.recommendation.calculationError);
      if (err?.response?.data?.error?.includes('suficientes datos')) {
        setResult(null);
      }
    } finally {
      setLoading(false);
      isCalculatingRef.current = false;
    }
  };

  // --------------------------------------------------------------------------------
  // CHARTS
  // --------------------------------------------------------------------------------
  
  const isIntraday = ['1m', '5m', '15m', '1h', '4h'].includes(interval || '1d');

  const toChartTime = (dateStr: string, intraday: boolean = false): string | number => {
    if (intraday) {
      return Math.floor(Date.parse(dateStr) / 1000);
    }
    return dateStr.split('T')[0];
  };

  const buildCharts = useCallback(() => {
    if (!result || typeof LightweightCharts === 'undefined') return;

    chartsRef.current.forEach(c => { try { c.remove(); } catch {} });
    chartsRef.current = [];

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

    const uniqueDates = new Set();
    const candles = (result.candles || [])
      .filter((c: any) => c.date != null && c.open != null && c.high != null && c.low != null && c.close != null)
      .map((c: any) => ({
        time: toChartTime(c.date, isIntraday),
        open: Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close),
      }))
      .filter((c: any) => !isNaN(c.open) && !isNaN(c.high) && !isNaN(c.low) && !isNaN(c.close))
      .filter((c: any) => {
        if (uniqueDates.has(c.time)) return false;
        uniqueDates.add(c.time);
        return true;
      })
      .sort((a: any, b: any) => {
        const timeA = typeof a.time === 'number' ? a.time * 1000 : new Date(a.time).getTime();
        const timeB = typeof b.time === 'number' ? b.time * 1000 : new Date(b.time).getTime();
        return timeA - timeB;
      });

    if (mainChartRef.current) {
      if (candles.length === 0) return;

      const isMobile = window.innerWidth < 768;
      const chartHeight = isMobile ? 350 : 500;
      
      mainChartRef.current.innerHTML = '';
      const chartWrapper = document.createElement('div');
      chartWrapper.style.position = 'relative';
      chartWrapper.style.width = '100%';
      chartWrapper.style.height = `${chartHeight}px`;
      mainChartRef.current.appendChild(chartWrapper);

      const chart = LightweightCharts.createChart(chartWrapper, {
        ...chartTheme,
        width: chartWrapper.clientWidth || mainChartRef.current.clientWidth || 800,
        height: chartHeight,
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

      const filterAndSort = (data: any[]) => {
        const tSet = new Set();
        return (data || [])
          .filter(p => p.time != null && p.value != null && !isNaN(p.value))
          .map(p => ({ time: toChartTime(p.time, isIntraday), value: Number(p.value) }))
          .filter(p => {
             if (tSet.has(p.time)) return false;
             tSet.add(p.time);
             return true;
          })
          .sort((a, b) => {
            const timeA = typeof a.time === 'number' ? (a.time as number) * 1000 : new Date(a.time).getTime();
            const timeB = typeof b.time === 'number' ? (b.time as number) * 1000 : new Date(b.time).getTime();
            return timeA - timeB;
          });
      };

      // Overlays
      if (showSMA50 && result.sma50) {
        const data = filterAndSort(result.sma50);
        if (data.length > 0) {
          const s = chart.addLineSeries({ color: '#fb923c', lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
          s.setData(data);
        }
      }
      if (showSMA200 && result.sma200) {
        const data = filterAndSort(result.sma200);
        if (data.length > 0) {
          const s = chart.addLineSeries({ color: '#ef4444', lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
          s.setData(data);
        }
      }
      if (showBollinger && result.bollingerData) {
        const upper = filterAndSort(result.bollingerData.upper);
        const lower = filterAndSort(result.bollingerData.lower);
        if (upper.length > 0) {
          const sUp = chart.addLineSeries({
            color: 'rgba(100, 160, 255, 0.9)', lineWidth: 1, lineStyle: 2,
            lastValueVisible: false, priceLineVisible: false,
          });
          sUp.setData(upper);
        }
        if (lower.length > 0) {
          const sLow = chart.addLineSeries({
            color: 'rgba(100, 160, 255, 0.9)', lineWidth: 1, lineStyle: 2,
            lastValueVisible: false, priceLineVisible: false,
          });
          sLow.setData(lower);
        }
      }

      // SL, TP, Entry Lines
      if (result.entryPrice != null && !isNaN(result.entryPrice)) {
        candleSeries.createPriceLine({
          price: result.entryPrice,
          color: darkMode ? '#ffffff' : '#1f2937',
          lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Entrada $${result.entryPrice.toFixed(precision)}`,
        });
      }

      if (result.sl != null && !isNaN(result.sl)) {
        candleSeries.createPriceLine({
          price: result.sl,
          color: '#ef4444',
          lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Solid,
          axisLabelVisible: true,
          title: `SL $${result.sl.toFixed(precision)} (-${result.slDistancePct.toFixed(1)}%)`,
        });
      }

      (result.tps || []).forEach((tp: any, i: number) => {
        if (tp.price != null && !isNaN(tp.price)) {
          candleSeries.createPriceLine({
            price: tp.price,
            color: '#22c55e',
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Solid,
            axisLabelVisible: true,
            title: `TP${i+1} $${tp.price.toFixed(precision)} (+${tp.distancePct.toFixed(1)}%)`,
          });
        }
      });

      // Support & Resistance levels as dashed lines
      if (result.supports?.length > 0) {
        result.supports.forEach((s: any) => {
          if (s.price != null && !isNaN(s.price)) {
            candleSeries.createPriceLine({
              price: s.price,
              color: '#3b82f6',
              lineWidth: 1,
              lineStyle: LightweightCharts.LineStyle.Dotted,
              axisLabelVisible: false,
              title: `S $${s.price.toFixed(precision)}`,
            });
          }
        });
      }
      if (result.resistances?.length > 0) {
        result.resistances.forEach((r: any) => {
          if (r.price != null && !isNaN(r.price)) {
            candleSeries.createPriceLine({
              price: r.price,
              color: '#f97316',
              lineWidth: 1,
              lineStyle: LightweightCharts.LineStyle.Dotted,
              axisLabelVisible: false,
              title: `R $${r.price.toFixed(precision)}`,
            });
          }
        });
      }

      // Shaded Areas for SL and TPs (Wait: LightweightCharts doesn't support drawing box areas naturally,
      // but we can use fill series trick like Bollinger, though it requires historical points matching entry value.
      // Easiest approximation is not to shade horizontally over whole chart, 
      // or to just skip the shaded area feature and stick to lines as standard LightweightCharts behavior.)

      const legendEl = document.createElement('div');
      legendEl.style.cssText = 'position:absolute;top:8px;left:12px;z-index:10;font-size:11px;color:#d1d5db;pointer-events:none;font-family:monospace;';
      chartWrapper.appendChild(legendEl);

      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !param.seriesData) {
          legendEl.textContent = '';
          return;
        }
        const d = param.seriesData.get(candleSeries);
        if (d) {
          legendEl.textContent = `O: ${d.open?.toFixed(precision)}  H: ${d.high?.toFixed(precision)}  L: ${d.low?.toFixed(precision)}  C: ${d.close?.toFixed(precision)}`;
        }
      });

      chart.timeScale().fitContent();
    }
  }, [result, showSMA50, showSMA200, showBollinger, darkMode, isIntraday]);

  useEffect(() => {
    buildCharts();
    return () => {
      chartsRef.current.forEach(c => { try { c.remove(); } catch {} });
      chartsRef.current = [];
    };
  }, [buildCharts]);

  useEffect(() => {
    const handleResize = () => {
      chartsRef.current.forEach((chart, idx) => {
        const refs = [mainChartRef, volumeChartRef];
        const ref = refs[idx];
        if (ref?.current) chart.applyOptions({ width: ref.current.clientWidth });
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const clearAndWait = (sym: string) => {
    setSymbol(sym);
    setResult(null);
    setError(null);
    setIaResumen(null);
    setIaJustificacion(null);
    setIaResumenError(null);
    setIaJustificacionError(null);
    setChatMessages([]);
    setChatSuggestionsVisible(true);
    chatContextRef.current = null;
  };

  // ── Chat Functions ───────────────────────────────────────────────────

  const sendChatMessage = async (msg: string) => {
    const trimmed = msg.trim();
    if (!trimmed || chatLoading || !chatContextRef.current) return;

    setChatSuggestionsVisible(false);
    const userMsg: IAChatMessage = { role: 'user', content: trimmed };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const historial = [...chatMessages, userMsg].slice(-10);
      const res = await iaService.chat({
        contexto: chatContextRef.current,
        historial,
        mensaje: trimmed,
      });
      const assistantMsg: IAChatMessage = { role: 'assistant', content: res.respuesta };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: IAChatMessage = { role: 'assistant', content: 'El servicio de IA no está disponible en este momento. Inténtalo de nuevo.' };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setChatSuggestionsVisible(true);
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const CHAT_SUGGESTIONS = t.recommendation.chatSuggestions;


  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.recommendation.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t.recommendation.subtitle}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* ── BLOQUE 1: CONFIGURACIÓN ── */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-6">
            
            {/* Buscador */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.recommendation.financialAsset}</label>
              <SymbolAutocomplete
                value={symbol}
                onChange={(sym) => {
                  if (sym && sym !== symbol) {
                    clearAndWait(sym);
                  } else if (!sym) {
                    setResult(null);
                    setSymbol('');
                  }
                }}
                onSubmit={() => calculate()}
                placeholder={t.recommendation.searchPlaceholder}
                showSearchIcon
                inputClassName="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />

              {/* Popular / Watchlist Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">{t.recommendation.popular}:</span>
                {QUICK_SYMBOLS.slice(0,4).map((s) => (
                  <button key={s} onClick={() => clearAndWait(s)}
                    className="px-2 py-0.5 text-[10px] font-medium rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.recommendation.tradeDirection}</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <button
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${direction === 'LONG' ? 'bg-green-600 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  onClick={() => setDirection('LONG')}
                >
                  {t.recommendation.long}
                </button>
                <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                <button
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${direction === 'SHORT' ? 'bg-red-600 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  onClick={() => setDirection('SHORT')}
                >
                  {t.recommendation.short}
                </button>
              </div>
            </div>

            {/* Intervalo */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.recommendation.timeframe}</label>
              <div className="flex flex-wrap gap-2">
                {INTERVALS.map((inv) => (
                  <button
                    key={inv}
                    onClick={() => { setInterval(inv); setResult(null); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      interval === inv
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {inv}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Stop Loss */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.recommendation.slMethod}</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="radio" checked={slMethod === 'FIXED_PCT'} onChange={() => setSlMethod('FIXED_PCT')} className="text-primary-600 focus:ring-primary-500" />
                  {t.recommendation.fixedPct}
                </label>
                {slMethod === 'FIXED_PCT' && (
                  <div className="ml-6 flex items-center gap-2">
                    <input type="number" step="0.1" min="0.1" max="20" value={slPct} onChange={e => setSlPct(e.target.value)}
                           className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-white focus:ring-primary-500" />
                    <span className="text-sm text-gray-400">%</span>
                  </div>
                )}
                
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="radio" checked={slMethod === 'SUPPORT_RESISTANCE'} onChange={() => setSlMethod('SUPPORT_RESISTANCE')} className="text-primary-600 focus:ring-primary-500" />
                  {direction === 'LONG' ? t.recommendation.closestSupport : t.recommendation.closestResistance}
                </label>
                
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="radio" checked={slMethod === 'DYNAMIC_ATR'} onChange={() => setSlMethod('DYNAMIC_ATR')} className="text-primary-600 focus:ring-primary-500" />
                  {t.recommendation.dynamicATR}
                  <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 rounded text-[9px] font-bold border border-primary-200 dark:border-primary-800/40 ml-1">
                    {t.recommendation.recommended}
                  </span>
                </label>
              </div>
            </div>

            {/* Take Profit */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.recommendation.tpMethods}</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={tpMethods.includes('RISK_REWARD')} onChange={() => toggleTpMethod('RISK_REWARD')} className="rounded text-primary-600 focus:ring-primary-500" />
                  {t.recommendation.riskRewardRatio}
                </label>
                {tpMethods.includes('RISK_REWARD') && (
                  <div className="ml-6 flex flex-wrap gap-2">
                    {['1','1.5','2','2.5','3'].map(r => (
                      <button key={r} onClick={() => setRrRatio(r)}
                        className={`px-2 py-1 text-xs rounded border ${rrRatio === r ? 'bg-primary-600 text-white border-primary-600' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-500'}`}>
                        1:{r}
                      </button>
                    ))}
                    <input type="number" step="0.1" placeholder="Custom" value={rrRatio !== '1' && rrRatio !== '1.5' && rrRatio !== '2' && rrRatio !== '2.5' && rrRatio !== '3' ? rrRatio : ''} 
                           onChange={e => setRrRatio(e.target.value)}
                           className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-xs text-white" />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={tpMethods.includes('SUPPORT_RESISTANCE')} onChange={() => toggleTpMethod('SUPPORT_RESISTANCE')} className="rounded text-primary-600 focus:ring-primary-500" />
                  {direction === 'LONG' ? t.recommendation.closestResistance : t.recommendation.closestSupport}
                </label>
                
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={tpMethods.includes('BOLLINGER')} onChange={() => toggleTpMethod('BOLLINGER')} className="rounded text-primary-600 focus:ring-primary-500" />
                  {t.recommendation.bollingerBands}
                </label>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Gestión del Riesgo */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                <span>{t.recommendation.riskManagement}</span>
                <select value={currency} onChange={e => setCurrency(e.target.value as 'EUR'|'USD')} className="bg-transparent text-xs font-bold text-gray-400 outline-none">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">{t.recommendation.totalCapital}</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{currency==='USD'?'$':'€'}</span>
                    <input type="number" min="1" step="100" value={capital} onChange={e => setCapital(e.target.value)}
                           className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-primary-500 text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">{t.recommendation.riskPerTrade}</label>
                  <div className="relative mt-1">
                    <input type="number" min="0.1" step="0.1" max="100" value={riskPct} onChange={e => setRiskPct(e.target.value)}
                           className="w-full pl-3 pr-7 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-primary-500 text-white" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón */}
            <button
              onClick={() => calculate()}
              disabled={loading || !symbol.trim()}
              className="w-full py-3.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
              {result && symbol === result.symbol ? t.recommendation.recalculateLevels : t.recommendation.calculateLevels}
            </button>
            
          </div>
        </div>


        {/* ── BLOQUE 2 & 3: RESULTADOS Y GRÁFICO ── */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <LayoutTemplate className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.recommendation.configureOperation}</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                {t.recommendation.configureDesc}
              </p>
            </div>
          )}

          {result && (
            <>
              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 space-y-2">
                  {result.warnings.map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-yellow-800 dark:text-yellow-400 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{w}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Layout: Info general, Stop Loss y Confianza */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${result.direction==='LONG'?'bg-green-500':'bg-red-500'}`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{result.symbol} {/* -- */} <span className={result.direction==='LONG'?'text-green-500':'text-red-500'}>{result.direction}</span></h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">{t.recommendation.entryPriceLabel}</p>
                      <p className="text-3xl font-mono text-gray-900 dark:text-white mt-1">${result.entryPrice.toFixed(precision)}</p>
                    </div>
                    <div className="text-right space-y-1.5">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-bold font-mono border border-gray-200 dark:border-gray-600">
                        Int: {result.interval}
                      </span>
                      {(() => {
                        const sig = result.signal?.classification || 'NEUTRAL';
                        const dir = result.direction;
                        const isContradictory = (dir === 'LONG' && (sig === 'VENTA' || sig === 'VENTA FUERTE')) || (dir === 'SHORT' && (sig === 'COMPRA' || sig === 'COMPRA FUERTE'));
                        const isAligned = (dir === 'LONG' && (sig === 'COMPRA' || sig === 'COMPRA FUERTE')) || (dir === 'SHORT' && (sig === 'VENTA' || sig === 'VENTA FUERTE'));
                        return (
                          <span className={`block px-2.5 py-1 rounded text-[10px] font-bold border ${
                            isContradictory
                              ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700/40'
                              : isAligned
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/40'
                                : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/40'
                          }`}>
                            {isContradictory ? t.recommendation.signalContradictory : isAligned ? t.recommendation.signalAligned : t.recommendation.signalNeutral}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Stop Loss Card */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/40 p-5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Stop Loss</p>
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-[10px] uppercase font-bold border border-red-200 dark:border-red-800/50">
                      {result.slMethodLabel}
                    </span>
                  </div>
                  <p className="text-3xl font-mono text-red-600 dark:text-red-400 font-bold">${result.sl.toFixed(precision)}</p>
                  <p className="text-sm text-red-600/70 dark:text-red-300/70 mt-1">
                    -{result.slDistancePct.toFixed(2)}% <span className="text-gray-300 dark:text-gray-500 mx-1">|</span> -${result.slDistanceAbs.toFixed(precision)}
                  </p>
                  {result.detectedSLLevel && <p className="text-[10px] text-red-600/80 dark:text-red-400/80 mt-2 italic break-words">{result.detectedSLLevel}</p>}
                </div>

                {/* Confidence Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900/40 p-5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t.recommendation.confidence}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-mono text-blue-600 dark:text-blue-400 font-bold">{result.confidence ?? '--'}%</p>
                  </div>
                  <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-2 leading-relaxed">
                    {result.reasoning ?? t.recommendation.noJustification}
                  </p>
                </div>

              </div>

              {/* ── Panel de Señal Técnica ── */}
              {result.signal && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t.recommendation.techSignal}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        result.signal.classification === 'COMPRA FUERTE' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/40' :
                        result.signal.classification === 'COMPRA' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/40' :
                        result.signal.classification === 'NEUTRAL' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/40' :
                        result.signal.classification === 'VENTA' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700/40' :
                        'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700/40'
                      }`}>
                        {result.signal.classification}
                      </span>
                      <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">{result.signal.score}/{result.signal.maxScore}</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {result.signal.breakdown.map((item: any, i: number) => {
                      const pct = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
                      const barColor = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{item.score}/{item.maxScore}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.max(pct, 2)}%` }}></div>
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{item.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* TPs y Riesgo (3 columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Take Profits */}
                <div className="md:col-span-2 space-y-3">
                  {result.tps.map((tp: any, i: number) => (
                    <div key={i} className="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/30 p-4 flex justify-between items-center transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">Take Profit {i+1}</p>
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded text-[10px] uppercase font-bold border border-green-200 dark:border-green-800/40">
                            {tp.label}
                          </span>
                        </div>
                        <p className="text-xl font-mono text-green-600 dark:text-green-400 font-bold">${tp.price.toFixed(precision)}</p>
                        <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                          +{tp.distancePct.toFixed(2)}% <span className="text-gray-300 dark:text-gray-500 mx-1">|</span> +${tp.distanceAbs.toFixed(precision)} <span className="text-gray-300 dark:text-gray-500 mx-1">|</span> R/B: {tp.realRatio.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">{t.recommendation.potential}</p>
                        <p className="text-lg font-mono text-green-600 dark:text-green-400 font-bold">+{formatCurrency(tp.potentialProfit, result.currency)}</p>
                      </div>
                    </div>
                  ))}
                  {result.tps.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                      <p className="text-sm text-gray-500">{t.recommendation.noneValidTP}</p>
                    </div>
                  )}
                </div>

                {/* Risk Management */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 shadow-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t.recommendation.riskPerCurrency.replace('{currency}', result.currency)}</p>
                    <p className="text-xl font-mono text-gray-900 dark:text-white">{formatCurrency(result.riskManagement.moneyAtRisk, result.currency)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{result.riskManagement.riskPctUsed}% del capital</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t.recommendation.positionSize}</p>
                    <p className="text-xl font-mono text-gray-900 dark:text-white">{result.riskManagement.positionSize.toFixed(4)} <span className="text-sm text-gray-500 dark:text-gray-400">{t.recommendation.units}</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t.recommendation.totalValue}</p>
                    <p className="text-xl font-mono text-gray-900 dark:text-white">{formatCurrency(result.riskManagement.positionValue, result.currency)}</p>
                  </div>
                </div>

              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-gray-500 text-center px-4">
                {t.recommendation.disclaimer}
              </p>

              {/* ══════════════════════════════════════════════════════════════════
                  MÓDULO IA 1: RESUMEN NARRATIVO
                  ══════════════════════════════════════════════════════════════════ */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-purple-200 dark:border-purple-500/20 p-5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t.recommendation.iaSummary}</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-[10px] font-bold border border-purple-200 dark:border-purple-700/40">
                    Groq · Llama 3.3
                  </span>
                </div>

                {iaLoading && !iaResumen && !iaResumenError && (
                  <div className="space-y-2.5">
                    <div className="h-3.5 bg-gray-700/60 rounded animate-pulse w-full"></div>
                    <div className="h-3.5 bg-gray-700/60 rounded animate-pulse w-11/12"></div>
                    <div className="h-3.5 bg-gray-700/60 rounded animate-pulse w-4/5"></div>
                  </div>
                )}

                {iaResumenError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{iaResumenError}</p>
                )}

                {iaResumen && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{iaResumen}</p>
                )}

                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-3">
                  {t.recommendation.iaGenerated}
                </p>
              </div>

              {/* ══════════════════════════════════════════════════════════════════
                  MÓDULO IA 2: JUSTIFICACIÓN DE LA SEÑAL (EXPANDIBLE)
                  ══════════════════════════════════════════════════════════════════ */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-colors">
                <button
                  onClick={() => setShowJustificacion(!showJustificacion)}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.recommendation.detailedJustification}</span>
                  </div>
                  {showJustificacion ? <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                </button>

                {showJustificacion && (
                  <div className="px-5 pb-4">
                    {iaLoading && !iaJustificacion && !iaJustificacionError && (
                      <div className="space-y-2.5">
                        <div className="h-3.5 bg-gray-700/60 rounded animate-pulse w-full"></div>
                        <div className="h-3.5 bg-gray-700/60 rounded animate-pulse w-11/12"></div>
                        <div className="h-3.5 bg-gray-700/60 rounded animate-pulse w-10/12"></div>
                        <div className="h-3.5 bg-gray-700/60 rounded animate-pulse w-4/5"></div>
                      </div>
                    )}

                    {iaJustificacionError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{iaJustificacionError}</p>
                    )}

                    {iaJustificacion && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{iaJustificacion}</p>
                    )}
                  </div>
                )}
              </div>

              {/* ══════════════════════════════════════════════════════════════════
                  MÓDULO IA 3: CHAT CONTEXTUAL
                  ══════════════════════════════════════════════════════════════════ */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t.recommendation.chatWithIA}</h4>
                    <span className="px-1.5 py-0.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded text-[9px] font-bold border border-cyan-200 dark:border-cyan-800/30">
                      {t.recommendation.contextual}
                    </span>
                  </div>
                  {chatMessages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t.recommendation.clearChat}
                    </button>
                  )}
                </div>

                {/* Messages area */}
                <div
                  ref={chatScrollRef}
                  className="px-4 py-3 space-y-3 overflow-y-auto"
                  style={{ height: '280px' }}
                >
                  {chatMessages.length === 0 && !chatLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500 mb-3">{t.recommendation.askWhatever.replace('{symbol}', result.symbol)}</p>
                      {chatSuggestionsVisible && (
                        <div className="flex flex-wrap justify-center gap-2">
                          {CHAT_SUGGESTIONS.map((sug, i) => (
                            <button
                              key={i}
                              onClick={() => sendChatMessage(sug)}
                              className="px-3 py-1.5 text-[11px] text-cyan-300 bg-cyan-900/20 border border-cyan-800/30 rounded-full hover:bg-cyan-900/40 transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-gray-600'
                      }`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1 mb-1">
                            <Bot className="w-3 h-3 text-cyan-400" />
                            <span className="text-[9px] text-cyan-400 font-bold">IA</span>
                          </div>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3.5 py-2.5 rounded-xl rounded-bl-sm border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold">IA</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(chatInput)}
                    placeholder={chatContextRef.current ? t.recommendation.typeYourQuestion : t.recommendation.calculateFirst}
                    disabled={!chatContextRef.current || chatLoading}
                    className="flex-1 px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={() => sendChatMessage(chatInput)}
                    disabled={!chatInput.trim() || chatLoading || !chatContextRef.current}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gráfico */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={showSMA50} onChange={() => setShowSMA50(!showSMA50)} className="rounded border-gray-300 dark:border-gray-600 text-primary-500 w-3.5 h-3.5" />
                      <span className="w-4 h-0.5 rounded bg-orange-400"></span> {t.recommendation.sma50}
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={showSMA200} onChange={() => setShowSMA200(!showSMA200)} className="rounded border-gray-300 dark:border-gray-600 text-primary-500 w-3.5 h-3.5" />
                      <span className="w-4 h-[2px] rounded bg-red-500"></span> {t.recommendation.sma200}
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={showBollinger} onChange={() => setShowBollinger(!showBollinger)} className="rounded border-gray-300 dark:border-gray-600 text-primary-500 w-3.5 h-3.5" />
                      <span className="w-4 h-0 border-b-2 border-dashed border-blue-400 rounded"></span> {t.recommendation.bollinger}
                    </label>
                  </div>
                </div>
                <div ref={mainChartRef} />
              </div>

            </>
          )}

        </div>
      </div>
    </div>
  );
}
