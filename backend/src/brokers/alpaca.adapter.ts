import axios from 'axios';
import type { TradeSide } from '../models/bot';

const PAPER_BASE = 'https://paper-api.alpaca.markets';
const LIVE_BASE = 'https://api.alpaca.markets';

const POLL_INTERVAL_MS = 500;
const POLL_MAX_ATTEMPTS = 20;

export interface AlpacaOrderResult {
  fillPrice: number;
  filledQty: number;
}

export interface AlpacaAccountInfo {
  cash: number;
  buyingPower: number;
  portfolioValue: number;
}

export class AlpacaAdapter {
  private readonly baseUrl: string;

  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    isPaper: boolean
  ) {
    this.baseUrl = isPaper ? PAPER_BASE : LIVE_BASE;
  }

  private get headers() {
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret,
      'Content-Type': 'application/json',
    };
  }

  async getAccount(): Promise<AlpacaAccountInfo> {
    const { data } = await axios.get(`${this.baseUrl}/v2/account`, { headers: this.headers });
    return {
      cash: Number(data.cash),
      buyingPower: Number(data.buying_power),
      portfolioValue: Number(data.portfolio_value),
    };
  }

  async getLatestPrice(symbol: string): Promise<number> {
    const { data } = await axios.get(
      `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/bars/latest`,
      { headers: this.headers, params: { feed: 'iex' } }
    );
    return Number(data.bar.vw ?? data.bar.c);
  }

  async executeOrder(symbol: string, side: TradeSide, quantity: number): Promise<AlpacaOrderResult> {
    const { data: order } = await axios.post(
      `${this.baseUrl}/v2/orders`,
      {
        symbol,
        qty: String(quantity),
        side: side.toLowerCase(),
        type: 'market',
        time_in_force: 'day',
      },
      { headers: this.headers }
    );

    const filled = await this._pollUntilFilled(order.id);
    return {
      fillPrice: Number(filled.filled_avg_price),
      filledQty: Number(filled.filled_qty),
    };
  }

  private async _pollUntilFilled(orderId: string): Promise<any> {
    for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      const { data } = await axios.get(`${this.baseUrl}/v2/orders/${orderId}`, { headers: this.headers });
      if (data.status === 'filled') return data;
      if (['canceled', 'expired', 'rejected'].includes(data.status)) {
        throw new Error(`Alpaca order ${orderId} ended with status: ${data.status}`);
      }
    }
    throw new Error(`Alpaca order ${orderId} not filled after ${POLL_MAX_ATTEMPTS} polls`);
  }
}
