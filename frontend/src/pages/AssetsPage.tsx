import { useState } from 'react';
import { Search, Loader2, Plus } from 'lucide-react';
import { useFetch } from '@hooks/useFetch';
import { assetService } from '@services/index';
import type { Asset } from '../types';
import AssetDetailModal from '../components/AssetDetailModal';

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchedAssets, setSearchedAssets] = useState<Asset[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { data: assets, loading, error } = useFetch<Asset[]>(
    () => assetService.getAssets(),
    []
  );

  // Combinar activos sugeridos con activos buscados
  const allAssets = [...(Array.isArray(assets) ? assets : []), ...searchedAssets];

  const filteredAssets = allAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Buscar activo dinámicamente en la API
  const handleSearchSymbol = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);

    try {
      const asset = await assetService.searchAssetBySymbol(searchQuery.trim());
      
      // Verificar si ya existe en la lista
      const exists = allAssets.some(a => a.symbol === asset.symbol);
      if (!exists) {
        setSearchedAssets(prev => [...prev, asset]);
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.error || 'No se encontró el símbolo');
    } finally {
      setSearching(false);
    }
  };

  // Buscar al presionar Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSymbol();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Activos Financieros
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Explora y analiza diferentes activos disponibles
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o símbolo (ej: AAPL, KO, NFLX)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearchSymbol}
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {asset.symbol}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {asset.name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  asset.type === 'stock' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    : asset.type === 'crypto'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                }`}>
                  {asset.type}
                </span>
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
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No se encontraron activos que coincidan con tu búsqueda
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Intenta buscar un símbolo específico (ej: AAPL, NFLX, META) presionando Enter o el botón "Buscar"
            </p>
          )}
        </div>
      )}

      {/* Modal de detalles del activo */}
      {selectedAsset && (
        <AssetDetailModal 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
        />
      )}
    </div>
  );
}
