import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { Language } from '../utils/i18n';

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = 'llama-3.3-70b-versatile';

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface IAContexto {
  ticker: string;
  tipo_activo: string;
  direccion: string;
  intervalo: string;
  horizonte: string;
  precio_entrada: number;
  sl: number;
  sl_dist_pct: number;
  metodo_sl: string;
  tps: string;
  take_profit_1: number | null;
  take_profit_1_pct: number;
  metodo_tp_1: string;
  take_profit_2: number | null;
  take_profit_2_pct: number;
  metodo_tp_2: string | null;
  ratio_rb: number;
  capital_total: number;
  capital_riesgo: number;
  riesgo_pct: number;
  tamano_posicion: number;
  valor_posicion: number;
  rsi: number | null;
  rsi_zona: string;
  macd: string;
  macd_hist_valor: number;
  sma: string;
  estado_sma50: string;
  estado_sma200: string;
  tendencia_sma: string;
  bollinger: string;
  obv: string;
  soporte: number | null;
  resistencia: number | null;
  señal: string;
  puntuacion: number;
  cambio_52s: number | null;
  pe: number | null;
  roe: number | null;
  margen: number | null;
  dividendo: number | null;
  market_cap: number | null;
  lang: Language;
}

export interface IAAnalisisResult {
  resumen: string | null;
  justificacion: string | null;
  resumenError?: string;
  justificacionError?: string;
}

// ── Construir contexto ─────────────────────────────────────────────────────

export function construirContexto(data: {
  ticker: string;
  direccion: string;
  intervalo: string;
  horizonte?: string;
  precio_entrada: number;
  sl: number;
  metodo_sl?: string;
  tps: Array<{ precio: number; metodo: string }>;
  tps_detalle?: Array<{ precio: number; metodo: string; pct: number; ratio: number }>;
  risk_management?: {
    capital_total?: number;
    riesgo_pct?: number;
    capital_riesgo?: number;
    tamano_posicion?: number;
    valor_posicion?: number;
  };
  datos_tecnicos: {
    rsi?: number | null;
    macd_hist?: number;
    sobre_sma50?: boolean;
    sobre_sma200?: boolean;
    sma50_sobre_sma200?: boolean;
    señal?: string;
    puntuacion?: number;
    bb_posicion?: string;
    obv_tendencia?: string;
    soporte_cercano?: number | null;
    resistencia_cercana?: number | null;
    cambio_52_semanas?: number | null;
  };
  datos_fundamentales: {
    pe?: number | null;
    roe?: number | null;
    margen_neto?: number | null;
    dividendo?: number | null;
    market_cap?: number | null;
    tipo?: string;
  };
  lang?: Language;
}): IAContexto {
  const { ticker, direccion, intervalo, precio_entrada, sl, tps, datos_tecnicos, datos_fundamentales, lang = 'es' } = data;

  const rsi = datos_tecnicos.rsi ?? null;
  const macd_hist_raw = datos_tecnicos.macd_hist ?? 0;
  const macd_alcista = macd_hist_raw > 0;
  const sobre_sma50 = datos_tecnicos.sobre_sma50 ?? false;
  const sobre_sma200 = datos_tecnicos.sobre_sma200 ?? false;
  const sma50_sobre_sma200 = datos_tecnicos.sma50_sobre_sma200 ?? sobre_sma50;
  const señal = datos_tecnicos.señal ?? 'NEUTRAL';
  const puntuacion = datos_tecnicos.puntuacion ?? 0;
  const bb_posicion = datos_tecnicos.bb_posicion ?? 'dentro';
  const obv_tendencia = datos_tecnicos.obv_tendencia ?? 'lateral';
  const soporte_cercano = datos_tecnicos.soporte_cercano ?? null;
  const resistencia_cercana = datos_tecnicos.resistencia_cercana ?? null;
  const cambio_52s = datos_tecnicos.cambio_52_semanas ?? null;

  const pe = datos_fundamentales.pe ?? null;
  const roe = datos_fundamentales.roe ?? null;
  const margen = datos_fundamentales.margen_neto ?? null;
  const dividendo = datos_fundamentales.dividendo ?? null;
  const market_cap = datos_fundamentales.market_cap ?? null;
  const tipo_activo = datos_fundamentales.tipo ?? 'EQUITY';

  const sl_dist = Math.abs(precio_entrada - sl) / precio_entrada * 100;

  // RSI zone
  const rsi_labels: Record<Language, { overbought: string, oversold: string, neutral: string }> = {
    es: { overbought: 'sobrecompra', oversold: 'sobreventa', neutral: 'neutral' },
    en: { overbought: 'overbought', oversold: 'oversold', neutral: 'neutral' },
    fr: { overbought: 'surachat', oversold: 'survente', neutral: 'neutre' },
    de: { overbought: 'überkauft', oversold: 'überverkauft', neutral: 'neutral' },
  };
  const rsi_zona = rsi != null
    ? (rsi > 70 ? rsi_labels[lang].overbought : rsi < 30 ? rsi_labels[lang].oversold : rsi_labels[lang].neutral)
    : 'N/A';

  const tps_str = tps.map((tp, i) => {
    const dist = Math.abs(tp.precio - precio_entrada) / precio_entrada * 100;
    return `TP${i + 1}=${tp.precio.toFixed(2)} (${tp.metodo}, +${dist.toFixed(1)}%)`;
  }).join(' | ');

  // TP detail extraction
  const detalle = data.tps_detalle || tps.map((tp, _i) => {
    const dist = Math.abs(tp.precio - precio_entrada) / precio_entrada * 100;
    const ratio = sl_dist > 0 ? dist / sl_dist : 0;
    return { precio: tp.precio, metodo: tp.metodo, pct: dist, ratio };
  });

  const tp1 = detalle[0] || null;
  const tp2 = detalle[1] || null;

  const rm = data.risk_management || {};

  return {
    ticker,
    tipo_activo,
    direccion,
    intervalo,
    horizonte: data.horizonte || intervalo,
    precio_entrada,
    sl,
    sl_dist_pct: sl_dist,
    metodo_sl: data.metodo_sl || '% Fijo',
    tps: tps_str,
    take_profit_1: tp1 ? tp1.precio : null,
    take_profit_1_pct: tp1 ? tp1.pct : 0,
    metodo_tp_1: tp1 ? tp1.metodo : 'N/A',
    take_profit_2: tp2 ? tp2.precio : null,
    take_profit_2_pct: tp2 ? tp2.pct : 0,
    metodo_tp_2: tp2 ? tp2.metodo : null,
    ratio_rb: tp1 ? tp1.ratio : 0,
    capital_total: rm.capital_total ?? 0,
    capital_riesgo: rm.capital_riesgo ?? 0,
    riesgo_pct: rm.riesgo_pct ?? 0,
    tamano_posicion: rm.tamano_posicion ?? 0,
    valor_posicion: rm.valor_posicion ?? 0,
    rsi,
    rsi_zona,
    macd: (macd_alcista ? { es: 'alcista', en: 'bullish', fr: 'haussier', de: 'bullisch' } : { es: 'bajista', en: 'bearish', fr: 'baissier', de: 'bärisch' })[lang],
    macd_hist_valor: macd_hist_raw,
    sma: ((): string => {
      const texts = {
        es: { above: 'por encima de', below: 'por debajo de' },
        en: { above: 'above', below: 'below' },
        fr: { above: 'au-dessus de', below: 'en dessous de' },
        de: { above: 'über', below: 'unter' },
      };
      const t = texts[lang];
      return `${sobre_sma50 ? t.above : t.below} SMA50, ${sobre_sma200 ? t.above : t.below} SMA200`;
    })(),
    estado_sma50: (sobre_sma50 ? { es: 'por encima', en: 'above', fr: 'au-dessus', de: 'über' } : { es: 'por debajo', en: 'below', fr: 'en dessous', de: 'unter' })[lang],
    estado_sma200: (sobre_sma200 ? { es: 'por encima', en: 'above', fr: 'au-dessus', de: 'über' } : { es: 'por debajo', en: 'below', fr: 'en dessous', de: 'unter' })[lang],
    tendencia_sma: (sma50_sobre_sma200 
      ? { es: 'alcista (golden cross)', en: 'bullish (golden cross)', fr: 'haussier (golden cross)', de: 'bullisch (Golden Cross)' }
      : { es: 'bajista (death cross)', en: 'bearish (death cross)', fr: 'baissier (death cross)', de: 'bärisch (Death Cross)' })[lang],
    bollinger: bb_posicion,
    obv: obv_tendencia,
    soporte: soporte_cercano,
    resistencia: resistencia_cercana,
    señal,
    puntuacion,
    cambio_52s,
    pe,
    roe,
    margen,
    dividendo,
    market_cap,
    lang,
  };
}

// ── Módulo 1: Resumen narrativo ────────────────────────────────────────────

async function generarResumen(ctx: IAContexto): Promise<string> {
  const fundamentalLine = ctx.pe
    ? `\nFUNDAMENTAL: P/E=${ctx.pe} | ROE=${ctx.roe}% | Margen neto=${ctx.margen}% | Dividendo=${ctx.dividendo}%`
    : '';

  const soporteStr = ctx.soporte != null ? ctx.soporte.toFixed(2) : 'N/A';
  const resistenciaStr = ctx.resistencia != null ? ctx.resistencia.toFixed(2) : 'N/A';

  const languageNames: Record<Language, string> = {
    es: 'Spanish',
    en: 'English',
    fr: 'French',
    de: 'German',
  };
  const targetLang = languageNames[ctx.lang];

  const prompt = `You are an expert financial analyst. You have the following data for ${ctx.ticker} (${ctx.tipo_activo}):

TECHNICAL: Signal ${ctx.señal} (${ctx.puntuacion}/100) | RSI=${ctx.rsi != null ? ctx.rsi.toFixed(1) : 'N/A'} | MACD ${ctx.macd} | Price ${ctx.sma} | SMA50 vs SMA200 Trend: ${ctx.tendencia_sma} | Bollinger: price ${ctx.bollinger} of the bands | OBV ${ctx.obv}${fundamentalLine}
KEY LEVELS: Support at ${soporteStr} | Resistance at ${resistenciaStr}
ANALYSIS TIMEFRAME: ${ctx.intervalo}

Write a summary of exactly 3 sentences in ${targetLang} for a retail investor.
- Sentence 1: current technical situation — what the price is doing and current dominant trend.
- Sentence 2: confluence or divergence between indicators — reliability of the signal.
- Sentence 3: key levels to monitor (support and resistance) and implications of breakouts.
IMPORTANT: Do NOT mention entry levels, stop loss, or take profit. Only describe the current technical picture.
No bullet points. No raw data repetition. Be direct and specific.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.4,
  });

  const errorMessages: Record<Language, string> = {
    es: 'No se pudo generar el resumen.',
    en: 'Could not generate the summary.',
    fr: 'Impossible de générer le résumé.',
    de: 'Zusammenfassung konnte nicht erstellt werden.',
  };

  return response.choices[0]?.message?.content || errorMessages[ctx.lang];
}

// ── Módulo 2: Justificación profesional de la operación ──────────────────

async function generarJustificacion(ctx: IAContexto): Promise<string> {
  const soporteStr = ctx.soporte != null ? ctx.soporte.toFixed(2) : 'N/A';
  const resistenciaStr = ctx.resistencia != null ? ctx.resistencia.toFixed(2) : 'N/A';
  const languageNames: Record<Language, string> = {
    es: 'Spanish',
    en: 'English',
    fr: 'French',
    de: 'German',
  };
  const targetLang = languageNames[ctx.lang];

  const tp2Line = ctx.take_profit_2 != null && ctx.metodo_tp_2
    ? `- Take Profit 2: ${ctx.take_profit_2.toFixed(2)} (+${ctx.take_profit_2_pct.toFixed(1)}% | method: ${ctx.metodo_tp_2})`
    : '';
  const cambio52sLine = ctx.cambio_52s != null ? `- Last 52 weeks change: ${ctx.cambio_52s.toFixed(1)}%` : '';

  const prompt = `You are an expert financial analyst in technical trading and risk management. Your task is to generate a professional justification for a trading operation based exclusively on the provided data. Do not invent data or make assumptions about information not provided.

IMPORTANT: This text complements a previous technical summary that already describes the asset's current technical situation (trend, indicators, key levels). DO NOT repeat the general technical description. Focus exclusively on justifying the proposed operation: why these SL and TP levels are chosen, if risk management is appropriate, and what could go wrong.

RESTRICTIONS:
- It does not constitute financial advice or investment recommendation.
- Base every statement on the provided data. If data is N/A or not available, do not mention it.
- Length: between 130 and 160 words. No more, no less.
- Format: a single continuous block of text, no lists, no emojis, no headers, no bold.
- Language: ${targetLang}.
- If the technical signal is NEUTRAL or SELL and the direction is LONG (or vice versa), explicitly point out the contradiction and recommend caution or not trading.

INTERNAL STRUCTURE (not visible in the output, only as a guide):
1. Signal/direction consistency: if the chosen direction is consistent with the global technical signal.
2. Stop Loss: explain why it's placed at that level according to the method used (detected support or fixed percentage) and if it adequately protects the position.
3. Take Profit: justify each target with its logic (resistance, risk/reward ratio, Bollinger band).
4. Risk management: assess if the R/R ratio is favorable and if the position size is prudent relative to total capital.
5. Main risks: one or two specific factors that could invalidate the trade, based on weak or contradictory indicators.

INPUT DATA:
- Asset: ${ctx.ticker} (${ctx.tipo_activo})
- Price at entry: ${ctx.precio_entrada.toFixed(2)}
- Direction: ${ctx.direccion}
- Interval / Horizon: ${ctx.intervalo} / ${ctx.horizonte}
- Stop Loss: ${ctx.sl.toFixed(2)} (${ctx.sl_dist_pct.toFixed(1)}% | method: ${ctx.metodo_sl})
- Take Profit 1: ${ctx.take_profit_1 != null ? ctx.take_profit_1.toFixed(2) : 'N/A'} (+${ctx.take_profit_1_pct.toFixed(1)}% | method: ${ctx.metodo_tp_1})
${tp2Line}
- Real R/R Ratio: ${ctx.ratio_rb.toFixed(2)}
- Capital at risk: ${ctx.capital_riesgo.toFixed(2)} (${ctx.riesgo_pct.toFixed(1)}% of total capital of ${ctx.capital_total.toFixed(2)})
- Position size: ${ctx.tamano_posicion.toFixed(4)} units | Total value: ${ctx.valor_posicion.toFixed(2)}
- RSI(14): ${ctx.rsi != null ? ctx.rsi.toFixed(1) : 'N/A'} ${ctx.rsi_zona}
- MACD: ${ctx.macd} (histogram ${ctx.macd_hist_valor})
- Moving averages: price ${ctx.estado_sma50} SMA50, ${ctx.estado_sma200} SMA200 | SMA50 vs SMA200 trend: ${ctx.tendencia_sma}
- Bollinger Bands: price ${ctx.bollinger} of the bands
- OBV: trend ${ctx.obv}
- Global technical signal: ${ctx.señal} (${ctx.puntuacion}/100)
- Nearest support: ${soporteStr}
- Nearest resistance: ${resistenciaStr}
${cambio52sLine}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.3,
  });

  const errorMessages: Record<Language, string> = {
    es: 'No se pudo generar la justificación.',
    en: 'Could not generate the justification.',
    fr: 'Impossible de générer la justification.',
    de: 'Begründung konnte nicht erstellt werden.',
  };

  return response.choices[0]?.message?.content || errorMessages[ctx.lang];
}

// ── Análisis en paralelo (módulos 1 y 2) ────────────────────────────────

export async function generarAnalisisIA(ctx: IAContexto): Promise<IAAnalisisResult> {
  const timeout = (ms: number) =>
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

  let resumen: string | null = null;
  let justificacion: string | null = null;
  let resumenError: string | undefined;
  let justificacionError: string | undefined;

  const [resumenResult, justificacionResult] = await Promise.allSettled([
    Promise.race([generarResumen(ctx), timeout(15000)]),
    Promise.race([generarJustificacion(ctx), timeout(15000)]),
  ]);

  if (resumenResult.status === 'fulfilled') {
    resumen = resumenResult.value;
  } else {
    resumenError = ctx.lang === 'es' 
      ? 'El servicio de IA no está disponible en este momento. Inténtalo de nuevo.'
      : 'The AI service is not available at this time. Please try again.';
  }

  if (justificacionResult.status === 'fulfilled') {
    justificacion = justificacionResult.value;
  } else {
    justificacionError = ctx.lang === 'es'
      ? 'El servicio de IA no está disponible en este momento. Inténtalo de nuevo.'
      : 'The AI service is not available at this time. Please try again.';
  }

  return { resumen, justificacion, resumenError, justificacionError };
}

// ── Módulo 3: Chat contextual ──────────────────────────────────────────

export async function chatIA(
  ctx: IAContexto,
  historial: Array<{ role: string; content: string }>,
  mensaje: string
): Promise<{ respuesta: string; ok: boolean }> {
  const soporteStr = ctx.soporte != null ? ctx.soporte.toFixed(2) : 'N/A';
  const resistenciaStr = ctx.resistencia != null ? ctx.resistencia.toFixed(2) : 'N/A';

  const fundamentalLine = ctx.pe
    ? `\n- P/E: ${ctx.pe} | ROE: ${ctx.roe}% | Margen: ${ctx.margen}%`
    : '';

  const languageNames: Record<Language, string> = {
    es: 'Spanish',
    en: 'English',
    fr: 'French',
    de: 'German',
  };
  const targetLang = languageNames[ctx.lang];

  const systemPrompt = `You are a specialized financial analysis assistant.
You have access to the following real-time data for asset ${ctx.ticker}:

CURRENT DATA:
- Asset type: ${ctx.tipo_activo}
- Analyzed entry price: ${ctx.precio_entrada.toFixed(2)}
- Proposed Stop Loss: ${ctx.sl.toFixed(2)} (${ctx.sl_dist_pct.toFixed(1)}% risk)
- Take Profits: ${ctx.tps}
- Technical signal: ${ctx.señal} (${ctx.puntuacion}/100)
- RSI: ${ctx.rsi != null ? ctx.rsi.toFixed(1) : 'N/A'} | MACD: ${ctx.macd} | Price ${ctx.sma}
- Bollinger: price ${ctx.bollinger} of the bands | OBV: ${ctx.obv}
- Nearest Support: ${soporteStr} | Nearest Resistance: ${resistenciaStr}${fundamentalLine}

INSTRUCTIONS:
- Respond ONLY based on the above data. Do not invent data that is not here.
- If the user asks something you cannot answer with this data, say so clearly.
- Always respond in ${targetLang}, concisely (maximum 4 sentences per response).
- Do not give direct investment recommendations. Explain, analyze, educate.
- If the user asks whether to buy or sell, explain the factors but do not give a binary answer.`;

  // Keep last 10 messages (5 turns)
  const trimmedHistorial = historial.slice(-10);

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...trimmedHistorial.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: mensaje },
  ];

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 350,
      temperature: 0.5,
    });

    const errorMessages: Record<Language, string> = {
      es: 'No response.',
      en: 'No response.',
      fr: 'Pas de réponse.',
      de: 'Keine Antwort.',
    };
    const respuesta = response.choices[0]?.message?.content || errorMessages[ctx.lang];
    return { respuesta, ok: true };
  } catch (e) {
    const errorMessages: Record<Language, string> = {
      es: 'El servicio de IA no está disponible en este momento. Inténtalo de nuevo.',
      en: 'The AI service is not available at this time. Please try again.',
      fr: 'Le service IA n\'est pas disponible pour le moment. Veuillez réessayer.',
      de: 'Der KI-Dienst ist derzeit nicht verfügbar. Bitte versuchen Sie es erneut.',
    };
    return {
      respuesta: errorMessages[ctx.lang],
      ok: false,
    };
  }
}

// ── Módulo 4: Resumen narrativo técnico puro ──────────────────────────

export async function generarResumenTecnico(data: {
  ticker: string;
  intervalo: string;
  horizonte: string;
  datos_tecnicos: {
    rsi?: number | null;
    macd_hist?: number;
    sobre_sma50?: boolean;
    sobre_sma200?: boolean;
    sma50_sobre_sma200?: boolean;
    bb_posicion?: string;
    obv_tendencia?: string;
    señal?: string;
    puntuacion?: number;
    soporte_cercano?: number | null;
    resistencia_cercana?: number | null;
    cambio_52_semanas?: number | null;
  };
  lang?: Language;
}): Promise<{ resumen: string | null; ok: boolean; error?: string }> {
  try {
    const { ticker, intervalo, horizonte, datos_tecnicos, lang = 'es' } = data;
    const isEn = lang === 'en';

    const rsi = datos_tecnicos.rsi ?? null;
    const macd_alcista = (datos_tecnicos.macd_hist ?? 0) > 0;
    const sobre_sma50 = datos_tecnicos.sobre_sma50 ?? false;
    const sobre_sma200 = datos_tecnicos.sobre_sma200 ?? false;
    const sma50_sobre_sma200 = datos_tecnicos.sma50_sobre_sma200 ?? false;
    const bb_posicion = datos_tecnicos.bb_posicion ?? 'dentro';
    const obv_tendencia = datos_tecnicos.obv_tendencia ?? 'lateral';
    const señal = datos_tecnicos.señal ?? 'NEUTRAL';
    const puntuacion = datos_tecnicos.puntuacion ?? 0;
    const soporte = datos_tecnicos.soporte_cercano ?? null;
    const resistencia = datos_tecnicos.resistencia_cercana ?? null;
    const cambio_52s = datos_tecnicos.cambio_52_semanas;

    const languageNames: Record<Language, string> = {
      es: 'Spanish',
      en: 'English',
      fr: 'French',
      de: 'German',
    };
    const targetLang = languageNames[lang];

    const prompt = `You are an expert technical analyst. Analyze the following technical situation for ${ticker} and generate a clear and objective narrative summary.

CURRENT TECHNICAL DATA:
- Interval analyzed: ${intervalo} | Horizon: ${horizonte}
- Global signal: ${señal} (${puntuacion}/100 points)
- RSI(14): ${rsi != null ? rsi.toFixed(1) : 'N/A'} ${rsi && rsi > 70 ? '→ overbought zone' : rsi && rsi < 30 ? '→ oversold zone' : '→ neutral zone'}
- MACD: histogram ${macd_alcista ? 'positive and bullish' : 'negative and bearish'}
- Moving averages: price ${sobre_sma50 ? 'above' : 'below'} SMA50, ${sobre_sma200 ? 'above' : 'below'} SMA200
- Structural tendency (SMA50 vs SMA200): ${sma50_sobre_sma200 ? 'bullish (golden cross)' : 'bearish (death cross)'}
- Bollinger Bands: price ${bb_posicion} of the bands
- OBV: trend ${obv_tendencia}
- Near support: ${soporte != null ? soporte.toFixed(2) : 'N/A'} | Near resistance: ${resistencia != null ? resistencia.toFixed(2) : 'N/A'}
${cambio_52s != null ? `- Last 52 weeks change: ${cambio_52s.toFixed(1)}%` : ''}

INSTRUCTIONS:
Write exactly 3 short paragraphs in ${targetLang}, without bullet points or headers:
1. Paragraph 1 (1-2 sentences): current technical situation — what the price is doing and current dominant trend.
2. Paragraph 2 (2-3 sentences): confluence or divergence between indicators — what that means for signal reliability.
3. Paragraph 3 (1-2 sentences): key levels to monitor (support and resistance) and implications of breakouts.

Be direct, specific with data and use language understandable for medium-level investors. Do not repeat raw numerical values — interpret them.`;

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 380,
      temperature: 0.4,
    });

    const resumen = response.choices[0]?.message?.content || null;
    
    if (!resumen) {
      throw new Error('Resumen vacío recibido de la IA');
    }

    return { resumen, ok: true };
  } catch (error) {
    console.error(`[ERROR Groq resumen técnico]: ${error}`);
    const lang = (data as any).lang || 'es';
    return {
      resumen: null,
      ok: false,
      error: lang === 'en' ? 'The AI service is not available at this time.' : 'El servicio de IA no está disponible en este momento.',
    };
  }
}

// ── Módulo 5: Veredicto comparativa de activos ────────────────────────────

export async function generarVeredictoComparativa(
  resultados: Array<{
    ticker: string;
    nombre: string;
    tipo: string;
    fundamental: any;
    tecnico: any;
    riesgo: any;
    error: string | null;
  }>,
  horizonte: string,
  lang: Language = 'es'
): Promise<{ veredicto: string | null; ok: boolean; error?: string }> {
  const isEn = lang === 'en';
  const activosValidos = resultados.filter(r => !r.error);
  if (activosValidos.length < 2) {
    return { veredicto: null, ok: false, error: isEn ? 'At least 2 valid assets are needed.' : 'Se necesitan al menos 2 activos válidos.' };
  }

  const tickersStr = activosValidos.map(r => r.ticker).join(' vs ');

  let resumenActivos = '';
  for (const r of activosValidos) {
    const f = r.fundamental || {};
    const t = r.tecnico || {};
    const rk = r.riesgo || {};
    resumenActivos += `
${r.ticker} (${r.nombre}, ${r.tipo}):
- Fundamental: P/E=${f.pe_ratio ?? 'N/D'}, ROE=${f.roe != null ? f.roe.toFixed(1) + '%' : 'N/D'}, Margen=${f.margen_neto != null ? f.margen_neto.toFixed(1) + '%' : 'N/D'}, Dividendo=${f.dividendo != null ? f.dividendo.toFixed(2) + '%' : 'N/D'}
- Técnico: Puntuación=${t.puntuacion_tecnica ?? 'N/D'}/100, RSI=${t.rsi != null ? t.rsi.toFixed(1) : 'N/D'}, Tendencia=${t.tendencia ?? 'N/D'}, Cambio período=${t.cambio_periodo_pct != null ? t.cambio_periodo_pct.toFixed(1) + '%' : 'N/D'}
- Riesgo: Volatilidad=${rk.volatilidad_anual != null ? rk.volatilidad_anual.toFixed(1) + '%' : 'N/D'}, Sharpe=${rk.sharpe_ratio != null ? rk.sharpe_ratio.toFixed(2) : 'N/D'}, MaxDrawdown=${rk.max_drawdown != null ? rk.max_drawdown.toFixed(1) + '%' : 'N/D'}, VaR95=${rk.var_95 != null ? rk.var_95.toFixed(2) + '%' : 'N/D'}
`;
  }

  const languageNames: Record<Language, string> = {
    es: 'Spanish',
    en: 'English',
    fr: 'French',
    de: 'German',
  };
  const targetLang = languageNames[lang];

  const prompt = `You are an expert financial analyst. Compare the following financial assets and emit a clear verdict:

COMPARISON: ${tickersStr} | Horizon: ${horizonte}

DATA:
${resumenActivos}

Generate a structured verdict in ${targetLang} with exactly these three parts, without using bullet points or headers with #:

Part 1 (2-3 sentences): Which asset shows a better FUNDAMENTAL profile and why, citing specific metrics.
Part 2 (2-3 sentences): Which asset shows a better TECHNICAL AND RISK profile in the analyzed horizon, with specific data.
Part 3 (2-3 sentences): Global verdict — which asset seems more attractive considering all factors and for what type of investor (conservative, moderate, aggressive). If assets are of different types (stock vs crypto), mention that direct comparison has limitations.

Be direct and specific. Do not repeat raw numerical values — interpret them.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.4,
    });

    const veredicto = response.choices[0]?.message?.content || null;
    if (!veredicto) {
      return { veredicto: null, ok: false, error: isEn ? 'Could not generate verdict.' : 'No se pudo generar el veredicto.' };
    }
    return { veredicto, ok: true };
  } catch (e) {
    console.error(`[ERROR veredicto IA]:`, e);
    const errorMessages: Record<Language, string> = {
      es: 'Servicio de IA no disponible.',
      en: 'AI service not available.',
      fr: 'Service IA non disponible.',
      de: 'KI-Dienst nicht verfügbar.',
    };
    return { veredicto: null, ok: false, error: errorMessages[lang] };
  }
}

