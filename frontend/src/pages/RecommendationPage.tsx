import { useState, useRef, useEffect, useCallback } from 'react';
import { Target, Search, Loader2, AlertTriangle, LayoutTemplate } from 'lucide-react';
import { recommendationService } from '@services/index';
import { formatCurrency } from '@utils/format';
import type { RecommendationRequest, RecommendationResult, SLMethod, TPMethod } from '../types';

// Lightweight Charts global
declare const LightweightCharts: any;

const QUICK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY'];
const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d', '1wk', '1mo'] as const;

export default function RecommendationPage() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);

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

  // Toggles
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);

  // Recalculate Risk if capital or riskPct change (without reloading all data)
  useEffect(() => {
    if (result && !loading) {
      const capNum = parseFloat(capital);
      const riskNum = parseFloat(riskPct);
      if (!isNaN(capNum) && !isNaN(riskNum) && capNum > 0 && riskNum > 0 && riskNum <= 100) {
        setResult((prev: RecommendationResult | null) => {
          if (!prev) return prev;
          const r = { ...prev };
          r.riskManagement = { ...r.riskManagement };
          
          const moneyAtRisk = capNum * (riskNum / 100);
          r.riskManagement.moneyAtRisk = moneyAtRisk;
          
          let posSize = 0;
          if (r.slDistanceAbs > 0) {
            posSize = moneyAtRisk / r.slDistanceAbs;
          }
          r.riskManagement.positionSize = posSize;
          r.riskManagement.positionValue = posSize * r.entryPrice;
          r.riskManagement.riskPctUsed = riskNum;
          r.currency = currency;

          // updating Warnings logic for capital
          const warnings = r.warnings.filter((w: string) => !w.includes('capital disponible'));
          if (r.riskManagement.positionValue > capNum) {
            warnings.push('El tamaño de posición supera el capital disponible. Considera reducir el riesgo o aumentar el stop loss.');
          }
          r.warnings = warnings;

          // update TPs profit
          r.tps = r.tps.map((tp: any) => ({
            ...tp,
            potentialProfit: posSize * tp.distanceAbs
          }));
          return r;
        });
      }
    }
  }, [capital, riskPct, currency, loading, result]);

  // If SL or TP method changes, we MUST fetch from backend again to get the proper levels
  // We'll require user to hit "Calcular" or auto-trigger it. 
  // Requirement: "Al cambiar el método de SL o TP, recalcular y actualizar resultados y gráfico sin recargar la página."
  // We can auto-fetch if we already have a result.

  useEffect(() => {
    if (result && !loading && symbol === result.symbol) {
      calculate();
    }
  }, [direction, slMethod, slPct, tpMethods, rrRatio]);

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
    if (!s) return;
    setSymbol(s);
    setLoading(true);
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
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Error al calcular la recomendación');
      if (err?.response?.data?.error?.includes('suficientes datos')) {
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------------
  // CHARTS
  // --------------------------------------------------------------------------------
  
  const toChartTime = (dateStr: string) => dateStr.split('T')[0];

  const buildCharts = useCallback(() => {
    if (!result || typeof LightweightCharts === 'undefined') return;

    chartsRef.current.forEach(c => { try { c.remove(); } catch {} });
    chartsRef.current = [];

    const darkTheme = {
      layout: { background: { color: '#1f2937' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#4b5563' },
      timeScale: { borderColor: '#4b5563', timeVisible: false },
    };

    const uniqueDates = new Set();
    const candles = (result.candles || [])
      .filter((c: any) => c.date != null && c.open != null && c.high != null && c.low != null && c.close != null)
      .map((c: any) => ({
        time: toChartTime(c.date),
        open: Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close),
      }))
      .filter((c: any) => !isNaN(c.open) && !isNaN(c.high) && !isNaN(c.low) && !isNaN(c.close))
      .filter((c: any) => {
        if (uniqueDates.has(c.time)) return false;
        uniqueDates.add(c.time);
        return true;
      })
      .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

    if (mainChartRef.current) {
      if (candles.length === 0) return;

      mainChartRef.current.innerHTML = '';
      const chart = LightweightCharts.createChart(mainChartRef.current, {
        ...darkTheme,
        width: mainChartRef.current.clientWidth,
        height: 500,
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      });
      chartsRef.current.push(chart);

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350',
        borderUpColor: '#26a69a', borderDownColor: '#ef5350',
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
      });
      candleSeries.setData(candles);

      const filterAndSort = (data: any[]) => {
        const tSet = new Set();
        return (data || [])
          .filter(p => p.time != null && p.value != null && !isNaN(p.value))
          .map(p => ({ time: toChartTime(p.time), value: Number(p.value) }))
          .filter(p => {
             if (tSet.has(p.time)) return false;
             tSet.add(p.time);
             return true;
          })
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
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
          color: '#ffffff',
          lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Entrada $${result.entryPrice.toFixed(2)}`,
        });
      }

      if (result.sl != null && !isNaN(result.sl)) {
        candleSeries.createPriceLine({
          price: result.sl,
          color: '#ef4444',
          lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Solid,
          axisLabelVisible: true,
          title: `SL $${result.sl.toFixed(2)} (-${result.slDistancePct.toFixed(1)}%)`,
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
            title: `TP${i+1} $${tp.price.toFixed(2)} (+${tp.distancePct.toFixed(1)}%)`,
          });
        }
      });

      // Shaded Areas for SL and TPs (Wait: LightweightCharts doesn't support drawing box areas naturally,
      // but we can use fill series trick like Bollinger, though it requires historical points matching entry value.
      // Easiest approximation is not to shade horizontally over whole chart, 
      // or to just skip the shaded area feature and stick to lines as standard LightweightCharts behavior.)

      const legendEl = document.createElement('div');
      legendEl.style.cssText = 'position:absolute;top:8px;left:12px;z-index:10;font-size:11px;color:#d1d5db;pointer-events:none;font-family:monospace;';
      mainChartRef.current.style.position = 'relative';
      mainChartRef.current.appendChild(legendEl);

      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !param.seriesData) {
          legendEl.textContent = '';
          return;
        }
        const d = param.seriesData.get(candleSeries);
        if (d) {
          legendEl.textContent = `O: ${d.open?.toFixed(2)}  H: ${d.high?.toFixed(2)}  L: ${d.low?.toFixed(2)}  C: ${d.close?.toFixed(2)}`;
        }
      });

      chart.timeScale().fitContent();
    }
  }, [result, showSMA50, showSMA200, showBollinger]);

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
  };


  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recomendación de Operación</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Calcula automáticamente niveles de Take Profit, Stop Loss y gestión del riesgo.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* ── BLOQUE 1: CONFIGURACIÓN ── */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-6">
            
            {/* Buscador */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Activo Financiero</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej: AAPL, BTC-USD..."
                  value={symbol}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    if(v !== symbol) setResult(null);
                    setSymbol(v);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && calculate()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Popular / Watchlist Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Populares:</span>
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
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dirección de la operación</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <button
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${direction === 'LONG' ? 'bg-green-600 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  onClick={() => setDirection('LONG')}
                >
                  LONG (Compra)
                </button>
                <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                <button
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${direction === 'SHORT' ? 'bg-red-600 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  onClick={() => setDirection('SHORT')}
                >
                  SHORT (Venta)
                </button>
              </div>
            </div>

            {/* Intervalo */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Intervalo de tiempo</label>
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
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Método Stop Loss</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="radio" checked={slMethod === 'FIXED_PCT'} onChange={() => setSlMethod('FIXED_PCT')} className="text-primary-600 focus:ring-primary-500" />
                  Porcentaje fijo
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
                  {direction === 'LONG' ? 'Soporte más cercano' : 'Resistencia más cercana'}
                </label>
              </div>
            </div>

            {/* Take Profit */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Métodos Take Profit</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={tpMethods.includes('RISK_REWARD')} onChange={() => toggleTpMethod('RISK_REWARD')} className="rounded text-primary-600 focus:ring-primary-500" />
                  Ratio Riesgo/Beneficio
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
                  {direction === 'LONG' ? 'Resistencia cercana' : 'Soporte cercano'}
                </label>
                
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={tpMethods.includes('BOLLINGER')} onChange={() => toggleTpMethod('BOLLINGER')} className="rounded text-primary-600 focus:ring-primary-500" />
                  Bandas de Bollinger
                </label>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Gestión del Riesgo */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                <span>Gestión del Riesgo</span>
                <select value={currency} onChange={e => setCurrency(e.target.value as 'EUR'|'USD')} className="bg-transparent text-xs font-bold text-gray-400 outline-none">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Capital total</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{currency==='USD'?'$':'€'}</span>
                    <input type="number" min="1" step="100" value={capital} onChange={e => setCapital(e.target.value)}
                           className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-primary-500 text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Riesgo por op.</label>
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
              {result && symbol === result.symbol ? 'Recalcular Niveles' : 'Calcular Niveles'}
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Configura la operación</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Introduce un símbolo, selecciona tus parámetros a la izquierda y pulsa calcular para obtener una recomendación detallada.
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

              {/* Layout: Info general y Stop Loss */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Info Card */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${result.direction==='LONG'?'bg-green-500':'bg-red-500'}`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{result.symbol} {/* -- */} <span className={result.direction==='LONG'?'text-green-500':'text-red-500'}>{result.direction}</span></h3>
                      <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Precio de Entrada</p>
                      <p className="text-3xl font-mono text-white mt-1">${result.entryPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-gray-700 text-gray-300 rounded text-xs font-bold font-mono">
                        Int: {result.interval}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stop Loss Card */}
                <div className="bg-red-900/20 rounded-xl border border-red-900/40 p-5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Stop Loss</p>
                    <span className="px-2 py-0.5 bg-red-900/50 text-red-300 rounded text-[10px] uppercase font-bold border border-red-800/50">
                      {result.slMethodLabel}
                    </span>
                  </div>
                  <p className="text-3xl font-mono text-red-400 font-bold">${result.sl.toFixed(2)}</p>
                  <p className="text-sm text-red-300/70 mt-1">
                    -{result.slDistancePct.toFixed(2)}% <span className="text-gray-500 mx-1">|</span> -${result.slDistanceAbs.toFixed(2)}
                  </p>
                  {result.detectedSLLevel && <p className="text-xs text-red-400/80 mt-2 italic">{result.detectedSLLevel}</p>}
                </div>
              </div>


              {/* TPs y Riesgo (3 columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Take Profits */}
                <div className="md:col-span-2 space-y-3">
                  {result.tps.map((tp: any, i: number) => (
                    <div key={i} className="bg-green-900/10 rounded-xl border border-green-900/30 p-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Take Profit {i+1}</p>
                          <span className="px-2 py-0.5 bg-green-900/40 text-green-300 rounded text-[10px] uppercase font-bold border border-green-800/40">
                            {tp.label}
                          </span>
                        </div>
                        <p className="text-xl font-mono text-green-400 font-bold">${tp.price.toFixed(2)}</p>
                        <p className="text-xs text-green-400/70 mt-1">
                          +{tp.distancePct.toFixed(2)}% <span className="text-gray-500 mx-1">|</span> +${tp.distanceAbs.toFixed(2)} <span className="text-gray-500 mx-1">|</span> R/B: {tp.realRatio.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Potencial</p>
                        <p className="text-lg font-mono text-green-400 font-bold">+{formatCurrency(tp.potentialProfit, result.currency)}</p>
                      </div>
                    </div>
                  ))}
                  {result.tps.length === 0 && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
                      <p className="text-sm text-gray-500">Ningún Take Profit válido calculado.</p>
                    </div>
                  )}
                </div>

                {/* Risk Management */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Riesgo / {result.currency}</p>
                    <p className="text-xl font-mono text-white">{formatCurrency(result.riskManagement.moneyAtRisk, result.currency)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{result.riskManagement.riskPctUsed}% del capital</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Tamaño Posición</p>
                    <p className="text-xl font-mono text-white">{result.riskManagement.positionSize.toFixed(4)} <span className="text-sm text-gray-400">unds</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Valor Total</p>
                    <p className="text-xl font-mono text-white">{formatCurrency(result.riskManagement.positionValue, result.currency)}</p>
                  </div>
                </div>

              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-gray-500 text-center px-4">
                Los niveles mostrados son puramente informativos y se generan de forma automática. 
                No constituyen asesoramiento financiero ni recomendación de inversión. 
                Opera siempre con responsabilidad y dentro de tus posibilidades.
              </p>

              {/* Gráfico */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={showSMA50} onChange={() => setShowSMA50(!showSMA50)} className="rounded border-gray-500 text-primary-500 w-3.5 h-3.5" />
                      <span className="w-4 h-0.5 rounded bg-orange-400"></span> SMA 50
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={showSMA200} onChange={() => setShowSMA200(!showSMA200)} className="rounded border-gray-500 text-primary-500 w-3.5 h-3.5" />
                      <span className="w-4 h-[2px] rounded bg-red-500"></span> SMA 200
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={showBollinger} onChange={() => setShowBollinger(!showBollinger)} className="rounded border-gray-500 text-primary-500 w-3.5 h-3.5" />
                      <span className="w-4 h-0 border-b-2 border-dashed border-blue-400 rounded"></span> Bollinger
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
