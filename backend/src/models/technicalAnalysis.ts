/**
 * Technical Analysis models
 * Structured output from the technical analysis engine
 */

export interface OHLCVCandle {
  date: string;   // ISO date string
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
  strength: number;   // Number of times price touched this zone ±0.5%
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
  score: number;           // 0-100
  maxScore: number;        // May be less than 100 if indicators are missing
  classification: TechnicalSignalClass;
  breakdown: SignalBreakdown[];
  explanation: string;     // 2-3 sentences
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
  atr: IndicatorPoint[];
  supports: SupportResistanceLevel[];
  resistances: SupportResistanceLevel[];
  signal: TechnicalSignal;
  hasVolume: boolean;
  analyzedAt: string;
}
