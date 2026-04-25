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
  interval?: string;
  range?: string;
  explanation?: string;
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

  quoteType?: string | null;
  
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
  quoteType?: string | null;
  
  lastUpdated: string;
}

export type FinancialData = StockFinancialData | CryptoFinancialData;

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
// Operations and Strategies
export interface Operation {
  id: string;
  date: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  pnl: number;
  pnlPercentage: number;
  strategyId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperationDTO {
  date: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  strategyId?: string;
  notes?: string;
}

export interface UpdateOperationDTO {
  symbol?: string;
  quantity?: number;
  buyPrice?: number;
  sellPrice?: number;
  strategyId?: string;
  notes?: string;
}

export interface DailyStats {
  date: string;
  totalPnL: number;
  totalPnLPercentage: number;
  operationCount: number;
  isProfit: boolean;
}

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStrategyDTO {
  name: string;
  description?: string;
  color?: string;
}
// Psychoanalysis
export interface GeneralStats {
  totalOperations: number;
  totalPnL: number;
  winRate: number;
  bestDay: { date: string; pnl: number };
  worstDay: { date: string; pnl: number };
  bestAsset: { symbol: string; pnl: number };
  worstAsset: { symbol: string; pnl: number };
}

export interface AssetStats {
  symbol: string;
  operations: number;
  totalPnL: number;
  winRate: number;
  avgPnL: number;
}

export interface DayOfWeekStats {
  day: string;
  operations: number;
  totalPnL: number;
  winRate: number;
}

export interface TemporalStats {
  dayOfWeek: DayOfWeekStats[];
  bestDayOfWeek: string;
  worstDayOfWeek: string;
}

export interface BehaviorStats {
  opsAfterWin: number;
  opsAfterLoss: number;
  recoveryAttempts: number;
  recoverySuccessRate: number;
  longestWinStreak: number;
  longestLossStreak: number;
}

export interface RiskAlert {
  type: 'overtrading' | 'revenge_trading' | 'loss_spiral';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface PsychoAnalysisSummary {
  generalStats: GeneralStats;
  assetStats: AssetStats[];
  temporalStats: TemporalStats;
  behaviorStats: BehaviorStats;
  alerts: RiskAlert[];
}
export interface UpdateStrategyDTO {
  name?: string;
  description?: string;
  color?: string;
}

export interface StrategyPerformance {
  strategyId: string;
  totalOperations: number;
  totalPnL: number;
  winRate: number;
  avgPnL: number;
  avgPnLPercentage: number;
  bestTrade: number;
  worstTrade: number;
  totalInvested: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source?: string;
  publisher?: string;
  publishedAt: string;
  summary?: string;
  relatedTickers?: string[];
  thumbnail?: string | null;
}

export type FundamentalOutlook = 'STRONG' | 'MODERATE' | 'WEAK';

export interface AnalysisSection {
  title: string;
  content: string;
}

export interface FundamentalAnalysis {
  symbol: string;
  assetType: 'stock' | 'crypto' | 'etf';
  outlook: FundamentalOutlook;
  outlookScore: number;
  sections: Record<string, AnalysisSection>;
  analyzedAt: string;
}

// ── Technical Analysis ────────────────────────────────────────────────────

export interface OHLCVCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorPoint {
  time: string;
  value: number;
}

export interface BollingerBandsData {
  upper: IndicatorPoint[];
  middle: IndicatorPoint[];
  lower: IndicatorPoint[];
  bandwidth: IndicatorPoint[];
}

export interface MACDData {
  macdLine: IndicatorPoint[];
  signalLine: IndicatorPoint[];
  histogram: IndicatorPoint[];
}

export interface SupportResistanceLevel {
  price: number;
  date: string;
  strength: number;
  type: 'support' | 'resistance';
}

export interface SignalBreakdown {
  name: string;
  score: number;
  maxScore: number;
  detail: string;
}

export type TechnicalSignalClass =
  | 'COMPRA FUERTE'
  | 'COMPRA'
  | 'NEUTRAL'
  | 'VENTA'
  | 'VENTA FUERTE';

export interface TechnicalSignal {
  score: number;
  maxScore: number;
  classification: TechnicalSignalClass;
  breakdown: SignalBreakdown[];
  explanation: string;
}

export interface TechnicalAnalysisResult {
  symbol: string;
  range: string;
  interval: string;
  candles: OHLCVCandle[];
  sma20: IndicatorPoint[];
  sma50: IndicatorPoint[];
  sma200: IndicatorPoint[];
  ema20: IndicatorPoint[];
  ema50: IndicatorPoint[];
  bollinger: BollingerBandsData;
  rsi: IndicatorPoint[];
  macd: MACDData;
  obv: IndicatorPoint[];
  supports: SupportResistanceLevel[];
  resistances: SupportResistanceLevel[];
  signal: TechnicalSignal;
  hasVolume: boolean;
  analyzedAt: string;
}

export * from './recommendation';