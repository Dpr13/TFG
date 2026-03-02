import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  Star,
  Briefcase,
  Newspaper,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '@hooks/useWatchlist';
import { useFetch } from '@hooks/useFetch';
import { assetService, newsService, type NewsArticle } from '@services/index';
import type { Asset } from '../types';

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

function assetTypeBadge(type: Asset['type']) {
  const map = {
    stock: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    crypto: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    forex: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  };
  return map[type];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-xl flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          {loading ? (
            <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const published = new Date(article.publishedAt);
  const isToday = published.toDateString() === new Date().toDateString();

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                 shadow-sm hover:shadow-md hover:border-primary-400 dark:hover:border-primary-500
                 transition-all overflow-hidden"
    >
      {/* Thumbnail */}
      {article.thumbnail ? (
        <div className="w-full h-36 overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center flex-shrink-0">
          <Newspaper className="w-10 h-10 text-primary-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Tickers */}
        {article.relatedTickers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.relatedTickers.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.5 text-xs font-mono font-semibold rounded bg-primary-50 text-primary-700
                           dark:bg-primary-900/20 dark:text-primary-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-3 flex-1">
          {article.title}
        </h3>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[100px]">{article.publisher}</span>
            <span>·</span>
            <span className={isToday ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
              {timeAgo(article.publishedAt)}
            </span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
        </div>
      </div>
    </a>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  const { data: assets, loading: loadingAssets } = useFetch<Asset[]>(
    () => assetService.getAssets(),
    []
  );

  const {
    data: newsData,
    loading: loadingNews,
    error: newsError,
  } = useFetch<{ articles: NewsArticle[]; count: number }>(
    () => newsService.getNews('financial markets stocks economy', 9),
    []
  );

  const firstName = useMemo(() => {
    if (!user?.name) return '';
    return user.name.split(' ')[0];
  }, [user]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 13) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const todayNews = useMemo(() => {
    if (!newsData?.articles) return 0;
    const today = new Date().toDateString();
    return newsData.articles.filter(
      (a) => new Date(a.publishedAt).toDateString() === today
    ).length;
  }, [newsData]);

  return (
    <div className="space-y-8">

      {/* ── Bienvenida ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary-100 text-sm font-medium">{greeting}</p>
            <h2 className="text-2xl font-bold mt-0.5">
              {firstName ? `${firstName} 👋` : 'Bienvenido 👋'}
            </h2>
            <p className="text-primary-100 text-sm mt-1">
              Aquí tienes el resumen del mercado de hoy.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/assets"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm
                         rounded-lg text-white text-sm font-medium transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Ver activos
            </Link>
            <Link
              to="/risk"
              className="flex items-center gap-2 px-4 py-2 bg-white text-primary-700 hover:bg-primary-50
                         rounded-lg text-sm font-medium transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Analizar riesgo
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Activity}
          label="Activos disponibles"
          value={assets?.length ?? '—'}
          loading={loadingAssets}
          color="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Star}
          label="En seguimiento"
          value={watchlist.length}
          color="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          icon={Newspaper}
          label="Noticias hoy"
          value={loadingNews ? '—' : todayNews > 0 ? todayNews : 'Recientes'}
          loading={loadingNews}
          color="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
        />
      </div>

      {/* ── Seguimiento rápido ─────────────────────────────────────────── */}
      {watchlist.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Mi seguimiento</h3>
            </div>
            <Link
              to="/assets"
              state={{ tab: 'watchlist' }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              Gestionar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {watchlist.map((asset) => (
              <Link
                key={asset.symbol}
                to="/assets"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700
                           border border-gray-200 dark:border-gray-600 hover:border-primary-400
                           dark:hover:border-primary-500 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {asset.symbol}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                  {asset.name.length > 18 ? asset.name.slice(0, 18) + '…' : asset.name}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${assetTypeBadge(asset.type)}`}>
                  {asset.type}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Noticias ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Noticias del mercado
            </h3>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Yahoo Finance
          </span>
        </div>

        {loadingNews && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
              >
                <div className="h-36 bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {newsError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">No se pudieron cargar las noticias. Inténtalo de nuevo más tarde.</p>
          </div>
        )}

        {!loadingNews && !newsError && newsData?.articles && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsData.articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
