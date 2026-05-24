import axios from 'axios';
import type { TradeSide } from '../models/bot';

const PAPER_BASE = 'https://paper-api.alpaca.markets';
const LIVE_BASE = 'https://api.alpaca.markets';

function ts(): string {
  return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

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

  async getAsset(symbol: string): Promise<{ tradable: boolean; active: boolean; name: string } | null> {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/v2/assets/${encodeURIComponent(symbol)}`,
        { headers: this.headers }
      );
      return {
        tradable: data.tradable === true,
        active: data.status === 'active',
        name: data.name ?? symbol,
      };
    } catch {
      return null;
    }
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

  async isMarketOpen(): Promise<boolean> {
    const { data } = await axios.get(`${this.baseUrl}/v2/clock`, { headers: this.headers });
    return data.is_open === true;
  }

  async cancelAllOpenOrders(): Promise<void> {
    await axios.delete(`${this.baseUrl}/v2/orders`, { headers: this.headers });
  }

  async executeOrder(symbol: string, side: TradeSide, quantity: number): Promise<AlpacaOrderResult> {
    const mode = this.baseUrl === PAPER_BASE ? 'PAPER' : 'LIVE';
    console.log(`[${ts()}][Alpaca ${mode}] submitting ${side} order — symbol=${symbol} qty=${quantity}`);

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

    console.log(`[${ts()}][Alpaca ${mode}] order accepted — id=${order.id} status=${order.status}`);

    const filled = await this._pollUntilFilled(order.id);
    const fillPrice = Number(filled.filled_avg_price);
    const filledQty = Number(filled.filled_qty);
    console.log(`[${ts()}][Alpaca ${mode}] order filled — id=${order.id} fillPrice=${fillPrice} filledQty=${filledQty}`);

    return { fillPrice, filledQty };
  }

  private async _cancelOrder(orderId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/v2/orders/${orderId}`, { headers: this.headers });
    } catch {}
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
    // Cancelar la orden para no dejarla abierta indefinidamente en Alpaca
    await this._cancelOrder(orderId);
    throw new Error(`Alpaca order ${orderId} not filled after ${POLL_MAX_ATTEMPTS} polls — order cancelled`);
  }
}
