import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { positionService, quoteService } from '../services';
import type { Position } from '../types';

interface Props {
  position: Position;
  onClose: () => void;
  onClosed: () => void;
}

export default function ClosePositionModal({ position, onClose, onClosed }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [quantity, setQuantity] = useState(String(position.quantityOpen));
  const [price, setPrice] = useState('');
  const [executedAt, setExecutedAt] = useState(today);
  const [fetchingPrice, setFetchingPrice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    quoteService.getPrice(position.symbol)
      .then(p => { if (p !== null) setPrice(String(p)); })
      .catch(() => {})
      .finally(() => setFetchingPrice(false));
  }, [position.symbol]);

  const qty = Number(quantity);
  const px  = Number(price);
  const estimatedPnl = qty > 0 && px > 0
    ? position.direction === 'long'
      ? (px - position.avgEntryPrice) * qty
      : (position.avgEntryPrice - px) * qty
    : null;
  const isPartial = qty < position.quantityOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0 || qty > position.quantityOpen) {
      setError(`La cantidad debe estar entre 0 y ${position.quantityOpen}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await positionService.closePosition(position.id, { quantity: qty, price: px, executedAt });
      onClosed();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar la posición');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500';
  const dirColor = position.direction === 'long' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cerrar posición</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Position summary */}
        <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Símbolo</span>
            <span className="font-bold text-gray-900 dark:text-white">{position.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Dirección</span>
            <span className={`font-semibold uppercase ${dirColor}`}>{position.direction}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Precio de entrada</span>
            <span className="font-semibold text-gray-900 dark:text-white">${position.avgEntryPrice.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Disponible</span>
            <span className="font-semibold text-gray-900 dark:text-white">{position.quantityOpen} uds</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cantidad a cerrar</label>
              <input type="number" min="0" max={position.quantityOpen} step="any" value={quantity} onChange={e => setQuantity(e.target.value)} className={inputCls} required />
              <p className="mt-0.5 text-xs text-gray-400">Máx: {position.quantityOpen}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                Precio de salida
                {fetchingPrice && <Loader2 className="w-3 h-3 animate-spin text-primary-500" />}
              </label>
              <input type="number" min="0" step="any" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} placeholder="0.00" required />
            </div>
          </div>

          {/* Estimated PnL */}
          {estimatedPnl !== null && (
            <div className={`p-3 rounded-xl text-sm font-semibold text-center ${estimatedPnl >= 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              PnL estimado: {estimatedPnl >= 0 ? '+' : ''}{estimatedPnl.toFixed(2)} $
              {isPartial && <span className="ml-2 text-xs font-normal opacity-75">(cierre parcial)</span>}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de cierre</label>
            <input type="date" value={executedAt} onChange={e => setExecutedAt(e.target.value)} className={inputCls} required />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? 'Cerrando...' : isPartial ? 'Cierre parcial' : 'Cerrar posición'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
