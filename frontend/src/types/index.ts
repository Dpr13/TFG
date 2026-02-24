export interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'forex';
  description?: string;
}

export interface Price {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RiskMetrics {
  symbol: string;
  volatility: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  valueAtRisk95?: number;
  calmarRatio?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  dataPoints: number;
  period?: {
    start: string;
    end: string;
  };
}

export interface StockFinancialData {
  symbol: string;
  
  // Valuation Measures
  marketCap?: number | null;
  enterpriseValue?: number | null;
  peRatio?: number | null;
  pegRatio?: number | null;
  priceToSales?: number | null;
  priceToBook?: number | null;
  evToEbitda?: number | null;
  
  // Financial Highlights
  eps?: number | null;
  dividendYield?: number | null;
  beta?: number | null;
  roe?: number | null;
  roa?: number | null;
  profitMargin?: number | null;
  operatingMargin?: number | null;
  
  // Trading Info
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  averageVolume?: number | null;
  sharesOutstanding?: number | null;
  
  lastUpdated: string;
}

export interface CryptoFinancialData {
  symbol: string;
  
  // Market Data
  marketCap?: number | null;
  volume24h?: number | null;
  circulatingSupply?: number | null;
  totalSupply?: number | null;
  maxSupply?: number | null;
  
  // Price Records
  allTimeHigh?: number | null;
  allTimeLow?: number | null;
  athDate?: string | null;
  atlDate?: string | null;
  
  // Trading Info
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  
  lastUpdated: string;
}

export type FinancialData = StockFinancialData | CryptoFinancialData;

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
