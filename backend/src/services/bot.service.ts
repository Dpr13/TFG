import { BotRepository } from '../repositories/bot.repository';
import { YahooFinanceMarketDataProvider } from '../providers/YahooFinanceMarketDataProvider';
import type { Bot, BotParams, BotMetrics, TradeSide } from '../models/bot';

const FEED_INTERVAL_MS = 15_000;

// ─── Paper Broker ────────────────────────────────────────────────────────────

function paperFill(marketPrice: number, side: TradeSide): number {
  const slippage = Math.random() * 0.0005;
  const factor = side === 'BUY' ? 1 + slippage : 1 - slippage;
  return Number((marketPrice * factor).toFixed(5));
}

// ─── Real Market Feed ─────────────────────────────────────────────────────────

interface MarketTick {
  symbol: string;
  price: number;
  timestamp: string;
}

class RealFeed {
  private timer?: NodeJS.Timeout;
  private lastPrice: number;

  constructor(
    private readonly symbol: string,
    private readonly provider: YahooFinanceMarketDataProvider,
    private readonly onTick: (tick: MarketTick) => Promise<void>,
    seedPrice: number
  ) {
    this.lastPrice = seedPrice;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(async () => {
      const fetched = await this.provider.getLatestPrice(this.symbol).catch(() => null);
      if (fetched !== null) this.lastPrice = fetched;
      await this.onTick({ symbol: this.symbol, price: this.lastPrice, timestamp: new Date().toISOString() });
    }, FEED_INTERVAL_MS);
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
  if (price > mean + k * std) return 'SELL';
  return 'HOLD';
}

// ─── Agent runtime ────────────────────────────────────────────────────────────

interface AgentRuntime {
  feed: RealFeed;
  priceHistory: number[];
  lastPrice: number;
  lastSignal: Signal;
}

class BotService {
  private readonly repo = new BotRepository();
  private readonly provider = new YahooFinanceMarketDataProvider();
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

  // Seeds price history with real 1-minute candles so strategies can signal from tick 1.
  private async _seedHistory(symbol: string, points: number, fallback: number): Promise<number[]> {
    try {
      const data = await this.provider.getHistoricalPrices(symbol, '1min', '5d');
      if (data && data.length > 0) {
        const closes = data.slice(-points).map(p => p.close);
        const padding = points - closes.length;
        return padding > 0
          ? [...Array(padding).fill(closes[0] ?? fallback), ...closes]
          : closes;
      }
    } catch {}
    return Array(points).fill(fallback);
  }

  private async _launchAgent(bot: Bot, seedPrice: number): Promise<void> {
    const botId = bot.id;
    const needed = Math.max(bot.params.slowWindow ?? 20, bot.params.window ?? 20);
    const priceHistory = await this._seedHistory(bot.symbol, needed, seedPrice);

    const feed = new RealFeed(bot.symbol, this.provider, async (tick) => {
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
      } else if (signal === 'SELL' && hasPosition && currentBot.positionEntryPrice !== null) {
        const fillPrice = paperFill(tick.price, 'SELL');
        const pnl = (fillPrice - currentBot.positionEntryPrice) * currentBot.positionSize;
        const proceeds = currentBot.positionSize * fillPrice;
        await this.repo.recordTrade(botId, 'SELL', currentBot.positionSize, fillPrice, pnl);
        await this.repo.updatePosition(botId, {
          positionSize: 0,
          positionEntryPrice: null,
          currentCapital: currentBot.currentCapital + proceeds,
        });
      }
    }, seedPrice);

    this.agents.set(botId, { feed, priceHistory, lastPrice: seedPrice, lastSignal: 'HOLD' });
    feed.start();
  }

  async startBot(botId: string, userId: string): Promise<Bot> {
    const bot = await this.getBot(botId, userId);
    if (bot.status === 'running') return bot;

    const seedPrice = await this.provider.getLatestPrice(bot.symbol).catch(() => null) ?? 100;
    await this._launchAgent(bot, seedPrice);
    return this.repo.setStatus(botId, 'running');
  }

  async restoreRunningBots(): Promise<void> {
    const runningBots = await this.repo.findAllRunning();
    await Promise.all(runningBots.map(async (bot) => {
      if (this.agents.has(bot.id)) return;
      const seedPrice = await this.provider.getLatestPrice(bot.symbol).catch(() => null) ?? 100;
      await this._launchAgent(bot, seedPrice);
    }));
    if (runningBots.length > 0) {
      console.log(`[BotService] ${runningBots.length} bot(s) restaurado(s) tras reinicio`);
    }
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

  async getMonthlyStats(userId: string, year: number, month: number, botId?: string) {
    return this.repo.getMonthlyStats(userId, year, month, botId);
  }

  async getDailyTrades(userId: string, date: string, botId?: string) {
    return this.repo.getDailyTrades(userId, date, botId);
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

export const botService = new BotService();
