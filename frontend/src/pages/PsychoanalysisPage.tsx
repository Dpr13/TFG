import { useState, useEffect, useCallback } from 'react';
import type { PsychoAnalysisSummary, Strategy } from '../types';
import { psychoanalysisService, strategyService } from '../services';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart2,
  Flame,
  RefreshCw,
  Activity,
  Star,
  Lightbulb,
  Shield,
  DollarSign,
} from 'lucide-react';
import AnalysisSummaryCard, { AnalysisVariant } from '@components/AnalysisSummaryCard';

export default function PsychoanalysisPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<PsychoAnalysisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    strategyService.getAllStrategies().then(setStrategies).catch(console.error);
  }, []);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let analysis;
      if (selectedStrategyId) {
        analysis = await psychoanalysisService.getAnalysisByStrategy(selectedStrategyId);
      } else if (startDate && endDate) {
        analysis = await psychoanalysisService.getAnalysisByDateRange(startDate, endDate);
      } else {
        analysis = await psychoanalysisService.getAnalysis();
      }
      setData(analysis);
    } catch (err) {
      setError(t.psycho.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedStrategyId, startDate, endDate, t]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t.psycho.analyzing}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || t.psycho.noDataAvailable}
          </div>
        </div>
      </div>
    );
  }

  const { generalStats, assetStats, temporalStats, directionalStats, behaviorStats, alerts, disciplineScore, recommendations } = data;

  const topAssets = assetStats.filter((a) => a.totalPnL > 0).slice(0, 5);
  const topSymbols = new Set(topAssets.map((a) => a.symbol));
  const remaining = [...assetStats].reverse().filter((a) => !topSymbols.has(a.symbol));
  const negativeAssets = remaining.filter((a) => a.totalPnL < 0).slice(0, 5);
  const worstAssets = negativeAssets.length > 0 ? negativeAssets : remaining.slice(0, 5);

  let classification = t.psycho.excellentPsychology;
  let variant: AnalysisVariant = 'success';
  let SummaryIcon = CheckCircle;

  if (disciplineScore < 50) {
    classification = t.psycho.highRisk;
    variant = 'danger';
    SummaryIcon = AlertTriangle;
  } else if (disciplineScore < 85) {
    classification = t.psycho.mediumRisk;
    variant = 'warning';
    SummaryIcon = AlertTriangle;
  }

  const alertTypeLabel: Record<string, string> = {
    overtrading: t.psycho.alertOvertrading,
    revenge_trading: t.psycho.alertRevengeTrading,
    loss_spiral: t.psycho.alertLossSpiral,
  };

  const severityLabel: Record<string, string> = {
    high: t.psycho.severityHigh,
    medium: t.psycho.severityMedium,
    low: t.psycho.severityLow,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t.psycho.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {t.psycho.strategy}
              </label>
              <select
                value={selectedStrategyId}
                onChange={(e) => { setSelectedStrategyId(e.target.value); setStartDate(''); setEndDate(''); }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t.psycho.generalAll}</option>
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {t.psycho.from}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setSelectedStrategyId(''); }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {t.psycho.to}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setSelectedStrategyId(''); }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {(startDate || endDate || selectedStrategyId) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setSelectedStrategyId(''); }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
              >
                {t.psycho.clearFilters}
              </button>
            )}
          </div>
        </div>

        {/* Psychological Summary Card */}
        <div className="mb-8">
          <AnalysisSummaryCard
            score={disciplineScore}
            classification={classification}
            variant={variant}
            explanation={
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SummaryIcon className="w-5 h-5" />
                  <span className="text-xl font-bold">{t.psycho.behaviorAlerts}</span>
                </div>
                <p className="text-sm leading-relaxed">
                  {alerts.length === 0
                    ? t.psycho.noPatternsDetected
                    : `${t.psycho.detectedAlerts.replace('{count}', alerts.length.toString())} ${
                        alerts.some(a => a.severity === 'high') ? t.psycho.highRiskPatterns :
                        alerts.some(a => a.severity === 'medium') ? t.psycho.disciplineIssues :
                        t.psycho.minorIssues
                      }`
                  }
                </p>
              </div>
            }
            footer={
              <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t.psycho.analyzingOps.replace('{count}', generalStats.totalOperations.toString())}
                </div>
                {generalStats.winRate > 50 && (
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    {t.psycho.positiveReturnability}
                  </div>
                )}
              </div>
            }
          />
        </div>

        {/* KPI Cards — primary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KPICard
            title="Total PnL"
            value={`€${generalStats.totalPnL.toFixed(2)}`}
            color={generalStats.totalPnL >= 0 ? 'green' : 'red'}
            icon={generalStats.totalPnL >= 0 ? <TrendingUp /> : <TrendingDown />}
          />
          <KPICard
            title={t.psycho.kpiWinRate}
            value={`${generalStats.winRate.toFixed(1)}%`}
            color={generalStats.winRate > 50 ? 'green' : 'red'}
            icon={<Target />}
          />
          <KPICard
            title={t.psycho.kpiTotalOps}
            value={generalStats.totalOperations.toString()}
            color="blue"
            icon={<Zap />}
          />
          <KPICard
            title={t.psycho.kpiBestDay}
            value={`€${generalStats.bestDay.pnl.toFixed(2)}`}
            color="green"
            icon={<TrendingUp />}
          />
        </div>

        {/* KPI Cards — secondary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            title={t.psycho.kpiExpectedValue}
            value={`€${generalStats.expectedValue.toFixed(2)}`}
            color={generalStats.expectedValue >= 0 ? 'green' : 'red'}
            icon={<DollarSign />}
            secondary
          />
          <KPICard
            title={t.psycho.kpiProfitFactor}
            value={generalStats.profitFactor.toFixed(2)}
            color={generalStats.profitFactor >= 1 ? 'green' : 'red'}
            icon={<Shield />}
            secondary
          />
          <KPICard
            title={t.psycho.kpiWorstDay}
            value={`€${generalStats.worstDay.pnl.toFixed(2)}`}
            color="red"
            icon={<TrendingDown />}
            secondary
          />
          <KPICard
            title={t.psycho.kpiDisciplineScore}
            value={`${disciplineScore} / 100`}
            color={disciplineScore >= 85 ? 'green' : disciplineScore >= 50 ? 'blue' : 'red'}
            icon={<Shield />}
            secondary
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {t.psycho.chartDayOfWeek}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={temporalStats.dayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => typeof value === 'number' ? `€${value.toFixed(2)}` : value} />
                <Bar dataKey="totalPnL" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 flex gap-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>{t.psycho.bestDay}:</strong> {temporalStats.bestDayOfWeek}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>{t.psycho.worstDay}:</strong> {temporalStats.worstDayOfWeek}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Long vs Short
            </h2>
            <div className="grid grid-cols-2 gap-4 h-[260px] content-center">
              {(['long', 'short'] as const).map((dir) => {
                const side = directionalStats[dir];
                const isLong = dir === 'long';
                const accent = isLong ? 'green' : 'red';
                const accentBg = isLong
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
                const accentText = isLong
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400';
                return (
                  <div key={dir} className={`rounded-lg border p-4 space-y-3 ${accentBg}`}>
                    <div className="flex items-center gap-2">
                      {isLong ? <TrendingUp className={`w-5 h-5 ${accentText}`} /> : <TrendingDown className={`w-5 h-5 ${accentText}`} />}
                      <span className={`font-bold text-lg capitalize ${accentText}`}>{isLong ? 'Long' : 'Short'}</span>
                    </div>
                    <DirectionalRow label="Operaciones" value={side.operations.toString()} />
                    <DirectionalRow label="PnL total" value={`€${side.totalPnL.toFixed(2)}`} valueClass={side.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                    <DirectionalRow label="Win rate" value={`${side.winRate.toFixed(1)}%`} valueClass={side.winRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                    <DirectionalRow label="PnL medio" value={`€${side.avgPnL.toFixed(2)}`} valueClass={side.avgPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                    <DirectionalRow label="Rto. medio" value={`${side.avgPnLPct.toFixed(2)}%`} valueClass={side.avgPnLPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            {t.psycho.chartWinRateByAsset}
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={assetStats.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(1)}%` : value} />
              <Bar dataKey="winRate" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Behavior Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Streaks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {t.psycho.streaks}
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {behaviorStats.longestWinStreak}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.psycho.longestWinStreak}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {behaviorStats.longestLossStreak}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.psycho.longestLossStreak}</p>
              </div>
            </div>
          </div>

          {/* Recovery */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {t.psycho.recovery}
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {behaviorStats.recoveryAttempts}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.psycho.recoveryAttempts}</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {behaviorStats.recoverySuccessRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.psycho.recoverySuccessRate}</p>
              </div>
            </div>
          </div>

          {/* After Win / Loss */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {t.psycho.avgOps}
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(behaviorStats.opsAfterWin * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.psycho.opsAfterWin}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {(behaviorStats.opsAfterLoss * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.psycho.opsAfterLoss}</p>
              </div>
            </div>
          </div>

          {/* Risk Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {t.psycho.riskScores}
            </h3>
            <div className="space-y-5">
              <ScoreBar
                value={behaviorStats.overtradingScore}
                label={t.psycho.overtradingScore}
              />
              <ScoreBar
                value={behaviorStats.impulsivityScore}
                label={t.psycho.impulsivityScore}
              />
            </div>
          </div>
        </div>

        {/* Best / Worst Assets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {t.psycho.bestAssets}
            </h2>
            <div className="space-y-2">
              {topAssets.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {t.psycho.noPositiveAssets}
                </p>
              ) : topAssets.map((asset, idx) => (
                <div
                  key={asset.symbol}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {idx + 1}. {asset.symbol}
                    </span>
                    <span className={`font-bold ${asset.totalPnL > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{asset.totalPnL.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {t.psycho.opsWinRate
                      .replace('{ops}', asset.operations.toString())
                      .replace('{rate}', asset.winRate.toFixed(1))}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <AssetPill label="Mejor" value={`€${asset.bestTrade.toFixed(2)}`} color="green" />
                    <AssetPill label="Peor" value={`€${asset.worstTrade.toFixed(2)}`} color="red" />
                    <AssetPill label="Volat." value={asset.volatility.toFixed(2)} color="neutral" />
                    <AssetPill label="Sharpe" value={asset.sharpeRatio.toFixed(2)} color={asset.sharpeRatio >= 1 ? 'green' : asset.sharpeRatio >= 0 ? 'neutral' : 'red'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {t.psycho.attentionAssets}
            </h2>
            <div className="space-y-2">
              {worstAssets.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {t.psycho.singleAsset}
                </p>
              ) : worstAssets.map((asset, idx) => (
                <div
                  key={asset.symbol}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {idx + 1}. {asset.symbol}
                    </span>
                    <span className={`font-bold ${asset.totalPnL > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{asset.totalPnL.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {t.psycho.opsWinRate
                      .replace('{ops}', asset.operations.toString())
                      .replace('{rate}', asset.winRate.toFixed(1))}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <AssetPill label="Mejor" value={`€${asset.bestTrade.toFixed(2)}`} color="green" />
                    <AssetPill label="Peor" value={`€${asset.worstTrade.toFixed(2)}`} color="red" />
                    <AssetPill label="Volat." value={asset.volatility.toFixed(2)} color="neutral" />
                    <AssetPill label="Sharpe" value={asset.sharpeRatio.toFixed(2)} color={asset.sharpeRatio >= 1 ? 'green' : asset.sharpeRatio >= 0 ? 'neutral' : 'red'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 rounded-lg p-6 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              {t.psycho.alertsTitle}
            </h2>
            <div className="space-y-3">
              {alerts.map((alert, idx) => {
                const severityStyles: Record<string, string> = {
                  high: 'bg-red-100 dark:bg-red-900/40 border-red-400 text-red-800 dark:text-red-300',
                  medium: 'bg-orange-100 dark:bg-orange-900/40 border-orange-400 text-orange-800 dark:text-orange-300',
                  low: 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 text-yellow-800 dark:text-yellow-300',
                };
                return (
                  <div key={idx} className={`p-4 rounded-lg border ${severityStyles[alert.severity]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{alertTypeLabel[alert.type]}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
                        {t.psycho.severityLabel}: {severityLabel[alert.severity]}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t.psycho.insightsTitle}
          </h2>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {generalStats.winRate > 50 ? (
              <p>{t.psycho.winRateAbove50}</p>
            ) : (
              <p>{t.psycho.winRateBelow50}</p>
            )}
            {behaviorStats.recoverySuccessRate > 60 ? (
              <p>{t.psycho.recoverySuccess.replace('{rate}', behaviorStats.recoverySuccessRate.toString())}</p>
            ) : (
              <p>{t.psycho.recoveryLow.replace('{rate}', behaviorStats.recoverySuccessRate.toString())}</p>
            )}
            {behaviorStats.opsAfterLoss > behaviorStats.opsAfterWin ? (
              <p>{t.psycho.moreOpsAfterLoss}</p>
            ) : (
              <p>{t.psycho.controlledBehavior}</p>
            )}
            {generalStats.bestAsset.symbol && (
              <p>
                {t.psycho.bestAssetInsight
                  .replace('{symbol}', generalStats.bestAsset.symbol)
                  .replace('{amount}', generalStats.bestAsset.pnl.toFixed(2))}
              </p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Recomendaciones personalizadas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-100 text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string;
  color: 'green' | 'red' | 'blue' | 'purple';
  icon?: React.ReactNode;
  secondary?: boolean;
}

function KPICard({ title, value, color, icon, secondary = false }: KPICardProps) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  const textColors: Record<string, string> = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color]} ${secondary ? 'opacity-90' : 'border-2'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-medium text-gray-600 dark:text-gray-400 ${secondary ? 'text-xs' : 'text-sm'}`}>
            {title}
          </p>
          <p className={`font-bold mt-1 ${textColors[color]} ${secondary ? 'text-xl' : 'text-2xl'}`}>
            {value}
          </p>
        </div>
        {icon && (
          <div className={`${textColors[color]} ${secondary ? 'text-2xl' : 'text-3xl'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface ScoreBarProps {
  value: number;
  label: string;
}

interface DirectionalRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

function DirectionalRow({ label, value, valueClass = 'text-gray-900 dark:text-white' }: DirectionalRowProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

interface AssetPillProps {
  label: string;
  value: string;
  color: 'green' | 'red' | 'neutral';
}

function AssetPill({ label, value, color }: AssetPillProps) {
  const styles: Record<string, string> = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    neutral: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${styles[color]}`}>
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function ScoreBar({ value, label }: ScoreBarProps) {
  const barColor =
    value > 60 ? 'bg-red-500' :
    value > 30 ? 'bg-yellow-500' :
    'bg-green-500';

  const textColor =
    value > 60 ? 'text-red-600 dark:text-red-400' :
    value > 30 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-green-600 dark:text-green-400';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className={`font-semibold tabular-nums ${textColor}`}>{value}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
