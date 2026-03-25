import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Loader2, Clock, Star } from 'lucide-react';
import { priceService, assetService } from '@services/index';
import type { Asset, FinancialData, StockFinancialData, CryptoFinancialData } from '../types';
import { formatCurrency, formatPercentage } from '@utils/format';

interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (asset: Asset) => void;
}

interface PriceStats {
  current: number;
  high: number;
  low: number;
  average: number;
  changePercent: number;
  changeAmount: number;
}

type TimeInterval = '5min' | '15min' | '30min' | '1h' | '4h' | '12h' | '1d' | '1wk' | '1mo' | 'all';

const intervalOptions: { value: TimeInterval; label: string }[] = [
  { value: '5min', label: '5 min' },
  { value: '15min', label: '15 min' },
  { value: '30min', label: '30 min' },
  { value: '1h', label: '1 hora' },
  { value: '4h', label: '4 horas' },
  { value: '12h', label: '12 horas' },
  { value: '1d', label: 'Diario' },
  { value: '1wk', label: 'Semanal' },
  { value: '1mo', label: 'Mensual' },
  { value: 'all', label: 'Histórico' },
];

export default function AssetDetailModal({ asset, onClose, isFavorite = false, onToggleFavorite }: AssetDetailModalProps) {
  const [priceData, setPriceData] = useState<any>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('1d');
  const [chartInterval, setChartInterval] = useState<TimeInterval>('1d');
  const [chartData, setChartData] = useState<any>(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loadingFinancial, setLoadingFinancial] = useState(true);

  // Helper: aggregate hourly prices into candles for 4h and 12h
  const aggregateHourlyToCandlesticks = (prices: Array<{ date: string; close: number }>, hoursPerCandle: number) => {
    if (hoursPerCandle <= 1 || prices.length === 0) return prices;

    const candlesticks: Array<{ date: string; close: number }> = [];
    let currentGroupStart = new Date(prices[0].date);
    let groupPrices: number[] = [prices[0].close];

    for (let i = 1; i < prices.length; i++) {
      const priceDate = new Date(prices[i].date);
      const hoursSinceStart = (priceDate.getTime() - currentGroupStart.getTime()) / (60 * 60 * 1000);

      if (hoursSinceStart >= hoursPerCandle) {
        // Emit the aggregated candle using close of last price in the group
        candlesticks.push({
          date: new Date(currentGroupStart.getTime() + (hoursPerCandle - 0.5) * 60 * 60 * 1000).toISOString(),
          close: groupPrices[groupPrices.length - 1],
        });
        currentGroupStart = priceDate;
        groupPrices = [prices[i].close];
      } else {
        groupPrices.push(prices[i].close);
      }
    }

    // Don't forget the last group
    if (groupPrices.length > 0) {
      candlesticks.push({
        date: new Date(currentGroupStart.getTime() + (hoursPerCandle - 0.5) * 60 * 60 * 1000).toISOString(),
        close: groupPrices[groupPrices.length - 1],
      });
    }

    return candlesticks;
  };

  // Helper: process prices to show recent data with good granularity
  const processPricesForChart = (prices: Array<{ date: string; close: number }>, interval: TimeInterval): Array<{ date: string; close: number }> => {
    if (prices.length === 0) return prices;

    // 'all' (Historical) is the only one where we truly want to see the whole history even if it means grouping
    const isHistorical = interval === 'all';

    // For specific granularities (5m up to Weekly/Monthly), we want exact units
    // Limit to 90 points to ensure bars have enough width to be readable
    const maxPoints = isHistorical ? 80 : 90;

    if (prices.length <= maxPoints) return prices;

    // For granular intervals, just take the most recent points to maintain exact scale
    // This satisfies "show the latest prices" and "each candle is exactly 1 unit (5m, 1d, etc.)"
    if (!isHistorical) {
      return prices.slice(-maxPoints);
    }

    // Only for Historical: downsampling to show the full trend in limited space
    const downsampled: Array<{ date: string; close: number }> = [];
    const groupSize = Math.ceil(prices.length / maxPoints);

    for (let i = 0; i < prices.length; i += groupSize) {
      const group = prices.slice(i, Math.min(i + groupSize, prices.length));
      if (group.length > 0) {
        downsampled.push(group[group.length - 1]);
      }
    }

    return downsampled;
  };

  useEffect(() => {
    const fetchData = async () => {
      // Obtener datos de precio
      setLoadingPrice(true);
      setPriceError(null);
      try {
        // Para las estadísticas usamos un intervalo más fino que el seleccionado
        // Para 4h y 12h, pedimos hourly (1h) y lo agregamos después
        const statsIntervalMap: Record<TimeInterval, string | undefined> = {
          '5min': '5min',
          '15min': '5min',
          '30min': '5min',
          '1h': '5min',
          '4h': '1h',     // Get hourly, then aggregate to 4h
          '12h': '1h',     // Get hourly, then aggregate to 12h
          '1d': '5min',
          '1wk': '1h',
          '1mo': '1h',
          'all': '3mo',
        };
        const intervalWindowMs: Record<TimeInterval, number | null> = {
          '5min': 5 * 60 * 1000,
          '15min': 15 * 60 * 1000,
          '30min': 30 * 60 * 1000,
          '1h': 1 * 60 * 60 * 1000,
          '4h': 4 * 60 * 60 * 1000,
          '12h': 12 * 60 * 60 * 1000,
          '1d': 24 * 60 * 60 * 1000,
          '1wk': 7 * 24 * 60 * 60 * 1000,
          '1mo': 28 * 24 * 60 * 60 * 1000,
          'all': null,
        };

        const statsInterval = statsIntervalMap[selectedInterval];
        let statsData = await priceService.getPriceHistory(asset.symbol, statsInterval);

        // If we requested hourly data for 4h or 12h charts, aggregate it
        if (statsData?.prices && (selectedInterval === '4h' || selectedInterval === '12h')) {
          const hoursPerCandle = selectedInterval === '4h' ? 4 : 12;
          statsData.prices = aggregateHourlyToCandlesticks(statsData.prices, hoursPerCandle);
        }

        // Process data for display (recentness + granularity)
        if (statsData?.prices) {
          statsData.prices = processPricesForChart(statsData.prices, selectedInterval);
        }

        setPriceData(statsData);

        if (statsData?.prices && statsData.prices.length > 0) {
          const windowMs = intervalWindowMs[selectedInterval];
          // Anclar al dato más reciente disponible (no a Date.now()) para que
          // fines de semana y fuera de horario funcionen correctamente.
          const mostRecentTime = new Date(statsData.prices[statsData.prices.length - 1].date).getTime();
          const filteredPrices = windowMs !== null
            ? statsData.prices.filter((p: any) => mostRecentTime - new Date(p.date).getTime() <= windowMs)
            : statsData.prices;
          const usedPrices = filteredPrices.length > 0 ? filteredPrices : statsData.prices;

          const priceValues = usedPrices.map((p: any) => p.close);
          const currentPrice = priceValues[priceValues.length - 1];
          const firstPrice = priceValues[0];
          const highPrice = Math.max(...priceValues);
          const lowPrice = Math.min(...priceValues);
          const avgPrice = priceValues.reduce((a: number, b: number) => a + b, 0) / priceValues.length;
          const changeAmount = currentPrice - firstPrice;
          const changePercent = (changeAmount / firstPrice) * 100;

          setStats({
            current: currentPrice,
            high: highPrice,
            low: lowPrice,
            average: avgPrice,
            changePercent,
            changeAmount,
          });
        }
      } catch (error: any) {
        console.error('Error fetching price data:', error);
        setPriceError(error.response?.data?.error || 'No se pudieron obtener los precios');
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchData();
  }, [asset.symbol, selectedInterval]);

  useEffect(() => {
    const fetchChartData = async () => {
      // Obtener datos para el gráfico de evolución
      setLoadingChart(true);
      setChartError(null);
      try {
        // Map chart intervals to backend intervals
        // '4h' and '12h' are created by aggregating hourly data (60m)
        const chartIntervalMap: Record<TimeInterval, string> = {
          '5min': '5min',
          '15min': '15min',
          '30min': '30min',
          '1h': '1h',
          '4h': '1h',     // Get hourly, then aggregate to 4h
          '12h': '1h',    // Get hourly, then aggregate to 12h
          '1d': '1d',
          '1wk': '1wk',
          '1mo': '1mo',
          'all': '3mo',
        };

        const intervalParam = chartIntervalMap[chartInterval] || chartInterval;
        let chartDataResult = await priceService.getPriceHistory(asset.symbol, intervalParam);

        // Aggregate hourly data to 4h or 12h if needed
        if (chartDataResult?.prices && (chartInterval === '4h' || chartInterval === '12h')) {
          const hoursPerCandle = chartInterval === '4h' ? 4 : 12;
          chartDataResult.prices = aggregateHourlyToCandlesticks(chartDataResult.prices, hoursPerCandle);
        }

        // Process data for display (recentness + granularity)
        if (chartDataResult?.prices) {
          chartDataResult.prices = processPricesForChart(chartDataResult.prices, chartInterval);
        }

        setChartData(chartDataResult);
      } catch (error: any) {
        console.error('Error fetching chart data:', error);
        setChartError(error.response?.data?.error || 'No se pudieron obtener los datos del gráfico');
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
  }, [asset.symbol, chartInterval]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoadingFinancial(true);
      try {
        const data = await assetService.getFinancialData(asset.symbol);
        setFinancialData(data);
      } catch (error: any) {
        console.error('Error fetching financial data:', error);
        // Don't set to null on error - keep any existing data
        // Only log the error, the UI will handle missing data gracefully
      } finally {
        setLoadingFinancial(false);
      }
    };

    fetchFinancialData();
  }, [asset.symbol]);

  // Helper functions
  const formatNumber = (value?: number | null): string => {
    if (value === undefined || value === null) return 'No disponible';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return formatCurrency(value);
  };

  const formatRatio = (value?: number | null): string => {
    if (value === undefined || value === null) return 'No disponible';
    return value.toFixed(2);
  };

  const formatPercent = (value?: number | null): string => {
    if (value === undefined || value === null) return 'No disponible';
    return formatPercentage(value);
  };

  const formatVolume = (value?: number | null): string => {
    if (value === undefined || value === null) return 'No disponible';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(0);
  };

  const isStockData = (data: FinancialData): data is StockFinancialData => {
    return 'peRatio' in data || 'eps' in data;
  };

  const isCryptoData = (data: FinancialData): data is CryptoFinancialData => {
    return 'circulatingSupply' in data || 'totalSupply' in data;
  };

  const chartSpansMultipleYears = chartData?.prices && chartData.prices.length > 1 &&
    new Date(chartData.prices[0].date).getFullYear() !==
    new Date(chartData.prices[chartData.prices.length - 1].date).getFullYear();

  const historySpansMultipleYears = priceData?.prices && priceData.prices.length > 1 &&
    new Date(priceData.prices[0].date).getFullYear() !==
    new Date(priceData.prices[priceData.prices.length - 1].date).getFullYear();

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {asset.symbol}
              </h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${asset.type === 'stock'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                : asset.type === 'crypto'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                }`}>
                {asset.type}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {asset.name}
            </p>
            {asset.description && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {asset.description}
              </p>
            )}
          </div>
          <div className="ml-4 flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset); }}
                title={isFavorite ? 'Quitar de seguimiento' : 'Añadir a seguimiento'}
                className={`p-2 rounded-lg transition-colors ${isFavorite
                  ? 'text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <Star className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Precio Actual */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cotización Actual
                </h3>
              </div>

              {/* Selector de intervalo */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <select
                  value={selectedInterval}
                  onChange={(e) => setSelectedInterval(e.target.value as TimeInterval)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                >
                  {intervalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {loadingPrice ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Cargando datos...</span>
              </div>
            ) : priceError ? (
              <p className="text-red-600 dark:text-red-400">{priceError}</p>
            ) : stats ? (
              <div>
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.current)}
                  </span>
                  <div className={`flex items-center gap-2 pb-2 ${stats.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    {stats.changePercent >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    <div className="flex flex-col items-start">
                      <span className="text-xl font-semibold">
                        {formatPercentage(Math.abs(stats.changePercent) / 100)}
                      </span>
                      <span className="text-sm">
                        {stats.changeAmount >= 0 ? '+' : ''}{formatCurrency(stats.changeAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-200 dark:border-primary-800">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Máximo</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(stats.high)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Promedio</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stats.average)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mínimo</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(stats.low)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No hay datos de precio disponibles</p>
            )}
          </div>

          {/* Gráfico de Evolución Simple */}
          {(loadingChart || chartData?.prices && chartData.prices.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Evolución de Precios
                  </h3>
                </div>

                {/* Selector de intervalo para el gráfico */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <select
                    value={chartInterval}
                    onChange={(e) => setChartInterval(e.target.value as TimeInterval)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                  >
                    {intervalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingChart ? (
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                    <span className="text-gray-600 dark:text-gray-400">Cargando gráfico...</span>
                  </div>
                </div>
              ) : chartError ? (
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-red-200 dark:border-red-600 p-6">
                  <p className="text-red-600 dark:text-red-400">{chartError}</p>
                </div>
              ) : chartData?.prices && chartData.prices.length > 0 ? (
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                  <div className="relative h-64 flex items-end gap-0.5 bg-gray-100 dark:bg-gray-800 rounded p-2">
                    {(() => {
                      const displayData = chartData.prices;

                      return displayData.map((price: any, index: number) => {
                        const maxPrice = Math.max(...displayData.map((p: any) => p.close));
                        const minPrice = Math.min(...displayData.map((p: any) => p.close));
                        const range = maxPrice - minPrice || 1; // Evitar división por cero

                        // Calcular altura en píxeles (máximo 240px - 10px de padding)
                        const maxHeight = 230;
                        const heightPx = range > 0
                          ? Math.max(10, ((price.close - minPrice) / range) * maxHeight)
                          : maxHeight / 2;

                        const isUp = index > 0 && price.close >= displayData[index - 1].close;

                        return (
                          <div
                            key={`${asset.symbol}-${index}-${price.date}`}
                            className="flex-1 group relative flex items-end justify-center"
                          >
                            <div
                              className={`w-full rounded-t transition-all cursor-pointer ${isUp
                                ? 'bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500'
                                : 'bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500'
                                }`}
                              style={{ height: `${heightPx}px`, minHeight: '10px' }}
                            />
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                              <div className="font-semibold">{formatCurrency(price.close)}</div>
                              <div className="text-[10px]">
                                {new Date(price.date).toLocaleDateString('es-ES', {
                                  ...(chartSpansMultipleYears ? { year: 'numeric' } : {}),
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {(() => {
                      const displayData = chartData.prices;

                      return (
                        <>
                          <span>
                            {new Date(displayData[0].date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>
                            {new Date(displayData[displayData.length - 1].date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                  <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles para este intervalo</p>
                </div>
              )}
            </div>
          )}

          {/* Información General */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información General
              </h3>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 space-y-6">

              {/* Datos Básicos */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Datos Básicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Símbolo:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{asset.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 md:col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${asset.type === 'stock'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      : asset.type === 'crypto'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                      {asset.type === 'stock' ? 'Acción' : asset.type === 'crypto' ? 'Criptomoneda' : 'Forex'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medidas de Valoración */}
              {asset.type === 'stock' && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Medidas de Valoración</h4>
                  {loadingFinancial ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cargando datos financieros...</span>
                    </div>
                  ) : financialData && isStockData(financialData) ? (
                    <>
                      {/* Mostrar aviso si hay datos limitados */}
                      {!financialData.marketCap && !financialData.peRatio && financialData.fiftyTwoWeekHigh && (
                        <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <p className="text-xs text-amber-800 dark:text-amber-300">
                            ℹ️ Datos limitados disponibles. Algunas métricas financieras no están accesibles actualmente.
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cap. de Mercado</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatNumber(financialData.marketCap)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">P/E Ratio</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRatio(financialData.peRatio)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">PEG Ratio</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRatio(financialData.pegRatio)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Price/Sales</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRatio(financialData.priceToSales)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Price/Book</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRatio(financialData.priceToBook)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">EV/EBITDA</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRatio(financialData.evToEbitda)}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No se pudieron obtener datos financieros detallados en este momento.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Destacados Financieros */}
              {asset.type === 'stock' && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Destacados Financieros</h4>
                  {loadingFinancial ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cargando datos financieros...</span>
                    </div>
                  ) : financialData && isStockData(financialData) ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">EPS (TTM)</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{financialData.eps !== undefined && financialData.eps !== null ? formatCurrency(financialData.eps) : 'No disponible'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Dividend Yield</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPercent(financialData.dividendYield)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Beta</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRatio(financialData.beta)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ROE</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPercent(financialData.roe)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ROA</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPercent(financialData.roa)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Margen Neto</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPercent(financialData.profitMargin)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Máximo 52 sem</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{financialData.fiftyTwoWeekHigh !== undefined && financialData.fiftyTwoWeekHigh !== null ? formatCurrency(financialData.fiftyTwoWeekHigh) : 'No disponible'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mínimo 52 sem</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{financialData.fiftyTwoWeekLow !== undefined && financialData.fiftyTwoWeekLow !== null ? formatCurrency(financialData.fiftyTwoWeekLow) : 'No disponible'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Vol. Promedio</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatVolume(financialData.averageVolume)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No se pudieron obtener datos financieros detallados en este momento.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Información de Criptomonedas */}
              {asset.type === 'crypto' && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Información de Mercado</h4>
                  {loadingFinancial ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cargando datos financieros...</span>
                    </div>
                  ) : financialData && isCryptoData(financialData) ? (
                    <>
                      {/* Mostrar aviso si hay datos limitados */}
                      {!financialData.marketCap && !financialData.circulatingSupply && financialData.fiftyTwoWeekHigh && (
                        <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <p className="text-xs text-amber-800 dark:text-amber-300">
                            ℹ️ Datos limitados disponibles. Algunas métricas de mercado no están accesibles actualmente.
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cap. de Mercado</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatNumber(financialData.marketCap)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Volumen 24h</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatVolume(financialData.volume24h)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Circulación</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatVolume(financialData.circulatingSupply)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Suministro Total</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatVolume(financialData.totalSupply)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Máximo 52 semanas</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{financialData.fiftyTwoWeekHigh !== undefined && financialData.fiftyTwoWeekHigh !== null ? formatCurrency(financialData.fiftyTwoWeekHigh) : 'No disponible'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mínimo 52 semanas</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{financialData.fiftyTwoWeekLow !== undefined && financialData.fiftyTwoWeekLow !== null ? formatCurrency(financialData.fiftyTwoWeekLow) : 'No disponible'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No se pudieron obtener datos de mercado en este momento.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Descripción */}
              {asset.description && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {asset.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Historial de Precios Detallado */}
          {priceData?.prices && priceData.prices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historial Reciente
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 max-h-80 overflow-y-auto">
                <div className="space-y-1">
                  {priceData.prices.slice().reverse().slice(0, 15).map((price: any, index: number) => {
                    const prevPrice = index < priceData.prices.length - 1
                      ? priceData.prices.slice().reverse()[index + 1]?.close
                      : price.close;
                    const dailyChange = price.close - prevPrice;
                    const dailyChangePercent = prevPrice ? (dailyChange / prevPrice) * 100 : 0;

                    return (
                      <div key={index} className="flex justify-between items-center py-3 px-2 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {new Date(price.date).toLocaleString('es-ES', {
                            ...(historySpansMultipleYears ? { year: 'numeric' } : {}),
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(price.close)}
                          </span>
                          {index > 0 && (
                            <div className={`flex items-center gap-1 min-w-[80px] justify-end ${dailyChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                              {dailyChange >= 0 ?
                                <TrendingUp className="w-4 h-4" /> :
                                <TrendingDown className="w-4 h-4" />
                              }
                              <span className="text-sm font-semibold">
                                {formatPercentage(Math.abs(dailyChangePercent) / 100)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
