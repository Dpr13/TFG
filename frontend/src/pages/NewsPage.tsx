import { useState, useMemo } from 'react';
import {
  Newspaper,
  ExternalLink,
  Clock,
  Search,
  Filter,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useFetch } from '@hooks/useFetch';
import { newsService } from '@services/index';

// ── Types ────────────────────────────────────────────────────────────────────

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  publisher: string;
  thumbnail?: string;
  relatedTickers: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('financial markets stocks economy');
  const [filterToday, setFilterToday] = useState(false);

  const {
    data: newsData,
    loading: loadingNews,
  } = useFetch<{ articles: NewsArticle[]; count: number }>(
    () => newsService.getNews(searchQuery, 24),
    [searchQuery]
  );

  const filteredArticles = useMemo(() => {
    if (!newsData?.articles) return [];
    if (!filterToday) return newsData.articles;
    
    const today = new Date().toDateString();
    return newsData.articles.filter(
      (a) => new Date(a.publishedAt).toDateString() === today
    );
  }, [newsData, filterToday]);

  const todayCount = useMemo(() => {
    if (!newsData?.articles) return 0;
    const today = new Date().toDateString();
    return newsData.articles.filter(
      (a) => new Date(a.publishedAt).toDateString() === today
    ).length;
  }, [newsData]);

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Noticias del mercado
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Mantente informado con las últimas noticias financieras
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total noticias</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loadingNews ? '...' : newsData?.count ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loadingNews ? '...' : todayCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fuente</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Yahoo Finance</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Today */}
          <button
            onClick={() => setFilterToday(!filterToday)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                     ${filterToday 
                       ? 'bg-blue-600 text-white shadow-md' 
                       : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                     }`}
          >
            <Filter className="w-4 h-4" />
            Solo hoy
            {filterToday && todayCount > 0 && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                {todayCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── News Grid ───────────────────────────────────────────────── */}
      {loadingNews && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loadingNews && filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Newspaper className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay noticias disponibles
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filterToday 
              ? 'No hay noticias publicadas hoy. Intenta desactivar el filtro.'
              : 'Intenta con un término de búsqueda diferente.'
            }
          </p>
        </div>
      )}

      {!loadingNews && filteredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => {
            const published = new Date(article.publishedAt);
            const isToday = published.toDateString() === new Date().toDateString();

            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
                         shadow-sm hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500
                         transition-all overflow-hidden"
              >
                {/* Thumbnail */}
                {article.thumbnail ? (
                  <div className="w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-blue-400" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Tickers */}
                  {article.relatedTickers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {article.relatedTickers.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700
                                   dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">{article.publisher}</span>
                      <span>·</span>
                      <span className={`font-medium ${isToday ? 'text-green-600 dark:text-green-400' : ''}`}>
                        {timeAgo(article.publishedAt)}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* ── Info Footer ─────────────────────────────────────────────── */}
      {!loadingNews && filteredArticles.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          Mostrando {filteredArticles.length} de {newsData?.count ?? 0} noticias
          {filterToday && ' de hoy'}
        </div>
      )}

    </div>
  );
}
