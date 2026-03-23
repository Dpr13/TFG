/**
 * Recommendation models
 * Request/response types for TP/SL calculation and risk management
 */

export type Direction = 'LONG' | 'SHORT';
export type SLMethod = 'FIXED_PCT' | 'SUPPORT_RESISTANCE';
export type TPMethod = 'RISK_REWARD' | 'SUPPORT_RESISTANCE' | 'BOLLINGER';

export interface RecommendationRequest {
  symbol: string;
  direction: Direction;
  interval: string;       // 1d, 1h, etc.
  range: string;          // 6mo, 1y, etc.
  slMethod: SLMethod;
  slPct?: number;         // For FIXED_PCT (e.g. 2 means 2%)
  tpMethods: TPMethod[];
  customRatio?: number;   // For RISK_REWARD when ratio is custom
  rrRatio?: number;       // Predefined ratio (1, 1.5, 2, 2.5, 3) or custom value
  capital: number;
  riskPct: number;        // e.g. 1 means 1%
  currency: 'EUR' | 'USD';
}

export interface TPResult {
  method: TPMethod;
  price: number;
  distancePct: number;
  distanceAbs: number;
  realRatio: number;
  label: string;          // Badge text: "R/B 1:2", "Resistencia", "Bollinger"
  potentialProfit: number;
}

export interface RiskManagementResult {
  moneyAtRisk: number;
  positionSize: number;
  positionValue: number;
  riskPctUsed: number;
}

export interface RecommendationResult {
  symbol: string;
  direction: Direction;
  interval: string;
  entryPrice: number;
  entryDate: string;

  // Stop Loss
  sl: number;
  slDistancePct: number;
  slDistanceAbs: number;
  slMethod: SLMethod;
  slMethodLabel: string;
  detectedSLLevel?: string;  // e.g. "Soporte detectado en $XXX.XX"

  // Take Profits
  tps: TPResult[];

  // Risk Management
  riskManagement: RiskManagementResult;
  currency: 'EUR' | 'USD';

  // Warnings
  warnings: string[];

  // Chart data (reuse from technical analysis)
  candles: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  supports: Array<{ price: number; date: string; strength: number; type: string }>;
  resistances: Array<{ price: number; date: string; strength: number; type: string }>;
  bollingerUpper: number | null;
  bollingerLower: number | null;

  // Technical overlays for the chart
  sma50: Array<{ time: string; value: number }>;
  sma200: Array<{ time: string; value: number }>;
  bollingerData: {
    upper: Array<{ time: string; value: number }>;
    lower: Array<{ time: string; value: number }>;
  } | null;

  analyzedAt: string;
}
