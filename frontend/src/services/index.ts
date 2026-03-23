import apiClient from './api';
import axios from 'axios';
import type {
  Asset,
  RiskMetrics,
  FinancialData,
  FundamentalAnalysis,
  Operation,
  CreateOperationDTO,
  UpdateOperationDTO,
  DailyStats,
  Strategy,
  CreateStrategyDTO,
  UpdateStrategyDTO,
  StrategyPerformance,
  PsychoAnalysisSummary,
  NewsArticle
} from '../types';

/**
 * SERVICIOS DE API
 * 
 * EXPANSIÓN: Funcionalidades a agregar:
 * - Autenticación y autorización (login/logout)
 * - Sincronización offline-first con IndexedDB
 * - Caché persistente con invalidación inteligente
 * - Websocket real-time para updates de operaciones
 * - Retry automático con backoff exponencial
 * - Analytics de performance por endpoint
 * - Export a CSV/Excel
 * - Import masivo de operaciones
 * - Sincronización con brokers (API integrations)
 * - Webhooks para notificaciones en tiempo real
 */

export const assetService = {
  // Obtener todos los activos (activos sugeridos/populares)
  getAssets: async (): Promise<Asset[]> => {
    const response = await apiClient.get<Asset[]>('/assets');
    return response.data;
  },

  // Buscar un activo específico por símbolo usando Yahoo Finance API
  searchAssetBySymbol: async (symbol: string): Promise<Asset> => {
    const response = await apiClient.get<Asset>(`/assets/search/${symbol}`);
    return response.data;
  },

  // Obtener datos financieros de un activo
  getFinancialData: async (symbol: string): Promise<FinancialData> => {
    const response = await apiClient.get<FinancialData>(`/assets/${symbol}/financial`);
    return response.data;
  },

  // Obtener análisis fundamental estructurado
  getFundamentalAnalysis: async (symbol: string, range: string = '1y'): Promise<FundamentalAnalysis> => {
    const response = await apiClient.get<FundamentalAnalysis>(`/assets/${symbol}/fundamental-analysis?range=${range}`);
    return response.data;
  },
};

export const priceService = {
  // Obtener histórico de precios
  getPriceHistory: async (
    symbol: string,
    interval?: string
  ): Promise<{ symbol: string; interval?: string; prices: Array<{ date: string; close: number }> }> => {
    const params = new URLSearchParams();
    if (interval) params.append('interval', interval);
    const query = params.toString();
    const response = await apiClient.get(
      `/assets/${symbol}/history${query ? `?${query}` : ''}`
    );
    return response.data;
  },
};

export const riskService = {
  // Calcular métricas de riesgo
  calculateRisk: async (symbol: string, range: '6mo' | '1y' | '3y' | '5y' | '10y' = '1y'): Promise<RiskMetrics> => {
    try {
      const params = new URLSearchParams();
      params.append('range', range);
      const response = await apiClient.get<RiskMetrics>(
        `/assets/${symbol}/risk?${params.toString()}`
      );
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.response?.data?.error;
        if (status === 404) {
          throw new Error(`No se encontró el activo '${symbol}'`);
        }
        if (status === 422) {
          throw new Error(message || `Datos insuficientes para calcular el riesgo de '${symbol}'`);
        }
        if (message) {
          throw new Error(message);
        }
      }
      throw err;
    }
  },
};

export const newsService = {
  // Obtener noticias financieras
  getNews: async (
    query?: string,
    count?: number
  ): Promise<{ articles: NewsArticle[]; count: number }> => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (count) params.append('count', count.toString());
    const qs = params.toString();
    const response = await apiClient.get(`/news${qs ? `?${qs}` : ''}`);
    return response.data;
  },
};

export const operationService = {
  // CRUD Operations
  createOperation: async (operation: CreateOperationDTO): Promise<Operation> => {
    const response = await apiClient.post<Operation>('/operations', operation);
    return response.data;
  },

  getOperationById: async (id: string): Promise<Operation> => {
    const response = await apiClient.get<Operation>(`/operations/${id}`);
    return response.data;
  },

  getAllOperations: async (): Promise<Operation[]> => {
    const response = await apiClient.get<Operation[]>('/operations');
    return response.data;
  },

  getOperationsByDate: async (date: string): Promise<Operation[]> => {
    const response = await apiClient.get<Operation[]>(`/operations/date/${date}`);
    return response.data;
  },

  getOperationsByDateRange: async (startDate: string, endDate: string): Promise<Operation[]> => {
    const response = await apiClient.get<Operation[]>('/operations/range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  updateOperation: async (id: string, operation: UpdateOperationDTO): Promise<Operation> => {
    const response = await apiClient.put<Operation>(`/operations/${id}`, operation);
    return response.data;
  },

  deleteOperation: async (id: string): Promise<void> => {
    await apiClient.delete(`/operations/${id}`);
  },

  deleteOperationsByDate: async (date: string): Promise<void> => {
    await apiClient.delete(`/operations/date/${date}`);
  },

  // Stats
  getDailyStats: async (date: string): Promise<DailyStats> => {
    const response = await apiClient.get<DailyStats>(`/operations/stats/daily/${date}`);
    return response.data;
  },

  getMonthlyStats: async (year: number, month: number): Promise<DailyStats[]> => {
    const response = await apiClient.get<DailyStats[]>('/operations/stats/monthly', {
      params: { year, month },
    });
    return response.data;
  },

  getOperationsByStrategyId: async (strategyId: string): Promise<Operation[]> => {
    const response = await apiClient.get<Operation[]>(`/operations/strategy/${strategyId}`);
    return response.data;
  },
};

export const strategyService = {
  createStrategy: async (strategy: CreateStrategyDTO): Promise<Strategy> => {
    const response = await apiClient.post<Strategy>('/strategies', strategy);
    return response.data;
  },

  getStrategyById: async (id: string): Promise<Strategy> => {
    const response = await apiClient.get<Strategy>(`/strategies/${id}`);
    return response.data;
  },

  getAllStrategies: async (): Promise<Strategy[]> => {
    const response = await apiClient.get<Strategy[]>('/strategies');
    return response.data;
  },

  updateStrategy: async (id: string, strategy: UpdateStrategyDTO): Promise<Strategy> => {
    const response = await apiClient.put<Strategy>(`/strategies/${id}`, strategy);
    return response.data;
  },

  deleteStrategy: async (id: string): Promise<void> => {
    await apiClient.delete(`/strategies/${id}`);
  },

  getStrategyOperations: async (id: string): Promise<Operation[]> => {
    const response = await apiClient.get<Operation[]>(`/strategies/${id}/operations`);
    return response.data;
  },

  getStrategyPerformance: async (id: string): Promise<StrategyPerformance> => {
    const response = await apiClient.get<StrategyPerformance>(`/strategies/${id}/performance`);
    return response.data;
  },
};

export const psychoanalysisService = {
  getAnalysis: async (): Promise<PsychoAnalysisSummary> => {
    const response = await apiClient.get<PsychoAnalysisSummary>('/psychoanalysis');
    return response.data;
  },

  getAnalysisByDateRange: async (startDate: string, endDate: string): Promise<PsychoAnalysisSummary> => {
    const response = await apiClient.get<PsychoAnalysisSummary>('/psychoanalysis/range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getAnalysisByStrategy: async (strategyId: string): Promise<PsychoAnalysisSummary> => {
    const response = await apiClient.get<PsychoAnalysisSummary>(`/psychoanalysis/strategy/${strategyId}`);
    return response.data;
  },
};

export interface WatchlistItem {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'forex';
  addedAt: string;
}

export interface AddToWatchlistDTO {
  assetSymbol: string;
  assetName: string;
  assetType: 'stock' | 'crypto' | 'forex';
}

export const watchlistService = {
  // Obtener la watchlist completa del usuario
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    const response = await apiClient.get<WatchlistItem[]>('/watchlist');
    return response.data;
  },

  // Agregar un activo a la watchlist
  addToWatchlist: async (data: AddToWatchlistDTO): Promise<WatchlistItem> => {
    const response = await apiClient.post<WatchlistItem>('/watchlist', data);
    return response.data;
  },

  // Eliminar un activo de la watchlist
  removeFromWatchlist: async (symbol: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/watchlist/${symbol}`);
    return response.data;
  },

  // Verificar si un activo está en la watchlist
  checkInWatchlist: async (symbol: string): Promise<{ inWatchlist: boolean }> => {
    const response = await apiClient.get<{ inWatchlist: boolean }>(`/watchlist/check/${symbol}`);
    return response.data;
  },

  // Limpiar toda la watchlist
  clearWatchlist: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>('/watchlist');
    return response.data;
  },
};

