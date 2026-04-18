import { BotRepository } from '../repositories/bot.repository';
import { YahooFinanceMarketDataProvider } from '../providers/YahooFinanceMarketDataProvider';
import type { Bot, BotParams, BotMetrics, TradeSide } from '../models/bot';

// ─── Paper Broker ────────────────────────────────────────────────────────────

function paperFill(marketPrice: number, side: TradeSide): number {
  const slippage = Math.random() * 0.0005;
  const factor = side === 'BUY' ? 1 + slippage : 1 - slippage;
  return Number((marketPrice * factor).toFixed(5));
}

// ─── Market Feed ─────────────────────────────────────────────────────────────

interface MarketTick {
  symbol: string;
  price: number;
  timestamp: string;
}

class SimulatedFeed {
  private price: number;
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly symbol: string,
    private readonly onTick: (tick: MarketTick) => Promise<void>,
    private readonly intervalMs = 3000,
    seedPrice = 100
  ) {
    this.price = seedPrice;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(async () => {
      const drift = (Math.random() - 0.5) * 0.001;
      this.price = Number((this.price * (1 + drift)).toFixed(5));
      await this.onTick({ symbol: this.symbol, price: this.price, timestamp: new Date().toISOString() });
    }, this.intervalMs);
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }
}

// ─── Strategies ──────────────────────────────────────────────────────────────

type Signal = 'BUY' | 'SELL' | 'HOLD';

function momentumSignal(prices: number[], params: BotParams): Signal {
  const fast = params.fastWindow ?? 5;
  const slow = params.slowWindow ?? 20;
  const threshold = params.thresholdPct ?? 0.001;
  if (prices.length < slow) return 'HOLD';
  const maFast = prices.slice(-fast).reduce((a, b) => a + b, 0) / fast;
  const maSlow = prices.slice(-slow).reduce((a, b) => a + b, 0) / slow;
  if (maFast > maSlow * (1 + threshold)) return 'BUY';
  if (maFast < maSlow * (1 - threshold)) return 'SELL';
  return 'HOLD';
}

function meanReversionSignal(prices: number[], params: BotParams): Signal {
  const window = params.window ?? 20;
  const k = params.k ?? 2;
  if (prices.length < window) return 'HOLD';
  const slice = prices.slice(-window);
  const mean = slice.reduce((a, b) => a + b, 0) / window;
  const std = Math.sqrt(slice.map(p => (p - mean) ** 2).reduce((a, b) => a + b, 0) / window);
  const price = prices[prices.length - 1];
  if (price < mean - k * std) return 'BUY';
  if (price > mean) return 'SELL';
  return 'HOLD';
}

// ─── Agent runtime ────────────────────────────────────────────────────────────

interface AgentRuntime {
  feed: SimulatedFeed;
  priceHistory: number[];
  lastPrice: number;
  lastSignal: Signal;
}

export class BotService {
  private readonly repo = new BotRepository();
  private readonly agents = new Map<string, AgentRuntime>();

  async createBot(userId: string, dto: { name: string; symbol: string; strategy: string; initialCapital?: number; params?: BotParams }): Promise<Bot> {
    return this.repo.create(userId, dto);
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    const bots = await this.repo.findByUser(userId);
    return bots.map(bot => {
      const runtime = this.agents.get(bot.id);
      return runtime ? { ...bot, currentPrice: runtime.lastPrice, lastSignal: runtime.lastSignal } : bot;
    });
  }

  async getBot(botId: string, userId: string): Promise<Bot> {
    const bot = await this.repo.findById(botId);
    if (!bot || bot.userId !== userId) throw new Error('Bot no encontrado');
    return bot;
  }

  async deleteBot(botId: string, userId: string): Promise<void> {
    await this.stopBot(botId, userId);
    await this.repo.delete(botId, userId);
  }

  async startBot(botId: string, userId: string): Promise<Bot> {
    const bot = await this.getBot(botId, userId);
    if (bot.status === 'running') return bot;

    const provider = new YahooFinanceMarketDataProvider();
    const realPrice = await provider.getLatestPrice(bot.symbol).catch(() => null);
    const seedPrice = realPrice ?? 100;

    const priceHistory: number[] = [];
    const feed = new SimulatedFeed(bot.symbol, async (tick) => {
      priceHistory.push(tick.price);
      const signal = bot.strategy === 'momentum'
        ? momentumSignal(priceHistory, bot.params)
        : meanReversionSignal(priceHistory, bot.params);

      const runtime = this.agents.get(botId);
      if (runtime) {
        runtime.lastPrice = tick.price;
        runtime.lastSignal = signal;
      }

      const currentBot = await this.repo.findById(botId);
      if (!currentBot || currentBot.status !== 'running') return;

      const hasPosition = currentBot.positionSize > 0;

      if (signal === 'BUY' && !hasPosition) {
        const fillPrice = paperFill(tick.price, 'BUY');
        const quantity = Number(((currentBot.currentCapital * 0.95) / fillPrice).toFixed(6));
        const cost = quantity * fillPrice;
        await this.repo.recordTrade(botId, 'BUY', quantity, fillPrice, null);
        await this.repo.updatePosition(botId, {
          positionSize: quantity,
          positionEntryPrice: fillPrice,
          currentCapital: currentBot.currentCapital - cost,
        });
      } else if (signal === 'SELL' && hasPosition) {
        const fillPrice = paperFill(tick.price, 'SELL');
        const pnl = (fillPrice - currentBot.positionEntryPrice!) * currentBot.positionSize;
        const proceeds = currentBot.positionSize * fillPrice;
        await this.repo.recordTrade(botId, 'SELL', currentBot.positionSize, fillPrice, pnl);
        await this.repo.updatePosition(botId, {
          positionSize: 0,
          positionEntryPrice: null,
          currentCapital: currentBot.currentCapital + proceeds,
        });
      }
    }, 3000, seedPrice);

    this.agents.set(botId, { feed, priceHistory, lastPrice: seedPrice, lastSignal: 'HOLD' });
    feed.start();
    return this.repo.setStatus(botId, 'running');
  }

  async stopBot(botId: string, userId: string): Promise<Bot> {
    const bot = await this.repo.findById(botId);
    if (!bot || bot.userId !== userId) throw new Error('Bot no encontrado');
    const runtime = this.agents.get(botId);
    if (runtime) {
      runtime.feed.stop();
      this.agents.delete(botId);
    }
    return this.repo.setStatus(botId, 'stopped');
  }

  async getTrades(botId: string, userId: string) {
    await this.getBot(botId, userId);
    return this.repo.getTrades(botId);
  }

  async getMetrics(botId: string, userId: string): Promise<BotMetrics> {
    const bot = await this.getBot(botId, userId);
    const trades = await this.repo.getTrades(botId);
    const sells = trades.filter(t => t.side === 'SELL' && t.pnl !== null);
    const winningTrades = sells.filter(t => (t.pnl ?? 0) > 0).length;
    const totalPnl = sells.reduce((acc, t) => acc + (t.pnl ?? 0), 0);
    return {
      totalTrades: trades.length,
      winningTrades,
      winRate: sells.length > 0 ? winningTrades / sells.length : 0,
      totalPnl,
      pnlPct: (totalPnl / bot.initialCapital) * 100,
      currentCapital: bot.currentCapital,
      positionSize: bot.positionSize,
    };
  }
}
