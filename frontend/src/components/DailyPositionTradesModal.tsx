import { TrendingUp, TrendingDown, X } from 'lucide-react';
import type { PositionTrade, PositionDailyStats } from '../types';

interface Props {
  date: string;
  trades: PositionTrade[];
  stats: PositionDailyStats | null;
  onClose: () => void;
}

function fmt(n: number, d = 2) { return n.toFixed(d); }
function fmtCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n);
}

export default function DailyPositionTradesModal({ date, trades, stats, onClose }: Props) {
  const [y, m, d] = date.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const isProfit = (stats?.totalPnL ?? 0) > 0;
  const headerBg = stats
    ? isProfit ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    : 'bg-gray-50 dark:bg-gray-700/50';
  const pnlColor = isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">{stats.tradeCount} cierre(s)</span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trade list */}
        <div className="p-5">
          {trades.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No hay cierres de posiciones en este día.
            </p>
          ) : (
            <div className="space-y-3">
              {trades.map(tr => {
                const positive = (tr.pnl ?? 0) >= 0;
                const isLong = tr.direction === 'long';
                const dirColor = isLong ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                const dirBg    = isLong ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';

                return (
                  <div key={tr.id} className={`p-4 rounded-xl border ${positive ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'} bg-white dark:bg-gray-800`}>
                    <div className="flex items-start justify-between gap-3">
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
                            <div>Cantidad cerrada: <span className="font-medium text-gray-700 dark:text-gray-300">{fmt(tr.quantity, 4)} uds</span></div>
                            <div>Precio de salida: <span className="font-medium text-gray-700 dark:text-gray-300">${fmt(tr.price, 4)}</span></div>
                          </div>
                        </div>
                      </div>

                      {tr.pnl !== undefined && (
                        <div className={`text-right text-sm font-semibold ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          <div>{positive ? '+' : ''}{fmtCurrency(tr.pnl)}</div>
                          {tr.pnlPct !== undefined && (
                            <div className="text-xs font-normal opacity-75">{positive ? '+' : ''}{fmt(tr.pnlPct)}%</div>
                          )}
                        </div>
                      )}
                    </div>
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
