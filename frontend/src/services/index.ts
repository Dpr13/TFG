import apiClient from './api';
import type { Asset, Price, RiskMetrics, FinancialData } from '../types';

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
