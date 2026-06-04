export type BotAlgorithm = 'momentum' | 'mean-reversion';

export interface BotStrategyParams {
  // Momentum
  fastWindow?: number;
  slowWindow?: number;
  thresholdPct?: number;
  // Mean-reversion / Bollinger
  window?: number;
  k?: number;
  // RSI confirmation filter (applies to any strategy)
  useRsi?: boolean;
  rsiPeriod?: number;
  rsiOverbought?: number;
  rsiOversold?: number;
  [key: string]: number | boolean | undefined;
}

export interface BotStrategy {
  id: string;
  userId: string;
  name: string;
  algorithm: BotAlgorithm;
  description?: string;
  params: BotStrategyParams;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBotStrategyDTO {
  name: string;
  algorithm: BotAlgorithm;
  description?: string;
  params: BotStrategyParams;
}
