import { useState, useEffect, useRef } from 'react';
import type { Operation, CreateOperationDTO, DailyStats, Strategy, Asset } from '../types';
import { operationService, strategyService, assetService } from '../services';
import { ChevronUp, Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/format';

// ============================================================================
// DAILY OPERATIONS MODAL COMPONENT
// ============================================================================
// Modal para ver y editar operaciones de un día específico
//
// EXPANSIONES FUTURAS:
// - Validación in-form de precios (no permitir inversiones de lógica)
// - Autocompletado de símbolos desde histórico
// - Calculadora integrada para PnL
// - Importación de operaciones desde CSV/Excel
// - Copiar operación anterior similar
// - Historial de cambios en operación (auditoría)
// - Attach de archivos/screenshots de análisis
// - Plantillas de operaciones frecuentes
// - Atajos de teclado para operaciones comunes
// - Integración con datos de mercado en tiempo real
// ============================================================================

interface DailyOperationsModalProps {
  date: string;
  operations: Operation[];
  stats: DailyStats | null;
  isOpen: boolean;
  onClose: () => void;
  onOperationAdded: () => void;
  onOperationDeleted: () => void;
}

export default function DailyOperationsModal({
  date,
  operations,
  stats,
  isOpen,
  onClose,
  onOperationAdded,
  onOperationDeleted,
}: DailyOperationsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const symbolInputRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    buyPrice: '',
    sellPrice: '',
    strategyId: '',
    notes: '',
  });

  // Fetch strategies and assets when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStrategies();
      loadAssets();
    }
  }, [isOpen]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (symbolInputRef.current && !symbolInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStrategies = async () => {
    try {
      const data = await strategyService.getAllStrategies();
      setStrategies(data);
    } catch (err) {
      console.error('Error loading strategies:', err);
    }
  };

  const loadAssets = async () => {
    try {
      const data = await assetService.getAssets();
      setAvailableAssets(data);
    } catch (err) {
      console.error('Error loading assets:', err);
    }
  };

  const handleSymbolChange = (value: string) => {
    setFormData({ ...formData, symbol: value });

    if (value.trim().length > 0) {
      const filtered = availableAssets.filter(asset =>
        asset.symbol.toLowerCase().includes(value.toLowerCase()) ||
        asset.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAssets(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredAssets([]);
      setShowSuggestions(false);
    }
  };

  const selectAsset = (asset: Asset) => {
    setFormData({ ...formData, symbol: asset.symbol });
    setShowSuggestions(false);
  };

  const validateSymbol = async (symbol: string): Promise<boolean> => {
    try {
      // Check if symbol exists in available assets
      const exists = availableAssets.some(
        asset => asset.symbol.toUpperCase() === symbol.toUpperCase()
      );

      if (!exists) {
        // Try to search in the API
        await assetService.searchAssetBySymbol(symbol);
      }

      return true;
    } catch (err) {
      return false;
    }
  };

  const handleAddOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate symbol exists
      const symbolExists = await validateSymbol(formData.symbol);
      if (!symbolExists) {
        setError(`El símbolo "${formData.symbol.toUpperCase()}" no existe. Por favor, selecciona un activo válido.`);
        setLoading(false);
        return;
      }

      const operationData: CreateOperationDTO = {
        date,
        symbol: formData.symbol.toUpperCase(),
        quantity: parseFloat(formData.quantity),
        buyPrice: parseFloat(formData.buyPrice),
        sellPrice: parseFloat(formData.sellPrice),
        strategyId: formData.strategyId || undefined,
        notes: formData.notes || undefined,
      };

      await operationService.createOperation(operationData);
      setFormData({ symbol: '', quantity: '', buyPrice: '', sellPrice: '', strategyId: '', notes: '' });
      setShowSuggestions(false);
      onOperationAdded();
    } catch (err) {
      setError('Error al crear la operación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOperation = async (operationId: string) => {
    if (!window.confirm('¿Deseas eliminar esta operación?')) return;

    setLoading(true);
    setError(null);

    try {
      await operationService.deleteOperation(operationId);
      onOperationDeleted();
    } catch (err) {
      setError('Error al eliminar la operación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const pnlClass = stats && stats.isProfit
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
  const bgClass = stats && stats.isProfit
    ? 'bg-green-50 dark:bg-green-900/20'
    : stats
      ? 'bg-red-50 dark:bg-red-900/20'
      : 'bg-gray-50 dark:bg-gray-700/50';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className={`${bgClass} border-b border-gray-200 dark:border-gray-700 p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {(() => {
                const [y, m, d] = date.split('-').map(Number);
                return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                });
              })()}
              </h2>
              {stats && (
                <div className="mt-2">
                  <div className={`text-lg font-semibold ${pnlClass}`}>
                    PnL: {formatCurrency(stats.totalPnL, 'EUR')} ({stats.totalPnLPercentage.toFixed(2)}%)
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.operationCount} operación(es)
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Operations List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Operaciones
            </h3>
            {operations.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No hay operaciones para este día</p>
            ) : (
              <div className="space-y-3">
                {operations.map((op) => (
                  <div
                    key={op.id}
                    className={`p-4 rounded-lg border ${op.pnl >= 0
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-gray-900 dark:text-white">
                            {op.symbol}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {op.quantity} unidades
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <div>Entrada: {formatCurrency(op.buyPrice, 'EUR')}</div>
                          <div>Salida: {formatCurrency(op.sellPrice, 'EUR')}</div>
                          {op.strategyId && (
                            <div className="mt-1">
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                {strategies.find(s => s.id === op.strategyId)?.name || 'Estrategia'}
                              </span>
                            </div>
                          )}
                          {op.notes && <div className="mt-1 italic">{op.notes}</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-semibold ${op.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          {formatCurrency(op.pnl, 'EUR')}
                        </div>
                        <div
                          className={`text-sm font-semibold ${op.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          {op.pnlPercentage.toFixed(2)}%
                        </div>
                        <button
                          onClick={() => handleDeleteOperation(op.id)}
                          disabled={loading}
                          className="mt-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Operation Form */}
          {isEditMode && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Añadir Operación
              </h3>
              <form onSubmit={handleAddOperation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Symbol Input with Autocomplete */}
                  <div className="relative" ref={symbolInputRef}>
                    <input
                      type="text"
                      placeholder="Símbolo (ej: AAPL, TSLA)"
                      value={formData.symbol}
                      onChange={(e) => handleSymbolChange(e.target.value)}
                      onFocus={() => formData.symbol && setShowSuggestions(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      required
                    />

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && filteredAssets.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredAssets.slice(0, 8).map((asset) => (
                          <button
                            key={asset.symbol}
                            type="button"
                            onClick={() => selectAsset(asset)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {asset.symbol}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {asset.name}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {asset.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Quantity Input */}
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio de compra"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    step="any"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio de venta"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    step="any"
                    required
                  />
                </div>
                <div>
                  <select
                    value={formData.strategyId}
                    onChange={(e) => setFormData({ ...formData, strategyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <option value="">Sin estrategia</option>
                    {strategies.map((strategy) => (
                      <option key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Notas (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Toggle Edit Mode */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
          >
            {isEditMode ? (
              <>
                <ChevronUp className="w-5 h-5" /> Cerrar Edición
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" /> Añadir Operación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
