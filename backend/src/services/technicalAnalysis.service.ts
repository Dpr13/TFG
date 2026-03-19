import yahooFinanceDefault from 'yahoo-finance2';
import {
  OHLCVCandle,
  IndicatorPoint,
  BollingerBandsData,
  MACDData,
  SupportResistanceLevel,
  TechnicalSignal,
  TechnicalSignalClass,
  SignalBreakdown,
  TechnicalAnalysisResult,
} from '../models/technicalAnalysis';

const yahooFinance: any = new (yahooFinanceDefault as any)({ suppressNotices: ['yahooSurvey'] });

const RANGE_CONFIG: Record<string, { period: string; interval: string }> = {
  '6mo': { period: '6mo', interval: '1d' },
  '1y':  { period: '1y',  interval: '1d' },
  '3y':  { period: '3y',  interval: '1wk' },
  '5y':  { period: '5y',  interval: '1wk' },
  '10y': { period: '10y', interval: '1mo' },
};

const SR_WINDOW: Record<string, number> = {
  '6mo': 10, '1y': 10, '3y': 8, '5y': 8, '10y': 6,
};

export class TechnicalAnalysisService {

  // ── Public API ──────────────────────────────────────────────────────────

  async analyze(symbol: string, range: string = '1y', customInterval?: string): Promise<TechnicalAnalysisResult> {
    const config = RANGE_CONFIG[range] || RANGE_CONFIG['1y'];
    const activeInterval = customInterval || config.interval;
    const candles = await this.fetchOHLCV(symbol, config.period, activeInterval);

    if (candles.length < 30) {
      throw new Error('No hay suficientes datos históricos para este activo en Yahoo Finance.');
    }

    const closes = candles.map(c => c.close);
    const highs  = candles.map(c => c.high);
    const lows   = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);
    const dates  = candles.map(c => c.date);

    // Check if volume data is meaningful
    const hasVolume = volumes.some(v => v > 0);

    // Moving averages
    const sma20  = this.calcSMA(closes, 20, dates);
    const sma50  = this.calcSMA(closes, 50, dates);
    const sma200 = this.calcSMA(closes, 200, dates);
    const ema20  = this.calcEMA(closes, 20, dates);
    const ema50  = this.calcEMA(closes, 50, dates);

    // Bollinger Bands
    const bollinger = this.calcBollinger(closes, 20, 2, dates);

    // RSI (Wilder)
    const rsi = this.calcRSI(closes, 14, dates);

    // MACD
    const macd = this.calcMACD(closes, 12, 26, 9, dates);

    // OBV
    const obv = hasVolume ? this.calcOBV(closes, volumes, dates) : [];

    // Support & Resistance
    const windowMap: Record<string, number> = {
      '1m': 20, '5m': 20, '15m': 20,
      '1h': 15, '4h': 15,
      '1d': 10,
      '1wk': 6, '1mo': 6,
    };
    const window = windowMap[activeInterval] || 10;
    const { supports, resistances } = this.calcSupportResistance(highs, lows, closes, dates, window);

    // Signal
    const signal = this.calcSignal(closes, sma20, sma50, sma200, rsi, macd, bollinger, obv, hasVolume);

    return {
      symbol: symbol.toUpperCase(),
      range,
      interval: activeInterval,
      candles,
      sma20, sma50, sma200, ema20, ema50,
      bollinger, rsi, macd, obv,
      supports, resistances,
      signal,
      hasVolume,
      analyzedAt: new Date().toISOString(),
    };
  }

  // ── OHLCV Fetch ─────────────────────────────────────────────────────────

  private async fetchOHLCV(symbol: string, period: string, interval: string): Promise<OHLCVCandle[]> {
    const yahooSymbol = this.getYahooSymbol(symbol);

    const now = new Date();
    let period1 = new Date();
    switch (period) {
      case '6mo':  period1.setMonth(now.getMonth() - 6); break;
      case '1y':   period1.setFullYear(now.getFullYear() - 1); break;
      case '3y':   period1.setFullYear(now.getFullYear() - 3); break;
      case '5y':   period1.setFullYear(now.getFullYear() - 5); break;
      case '10y':  period1.setFullYear(now.getFullYear() - 10); break;
      default:     period1.setFullYear(now.getFullYear() - 1);
    }

    const fetchInterval = interval === '4h' ? '1h' : interval;

    // Cap the requested period based on Yahoo Finance limits for intraday data
    if (fetchInterval === '1m') {
      const maxPast = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days to be safe
      if (period1 < maxPast) period1 = maxPast;
    } else if (['5m', '15m'].includes(fetchInterval)) {
      const maxPast = new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000); // 58 days to be safe
      if (period1 < maxPast) period1 = maxPast;
    } else if (['1h', '90m'].includes(fetchInterval)) {
      const maxPast = new Date(now.getTime() - 728 * 24 * 60 * 60 * 1000); // 728 days to be safe
      if (period1 < maxPast) period1 = maxPast;
    }

    const result: any = await yahooFinance.chart(yahooSymbol, { period1, interval: fetchInterval });

    if (!result?.quotes?.length) {
      return [];
    }

    let quotes = result.quotes
      .filter((q: any) => q.close != null && !isNaN(q.close) && q.open != null && q.high != null && q.low != null);

    if (interval === '4h') {
      const resampled: any[] = [];
      let currentGroup: any = null;
      let currentGroupId = -1;

      for (const q of quotes) {
        const d = q.date instanceof Date ? q.date : new Date(q.date);
        const groupId = Math.floor(d.getTime() / (4 * 60 * 60 * 1000));
        
        if (groupId !== currentGroupId) {
          if (currentGroup) resampled.push(currentGroup);
          currentGroup = {
            date: d,
            open: q.open,
            high: q.high,
            low: q.low,
            close: q.close,
            volume: q.volume || 0,
          };
          currentGroupId = groupId;
        } else {
          currentGroup.high = Math.max(currentGroup.high, q.high);
          currentGroup.low = Math.min(currentGroup.low, q.low);
          currentGroup.close = q.close;
          currentGroup.volume += (q.volume || 0);
        }
      }
      if (currentGroup) resampled.push(currentGroup);
      quotes = resampled;
    }

    return quotes.map((q: any) => ({
      date: (q.date instanceof Date ? q.date : new Date(q.date)).toISOString(),
      open: q.open as number,
      high: q.high as number,
      low: q.low as number,
      close: q.close as number,
      volume: (q.volume as number) || 0,
    }));
  }

  private getYahooSymbol(symbol: string): string {
    const s = symbol.toUpperCase();
    if (['BTC', 'BITCOIN'].includes(s)) return 'BTC-USD';
    if (['ETH', 'ETHEREUM'].includes(s)) return 'ETH-USD';
    const cryptoSuffixes = ['-USD', '-BTC', '-ETH', '-EUR'];
    if (cryptoSuffixes.some(x => s.endsWith(x))) return s;
    if (['SOL', 'ADA', 'DOGE', 'XRP', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI', 'SHIB'].includes(s)) return `${s}-USD`;
    return s;
  }

  // ── SMA ─────────────────────────────────────────────────────────────────

  private calcSMA(data: number[], period: number, dates: string[]): IndicatorPoint[] {
    const result: IndicatorPoint[] = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j];
      result.push({ time: dates[i], value: sum / period });
    }
    return result;
  }

  // ── EMA ─────────────────────────────────────────────────────────────────

  private calcEMA(data: number[], period: number, dates: string[]): IndicatorPoint[] {
    if (data.length < period) return [];
    const k = 2 / (period + 1);
    const result: IndicatorPoint[] = [];

    // Seed with SMA
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    let ema = sum / period;
    result.push({ time: dates[period - 1], value: ema });

    for (let i = period; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
      result.push({ time: dates[i], value: ema });
    }
    return result;
  }

  // ── Bollinger Bands ─────────────────────────────────────────────────────

  private calcBollinger(data: number[], period: number, mult: number, dates: string[]): BollingerBandsData {
    const upper: IndicatorPoint[] = [];
    const middle: IndicatorPoint[] = [];
    const lower: IndicatorPoint[] = [];
    const bandwidth: IndicatorPoint[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
      const u = mean + mult * std;
      const l = mean - mult * std;
      const bw = mean > 0 ? ((u - l) / mean) * 100 : 0;

      const t = dates[i];
      upper.push({ time: t, value: u });
      middle.push({ time: t, value: mean });
      lower.push({ time: t, value: l });
      bandwidth.push({ time: t, value: bw });
    }
    return { upper, middle, lower, bandwidth };
  }

  // ── RSI (Wilder) ────────────────────────────────────────────────────────

  private calcRSI(data: number[], period: number, dates: string[]): IndicatorPoint[] {
    if (data.length < period + 1) return [];
    const result: IndicatorPoint[] = [];
    const changes: number[] = [];

    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }

    // Initial average gain/loss (SMA of first `period` changes)
    let avgGain = 0, avgLoss = 0;
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
    }
    avgGain /= period;
    avgLoss /= period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi0 = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    result.push({ time: dates[period], value: rsi0 });

    // Wilder smoothing
    for (let i = period; i < changes.length; i++) {
      const gain = changes[i] > 0 ? changes[i] : 0;
      const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rsI = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiI = avgLoss === 0 ? 100 : 100 - (100 / (1 + rsI));
      result.push({ time: dates[i + 1], value: rsiI });
    }
    return result;
  }

  // ── MACD ────────────────────────────────────────────────────────────────

  private calcMACD(data: number[], fast: number, slow: number, sig: number, dates: string[]): MACDData {
    const emaFast = this.calcEMAValues(data, fast);
    const emaSlow = this.calcEMAValues(data, slow);

    if (emaFast.length === 0 || emaSlow.length === 0) {
      return { macdLine: [], signalLine: [], histogram: [] };
    }

    // MACD line = EMA(fast) - EMA(slow), aligned from index slow-1
    const offset = slow - fast; // emaSlow starts further
    const macdValues: number[] = [];
    const macdDates: string[] = [];

    for (let i = 0; i < emaSlow.length; i++) {
      macdValues.push(emaFast[i + offset] - emaSlow[i]);
      macdDates.push(dates[slow - 1 + i]);
    }

    // Signal line = EMA(9) of MACD values
    const signalValues = this.calcEMAValues(macdValues, sig);
    const signalOffset = sig - 1;

    const macdLine: IndicatorPoint[] = [];
    const signalLine: IndicatorPoint[] = [];
    const histogram: IndicatorPoint[] = [];

    for (let i = 0; i < signalValues.length; i++) {
      const idx = i + signalOffset;
      const t = macdDates[idx];
      macdLine.push({ time: t, value: macdValues[idx] });
      signalLine.push({ time: t, value: signalValues[i] });
      histogram.push({ time: t, value: macdValues[idx] - signalValues[i] });
    }

    return { macdLine, signalLine, histogram };
  }

  // Raw EMA values (no dates)
  private calcEMAValues(data: number[], period: number): number[] {
    if (data.length < period) return [];
    const k = 2 / (period + 1);
    const result: number[] = [];
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    let ema = sum / period;
    result.push(ema);
    for (let i = period; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
      result.push(ema);
    }
    return result;
  }

  // ── OBV ─────────────────────────────────────────────────────────────────

  private calcOBV(closes: number[], volumes: number[], dates: string[]): IndicatorPoint[] {
    const result: IndicatorPoint[] = [];
    let obv = 0;
    result.push({ time: dates[0], value: 0 });

    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) obv += volumes[i];
      else if (closes[i] < closes[i - 1]) obv -= volumes[i];
      result.push({ time: dates[i], value: obv });
    }
    return result;
  }

  // ── Support & Resistance ────────────────────────────────────────────────

  private calcSupportResistance(
    highs: number[], lows: number[], closes: number[], dates: string[], window: number
  ): { supports: SupportResistanceLevel[]; resistances: SupportResistanceLevel[] } {
    const half = Math.floor(window / 2);
    const localMaxima: { price: number; idx: number }[] = [];
    const localMinima: { price: number; idx: number }[] = [];

    for (let i = half; i < highs.length - half; i++) {
      let isMax = true;
      for (let j = i - half; j <= i + half; j++) {
        if (j !== i && highs[j] >= highs[i]) { isMax = false; break; }
      }
      if (isMax) localMaxima.push({ price: highs[i], idx: i });
    }

    for (let i = half; i < lows.length - half; i++) {
      let isMin = true;
      for (let j = i - half; j <= i + half; j++) {
        if (j !== i && lows[j] <= lows[i]) { isMin = false; break; }
      }
      if (isMin) localMinima.push({ price: lows[i], idx: i });
    }

    // Calculate strength: how many times price touched the zone (±0.5%)
    const calcStrength = (price: number): number => {
      const tolerance = price * 0.005;
      return closes.filter(c => Math.abs(c - price) <= tolerance).length;
    };

    const resistances: SupportResistanceLevel[] = localMaxima
      .slice(-3) // 3 most recent
      .map(m => ({
        price: m.price,
        date: dates[m.idx],
        strength: calcStrength(m.price),
        type: 'resistance' as const,
      }));

    const supports: SupportResistanceLevel[] = localMinima
      .slice(-3)
      .map(m => ({
        price: m.price,
        date: dates[m.idx],
        strength: calcStrength(m.price),
        type: 'support' as const,
      }));

    return { supports, resistances };
  }

  // ── Signal Scoring ──────────────────────────────────────────────────────

  private calcSignal(
    closes: number[],
    sma20: IndicatorPoint[], sma50: IndicatorPoint[], sma200: IndicatorPoint[],
    rsi: IndicatorPoint[],
    macd: MACDData,
    bollinger: BollingerBandsData,
    obv: IndicatorPoint[],
    hasVolume: boolean
  ): TechnicalSignal {
    const breakdown: SignalBreakdown[] = [];
    const lastClose = closes[closes.length - 1];
    let totalScore = 0;
    let totalMax = 0;

    // ── Moving Averages (30 pts) ──
    if (sma50.length > 0 || sma200.length > 0) {
      let maScore = 0;
      const maMax = 30;
      const details: string[] = [];

      if (sma200.length > 0) {
        const lastSMA200 = sma200[sma200.length - 1].value;
        if (lastClose > lastSMA200) { maScore += 10; details.push('Precio > SMA200'); }
        else details.push('Precio < SMA200');
      }

      if (sma50.length > 0) {
        const lastSMA50 = sma50[sma50.length - 1].value;
        if (lastClose > lastSMA50) { maScore += 10; details.push('Precio > SMA50'); }
        else details.push('Precio < SMA50');
      }

      if (sma50.length > 0 && sma200.length > 0) {
        const lastSMA50 = sma50[sma50.length - 1].value;
        const lastSMA200 = sma200[sma200.length - 1].value;
        if (lastSMA50 > lastSMA200) { maScore += 10; details.push('SMA50 > SMA200 (Golden Cross)'); }
        else details.push('SMA50 < SMA200 (Death Cross)');
      }

      breakdown.push({ name: 'Medias Móviles', score: maScore, maxScore: maMax, detail: details.join('. ') });
      totalScore += maScore;
      totalMax += maMax;
    }

    // ── RSI (20 pts) ──
    if (rsi.length > 0) {
      const lastRSI = rsi[rsi.length - 1].value;
      let rsiScore = 0;
      let rsiDetail = '';
      if (lastRSI >= 50 && lastRSI <= 70) { rsiScore = 20; rsiDetail = `RSI ${lastRSI.toFixed(1)}: momentum alcista sin sobrecompra`; }
      else if (lastRSI >= 40 && lastRSI < 50) { rsiScore = 10; rsiDetail = `RSI ${lastRSI.toFixed(1)}: neutro-alcista`; }
      else if (lastRSI >= 30 && lastRSI < 40) { rsiScore = 5; rsiDetail = `RSI ${lastRSI.toFixed(1)}: debilitamiento`; }
      else if (lastRSI > 70) { rsiScore = 5; rsiDetail = `RSI ${lastRSI.toFixed(1)}: sobrecompra`; }
      else { rsiScore = 0; rsiDetail = `RSI ${lastRSI.toFixed(1)}: sobrevendido`; }

      breakdown.push({ name: 'RSI', score: rsiScore, maxScore: 20, detail: rsiDetail });
      totalScore += rsiScore;
      totalMax += 20;
    }

    // ── MACD (20 pts) ──
    if (macd.macdLine.length > 0 && macd.signalLine.length > 0) {
      let macdScore = 0;
      const details: string[] = [];
      const lastMACD = macd.macdLine[macd.macdLine.length - 1].value;
      const lastSignal = macd.signalLine[macd.signalLine.length - 1].value;
      const lastHist = macd.histogram[macd.histogram.length - 1].value;

      if (lastMACD > lastSignal) { macdScore += 10; details.push('MACD > Signal'); }
      else details.push('MACD < Signal');

      if (macd.histogram.length >= 2) {
        const prevHist = macd.histogram[macd.histogram.length - 2].value;
        if (lastHist > 0 && lastHist > prevHist) { macdScore += 10; details.push('Histograma positivo y creciente'); }
        else if (lastHist > 0) { macdScore += 5; details.push('Histograma positivo pero decreciente'); }
        else details.push('Histograma negativo');
      }

      breakdown.push({ name: 'MACD', score: macdScore, maxScore: 20, detail: details.join('. ') });
      totalScore += macdScore;
      totalMax += 20;
    }

    // ── Bollinger Bands (15 pts) ──
    if (bollinger.upper.length > 0) {
      const lastUpper = bollinger.upper[bollinger.upper.length - 1].value;
      const lastLower = bollinger.lower[bollinger.lower.length - 1].value;
      let bbScore = 0;
      let bbDetail = '';

      if (lastClose > lastUpper) { bbScore = 5; bbDetail = 'Precio fuera de banda superior (sobrecompra)'; }
      else if (lastClose < lastLower) { bbScore = 5; bbDetail = 'Precio fuera de banda inferior (sobrevendido)'; }
      else { bbScore = 15; bbDetail = 'Precio dentro de las bandas (comportamiento normal)'; }

      breakdown.push({ name: 'Bandas de Bollinger', score: bbScore, maxScore: 15, detail: bbDetail });
      totalScore += bbScore;
      totalMax += 15;
    }

    // ── OBV (15 pts) ──
    if (hasVolume && obv.length >= 10) {
      const lastOBV = obv[obv.length - 1].value;
      const obvSlice = obv.slice(-10);
      const obvAvg = obvSlice.reduce((a, b) => a + b.value, 0) / obvSlice.length;
      let obvScore = 0;
      let obvDetail = '';

      const diff = lastOBV - obvAvg;
      const threshold = Math.abs(obvAvg) * 0.02 || 1; // 2% threshold for "lateral"

      if (diff > threshold) { obvScore = 15; obvDetail = 'OBV en tendencia alcista (acumulación)'; }
      else if (diff > -threshold) { obvScore = 7; obvDetail = 'OBV lateral'; }
      else { obvScore = 0; obvDetail = 'OBV en tendencia bajista (distribución)'; }

      breakdown.push({ name: 'Volumen / OBV', score: obvScore, maxScore: 15, detail: obvDetail });
      totalScore += obvScore;
      totalMax += 15;
    }

    // ── Normalize score if some indicators are missing ──
    const normalizedScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 50;

    // ── Classification ──
    let classification: TechnicalSignalClass;
    if (normalizedScore >= 80) classification = 'COMPRA FUERTE';
    else if (normalizedScore >= 60) classification = 'COMPRA';
    else if (normalizedScore >= 40) classification = 'NEUTRAL';
    else if (normalizedScore >= 20) classification = 'VENTA';
    else classification = 'VENTA FUERTE';

    // ── Generate explanation ──
    const explanation = this.generateExplanation(breakdown, normalizedScore, classification);

    return {
      score: normalizedScore,
      maxScore: totalMax,
      classification,
      breakdown,
      explanation,
    };
  }

  private generateExplanation(breakdown: SignalBreakdown[], score: number, classification: TechnicalSignalClass): string {
    const sentences: string[] = [];

    // Top contributor
    const sorted = [...breakdown].sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore));
    if (sorted.length > 0) {
      const top = sorted[0];
      const pct = Math.round((top.score / top.maxScore) * 100);
      sentences.push(`${top.name} es el indicador más favorable (${top.score}/${top.maxScore} pts, ${pct}%).`);
    }

    // Weakest
    const weakest = [...breakdown].sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore));
    if (weakest.length > 1 && weakest[0].score / weakest[0].maxScore < 0.5) {
      sentences.push(`${weakest[0].name} muestra debilidad: ${weakest[0].detail}.`);
    }

    // Overall
    if (score >= 70) sentences.push('Los indicadores técnicos convergen en una señal positiva.');
    else if (score >= 50) sentences.push('La señal técnica es mixta, se recomienda vigilar la evolución de los indicadores.');
    else sentences.push('Los indicadores técnicos sugieren precaución en el corto plazo.');

    return sentences.join(' ');
  }
}
