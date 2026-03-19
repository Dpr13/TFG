import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper,
  ExternalLink,
  Clock,
  Search,
  Filter,
  Zap,
  ChevronLeft,
} from 'lucide-react';
import { useFetch } from '@hooks/useFetch';
import { newsService } from '@services/index';

import type { NewsArticle } from '../types';

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
  const navigate = useNavigate();
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>
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

      {/* ── Banner CTA ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-6 shadow-lg">
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-2 right-24 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative flex items-center gap-4">
          <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest mb-0.5">
              Actualizado en tiempo real · Yahoo Finance
            </p>
            <h2 className="text-xl font-bold text-white">
              ¡Revisa las últimas noticias del mercado!
            </h2>
            <p className="text-blue-100 text-sm mt-0.5">
              Usa el buscador para filtrar por empresa, sector o activo.
            </p>
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
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
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
        <div className="flex flex-col gap-3">
          {filteredArticles.map((article) => {
            const published = new Date(article.publishedAt);
            const isToday = published.toDateString() === new Date().toDateString();

            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
                         shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500
                         transition-all p-4"
              >
                {/* Icono */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mt-0.5">
                  <Newspaper className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Tickers */}
                  {article.relatedTickers && article.relatedTickers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.relatedTickers.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700
                                   dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[160px]">{article.publisher}</span>
                    <span>·</span>
                    <span className={`font-medium ${isToday ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {timeAgo(article.publishedAt)}
                    </span>
                  </div>
                </div>

                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
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
