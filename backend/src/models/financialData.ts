/**
 * Financial data model for stocks and cryptocurrencies
 */

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
  eps?: number | null; // Earnings per share (TTM)
  dividendYield?: number | null;
  beta?: number | null;
  roe?: number | null; // Return on Equity
  roa?: number | null; // Return on Assets
  profitMargin?: number | null;
  operatingMargin?: number | null;
  debtToEquity?: number | null;
  
  // Trading Info
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  averageVolume?: number | null;
  
  // ETF specific
  totalAssets?: number | null;
  navPrice?: number | null;
  beta3Year?: number | null;
  threeYearAverageReturn?: number | null;
  fiveYearAverageReturn?: number | null;
  ytdReturn?: number | null;
  annualReportExpenseRatio?: number | null;
  fundFamily?: string | null;
  fundInceptionDate?: string | null;

  // Metadata
  quoteType?: string | null;
  financialCurrency?: string | null;
  exchange?: string | null;
  
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
  fiftyTwoWeekChange?: number | null;
  
  // Metadata
  quoteType?: string | null;
  financialCurrency?: string | null;
  
  lastUpdated: string;
}

export type FinancialData = StockFinancialData | CryptoFinancialData;

export class FinancialDataValidator {
  static isStockData(data: FinancialData): data is StockFinancialData {
    return 'peRatio' in data || 'eps' in data;
  }

  static isCryptoData(data: FinancialData): data is CryptoFinancialData {
    return 'circulatingSupply' in data || 'totalSupply' in data;
  }
}
