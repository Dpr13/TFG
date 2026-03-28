import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  Star,
  Briefcase,
  Newspaper,
  ExternalLink,
  ArrowRight,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '@hooks/useWatchlist';
import { useFetch } from '@hooks/useFetch';
import { newsService, operationService, strategyService } from '@services/index';
import type { Operation, Strategy, NewsArticle } from '../types';

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

// ── Mini Components ──────────────────────────────────────────────────────────

function MiniSparkline() {
  return (
    <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
      <polyline
        points="0,20 15,15 25,18 35,12 45,14 55,10 65,8 75,12 85,7 100,5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-500"
      />
    </svg>
  );
}

function MiniDonutChart({ value, total, color = 'blue' }: { value: number; total: number; color?: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap: Record<string, string> = {
    blue: 'stroke-blue-600 dark:stroke-blue-400',
    green: 'stroke-green-600 dark:stroke-green-400',
    purple: 'stroke-purple-600 dark:stroke-purple-400',
  };

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        className="text-gray-200 dark:text-gray-700"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={colorMap[color]}
      />
    </svg>
  );
}

function MiniBarChart() {
  const bars = [60, 45, 50, 75, 65, 80, 55];
  const days = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  
  return (
    <div className="flex items-end justify-between h-full gap-1 px-2">
      {bars.map((height, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full bg-blue-600 dark:bg-blue-500 rounded-t"
            style={{ height: `${height}%` }}
          />
          <span className="text-[8px] text-gray-500 dark:text-gray-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  const { data: operations, loading: loadingOperations } = useFetch<Operation[]>(
    () => operationService.getAllOperations(),
    []
  );

  const { data: strategies, loading: loadingStrategies } = useFetch<Strategy[]>(
    () => strategyService.getAllStrategies(),
    []
  );

  const {
    data: newsData,
    loading: loadingNews,
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

  // Contar tipos de activos en watchlist
  const watchlistStats = useMemo(() => {
    const stats = { stock: 0, crypto: 0, forex: 0 };
    watchlist.forEach(asset => {
      stats[asset.type]++;
    });
    return stats;
  }, [watchlist]);

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Header con Saludo ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          ¡{greeting} {firstName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí tienes el resumen del mercado de hoy.
        </p>
      </div>

      {/* ── Grid Principal ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Fila 1: Mini Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Operaciones registradas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {loadingOperations ? '...' : operations?.length ?? 0}
              </p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="h-12">
            <MiniSparkline />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estrategias</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {loadingStrategies ? '...' : strategies?.length ?? 0}
              </p>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="h-16 flex items-center justify-center">
            <div className="w-16 h-16">
              <MiniDonutChart 
                value={strategies?.length ?? 0} 
                total={Math.max(5, strategies?.length ?? 5)} 
                color="green" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En seguimiento</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {watchlist.length}
              </p>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Stocks {watchlistStats.stock}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Crypto {watchlistStats.crypto}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Forex {watchlistStats.forex}</span>
            </div>
          </div>
        </div>

        {/* Fila 2: Card Grande + 2 Mini */}
        <div className="lg:row-span-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Analizar riesgo</h3>
            <p className="text-blue-100 text-sm mb-6">
              Evalúa el riesgo de tus inversiones y toma decisiones informadas
            </p>
            
            <div className="flex flex-col gap-3">
              <Link
                to="/assets"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 
                         backdrop-blur-sm rounded-lg text-white font-medium transition-all
                         border border-white/30"
              >
                <Briefcase className="w-4 h-4" />
                Ver activos
              </Link>
              <Link
                to="/analisis"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-700 
                         hover:bg-blue-50 rounded-lg font-medium transition-all shadow-lg"
              >
                <TrendingUp className="w-4 h-4" />
                Analizar riesgo
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">En seguimiento</p>
            <div className="w-12 h-12">
              <MiniDonutChart value={watchlist.length} total={10} color="purple" />
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Stocks</span>
              <span className="font-semibold text-gray-900 dark:text-white">{watchlistStats.stock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Crypto</span>
              <span className="font-semibold text-gray-900 dark:text-white">{watchlistStats.crypto}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Otros</span>
              <span className="font-semibold text-gray-900 dark:text-white">{watchlistStats.forex}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Actividad semanal</p>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="h-12">
            <MiniBarChart />
          </div>
        </div>
      </div>

      {/* ── Seguimiento ──────────────────────────────────────────────────── */}
      {watchlist.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Seguimiento</h3>
            </div>
            <Link
              to="/assets"
              state={{ tab: 'watchlist' }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              Gestionar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {watchlist.slice(0, 8).map((asset) => {
              const typeColors = {
                stock: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
                crypto: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
                forex: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
              };
              
              return (
                <Link
                  key={asset.symbol}
                  to="/assets"
                  state={{ symbol: asset.symbol }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all
                           hover:shadow-md hover:scale-105 ${typeColors[asset.type]}`}
                >
                  <div>
                    <div className="text-sm font-bold">
                      {asset.symbol}
                    </div>
                    <div className="text-xs opacity-75 max-w-[120px] truncate">
                      {asset.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Noticias ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Noticias del mercado
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-500">~ Yahoo Finance</span>
            <Link
              to="/news"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
            >
              Ver más <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loadingNews && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
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

        {!loadingNews && newsData?.articles && (
          <div className="flex flex-col gap-3">
            {newsData.articles.slice(0, 3).map((article) => {
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
                        {article.relatedTickers.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700
                                     dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">{article.publisher}</span>
                      <span>·</span>
                      <span className={isToday ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                        {timeAgo(article.publishedAt)}
                      </span>
                    </div>
                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                </a>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
