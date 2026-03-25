export type Direction = 'LONG' | 'SHORT';
export type SLMethod = 'FIXED_PCT' | 'SUPPORT_RESISTANCE';
export type TPMethod = 'RISK_REWARD' | 'SUPPORT_RESISTANCE' | 'BOLLINGER';

export interface RecommendationRequest {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  interval: string;
  range?: string;
  slMethod: 'FIXED_PCT' | 'SUPPORT_RESISTANCE';
  slPct?: number;
  tpMethods: Array<'RISK_REWARD' | 'SUPPORT_RESISTANCE' | 'BOLLINGER'>;
  customRatio?: number;
  rrRatio?: number;
  capital: number;
  riskPct: number;
  currency: 'EUR' | 'USD';
}

export interface TPResult {
  method: string;
  price: number;
  distancePct: number;
  distanceAbs: number;
  realRatio: number;
  label: string;
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
  direction: 'LONG' | 'SHORT';
  interval: string;
  entryPrice: number;
  entryDate: string;
  sl: number;
  slDistancePct: number;
  slDistanceAbs: number;
  slMethod: string;
  slMethodLabel: string;
  detectedSLLevel?: string;
  tps: TPResult[];
  riskManagement: RiskManagementResult;
  currency: 'EUR' | 'USD';
  warnings: string[];
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
  sma50: Array<{ time: string; value: number }>;
  sma200: Array<{ time: string; value: number }>;
  bollingerData: {
    upper: Array<{ time: string; value: number }>;
    lower: Array<{ time: string; value: number }>;
  } | null;
  signal: {
    score: number;
    maxScore: number;
    classification: string;
    breakdown: Array<{ name: string; score: number; maxScore: number; detail: string }>;
    explanation: string;
  };
  analyzedAt: string;
}

// ── IA Module Types ──────────────────────────────────────────────────────

export interface IAAnalysisResult {
  resumen: string | null;
  justificacion: string | null;
  resumenError?: string;
  justificacionError?: string;
}

export interface IAChatResponse {
  respuesta: string;
  ok: boolean;
}

export interface IAChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

