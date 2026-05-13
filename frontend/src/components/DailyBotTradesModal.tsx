import type { BotDailyStats, BotTradeWithBot } from '../types';

interface DailyBotTradesModalProps {
  date: string;
  trades: BotTradeWithBot[];
  stats: BotDailyStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyBotTradesModal({
  date,
  trades,
  stats,
  isOpen,
  onClose,
}: DailyBotTradesModalProps) {
  if (!isOpen) return null;

  const [y, m, d] = date.split('-').map(Number);
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const pnlClass = stats && stats.isProfit
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
  const bgClass = stats && stats.isProfit
    ? 'bg-green-50 dark:bg-green-900/20'
    : stats
      ? 'bg-red-50 dark:bg-red-900/20'
      : 'bg-gray-50 dark:bg-gray-700/50';

  const sellTrades = trades.filter(t => t.side === 'SELL');
  const buyTrades = trades.filter(t => t.side === 'BUY');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className={`${bgClass} border-b border-gray-200 dark:border-gray-700 p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {dateLabel}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Actividad de bots</p>
              {stats ? (
                <div className="mt-2">
                  <div className={`text-lg font-semibold ${pnlClass}`}>
                    PnL: {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)} €
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.tradeCount} operaciones cerradas · {trades.length} órdenes totales
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sin actividad este día</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {trades.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No hay actividad de bots para este día.</p>
          ) : (
            <>
              {/* Closed positions (SELL with PnL) */}
              {sellTrades.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Posiciones cerradas ({sellTrades.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {sellTrades.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          (t.pnl ?? 0) >= 0
                            ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                            : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            SELL
                          </span>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">{t.symbol}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">· {t.botName}</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t.quantity.toFixed(4)} uds @ {t.fillPrice.toFixed(2)} €
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold text-sm ${(t.pnl ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {(t.pnl ?? 0) >= 0 ? '+' : ''}{(t.pnl ?? 0).toFixed(2)} €
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(t.executedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open entries (BUY without closed PnL) */}
              {buyTrades.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Entradas ({buyTrades.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {buyTrades.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            BUY
                          </span>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">{t.symbol}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">· {t.botName}</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t.quantity.toFixed(4)} uds @ {t.fillPrice.toFixed(2)} €
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(t.executedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
