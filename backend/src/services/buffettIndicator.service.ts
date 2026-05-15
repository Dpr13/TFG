import axios from 'axios';
import { FinancialDataService } from './financialData.service';
import { US_LARGE_CAP_PROXY_TICKERS } from '../data/usLargeCapProxy';

export type BuffettIndicatorResult = {
  country: string;
  currency: 'USD';
  indicator: number | null; // marketCap / GDP
  marketCap: number | null;
  gdp: number | null;
  gdpYear: number | null;
  coverage: {
    tickersTotal: number;
    tickersUsed: number;
  };
  sources: {
    marketCap: string;
    gdp: string;
  };
  updatedAt: string;
};

type CacheEntry = { data: BuffettIndicatorResult; timestamp: number };

export class BuffettIndicatorService {
  private financialData = new FinancialDataService();

  private cache = new Map<string, CacheEntry>();

  // Buffett indicator changes slowly; keep a generous TTL.
  private TTL = 6 * 60 * 60 * 1000; // 6h

  async get(country: string): Promise<BuffettIndicatorResult | null> {
    const normalized = String(country || '').trim().toUpperCase();

    if (normalized !== 'US') return null;

    const cached = this.cache.get(normalized);
    if (cached && Date.now() - cached.timestamp < this.TTL) return cached.data;

    const data = await this.computeUs();
    this.cache.set(normalized, { data, timestamp: Date.now() });
    return data;
  }

  private async computeUs(): Promise<BuffettIndicatorResult> {
    const { marketCapUsd, year: marketCapYear, source: marketCapSource } =
      await this.fetchMarketCapUsdWorldBank('USA');

    // GDP (current US$)
    const { gdpUsd, year: gdpYear } = await this.fetchGdpUsdWorldBank('USA');

    // Fallback: if World Bank market cap is missing, approximate via a large-cap proxy.
    let fallbackCoverage = { tickersTotal: 0, tickersUsed: 0 };
    let effectiveMarketCap = marketCapUsd;
    let effectiveMarketCapSource = marketCapSource;

    if (effectiveMarketCap == null) {
      const tickers = US_LARGE_CAP_PROXY_TICKERS;
      const marketCapUsdRes = await this.sumMarketCapsUSD(tickers);
      effectiveMarketCap = marketCapUsdRes.sum;
      effectiveMarketCapSource = 'Yahoo Finance (fallback proxy: US large-cap tickers)';
      fallbackCoverage = { tickersTotal: tickers.length, tickersUsed: marketCapUsdRes.used };
    }

    const indicator =
      effectiveMarketCap != null && gdpUsd != null && gdpUsd > 0
        ? effectiveMarketCap / gdpUsd
        : null;

    // If we used World Bank market cap, we don't have per-ticker coverage.
    const coverage = marketCapUsd != null
      ? { tickersTotal: 0, tickersUsed: 0 }
      : fallbackCoverage;

    // Pick a single year to report; GDP year is usually the one people care about.
    // If GDP year is missing but market cap year exists, use that.
    const reportedYear = gdpYear ?? marketCapYear;

    return {
      country: 'US',
      currency: 'USD',
      indicator,
      marketCap: effectiveMarketCap,
      gdp: gdpUsd,
      gdpYear: reportedYear,
      coverage,
      sources: {
        marketCap: effectiveMarketCapSource,
        gdp: 'World Bank API (NY.GDP.MKTP.CD)',
      },
      updatedAt: new Date().toISOString(),
    };
  }

  private async sumMarketCapsUSD(tickers: string[]): Promise<{ sum: number | null; used: number }> {
    const concurrency = 5;
    let sum = 0;
    let used = 0;

    const queue = [...tickers];
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length) {
        const ticker = queue.shift();
        if (!ticker) return;

        try {
          const data = await this.financialData.getFinancialData(ticker);
          if (!data) continue;

          // Only equity-style financial data has a currency.
          const currency = this.normalizeString((data as any).financialCurrency);
          const marketCap = this.normalizeNumber((data as any).marketCap);

          if (marketCap == null || marketCap <= 0) continue;

          if (currency && currency.toUpperCase() !== 'USD') continue;

          sum += marketCap;
          used += 1;
        } catch {
          // Ignore per-ticker failures; we report coverage.
          continue;
        }
      }
    });

    await Promise.all(workers);

    if (used === 0) return { sum: null, used: 0 };
    return { sum, used };
  }

  private async fetchGdpUsdWorldBank(countryIso3: string): Promise<{ gdpUsd: number | null; year: number | null }> {
    try {
      const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(countryIso3)}/indicator/NY.GDP.MKTP.CD?format=json&per_page=60`;
      const res = await axios.get(url, { timeout: 15000 });
      const arr = res.data;
      const series: any[] | undefined = Array.isArray(arr) ? arr[1] : undefined;
      if (!Array.isArray(series)) return { gdpUsd: null, year: null };

      for (const point of series) {
        const value = this.normalizeNumber(point?.value);
        const date = point?.date;
        if (value != null) {
          const year = date != null ? Number(date) : null;
          return { gdpUsd: Number(value), year: Number.isFinite(year as any) ? year : null };
        }
      }

      return { gdpUsd: null, year: null };
    } catch {
      return { gdpUsd: null, year: null };
    }
  }

  private async fetchMarketCapUsdWorldBank(
    countryIso3: string
  ): Promise<{ marketCapUsd: number | null; year: number | null; source: string }> {
    // Market capitalization of listed domestic companies (current US$)
    // World Bank indicator: CM.MKT.LCAP.CD
    try {
      const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(countryIso3)}/indicator/CM.MKT.LCAP.CD?format=json&per_page=60`;
      const res = await axios.get(url, { timeout: 15000 });
      const arr = res.data;
      const series: any[] | undefined = Array.isArray(arr) ? arr[1] : undefined;
      if (!Array.isArray(series)) {
        return { marketCapUsd: null, year: null, source: 'World Bank API (CM.MKT.LCAP.CD)' };
      }

      for (const point of series) {
        const value = this.normalizeNumber(point?.value);
        const date = point?.date;
        if (value != null) {
          const year = date != null ? Number(date) : null;
          return {
            marketCapUsd: Number(value),
            year: Number.isFinite(year as any) ? year : null,
            source: 'World Bank API (CM.MKT.LCAP.CD)',
          };
        }
      }

      return { marketCapUsd: null, year: null, source: 'World Bank API (CM.MKT.LCAP.CD)' };
    } catch {
      return { marketCapUsd: null, year: null, source: 'World Bank API (CM.MKT.LCAP.CD)' };
    }
  }

  private normalizeNumber(value: any): number | null {
    if (value == null) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    // yahoo-finance2 often returns objects like { raw, fmt }
    if (typeof value === 'object') {
      const raw = (value as any).raw;
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
      if (typeof raw === 'string') {
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      }
    }

    if (typeof value === 'string') {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }

    return null;
  }

  private normalizeString(value: any): string | null {
    if (value == null) return null;
    if (typeof value === 'string') return value;

    if (typeof value === 'object') {
      const raw = (value as any).raw;
      if (typeof raw === 'string') return raw;
    }

    return null;
  }
}

export const buffettIndicatorService = new BuffettIndicatorService();
