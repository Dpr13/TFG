import { useState, useEffect, useCallback } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Info } from 'lucide-react';
import { newsService } from '../../services';
import { NewsArticle } from '../../types';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<'mercados' | 'activo'>('mercados');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  // Formateador de tiempo relativo
  const tiempoRelativo = (isoString: string) => {
    const timestamp = Math.floor(new Date(isoString).getTime() / 1000);
    const diff = Math.floor((Date.now() / 1000) - timestamp);
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
  };

  const loadNews = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      let data: NewsArticle[] = [];
      if (activeTab === 'mercados') {
        data = await newsService.getMarketNews();
      } else if (activeTab === 'activo' && activeTicker) {
        data = await newsService.getAssetNews(activeTicker);
      }
      setNews(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error al cargar noticias:', err);
      setError('No se pudieron cargar las noticias. Inténtalo de nuevo.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [activeTab, activeTicker]);

  // Carga inicial y por cambio de pestaña/ticker/refreshKey
  useEffect(() => {
    loadNews();
  }, [loadNews, refreshKey]);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadNews(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNews]);

  // Escuchar evento de activo analizado
  useEffect(() => {
    const handleActivo = (e: any) => {
      const ticker = e.detail?.ticker;
      if (ticker) {
        setActiveTicker(ticker);
        // Autocarga si estamos en pestaña activo
        if (activeTab === 'activo') setRefreshKey(k => k + 1);
      }
    };
    window.addEventListener('activoAnalizado', handleActivo);
    return () => window.removeEventListener('activoAnalizado', handleActivo);
  }, [activeTab]);

  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-[calc(100vh-65px)] flex flex-col z-40">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Noticias</h2>
          </div>
          <button 
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors disabled:opacity-50"
            title="Recargar noticias"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg gap-1">
          <button
            onClick={() => setActiveTab('mercados')}
            className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'mercados'
                ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Mercados
          </button>
          <button
            onClick={() => setActiveTab('activo')}
            className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all truncate ${
              activeTab === 'activo'
                ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {activeTicker ? `Activo · ${activeTicker}` : 'Activo'}
          </button>
        </div>

        {/* Update timestamp */}
        <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 text-center">
          Actualizado hace {Math.floor((Date.now() - lastUpdate.getTime()) / 60000)}m
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{error}</p>
            <button 
              onClick={() => setRefreshKey(k => k + 1)}
              className="text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              Reintentar
            </button>
          </div>
        ) : activeTab === 'activo' && !activeTicker ? (
          <div className="p-8 text-center">
            <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Analiza un activo para ver noticias relacionadas.
            </p>
          </div>
        ) : news.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No hay noticias disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {item.publisher}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-600">•</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {tiempoRelativo(item.publishedAt)}
                    </span>
                  </div>
                </div>
                {item.thumbnail && (
                  <div className="flex-shrink-0">
                    <img 
                      src={item.thumbnail} 
                      alt="" 
                      className="w-10 h-10 object-cover rounded shadow-sm bg-gray-100 dark:bg-gray-700"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3" />
          Fuente: Yahoo Finance
        </p>
      </div>
    </aside>
  );
}
