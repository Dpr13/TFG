import { FinancialData, FinancialDataValidator, StockFinancialData, CryptoFinancialData } from '../models/financialData';
import { FundamentalAnalysis, FundamentalOutlook, AnalysisSection } from '../models/fundamentalAnalysis';
import { FinancialDataService } from './financialData.service';
import { i18n, Language } from '../utils/i18n';

/**
 * Rule-based Fundamental Analysis Engine
 * Generates structured narrative analysis from Yahoo Finance financial metrics
 */
export class FundamentalAnalysisService {
  private financialDataService: FinancialDataService;

  constructor() {
    this.financialDataService = new FinancialDataService();
  }

  /**
   * Generate a full fundamental analysis for a given symbol
   */
  async analyze(symbol: string, lang: Language = 'es', range: string = '1y'): Promise<FundamentalAnalysis | null> {
    const data = await this.financialDataService.getFinancialData(symbol);
    if (!data) return null;

    const quoteType = data.quoteType?.toUpperCase() || 'EQUITY';

    if (quoteType === 'CRYPTOCURRENCY') {
      return this.analyzeCrypto(symbol, data as CryptoFinancialData, lang, range);
    } else if (quoteType === 'ETF') {
      return this.analyzeETF(symbol, data as StockFinancialData, lang, range);
    } else {
      return this.analyzeStock(symbol, data as StockFinancialData, lang, range);
    }
  }

  // ── Stock Analysis ──────────────────────────────────────────────────────

  private analyzeStock(symbol: string, data: StockFinancialData, lang: Language, range: string): FundamentalAnalysis {
    if (['6mo', '1y'].includes(range)) {
      return this.analyzeStockShortTerm(symbol, data, lang, range);
    } else if (range === '3y') {
      return this.analyzeStockMidTerm(symbol, data, lang, range);
    } else {
      return this.analyzeStockLongTerm(symbol, data, lang, range);
    }
  }

  // ── Short Term Analyzer (<= 1 year) ──────────────────────────────────────
  // Focus: Momentum, Recent Earnings, and Volatility
  private analyzeStockShortTerm(symbol: string, data: StockFinancialData, lang: Language, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const currency = this.getCurrencySymbol(data.financialCurrency);
    const benchmark = this.getBenchmark(data.exchange, lang);
    const t = i18n[lang].fundamental;

    // 1. Momentum & Market Position (Higher importance in short term)
    let momentumScore = 50;
    if (data.fiftyTwoWeekHigh != null && data.fiftyTwoWeekLow != null) {
      const currentPrice = data.fiftyTwoWeekLow + (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow) * 0.5; // Approximation
      const pos = ((currentPrice - data.fiftyTwoWeekLow) / (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow)) * 100;
      momentumScore = pos > 70 ? 80 : pos < 30 ? 30 : 50;
    }
    sections.stability = { 
      title: t.sections.stability, 
      content: lang === 'en' 
        ? `Beta of ${data.beta?.toFixed(2)} (${benchmark}). The asset trades in a range of ${currency}${data.fiftyTwoWeekLow?.toFixed(2)} - ${currency}${data.fiftyTwoWeekHigh?.toFixed(2)}. Short-term momentum is the dominant factor.`
        : `Beta de ${data.beta?.toFixed(2)} (${benchmark}). El activo cotiza en un rango de ${currency}${data.fiftyTwoWeekLow?.toFixed(2)} - ${currency}${data.fiftyTwoWeekHigh?.toFixed(2)}. El momentum de corto plazo es el factor dominante.` 
    };
    scores.push({ val: momentumScore, weight: 0.4 });

    // 2. Recent Earnings (TTM)
    let earningsScore = 50;
    if (data.eps != null) {
      earningsScore = data.eps > 0 ? 70 : 20;
    }
    let earningsContent = '';
    if (lang === 'en') {
      earningsContent = data.eps && data.eps > 0 
        ? `Positive earnings per share of ${currency}${data.eps.toFixed(2)}. The market reacts favorably to immediate profitability.` 
        : `Lack of recent earnings (${currency}${data.eps?.toFixed(2)}), creating bearish pressure in the short term.`;
    } else {
      earningsContent = data.eps && data.eps > 0 
        ? `Beneficio por acción positivo de ${currency}${data.eps.toFixed(2)}. El mercado reacciona favorablemente a la rentabilidad inmediata.` 
        : `Ausencia de beneficios recientes (${currency}${data.eps?.toFixed(2)}), lo que genera presión bajista en el corto plazo.`;
    }
    sections.growth = { title: t.sections.growth, content: earningsContent };
    scores.push({ val: earningsScore, weight: 0.3 });

    // 3. Profitability (Short Term - Requested)
    let profitScore = 50;
    if (data.profitMargin != null && data.roe != null) {
      profitScore = (data.profitMargin > 0.1 ? 70 : 40) + (data.roe > 0.15 ? 10 : 0);
    }
    sections.profitability = { 
      title: t.sections.profitability, 
      content: lang === 'en'
        ? `Net margin of ${(data.profitMargin ? data.profitMargin * 100 : 0).toFixed(2)}% and ROE of ${(data.roe ? data.roe * 100 : 0).toFixed(2)}%. These figures confirm current operating efficiency.`
        : `Margen neto del ${(data.profitMargin ? data.profitMargin * 100 : 0).toFixed(2)}% y ROE del ${(data.roe ? data.roe * 100 : 0).toFixed(2)}%. Estos datos confirman la eficiencia operativa actual.` 
    };
    scores.push({ val: profitScore, weight: 0.2 });

    // 4. Current Valuation (Point-in-time)
    let valScore = 50;
    if (data.peRatio != null) {
      valScore = data.peRatio < 25 ? 70 : 30;
    }
    sections.valuation = { 
      title: t.sections.valuation, 
      content: lang === 'en'
        ? `Current P/E Ratio of ${data.peRatio?.toFixed(2) || 'N/A'}. In the short term, the market validates comparative multiples.`
        : `P/E Ratio actual de ${data.peRatio?.toFixed(2) || 'N/A'}. En el corto plazo, el mercado valida múltiplos comparativos.` 
    };
    scores.push({ val: valScore, weight: 0.1 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    return this.assembleAnalysis(symbol, 'stock', outlook, totalScore, sections, lang, range, t.stock_horizons.short);
  }

  // ── Mid Term Analyzer (1-3 years) ────────────────────────────────────────
  // Focus: Growth Efficiency, PEG, and Operating Execution
  private analyzeStockMidTerm(symbol: string, data: StockFinancialData, lang: Language, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const t = i18n[lang].fundamental;

    // 1. Growth Efficiency (PEG)
    let growthScore = 50;
    if (data.pegRatio != null) {
      growthScore = data.pegRatio < 1.0 ? 85 : data.pegRatio < 2.0 ? 60 : 30;
    }
    sections.growth = { 
      title: t.sections.growth, 
      content: lang === 'en'
        ? `PEG Ratio of ${data.pegRatio?.toFixed(2) || 'N/A'}. Indicates whether projected growth justifies the paid multiple.`
        : `PEG Ratio de ${data.pegRatio?.toFixed(2) || 'N/A'}. Indica si el crecimiento proyectado justifica el múltiplo pagado.` 
    };
    scores.push({ val: growthScore, weight: 0.5 });

    // 2. Operating Execution (Margins)
    let marginScore = 50;
    if (data.operatingMargin != null) {
      marginScore = data.operatingMargin > 0.2 ? 80 : data.operatingMargin > 0.1 ? 55 : 30;
    }
    sections.profitability = { 
      title: t.sections.profitability, 
      content: lang === 'en'
        ? `Operating margin of ${((data.operatingMargin || 0) * 100).toFixed(2)}%. Reflects the ability to convert revenue into sustained gross profit.`
        : `Margen operativo del ${((data.operatingMargin || 0) * 100).toFixed(2)}%. Refleja la capacidad de convertir ingresos en beneficio bruto sostenido.` 
    };
    scores.push({ val: marginScore, weight: 0.3 });

    // 3. Valuation (P/E normalized)
    let valScore = 50;
    if (data.peRatio != null) {
      valScore = data.peRatio < 20 ? 75 : 45;
    }
    sections.valuation = { 
      title: t.sections.valuation, 
      content: lang === 'en'
        ? `Current P/E Ratio of ${data.peRatio?.toFixed(2)}. Moderate valuation in a cycle context. Growth is prioritized vs static multiples.`
        : `Ratio P/E actual de ${data.peRatio?.toFixed(2)}. Valoración moderada en contexto de ciclo. Se prioriza el crecimiento vs múltiplos estáticos.` 
    };
    scores.push({ val: valScore, weight: 0.2 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    return this.assembleAnalysis(symbol, 'stock', outlook, totalScore, sections, lang, range, t.stock_horizons.mid);
  }

  // ── Long Term Analyzer (5-10 years) ───────────────────────────────────────
  // Focus: Moat, ROE, FCF, and Structural Quality
  private analyzeStockLongTerm(symbol: string, data: StockFinancialData, lang: Language, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const t = i18n[lang].fundamental;

    // 1. Structural Quality (ROE / Capital Efficiency)
    let qualityScore = 50;
    if (data.roe != null) {
      qualityScore = data.roe > 0.2 ? 90 : data.roe > 0.12 ? 65 : 35;
    }
    sections.profitability = { 
      title: t.sections.profitability, 
      content: lang === 'en'
        ? `Sustainable ROE of ${(data.roe ? data.roe * 100 : 0).toFixed(2)}%. ROE is the main engine of value creation over a decade.`
        : `ROE sostenible del ${(data.roe ? data.roe * 100 : 0).toFixed(2)}%. El ROE es el motor principal de creación de valor a una década vista.` 
    };
    scores.push({ val: qualityScore, weight: 0.4 });

    // 2. Business Moat (Market Cap & Stability)
    let moatScore = 50;
    if (data.marketCap != null) {
      moatScore = data.marketCap > 100e9 ? 80 : data.marketCap > 10e9 ? 60 : 40;
    }
    sections.stability = { 
      title: t.sections.stability, 
      content: lang === 'en'
        ? `Market capitalization of ${this.formatLargeNumber(data.marketCap || 0)}. Indicates maturity and structural resilience across long cycles.`
        : `Capitalización de mercado de ${this.formatLargeNumber(data.marketCap || 0)}. Indica madurez y resistencia estructural ante ciclos largos.` 
    };
    scores.push({ val: moatScore, weight: 0.2 });

    // 3. Crecimiento (Long Term - Requested)
    let growthScore = 50;
    let growthContent = '';
    if (data.pegRatio == null) {
      growthScore = 50;
      growthContent = lang === 'en' ? 'Growth data not available for this asset in accessed sources.' : 'Datos de crecimiento no disponibles para este activo en las fuentes consultadas.';
    } else {
      growthScore = data.pegRatio < 1.2 ? 75 : 50;
      growthContent = lang === 'en' 
        ? `PEG Ratio of ${data.pegRatio?.toFixed(2)}. Reflects the structural ability to grow above the market.`
        : `Ratio PEG de ${data.pegRatio?.toFixed(2)}. Refleja la capacidad estructural de crecer por encima del mercado.`;
    }
    sections.growth = { title: t.sections.growth, content: growthContent };
    scores.push({ val: growthScore, weight: 0.2 });

    // 4. Shareholder Returns (Dividends)
    let incomeScore = 50;
    if (data.dividendYield != null) {
      incomeScore = data.dividendYield > 0.02 ? 75 : 50;
    }
    sections.valuation = { 
      title: t.sections.valuation, 
      content: lang === 'en'
        ? `Dividend yield of ${((data.dividendYield || 0) * 100).toFixed(2)}%. Key factor in total return over the long term.`
        : `Rentabilidad por dividendo del ${((data.dividendYield || 0) * 100).toFixed(2)}%. Factor clave en el retorno total a largo plazo.` 
    };
    scores.push({ val: incomeScore, weight: 0.2 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    return this.assembleAnalysis(symbol, 'stock', outlook, totalScore, sections, lang, range, t.stock_horizons.long);
  }

  // ── Crypto Analysis ─────────────────────────────────────────────────────

  private analyzeCrypto(symbol: string, data: CryptoFinancialData, lang: Language, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const t = i18n[lang].fundamental;

    // 1. Market Positioning
    let posScore = 50;
    let posContent = '';
    if (lang === 'en') {
      posContent = `Market capitalization of ${this.formatLargeNumber(data.marketCap)}. `;
      if (data.circulatingSupply && data.maxSupply) {
        const completion = data.circulatingSupply / data.maxSupply;
        posContent += `Issuance completed at ${(completion * 100).toFixed(2)}% of the total maximum predicted (${this.formatLargeNumber(data.maxSupply)} units). `;
        posScore = completion > 0.9 ? 85 : 60;
      } else if (data.circulatingSupply) {
        posContent += `Current circulating supply of ${this.formatLargeNumber(data.circulatingSupply)}. There is no maximum limit defined in the protocol, implying a monitoring factor on asset inflation.`;
        posScore = 45;
      } else {
        posContent += 'Circulating supply data not available. Market size indicates project relevance in the DeFi/Crypto ecosystem.';
      }
    } else {
      posContent = `Capitalización de mercado de ${this.formatLargeNumber(data.marketCap)}. `;
      if (data.circulatingSupply && data.maxSupply) {
        const completion = data.circulatingSupply / data.maxSupply;
        posContent += `Emisión completada al ${(completion * 100).toFixed(2)}% del total máximo previsto (${this.formatLargeNumber(data.maxSupply)} unidades). `;
        posScore = completion > 0.9 ? 85 : 60;
      } else if (data.circulatingSupply) {
        posContent += `Oferta circulante actual de ${this.formatLargeNumber(data.circulatingSupply)}. No existe un límite máximo definido en protocolo, lo que implica un factor de vigilancia sobre la inflación del activo.`;
        posScore = 45;
      } else {
        posContent += 'Datos de suministro circulante no disponibles. El tamaño del mercado indica la relevancia del proyecto en el ecosistema DeFi/Crypto.';
      }
    }
    sections.valuation = { title: t.sections.valuation, content: posContent };
    scores.push({ val: posScore, weight: 0.25 });

    // 2. Activity and Liquidity
    let liqScore = 50;
    let liqContent = '';
    if (lang === 'en') {
      liqContent = `24h trading volume of ${this.formatLargeNumber(data.volume24h)}. `;
      if (data.volume24h && data.marketCap) {
        const liqRatio = data.volume24h / data.marketCap;
        liqScore = liqRatio > 0.05 ? 80 : liqRatio > 0.01 ? 60 : 40;
        liqContent += `Represents ${(liqRatio * 100).toFixed(2)}% of its total capitalization. ${liqRatio > 0.05 ? 'High liquidity and turnover, ideal for active operations.' : 'Moderate activity level.'}`;
      } else {
        liqContent += 'Transacted volume is a vital indicator of protocol validity and user adoption.';
      }
    } else {
      liqContent = `Volumen de negociación en 24h de ${this.formatLargeNumber(data.volume24h)}. `;
      if (data.volume24h && data.marketCap) {
        const liqRatio = data.volume24h / data.marketCap;
        liqScore = liqRatio > 0.05 ? 80 : liqRatio > 0.01 ? 60 : 40;
        liqContent += `Representa un ${(liqRatio * 100).toFixed(2)}% de su capitalización total. ${liqRatio > 0.05 ? 'Alta liquidez y rotación, ideal para operativa activa.' : 'Nivel de actividad moderado.'}`;
      } else {
        liqContent += 'El volumen transaccionado es un indicador vital de la vigencia y adopción del protocolo por parte de los usuarios.';
      }
    }
    
    sections.profitability = { title: t.sections.profitability, content: liqContent };
    scores.push({ val: liqScore, weight: 0.25 });

    // 3. Price Behavior & Cycle
    let priceScore = 50;
    if (data.fiftyTwoWeekHigh != null && data.fiftyTwoWeekLow != null) {
      const rangeDist = data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow;
      const currentPrice = data.marketCap && data.circulatingSupply ? data.marketCap / data.circulatingSupply : data.fiftyTwoWeekLow + rangeDist * 0.5;
      const pos = rangeDist > 0 ? ((currentPrice - data.fiftyTwoWeekLow) / rangeDist) * 100 : 50;
      
      priceScore = pos < 25 ? 85 : pos > 75 ? 35 : 55;
      if (lang === 'en') {
        sections.stability = { 
          title: t.sections.stability, 
          content: `Trading at ${pos.toFixed(2)}% of the annual range (${this.formatLargeNumber(data.fiftyTwoWeekLow)} - ${this.formatLargeNumber(data.fiftyTwoWeekHigh)}). ${pos > 80 ? 'Near annual highs, suggesting caution due to potential movement exhaustion.' : pos < 20 ? 'Near annual lows, which could represent a historical accumulation zone.' : 'In neutral intermediate cycle zone.'}` 
        };
      } else {
        sections.stability = { 
          title: t.sections.stability, 
          content: `Cotizando al ${pos.toFixed(2)}% del rango anual (${this.formatLargeNumber(data.fiftyTwoWeekLow)} - ${this.formatLargeNumber(data.fiftyTwoWeekHigh)}). ${pos > 80 ? 'Cerca de máximos anuales, sugiriendo cautela por posible agotamiento del movimiento.' : pos < 20 ? 'Cerca de mínimos anuales, lo que podría representar una zona de acumulación histórica.' : 'En zona neutral de ciclo intermedio.'}` 
        };
      }
    } else {
      sections.stability = { 
        title: t.sections.stability, 
        content: lang === 'en' ? 'Insufficient historical range data to accurately determine current cycle phase.' : 'Datos de rango histórico insuficientes para determinar la fase del ciclo actual con precisión.' 
      };
    }
    scores.push({ val: priceScore, weight: 0.25 });

    // 4. Recent Momentum
    let changeScore = 50;
    if (data.fiftyTwoWeekChange != null && !isNaN(data.fiftyTwoWeekChange)) {
      changeScore = data.fiftyTwoWeekChange > 0 ? 75 : 30;
      sections.overview = { 
        title: t.sections.overview, 
        content: lang === 'en'
          ? `Period change of ${(data.fiftyTwoWeekChange * 100).toFixed(2)}%. This asset is analyzed under a ${range === '6mo' || range === '1y' ? 'short-term' : 'medium/long-term'} horizon.`
          : `Cambio registrado en el periodo del ${(data.fiftyTwoWeekChange * 100).toFixed(2)}%. Este activo se analiza bajo el prisma de un horizonte de ${range === '6mo' || range === '1y' ? 'corto plazo' : 'medio/largo plazo'}.` 
      };
    } else {
      sections.overview = { 
        title: t.sections.overview, 
        content: lang === 'en'
          ? `${symbol} analyzed based on market capitalization and available network metrics.`
          : `${symbol} analizado en base a su capitalización de mercado y métricas de red disponibles.` 
      };
    }
    scores.push({ val: changeScore, weight: 0.25 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 70 ? 'STRONG' : totalScore >= 45 ? 'MODERATE' : 'WEAK';

    sections.risks = { 
      title: t.sections.risks, 
      content: lang === 'en'
        ? 'Regulatory risks, custody risks (private keys), whale concentration, and high intrinsic volatility. Consideration of correlation with Bitcoin and general market sentiment is recommended.'
        : 'Riesgos regulatorios, de custodia (claves privadas), de concentración de ballenas y de alta volatilidad intrínseca. Se recomienda considerar la correlación con Bitcoin y el sentimiento general del mercado.' 
    };

    return this.assembleAnalysis(symbol, 'crypto', outlook, totalScore, sections, lang, range, t.crypto_horizon);
  }

  // ── ETF Analysis ────────────────────────────────────────────────────────

  private analyzeETF(symbol: string, data: StockFinancialData, lang: Language, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const t = i18n[lang].fundamental;

    // 1. Historical Returns
    let retScore = 50;
    if (data.fiveYearAverageReturn != null || data.threeYearAverageReturn != null) {
      const avg = (data.fiveYearAverageReturn || data.threeYearAverageReturn || 0);
      retScore = avg > 0.1 ? 85 : avg > 0.05 ? 65 : 40;
    }
    if (lang === 'en') {
      sections.profitability = { 
        title: t.sections.profitability, 
        content: `5-year average return: ${(data.fiveYearAverageReturn ? data.fiveYearAverageReturn * 100 : 0).toFixed(2)}% (YTD: ${(data.ytdReturn ? data.ytdReturn * 100 : 0).toFixed(2)}%). ${['5y', '10y'].includes(range) ? 'Long-term consistency is the determining factor.' : 'YTD performance marks the current fund momentum.'}` 
      };
    } else {
      sections.profitability = { 
        title: t.sections.profitability, 
        content: `Retorno medio a 5 años: ${(data.fiveYearAverageReturn ? data.fiveYearAverageReturn * 100 : 0).toFixed(2)}% (YTD: ${(data.ytdReturn ? data.ytdReturn * 100 : 0).toFixed(2)}%). ${['5y', '10y'].includes(range) ? 'La consistencia a largo plazo es el factor determinante.' : 'El rendimiento YTD marca el momentum actual del fondo.'}` 
      };
    }
    scores.push({ val: retScore, weight: 0.35 });

    // 2. Cost and Efficiency
    let costScore = 50;
    if (data.annualReportExpenseRatio != null) {
      costScore = data.annualReportExpenseRatio < 0.002 ? 90 : data.annualReportExpenseRatio < 0.005 ? 70 : 40;
    }
    if (lang === 'en') {
      sections.growth = { 
        title: t.sections.growth, 
        content: `AUM of ${this.formatLargeNumber(data.totalAssets || 0)}. TER (Total Expense Ratio): ${(data.annualReportExpenseRatio ? data.annualReportExpenseRatio * 100 : 0).toFixed(2)}%. ${data.annualReportExpenseRatio && data.annualReportExpenseRatio < 0.002 ? 'Very efficient expense ratio for the investor.' : 'Monitoring the impact of fees over the long term is recommended.'}` 
      };
    } else {
      sections.growth = { 
        title: t.sections.growth, 
        content: `AUM de ${this.formatLargeNumber(data.totalAssets || 0)}. TER (Gastos totales): ${(data.annualReportExpenseRatio ? data.annualReportExpenseRatio * 100 : 0).toFixed(2)}%. ${data.annualReportExpenseRatio && data.annualReportExpenseRatio < 0.002 ? 'Ratio de gastos muy eficiente para el inversor.' : 'Se recomienda vigilar el impacto de las comisiones en el largo plazo.'}` 
      };
    }
    scores.push({ val: costScore, weight: 0.25 });

    // 3. Risk (Beta)
    let riskScore = 50;
    if (data.beta3Year != null) {
      riskScore = data.beta3Year < 1.0 ? 75 : 45;
    }
    sections.stability = { 
      title: t.sections.risks, // Stability section title mapped to Risks logic in ETF
      content: lang === 'en'
        ? `3-year Beta of ${data.beta3Year?.toFixed(2) || 'N/A'}. ${data.beta3Year && data.beta3Year < 1 ? 'Lower volatility than its benchmark.' : 'Asset with volatility higher than the market.'}`
        : `Beta a 3 años de ${data.beta3Year?.toFixed(2) || 'N/A'}. ${data.beta3Year && data.beta3Year < 1 ? 'Menor volatilidad que su benchmark.' : 'Activo con volatilidad superior al mercado.'}` 
    };
    scores.push({ val: riskScore, weight: 0.2 });

    // 4. Valuation and Dividend
    let divScore = 50;
    if (range === '6mo' || range === '1y') {
      divScore = 50;
    } else if (data.dividendYield != null) {
      divScore = data.dividendYield > 0.02 ? 80 : 55;
    }
    if (lang === 'en') {
      sections.valuation = { 
        title: t.sections.valuation, 
        content: `Weighted P/E: ${data.peRatio?.toFixed(2) || 'N/A'}. Dividend yield: ${(data.dividendYield ? data.dividendYield * 100 : 0).toFixed(2)}%. ${data.dividendYield && data.dividendYield > 0 ? 'Distribution ETF.' : 'Probably an accumulation fund.'}` 
      };
    } else {
      sections.valuation = { 
        title: t.sections.valuation, 
        content: `P/E ponderado: ${data.peRatio?.toFixed(2) || 'N/A'}. Rentabilidad por dividendo: ${(data.dividendYield ? data.dividendYield * 100 : 0).toFixed(2)}%. ${data.dividendYield && data.dividendYield > 0 ? 'ETF de distribución.' : 'Probablemente de acumulación.'}` 
      };
    }
    scores.push({ val: divScore, weight: 0.2 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    sections.risks = { 
      title: t.sections.risks, 
      content: lang === 'en'
        ? 'Tracking error, counterparty risk (if synthetic), closure risk (low AUM), and sector concentration.'
        : 'Tracking error, riesgo de contrapartida (si es sintético), riesgo de cierre (AUM bajo) y concentración sectorial.' 
    };

    const horizonNote = t.etf_horizon.replace('{family}', data.fundFamily || 'N/A');
    return this.assembleAnalysis(symbol, 'etf', outlook, totalScore, sections, lang, range, horizonNote);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private getCurrencySymbol(currency: string | null | undefined): string {
    if (currency === 'EUR') return '€';
    if (currency === 'GBP') return '£';
    return '$'; // Default or USD
  }

  private getBenchmark(exchange: string | null | undefined, lang: Language): string {
    const t = i18n[lang].fundamental.benchmarks;
    if (!exchange) return t.none;
    const ex = exchange.toUpperCase();
    if (ex.includes('NASDAQ') || ex.includes('NYSE')) return t.sp500;
    if (ex.includes('MADRID') || ex.includes('IBEX') || ex.includes('MC')) return t.ibex35;
    if (ex.includes('LSE') || ex.includes('LONDON')) return t.ftse100;
    if (ex.includes('PARIS') || ex.includes('PA')) return t.cac40;
    if (ex.includes('FRANKFURT') || ex.includes('XETRA') || ex.includes('DE')) return t.dax;
    return t.none;
  }

  private formatLargeNumber(n: number | null | undefined): string {
    if (n === null || n === undefined || isNaN(n)) return 'N/A';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  }

  private assembleAnalysis(symbol: string, type: 'stock' | 'crypto' | 'etf', outlook: FundamentalOutlook, score: number, sections: Record<string, AnalysisSection>, lang: Language, range: string, horizonNote: string): FundamentalAnalysis {
    const t = i18n[lang].fundamental;
    const outlookLabel = t.outlooks[outlook];
    const rangeLabel = (t.ranges as any)[range] || range;

    let summaryText = '';
    if (lang === 'en') {
      summaryText = `**Outlook for ${rangeLabel}: ${outlookLabel}** (score ${score}/100). In this horizon, the analysis has focused on the determining factors for success over ${rangeLabel}.`;
    } else {
      summaryText = `**Perspectiva a ${rangeLabel}: ${outlookLabel}** (puntuación ${score}/100). En este horizonte, el análisis se ha centrado en los factores determinantes para el éxito a ${rangeLabel}.`;
    }

    const finalSections: Record<string, AnalysisSection> = {
      overview: { 
        title: t.sections.overview, 
        content: lang === 'en' 
          ? `${symbol} analyzed under the lens of a ${rangeLabel} horizon.` 
          : `${symbol} analizado bajo el prisma de un horizonte de ${rangeLabel}.` 
      },
      ...sections,
      summary: { title: t.sections.summary, content: summaryText },
      horizon: { title: t.sections.horizon, content: horizonNote },
    };

    return {
      symbol,
      assetType: type,
      outlook,
      outlookScore: score,
      sections: finalSections,
      analyzedAt: new Date().toISOString(),
    };
  }
}
