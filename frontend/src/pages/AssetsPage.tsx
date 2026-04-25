import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, Plus, Star } from 'lucide-react';
import { useFetch } from '@hooks/useFetch';
import { useWatchlist } from '@hooks/useWatchlist';
import { assetService } from '@services/index';
import type { Asset } from '../types';
import AssetDetailModal from '../components/AssetDetailModal';
import SymbolAutocomplete from '../components/SymbolAutocomplete';
import { useLanguage } from '../context/LanguageContext';

export default function AssetsPage() {
  const location = useLocation();
  const initialTab = (location.state as { tab?: string } | null)?.tab === 'watchlist' ? 'watchlist' : 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchedAssets, setSearchedAssets] = useState<Asset[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeView, setActiveView] = useState<'all' | 'watchlist'>(initialTab);
  const { watchlist, isFavorite, toggleFavorite } = useWatchlist();
  const { t } = useLanguage();

  const { data: assets, loading, error } = useFetch<Asset[]>(
    () => assetService.getAssets(),
    []
  );

  // Cargar activos buscados del usuario al montar el componente
  useEffect(() => {
    const loadSearchedAssets = async () => {
      try {
        const userSearchedAssets = await assetService.getUserSearchedAssets();
        setSearchedAssets(userSearchedAssets || []);
      } catch (err) {
        // No mostrar error si no está autenticado o si hay un problema
        // Los activos simplemente no se cargarán desde el backend
        console.warn('Could not load user searched assets:', err);
      }
    };

    loadSearchedAssets();
  }, []);

  // Combinar activos: primero los buscados, luego los sugeridos, máximo 18
  const allAssets = [
    ...searchedAssets,
    ...(Array.isArray(assets) ? assets : [])
  ].reduce((unique: Asset[], asset) => {
    // Evitar duplicados
    if (!unique.some(a => a.symbol === asset.symbol)) {
      unique.push(asset);
    }
    return unique;
  }, []).slice(0, 18); // Limitar a 18 activos

  const baseAssets = activeView === 'watchlist' ? watchlist : allAssets;

  const filteredAssets = baseAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Buscar activo dinámicamente en la API
  const handleSearchSymbol = async (symbolOverride?: string) => {
    const sym = symbolOverride || searchQuery.trim();
    if (!sym) return;

    setSearching(true);
    setSearchError(null);

    try {
      const asset = await assetService.searchAssetBySymbol(sym);

      // Siempre mover el activo buscado al principio (más reciente primero)
      // Incluso si ya estaba en la lista "sugeridos" o ya fue buscado antes.
      setSearchedAssets((prev) => [asset, ...prev.filter((a) => a.symbol !== asset.symbol)]);

      // Guardar en el backend (sin bloquear si falla)
      // Esto también actualiza el searched_at si ya existía.
      try {
        await assetService.saveSearchedAsset(asset.symbol, asset.name, asset.type);
      } catch (err) {
        console.warn('Warning: Could not save searched asset to backend:', err);
        // El activo se muestra aunque no se haya guardado en el backend
      }

      // Mantener la búsqueda activa para que la lista quede filtrada
      setSearchQuery(asset.symbol);
    } catch (err: any) {
      setSearchError(
        err.response?.data?.error ||
        'No se encontró el activo. Comprueba que el símbolo sea correcto.'
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Activos Financieros
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Explora y analiza diferentes activos disponibles
          </p>
        </div>
        {/* Tabs vista */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden self-start sm:self-auto">
          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveView('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
              activeView === 'watchlist'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Star className="w-4 h-4" fill={activeView === 'watchlist' ? 'currentColor' : 'none'} />
            Seguimiento
            {watchlist.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeView === 'watchlist'
                  ? 'bg-white/20 text-white'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {watchlist.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative flex gap-2">
            <SymbolAutocomplete
              value={searchQuery}
              onChange={(symbol) => {
                setSearchQuery(symbol);
                if (symbol) handleSearchSymbol(symbol);
              }}
              onSubmit={(symbol) => {
                if (symbol) {
                  setSearchQuery(symbol);
                  handleSearchSymbol(symbol);
                }
              }}
              placeholder={t.assets.searchPlaceholder}
              className="flex-1"
              showSearchIcon
              inputClassName="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSearchSymbol()}
              disabled={searching || !searchQuery.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Buscar
            </button>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="stock">Acciones</option>
            <option value="crypto">Criptomonedas</option>
            <option value="forex">Forex</option>
          </select>
        </div>
        {searchError && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {searchError}
          </div>
        )}
      </div>

      {/* Lista de activos */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">
            Error al cargar activos: {error.message}
          </p>
        </div>
      )}

      {!loading && !error && filteredAssets && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700
                       hover:shadow-md transition-shadow cursor-pointer hover:border-primary-400 dark:hover:border-primary-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {asset.symbol}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {asset.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    asset.type === 'stock' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      : asset.type === 'crypto'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {asset.type}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(asset); }}
                    title={isFavorite(asset.symbol) ? 'Quitar de seguimiento' : 'Añadir a seguimiento'}
                    className={`p-1 rounded transition-colors ${
                      isFavorite(asset.symbol)
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400 dark:text-gray-600 dark:hover:text-yellow-400'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={isFavorite(asset.symbol) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              {asset.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {asset.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredAssets?.length === 0 && (
        <div className="text-center py-12">
          {activeView === 'watchlist' ? (
            <>
              <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Tu lista de seguimiento está vacía
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Pulsa la estrella <Star className="w-3 h-3 inline" /> en cualquier activo para añadirlo
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No se encontraron activos que coincidan con tu búsqueda
              </p>
              {searchQuery && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Intenta buscar un símbolo específico (ej: AAPL, NFLX, META) presionando Enter o el botón "Buscar"
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal de detalles del activo */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          isFavorite={isFavorite(selectedAsset.symbol)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

