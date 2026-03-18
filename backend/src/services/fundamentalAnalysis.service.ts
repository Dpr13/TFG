import { FinancialData, FinancialDataValidator, StockFinancialData, CryptoFinancialData } from '../models/financialData';
import { FundamentalAnalysis, FundamentalOutlook, AnalysisSection } from '../models/fundamentalAnalysis';
import { FinancialDataService } from './financialData.service';

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
  async analyze(symbol: string, range: string = '1y'): Promise<FundamentalAnalysis | null> {
    const data = await this.financialDataService.getFinancialData(symbol);
    if (!data) return null;

    const quoteType = data.quoteType?.toUpperCase() || 'EQUITY';

    if (quoteType === 'CRYPTOCURRENCY') {
      return this.analyzeCrypto(symbol, data as CryptoFinancialData, range);
    } else if (quoteType === 'ETF') {
      return this.analyzeETF(symbol, data as StockFinancialData, range);
    } else {
      return this.analyzeStock(symbol, data as StockFinancialData, range);
    }
  }

  // ── Stock Analysis ──────────────────────────────────────────────────────

  private analyzeStock(symbol: string, data: StockFinancialData, range: string): FundamentalAnalysis {
    if (['6mo', '1y'].includes(range)) {
      return this.analyzeStockShortTerm(symbol, data, range);
    } else if (range === '3y') {
      return this.analyzeStockMidTerm(symbol, data, range);
    } else {
      return this.analyzeStockLongTerm(symbol, data, range);
    }
  }

  // ── Short Term Analyzer (<= 1 year) ──────────────────────────────────────
  // Focus: Momentum, Recent Earnings, and Volatility
  private analyzeStockShortTerm(symbol: string, data: StockFinancialData, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const currency = this.getCurrencySymbol(data.financialCurrency);
    const benchmark = this.getBenchmark(data.exchange);

    // 1. Momentum & Market Position (Higher importance in short term)
    let momentumScore = 50;
    if (data.fiftyTwoWeekHigh != null && data.fiftyTwoWeekLow != null) {
      const currentPrice = data.fiftyTwoWeekLow + (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow) * 0.5; // Approximation
      const pos = ((currentPrice - data.fiftyTwoWeekLow) / (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow)) * 100;
      momentumScore = pos > 70 ? 80 : pos < 30 ? 30 : 50;
    }
    sections.stability = { 
      title: 'Momentum y Volatilidad', 
      content: `Beta de ${data.beta?.toFixed(2)} (${benchmark}). El activo cotiza en un rango de ${currency}${data.fiftyTwoWeekLow?.toFixed(2)} - ${currency}${data.fiftyTwoWeekHigh?.toFixed(2)}. El momentum de corto plazo es el factor dominante.` 
    };
    scores.push({ val: momentumScore, weight: 0.4 });

    // 2. Recent Earnings (TTM)
    let earningsScore = 50;
    if (data.eps != null) {
      earningsScore = data.eps > 0 ? 70 : 20;
    }
    sections.growth = { title: 'Resultados Recientes', content: data.eps && data.eps > 0 
      ? `Beneficio por acción positivo de ${currency}${data.eps.toFixed(2)}. El mercado reacciona favorablemente a la rentabilidad inmediata.` 
      : `Ausencia de beneficios recientes (${currency}${data.eps?.toFixed(2)}), lo que genera presión bajista en el corto plazo.` };
    scores.push({ val: earningsScore, weight: 0.3 });

    // 3. Profitability (Short Term - Requested)
    let profitScore = 50;
    if (data.profitMargin != null && data.roe != null) {
      profitScore = (data.profitMargin > 0.1 ? 70 : 40) + (data.roe > 0.15 ? 10 : 0);
    }
    sections.profitability = { title: 'Rentabilidad Reciente', content: `Margen neto del ${(data.profitMargin ? data.profitMargin * 100 : 0).toFixed(2)}% y ROE del ${(data.roe ? data.roe * 100 : 0).toFixed(2)}%. Estos datos confirman la eficiencia operativa actual.` };
    scores.push({ val: profitScore, weight: 0.2 });

    // 4. Current Valuation (Point-in-time)
    let valScore = 50;
    if (data.peRatio != null) {
      valScore = data.peRatio < 25 ? 70 : 30;
    }
    sections.valuation = { title: 'Valoración Inmediata', content: `P/E Ratio actual de ${data.peRatio?.toFixed(2) || 'N/A'}. En el corto plazo, el mercado valida múltiplos comparativos.` };
    scores.push({ val: valScore, weight: 0.1 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    return this.assembleAnalysis(symbol, 'stock', outlook, totalScore, sections, range, 'Análisis de Corto Plazo: Prioriza momentum, resultados trimestrales y volatilidad. El ROE y los márgenes estructurales se consideran factores secundarios.');
  }

  // ── Mid Term Analyzer (1-3 years) ────────────────────────────────────────
  // Focus: Growth Efficiency, PEG, and Operating Execution
  private analyzeStockMidTerm(symbol: string, data: StockFinancialData, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const currency = this.getCurrencySymbol(data.financialCurrency);

    // 1. Growth Efficiency (PEG)
    let growthScore = 50;
    if (data.pegRatio != null) {
      growthScore = data.pegRatio < 1.0 ? 85 : data.pegRatio < 2.0 ? 60 : 30;
    }
    sections.growth = { title: 'Crecimiento y Eficiencia', content: `PEG Ratio de ${data.pegRatio?.toFixed(2) || 'N/A'}. Indica si el crecimiento proyectado justifica el múltiplo pagado.` };
    scores.push({ val: growthScore, weight: 0.5 });

    // 2. Operating Execution (Margins)
    let marginScore = 50;
    if (data.operatingMargin != null) {
      marginScore = data.operatingMargin > 0.2 ? 80 : data.operatingMargin > 0.1 ? 55 : 30;
    }
    sections.profitability = { title: 'Ejecución Operativa', content: `Margen operativo del ${((data.operatingMargin || 0) * 100).toFixed(2)}%. Refleja la capacidad de convertir ingresos en beneficio bruto sostenido.` };
    scores.push({ val: marginScore, weight: 0.3 });

    // 3. Valuation (P/E normalized)
    let valScore = 50;
    if (data.peRatio != null) {
      valScore = data.peRatio < 20 ? 75 : 45;
    }
    sections.valuation = { title: 'Valoración a Medio Plazo', content: `Ratio P/E actual de ${data.peRatio?.toFixed(2)}. Valoración moderada en contexto de ciclo. Se prioriza el crecimiento vs múltiplos estáticos.` };
    scores.push({ val: valScore, weight: 0.2 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    return this.assembleAnalysis(symbol, 'stock', outlook, totalScore, sections, range, 'Análisis de Medio Plazo: Se centra en el equilibrio entre valoración y crecimiento (PEG). Se ignora la volatilidad diaria para enfocarse en la ejecución operativa y márgenes.');
  }

  // ── Long Term Analyzer (5-10 years) ───────────────────────────────────────
  // Focus: Moat, ROE, FCF, and Structural Quality
  private analyzeStockLongTerm(symbol: string, data: StockFinancialData, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const currency = this.getCurrencySymbol(data.financialCurrency);

    // 1. Structural Quality (ROE / Capital Efficiency)
    let qualityScore = 50;
    if (data.roe != null) {
      qualityScore = data.roe > 0.2 ? 90 : data.roe > 0.12 ? 65 : 35;
    }
    sections.profitability = { title: 'Calidad Estructural (ROE)', content: `ROE sostenible del ${(data.roe ? data.roe * 100 : 0).toFixed(2)}%. El ROE es el motor principal de creación de valor a una década vista.` };
    scores.push({ val: qualityScore, weight: 0.4 });

    // 2. Business Moat (Market Cap & Stability)
    let moatScore = 50;
    if (data.marketCap != null) {
      moatScore = data.marketCap > 100e9 ? 80 : data.marketCap > 10e9 ? 60 : 40;
    }
    sections.stability = { title: 'Foso Competitivo (Moat)', content: `Capitalización de mercado de ${this.formatLargeNumber(data.marketCap || 0)}. Indica madurez y resistencia estructural ante ciclos largos.` };
    scores.push({ val: moatScore, weight: 0.2 });

    // 3. Crecimiento (Long Term - Requested)
    let growthScore = 50;
    let growthContent = `Ratio PEG de ${data.pegRatio?.toFixed(2)}. Refleja la capacidad estructural de crecer por encima del mercado.`;
    if (data.pegRatio == null) {
      growthScore = 50;
      growthContent = 'Datos de crecimiento no disponibles para este activo en las fuentes consultadas.';
    } else {
      growthScore = data.pegRatio < 1.2 ? 75 : 50;
    }
    sections.growth = { title: 'Crecimiento Estructural', content: growthContent };
    scores.push({ val: growthScore, weight: 0.2 });

    // 4. Shareholder Returns (Dividends)
    let incomeScore = 50;
    if (data.dividendYield != null) {
      incomeScore = data.dividendYield > 0.02 ? 75 : 50;
    }
    sections.valuation = { title: 'Retorno para el Accionista', content: `Rentabilidad por dividendo del ${((data.dividendYield || 0) * 100).toFixed(2)}%. Factor clave en el retorno total a largo plazo.` };
    scores.push({ val: incomeScore, weight: 0.2 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    return this.assembleAnalysis(symbol, 'stock', outlook, totalScore, sections, range, 'Análisis de Largo Plazo: Enfoque exclusivo en la eficiencia del capital (ROE) y el foso competitivo. La volatilidad de corto plazo y las noticias se consideran ruido irrelevante.');
  }

  // ── Crypto Analysis ─────────────────────────────────────────────────────

  private analyzeCrypto(symbol: string, data: CryptoFinancialData, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];

    // 1. Posicionamiento de Mercado
    let posScore = 50;
    let posContent = `Capitalización de mercado de ${this.formatLargeNumber(data.marketCap)}. `;
    
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
    sections.valuation = { title: 'Posicionamiento de Mercado', content: posContent };
    scores.push({ val: posScore, weight: 0.25 });

    // 2. Actividad y Liquidez
    let liqScore = 50;
    let liqContent = `Volumen de negociación en 24h de ${this.formatLargeNumber(data.volume24h)}. `;
    
    if (data.volume24h && data.marketCap) {
      const liqRatio = data.volume24h / data.marketCap;
      liqScore = liqRatio > 0.05 ? 80 : liqRatio > 0.01 ? 60 : 40;
      liqContent += `Representa un ${(liqRatio * 100).toFixed(2)}% de su capitalización total. ${liqRatio > 0.05 ? 'Alta liquidez y rotación, ideal para operativa activa.' : 'Nivel de actividad moderado.'}`;
    } else {
      liqContent += 'El volumen transaccionado es un indicador vital de la vigencia y adopción del protocolo por parte de los usuarios.';
    }
    
    sections.profitability = { 
      title: 'Actividad y Liquidez', 
      content: liqContent 
    };
    scores.push({ val: liqScore, weight: 0.25 });

    // 3. Comportamiento de Precio & Ciclo
    let priceScore = 50;
    if (data.fiftyTwoWeekHigh != null && data.fiftyTwoWeekLow != null) {
      const rangeDist = data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow;
      const currentPrice = data.marketCap && data.circulatingSupply ? data.marketCap / data.circulatingSupply : data.fiftyTwoWeekLow + rangeDist * 0.5;
      const pos = rangeDist > 0 ? ((currentPrice - data.fiftyTwoWeekLow) / rangeDist) * 100 : 50;
      
      priceScore = pos < 25 ? 85 : pos > 75 ? 35 : 55;
      sections.stability = { 
        title: 'Ciclo de Precio Anual', 
        content: `Cotizando al ${pos.toFixed(2)}% del rango anual (${this.formatLargeNumber(data.fiftyTwoWeekLow)} - ${this.formatLargeNumber(data.fiftyTwoWeekHigh)}). ${pos > 80 ? 'Cerca de máximos anuales, sugiriendo cautela por posible agotamiento del movimiento.' : pos < 20 ? 'Cerca de mínimos anuales, lo que podría representar una zona de acumulación histórica.' : 'En zona neutral de ciclo intermedio.'}` 
      };
    } else {
      sections.stability = { title: 'Ciclo de Precio Anual', content: 'Datos de rango histórico insuficientes para determinar la fase del ciclo actual con precisión.' };
    }
    scores.push({ val: priceScore, weight: 0.25 });

    // 4. Momentum Reciente
    let changeScore = 50;
    if (data.fiftyTwoWeekChange != null && !isNaN(data.fiftyTwoWeekChange)) {
      changeScore = data.fiftyTwoWeekChange > 0 ? 75 : 30;
      sections.overview = { title: 'Desempeño Reciente', content: `Cambio registrado en el periodo del ${(data.fiftyTwoWeekChange * 100).toFixed(2)}%. Este activo se analiza bajo el prisma de un horizonte de ${range === '6mo' || range === '1y' ? 'corto plazo' : 'medio/largo plazo'}.` };
    } else {
      sections.overview = { title: 'Desempeño Reciente', content: `${symbol} analizado en base a su capitalización de mercado y métricas de red disponibles.` };
    }
    scores.push({ val: changeScore, weight: 0.25 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 70 ? 'STRONG' : totalScore >= 45 ? 'MODERATE' : 'WEAK';

    sections.risks = { title: 'Riesgos Clave', content: 'Riesgos regulatorios, de custodia (claves privadas), de concentración de ballenas y de alta volatilidad intrínseca. Se recomienda considerar la correlación con Bitcoin y el sentimiento general del mercado.' };

    return this.assembleAnalysis(symbol, 'crypto', outlook, totalScore, sections, range, 'Análisis Crypto: Enfoque en métricas de red (supply), liquidez de mercado y posicionamiento en el ciclo anual.');
  }

  // ── ETF Analysis ────────────────────────────────────────────────────────

  private analyzeETF(symbol: string, data: StockFinancialData, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];

    // 1. Rentabilidad Histórica
    let retScore = 50;
    if (data.fiveYearAverageReturn != null || data.threeYearAverageReturn != null) {
      const avg = (data.fiveYearAverageReturn || data.threeYearAverageReturn || 0);
      retScore = avg > 0.1 ? 85 : avg > 0.05 ? 65 : 40;
    }
    sections.profitability = { 
      title: 'Rentabilidad Histórica', 
      content: `Retorno medio a 5 años: ${(data.fiveYearAverageReturn ? data.fiveYearAverageReturn * 100 : 0).toFixed(2)}% (YTD: ${(data.ytdReturn ? data.ytdReturn * 100 : 0).toFixed(2)}%). ${['5y', '10y'].includes(range) ? 'La consistencia a largo plazo es el factor determinante.' : 'El rendimiento YTD marca el momentum actual del fondo.'}` 
    };
    scores.push({ val: retScore, weight: 0.35 });

    // 2. Coste y Eficiencia
    let costScore = 50;
    if (data.annualReportExpenseRatio != null) {
      costScore = data.annualReportExpenseRatio < 0.002 ? 90 : data.annualReportExpenseRatio < 0.005 ? 70 : 40;
    }
    sections.growth = { 
      title: 'Coste y Eficiencia', 
      content: `AUM de ${this.formatLargeNumber(data.totalAssets || 0)}. TER (Gastos totales): ${(data.annualReportExpenseRatio ? data.annualReportExpenseRatio * 100 : 0).toFixed(2)}%. ${data.annualReportExpenseRatio && data.annualReportExpenseRatio < 0.002 ? 'Ratio de gastos muy eficiente para el inversor.' : 'Se recomienda vigilar el impacto de las comisiones en el largo plazo.'}` 
    };
    scores.push({ val: costScore, weight: 0.25 });

    // 3. Riesgo (Beta)
    let riskScore = 50;
    if (data.beta3Year != null) {
      riskScore = data.beta3Year < 1.0 ? 75 : 45;
    }
    sections.stability = { title: 'Riesgo', content: `Beta a 3 años de ${data.beta3Year?.toFixed(2) || 'N/A'}. ${data.beta3Year && data.beta3Year < 1 ? 'Menor volatilidad que su benchmark.' : 'Activo con volatilidad superior al mercado.'}` };
    scores.push({ val: riskScore, weight: 0.2 });

    // 4. Valoración y Dividendo
    let divScore = 50;
    if (range === '6mo' || range === '1y') {
      divScore = 50; // Dividend redundant in short term for ETFs
    } else if (data.dividendYield != null) {
      divScore = data.dividendYield > 0.02 ? 80 : 55;
    }
    sections.valuation = { title: 'Valoración y Dividendo', content: `P/E ponderado: ${data.peRatio?.toFixed(2) || 'N/A'}. Rentabilidad por dividendo: ${(data.dividendYield ? data.dividendYield * 100 : 0).toFixed(2)}%. ${data.dividendYield && data.dividendYield > 0 ? 'ETF de distribución.' : 'Probablemente de acumulación.'}` };
    scores.push({ val: divScore, weight: 0.2 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    sections.risks = { title: 'Riesgos Clave', content: 'Tracking error, riesgo de contrapartida (si es sintético), riesgo de cierre (AUM bajo) y concentración sectorial.' };

    return this.assembleAnalysis(symbol, 'etf', outlook, totalScore, sections, range, `ETF de la gestora ${data.fundFamily || 'N/A'}. El análisis se centra en la eficiencia de costes (TER), solidez de activos (AUM) y consistencia histórica.`);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private getCurrencySymbol(currency: string | null | undefined): string {
    if (currency === 'EUR') return '€';
    if (currency === 'GBP') return '£';
    return '$'; // Default or USD
  }

  private getBenchmark(exchange: string | null | undefined): string {
    if (!exchange) return 'benchmark no especificado';
    const ex = exchange.toUpperCase();
    if (ex.includes('NASDAQ') || ex.includes('NYSE')) return 'vs S&P 500';
    if (ex.includes('MADRID') || ex.includes('IBEX') || ex.includes('MC')) return 'vs IBEX 35';
    if (ex.includes('LSE') || ex.includes('LONDON')) return 'vs FTSE 100';
    if (ex.includes('PARIS') || ex.includes('PA')) return 'vs CAC 40';
    if (ex.includes('FRANKFURT') || ex.includes('XETRA') || ex.includes('DE')) return 'vs DAX';
    return 'benchmark no especificado';
  }

  private formatLargeNumber(n: number | null | undefined): string {
    if (n === null || n === undefined || isNaN(n)) return 'N/A';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  }

  private assembleAnalysis(symbol: string, type: 'stock' | 'crypto' | 'etf', outlook: FundamentalOutlook, score: number, sections: Record<string, AnalysisSection>, range: string, horizonNote: string): FundamentalAnalysis {
    const outlookLabels = { STRONG: 'Fuerte', MODERATE: 'Moderada', WEAK: 'Débil' };
    const rangeLabels: Record<string, string> = { '6mo': '6 meses', '1y': '1 año', '3y': '3 años', '5y': '5 años', '10y': '10 años' };

    const summaryText = `**Perspectiva a ${rangeLabels[range] || range}: ${outlookLabels[outlook]}** (puntuación ${score}/100). En este horizonte, el análisis se ha centrado en los factores determinantes para el éxito a ${rangeLabels[range] || range}.`;

    const finalSections: Record<string, AnalysisSection> = {
      overview: { title: 'Visión General', content: `${symbol} analizado bajo el prisma de un horizonte de ${rangeLabels[range] || range}.` },
      ...sections,
      summary: { title: 'Resumen Ejecutivo', content: summaryText },
      horizon: { title: 'Lógica del Horizonte Temporal', content: horizonNote },
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
