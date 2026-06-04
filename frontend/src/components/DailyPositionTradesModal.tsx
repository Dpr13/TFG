import { useState } from 'react';
import { TrendingUp, TrendingDown, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { PositionTrade, PositionDailyStats } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  date: string;
  trades: PositionTrade[];
  stats: PositionDailyStats | null;
  onClose: () => void;
}

function fmt(n: number, d = 2) { return n.toFixed(d); }

export default function DailyPositionTradesModal({ date, trades, stats, onClose }: Props) {
  const { t, language } = useLanguage();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(n);

  const fmtDateTime = (iso: string) => {
    const [y, m, d] = iso.split('T')[0].split('-').map(Number);
    const time = iso.includes('T') ? iso.split('T')[1].slice(0, 5) : null;
    const dateStr = new Date(y, m - 1, d).toLocaleDateString(language, { day: '2-digit', month: 'short', year: 'numeric' });
    return time ? `${dateStr} · ${time}` : dateStr;
  };

  const [y, m, d] = date.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString(language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const toggle = (id: string) => setExpandedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const isProfit = (stats?.totalPnL ?? 0) > 0;
  const headerBg = stats
    ? isProfit ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    : 'bg-gray-50 dark:bg-gray-700/50';
  const pnlColor = isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto m-4">

        <div className={`${headerBg} border-b border-gray-200 dark:border-gray-700 p-5`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{label}</h2>
              {stats && (
                <div className="mt-1.5 flex items-center gap-3">
                  <span className={`text-lg font-semibold ${pnlColor}`}>
                    {isProfit ? '+' : ''}{fmtCurrency(stats.totalPnL)}
                  </span>
                  <span className={`text-sm ${pnlColor}`}>({fmt(stats.totalPnLPercentage)}%)</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t.positions.closings.replace('{n}', String(stats.tradeCount))}
                  </span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {trades.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              {t.positions.noClosings}
            </p>
          ) : (
            <div className="space-y-3">
              {trades.map(tr => {
                const positive = (tr.pnl ?? 0) >= 0;
                const isLong = tr.direction === 'long';
                const dirColor = isLong ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                const dirBg    = isLong ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
                const open     = expandedIds.has(tr.id);

                return (
                  <div key={tr.id} className={`rounded-xl border ${positive ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'} bg-white dark:bg-gray-800 overflow-hidden`}>

                    <button
                      onClick={() => toggle(tr.id)}
                      className="w-full p-4 flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${dirBg}`}>
                          {isLong
                            ? <TrendingUp className={`w-4 h-4 ${dirColor}`} />
                            : <TrendingDown className={`w-4 h-4 ${dirColor}`} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{tr.symbol ?? '—'}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-semibold uppercase ${dirColor} ${dirBg}`}>
                              {tr.direction ?? '—'}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <div>{t.positions.quantityLabel}: <span className="font-medium text-gray-700 dark:text-gray-300">{fmt(tr.quantity, 4)} {t.calendar.units}</span></div>
                            <div>{t.positions.exitPriceLabel}: <span className="font-medium text-gray-700 dark:text-gray-300">${fmt(tr.price, 4)}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {tr.pnl !== undefined && (
                          <div className={`text-right text-sm font-semibold ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            <div>{positive ? '+' : ''}{fmtCurrency(tr.pnl)}</div>
                            {tr.pnlPct !== undefined && (
                              <div className="text-xs font-normal opacity-75">{positive ? '+' : ''}{fmt(tr.pnlPct)}%</div>
                            )}
                          </div>
                        )}
                        {open
                          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      </div>
                    </button>

                    {open && (
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                          <div>
                            <dt className="text-gray-400 dark:text-gray-500">{t.positions.closeDateLabel}</dt>
                            <dd className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">{fmtDateTime(tr.executedAt)}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-400 dark:text-gray-500">{t.positions.directionField}</dt>
                            <dd className={`font-semibold mt-0.5 uppercase ${dirColor}`}>{tr.direction ?? '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-400 dark:text-gray-500">{t.positions.closedQuantityField}</dt>
                            <dd className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">{fmt(tr.quantity, 4)} {t.calendar.units}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-400 dark:text-gray-500">{t.positions.exitPriceField ?? t.positions.exitPriceLabel}</dt>
                            <dd className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">${fmt(tr.price, 4)}</dd>
                          </div>
                          {tr.pnl !== undefined && (
                            <div>
                              <dt className="text-gray-400 dark:text-gray-500">{t.positions.realizedPnl}</dt>
                              <dd className={`font-semibold mt-0.5 ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {positive ? '+' : ''}{fmtCurrency(tr.pnl)}
                                {tr.pnlPct !== undefined && <span className="font-normal opacity-75 ml-1">({positive ? '+' : ''}{fmt(tr.pnlPct)}%)</span>}
                              </dd>
                            </div>
                          )}
                          <div>
                            <dt className="text-gray-400 dark:text-gray-500">{t.positions.positionId}</dt>
                            <dd className="font-mono text-gray-500 dark:text-gray-400 mt-0.5 truncate">{tr.positionId}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
