export type BotAlgorithm = 'momentum' | 'mean-reversion';

export interface BotStrategyParams {
  // Momentum
  fastWindow?: number;
  slowWindow?: number;
  thresholdPct?: number;
  // Mean-reversion
  window?: number;
  k?: number;
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
