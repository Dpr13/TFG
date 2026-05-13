import { useState, useEffect, useMemo } from 'react';
import { positionService, quoteService, botService } from '../services';
import type { Position, PositionTrade, PositionDailyStats, BotDailyStats, BotTradeWithBot } from '../types';
import DailyPositionTradesModal from '../components/DailyPositionTradesModal';
import DailyBotTradesModal from '../components/DailyBotTradesModal';
import OpenPositionsPanel from '../components/OpenPositionsPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const localeMap: Record<string, string> = { es: 'es-ES', en: 'en-US', de: 'de-DE', fr: 'fr-FR' };

type CalendarTab = 'manual' | 'bots';

// ── Shared helpers ─────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date) {
  return (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7;
}

// ── Calendar grid (shared between tabs) ────────────────────────────────────────

interface CalendarGridProps {
  currentDate: Date;
  statsMap: Map<string, { totalPnL: number; count: number; isProfit: boolean }>;
  maxAbsPnL: number;
  onDayClick: (day: number) => void;
  weekdays: string[];
  countLabel: (n: number) => string;
}

function CalendarGrid({ currentDate, statsMap, maxAbsPnL, onDayClick, weekdays, countLabel }: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;

          const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
          const stats = statsMap.get(dateStr);
          const isProfit = stats && stats.totalPnL > 0;
          const intensity = stats ? Math.min(Math.abs(stats.totalPnL) / maxAbsPnL, 1) : 0;
          const alpha = stats ? (0.15 + intensity * 0.75).toFixed(2) : '0';
          const bgStyle = stats
            ? { backgroundColor: isProfit ? `rgba(34,197,94,${alpha})` : `rgba(239,68,68,${alpha})` }
            : undefined;

          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              style={bgStyle}
              className={`aspect-square p-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary-400 transition-all cursor-pointer ${!stats ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
            >
              <div className="h-full flex flex-col items-start justify-start">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{day}</span>
                {stats && (
                  <div className="mt-auto text-xs">
                    <div className={isProfit ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                      {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(0)}€
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {countLabel(stats.count)}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<CalendarTab>('manual');
  const [currentDate, setCurrentDate] = useState(new Date());

  // ── Manual tab state ────────────────────────────────────────────────────────
  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const [positionPrices, setPositionPrices] = useState<Record<string, number>>({});
  const [manualStats, setManualStats] = useState<Map<string, PositionDailyStats>>(new Map());
  const [manualLoading, setManualLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayTrades, setSelectedDayTrades] = useState<PositionTrade[]>([]);
  const [selectedDayStats, setSelectedDayStats] = useState<PositionDailyStats | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // ── Bot tab state ───────────────────────────────────────────────────────────
  const [botDailyStats, setBotDailyStats] = useState<BotDailyStats[]>([]);
  const [bots, setBots] = useState<{ id: string; name: string }[]>([]);
  const [selectedBotId, setSelectedBotId] = useState('');
  const [botLoading, setBotLoading] = useState(false);

  const [selectedBotDate, setSelectedBotDate] = useState<string | null>(null);
  const [selectedBotDayTrades, setSelectedBotDayTrades] = useState<BotTradeWithBot[]>([]);
  const [selectedBotDayStats, setSelectedBotDayStats] = useState<BotDailyStats | null>(null);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ── Load bots and open positions once ─────────────────────────────────────
  useEffect(() => {
    botService.getBots().then(setBots).catch(console.error);
    loadOpenPositions();
  }, []);

  // ── Fetch data when tab or month changes ───────────────────────────────────
  useEffect(() => {
    if (activeTab === 'manual') fetchManualData();
    else fetchBotData();
  }, [currentDate, activeTab]);

  useEffect(() => {
    if (activeTab === 'bots') fetchBotData();
  }, [selectedBotId]);

  const loadOpenPositions = async () => {
    try {
      const positions = await positionService.getOpenPositions();
      setOpenPositions(positions);
      const symbols = [...new Set(positions.map(p => p.symbol))];
      const priceEntries = await Promise.all(
        symbols.map(async s => [s, await quoteService.getPrice(s).catch(() => null)] as const)
      );
      const pricesMap: Record<string, number> = {};
      priceEntries.forEach(([sym, p]) => { if (p !== null) pricesMap[sym] = p; });
      setPositionPrices(pricesMap);
    } catch {}
  };

  const fetchManualData = async () => {
    setManualLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const stats = await positionService.getMonthlyStats(year, month);
      const statsMap = new Map<string, PositionDailyStats>();
      stats.forEach(s => statsMap.set(s.date, s));
      setManualStats(statsMap);
    } catch {
      setError(t.calendar.errorLoading);
    } finally {
      setManualLoading(false);
    }
  };

  const fetchBotData = async () => {
    setBotLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const stats = await botService.getMonthlyStats(year, month, selectedBotId || undefined);
      setBotDailyStats(stats);
    } catch {
      setError('Error al cargar datos de bots');
    } finally {
      setBotLoading(false);
    }
  };

  const manualStatsMap = useMemo(() => {
    const m = new Map<string, { totalPnL: number; count: number; isProfit: boolean }>();
    manualStats.forEach((s, date) => m.set(date, { totalPnL: s.totalPnL, count: s.tradeCount, isProfit: s.isProfit }));
    return m;
  }, [manualStats]);

  const botStatsMap = useMemo(() => {
    const m = new Map<string, { totalPnL: number; count: number; isProfit: boolean }>();
    botDailyStats.forEach((s) => m.set(s.date, { totalPnL: s.totalPnL, count: s.tradeCount, isProfit: s.isProfit }));
    return m;
  }, [botDailyStats]);

  const maxAbsManual = useMemo(() => {
    let max = 0;
    manualStatsMap.forEach((s) => { if (Math.abs(s.totalPnL) > max) max = Math.abs(s.totalPnL); });
    return max || 1;
  }, [manualStatsMap]);

  const maxAbsBot = useMemo(() => {
    let max = 0;
    botStatsMap.forEach((s) => { if (Math.abs(s.totalPnL) > max) max = Math.abs(s.totalPnL); });
    return max || 1;
  }, [botStatsMap]);

  // ── Day click handlers ─────────────────────────────────────────────────────
  const handleManualDayClick = async (day: number) => {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setSelectedDate(dateStr);
    try {
      const trades = await positionService.getDailyTrades(dateStr);
      setSelectedDayTrades(trades);
    } catch {
      setSelectedDayTrades([]);
    }
    setSelectedDayStats(manualStats.get(dateStr) ?? null);
    setIsManualModalOpen(true);
  };

  const handleBotDayClick = async (day: number) => {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setSelectedBotDate(dateStr);
    try {
      const trades = await botService.getDailyTrades(dateStr, selectedBotId || undefined);
      setSelectedBotDayTrades(trades);
    } catch {
      setSelectedBotDayTrades([]);
    }
    const bsm = botStatsMap.get(dateStr);
    setSelectedBotDayStats(bsm ? { date: dateStr, totalPnL: bsm.totalPnL, tradeCount: bsm.count, isProfit: bsm.isProfit } : null);
    setIsBotModalOpen(true);
  };

  const handlePositionRefresh = async () => {
    await Promise.all([loadOpenPositions(), fetchManualData()]);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const monthName = currentDate.toLocaleDateString(localeMap[language] ?? language, { month: 'long', year: 'numeric' });

  const isLoading = activeTab === 'manual' ? manualLoading : botLoading;

  if (isLoading && manualStats.size === 0 && botDailyStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t.calendar.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t.calendar.pageTitle}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Open Positions Panel */}
        {activeTab === 'manual' && (
          <div className="mb-6">
            <OpenPositionsPanel
              positions={openPositions}
              prices={positionPrices}
              onRefresh={handlePositionRefresh}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg w-fit">
          {(['manual', 'bots'] as CalendarTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab === 'manual' ? 'Operaciones manuales' : 'Bots'}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={previousMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Filter row */}
          {activeTab === 'bots' && bots.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Bot
              </label>
              <select
                value={selectedBotId}
                onChange={(e) => setSelectedBotId(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos los bots</option>
                {bots.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {selectedBotId && (
                <button onClick={() => setSelectedBotId('')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline">
                  Limpiar
                </button>
              )}
            </div>
          )}

          {activeTab === 'bots' && bots.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              No tienes bots creados. Crea uno desde la sección Bots para ver su actividad aquí.
            </p>
          )}

          {/* Grid */}
          {activeTab === 'manual' ? (
            <CalendarGrid
              currentDate={currentDate}
              statsMap={manualStatsMap}
              maxAbsPnL={maxAbsManual}
              onDayClick={handleManualDayClick}
              weekdays={t.calendar.weekdays}
              countLabel={(n) => t.calendar.opsCount.replace('{n}', String(n))}
            />
          ) : (
            <CalendarGrid
              currentDate={currentDate}
              statsMap={botStatsMap}
              maxAbsPnL={maxAbsBot}
              onDayClick={handleBotDayClick}
              weekdays={t.calendar.weekdays}
              countLabel={(n) => `${n} op.`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded" />
              <span className="text-gray-700 dark:text-gray-300">{t.calendar.legendProfit}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded" />
              <span className="text-gray-700 dark:text-gray-300">{t.calendar.legendLoss}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded" />
              <span className="text-gray-700 dark:text-gray-300">{t.calendar.legendNoOps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual modal */}
      {isManualModalOpen && selectedDate && (
        <DailyPositionTradesModal
          date={selectedDate}
          trades={selectedDayTrades}
          stats={selectedDayStats}
          onClose={() => setIsManualModalOpen(false)}
        />
      )}

      {/* Bot modal */}
      {selectedBotDate && (
        <DailyBotTradesModal
          date={selectedBotDate}
          trades={selectedBotDayTrades}
          stats={selectedBotDayStats}
          isOpen={isBotModalOpen}
          onClose={() => setIsBotModalOpen(false)}
        />
      )}
    </div>
  );
}
