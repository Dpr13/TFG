import apiClient from './api';
import type { Asset, RiskMetrics, FinancialData } from '../types';

export interface NewsArticle {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  thumbnail: string | null;
  relatedTickers: string[];
}

export const assetService = {
  // Obtener todos los activos (activos sugeridos/populares)
  getAssets: async (): Promise<Asset[]> => {
    const response = await apiClient.get<Asset[]>('/api/assets');
    return response.data;
  },

  // Buscar un activo específico por símbolo usando Yahoo Finance API
  searchAssetBySymbol: async (symbol: string): Promise<Asset> => {
    const response = await apiClient.get<Asset>(`/api/assets/search/${symbol}`);
    return response.data;
  },

  // Obtener datos financieros de un activo
  getFinancialData: async (symbol: string): Promise<FinancialData> => {
    const response = await apiClient.get<FinancialData>(`/api/assets/${symbol}/financial`);
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
      `/api/assets/${symbol}/history${query ? `?${query}` : ''}`
    );
    return response.data;
  },
};

export const riskService = {
  // Calcular métricas de riesgo
  calculateRisk: async (symbol: string): Promise<RiskMetrics> => {
    const response = await apiClient.get<RiskMetrics>(
      `/api/assets/${symbol}/risk`
    );
    return response.data;
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
    const response = await apiClient.get(`/api/news${qs ? `?${qs}` : ''}`);
    return response.data;
  },
};
