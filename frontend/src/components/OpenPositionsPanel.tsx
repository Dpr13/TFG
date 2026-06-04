import { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Position } from '../types';
import { positionService } from '../services';
import ClosePositionModal from './ClosePositionModal';
import OpenPositionModal from './OpenPositionModal';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  positions: Position[];
  prices: Record<string, number>;
  onRefresh: () => void;
}

function fmt(n: number, d = 2) { return n.toFixed(d); }

function unrealizedPnl(pos: Position, currentPrice: number) {
  return pos.direction === 'long'
    ? (currentPrice - pos.avgEntryPrice) * pos.quantityOpen
    : (pos.avgEntryPrice - currentPrice) * pos.quantityOpen;
}

function PositionRow({ pos, currentPrice, onRefresh }: { pos: Position; currentPrice?: number; onRefresh: () => void }) {
  const { t, language } = useLanguage();
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(n);

  const pnl = currentPrice != null ? unrealizedPnl(pos, currentPrice) : null;
  const pnlPct = currentPrice != null && pos.avgEntryPrice > 0
    ? pos.direction === 'long'
      ? ((currentPrice - pos.avgEntryPrice) / pos.avgEntryPrice) * 100
      : ((pos.avgEntryPrice - currentPrice) / pos.avgEntryPrice) * 100
    : null;

  const dirColor = pos.direction === 'long' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const dirBg    = pos.direction === 'long' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  const positive = pnl !== null && pnl >= 0;

  const handleDelete = async () => {
    if (!confirm(t.positions.deleteConfirm)) return;
    setDeleting(true);
    try { await positionService.deletePosition(pos.id); onRefresh(); }
    catch { alert(t.positions.errorDelete); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className={`p-2 rounded-lg ${dirBg}`}>
          {pos.direction === 'long'
            ? <TrendingUp className={`w-4 h-4 ${dirColor}`} />
            : <TrendingDown className={`w-4 h-4 ${dirColor}`} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 dark:text-white">{pos.symbol}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-semibold uppercase ${dirColor} ${dirBg}`}>
              {pos.direction}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex gap-2 flex-wrap">
            <span>{fmt(pos.quantityOpen, 4)} {t.calendar.units}</span>
            <span>·</span>
            <span>{t.positions.entry}: ${fmt(pos.avgEntryPrice, 4)}</span>
            {currentPrice != null && (
              <>
                <span>·</span>
                <span>{t.positions.current}: ${fmt(currentPrice, 4)}</span>
              </>
            )}
          </div>
          {pos.quantityOpen < pos.quantityTotal && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {t.positions.partialOpen.replace('{open}', fmt(pos.quantityOpen, 4)).replace('{total}', fmt(pos.quantityTotal, 4))}
            </p>
          )}
        </div>

        {pnl !== null && (
          <div className={`text-right text-sm font-semibold ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <div>{positive ? '+' : ''}{fmtCurrency(pnl)}</div>
            {pnlPct !== null && (
              <div className="text-xs font-normal opacity-75">{positive ? '+' : ''}{fmt(pnlPct)}%</div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button onClick={() => setClosing(true)}
            className="px-2.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors">
            {t.positions.close}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {closing && (
        <ClosePositionModal
          position={pos}
          onClose={() => setClosing(false)}
          onClosed={onRefresh}
        />
      )}
    </>
  );
}

export default function OpenPositionsPanel({ positions, prices, onRefresh }: Props) {
  const { t, language } = useLanguage();
  const today = new Date().toISOString().slice(0, 10);
  const [collapsed, setCollapsed] = useState(false);
  const [showOpen, setShowOpen] = useState(false);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(n);

  const totalUnrealized = positions.reduce((acc, pos) => {
    const cp = prices[pos.symbol];
    return cp != null ? acc + unrealizedPnl(pos, cp) : acc;
  }, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <button onClick={() => setCollapsed(c => !c)} className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{t.positions.openPositions}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold">
              {positions.length}
            </span>
            {collapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
          </button>
          {positions.length > 0 && (
            <span className={`text-xs sm:text-sm font-semibold ${totalUnrealized >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalUnrealized >= 0 ? '+' : ''}{fmtCurrency(totalUnrealized)}<span className="hidden sm:inline"> {t.positions.unrealized}</span>
            </span>
          )}
        </div>
        <button onClick={() => setShowOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span className="sm:hidden">{t.positions.newShort}</span>
          <span className="hidden sm:inline">{t.positions.newPosition}</span>
        </button>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-2">
          {positions.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              {t.positions.noPositions}
            </p>
          ) : (
            positions.map(pos => (
              <PositionRow
                key={pos.id}
                pos={pos}
                currentPrice={prices[pos.symbol]}
                onRefresh={onRefresh}
              />
            ))
          )}
        </div>
      )}

      {showOpen && (
        <OpenPositionModal
          defaultDate={today}
          onClose={() => setShowOpen(false)}
          onOpened={onRefresh}
        />
      )}
    </div>
  );
}
