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
  async analyze(symbol: string): Promise<FundamentalAnalysis | null> {
    const data = await this.financialDataService.getFinancialData(symbol);
    if (!data) return null;

    if (FinancialDataValidator.isStockData(data)) {
      return this.analyzeStock(symbol, data);
    } else {
      return this.analyzeCrypto(symbol, data);
    }
  }

  // ── Stock Analysis ──────────────────────────────────────────────────────

  private analyzeStock(symbol: string, data: StockFinancialData): FundamentalAnalysis {
    const overview = this.stockOverview(symbol, data);
    const valuation = this.stockValuation(data);
    const profitability = this.stockProfitability(data);
    const growth = this.stockGrowth(data);
    const stability = this.stockStability(data);
    const risks = this.stockRisks(data);

    // Compute overall score (0-100)
    const scores = [
      valuation.score,
      profitability.score,
      growth.score,
      stability.score,
    ].filter((s) => s !== null) as number[];

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 50;

    const outlook: FundamentalOutlook =
      avgScore >= 65 ? 'STRONG' : avgScore >= 40 ? 'MODERATE' : 'WEAK';

    const summaryText = this.buildStockSummary(outlook, avgScore, data);

    return {
      symbol,
      assetType: 'stock',
      outlook,
      outlookScore: avgScore,
      sections: {
        overview: overview.section,
        valuation: valuation.section,
        profitability: profitability.section,
        growth: growth.section,
        stability: stability.section,
        risks: risks.section,
        summary: { title: 'Perspectiva Fundamental', content: summaryText },
      },
      analyzedAt: new Date().toISOString(),
    };
  }

  // ── Stock Section Builders ──────────────────────────────────────────────

  private stockOverview(symbol: string, data: StockFinancialData): { section: AnalysisSection } {
    const parts: string[] = [];
    parts.push(`${symbol} es un activo de renta variable cotizado en mercados públicos.`);

    if (data.marketCap != null) {
      const capStr = this.formatLargeNumber(data.marketCap);
      const capCategory = data.marketCap >= 200e9 ? 'mega-cap'
        : data.marketCap >= 10e9 ? 'large-cap'
        : data.marketCap >= 2e9 ? 'mid-cap'
        : 'small-cap';
      parts.push(`Con una capitalización de mercado de ${capStr}, se clasifica como una empresa ${capCategory}.`);
    }

    if (data.dividendYield != null && data.dividendYield > 0) {
      parts.push(`Ofrece un rendimiento por dividendo del ${(data.dividendYield * 100).toFixed(2)}%.`);
    }

    return { section: { title: 'Visión General', content: parts.join(' ') } };
  }

  private stockValuation(data: StockFinancialData): { section: AnalysisSection; score: number | null } {
    const parts: string[] = [];
    const scores: number[] = [];

    if (data.peRatio != null) {
      const pe = data.peRatio;
      if (pe < 0) {
        parts.push(`El P/E ratio es negativo (${pe.toFixed(1)}), lo que indica que la empresa no es rentable actualmente.`);
        scores.push(15);
      } else if (pe < 15) {
        parts.push(`El P/E ratio de ${pe.toFixed(1)} sugiere que el activo podría estar **infravalorado** respecto a la media del mercado (~20-25x).`);
        scores.push(80);
      } else if (pe < 25) {
        parts.push(`El P/E ratio de ${pe.toFixed(1)} indica una valoración razonable, en línea con la media del mercado.`);
        scores.push(60);
      } else if (pe < 40) {
        parts.push(`El P/E ratio de ${pe.toFixed(1)} está por encima de la media, sugiriendo expectativas de crecimiento elevadas o una posible **sobrevaloración**.`);
        scores.push(40);
      } else {
        parts.push(`El P/E ratio de ${pe.toFixed(1)} es muy elevado, típico de empresas de alto crecimiento pero con riesgo de corrección si no cumple expectativas.`);
        scores.push(25);
      }
    }

    if (data.pegRatio != null) {
      const peg = data.pegRatio;
      if (peg < 1) {
        parts.push(`El PEG ratio de ${peg.toFixed(2)} (<1) indica que el precio es atractivo en relación con su crecimiento esperado.`);
        scores.push(80);
      } else if (peg < 2) {
        parts.push(`El PEG ratio de ${peg.toFixed(2)} se sitúa en un rango razonable.`);
        scores.push(55);
      } else {
        parts.push(`El PEG ratio de ${peg.toFixed(2)} (>2) sugiere que el precio ya descuenta un crecimiento significativo.`);
        scores.push(30);
      }
    }

    if (data.priceToBook != null) {
      const pb = data.priceToBook;
      if (pb < 1) {
        parts.push(`El Price/Book de ${pb.toFixed(2)} (<1) indica que cotiza por debajo de su valor contable, posible oportunidad valor.`);
        scores.push(80);
      } else if (pb < 3) {
        parts.push(`El Price/Book de ${pb.toFixed(2)} está en un rango normal.`);
        scores.push(60);
      } else {
        parts.push(`El Price/Book de ${pb.toFixed(2)} es elevado, typical de empresas con activos intangibles elevados o alta rentabilidad.`);
        scores.push(40);
      }
    }

    if (data.evToEbitda != null) {
      const ev = data.evToEbitda;
      if (ev < 10) {
        parts.push(`El EV/EBITDA de ${ev.toFixed(1)} es bajo, lo que sugiere una valoración atractiva.`);
        scores.push(75);
      } else if (ev < 20) {
        parts.push(`El EV/EBITDA de ${ev.toFixed(1)} se encuentra en la media del mercado.`);
        scores.push(55);
      } else {
        parts.push(`El EV/EBITDA de ${ev.toFixed(1)} es elevado.`);
        scores.push(30);
      }
    }

    if (parts.length === 0) {
      parts.push('No se dispone de suficientes datos de valoración para este activo.');
    }

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    return {
      section: { title: 'Valoración', content: parts.join(' ') },
      score: avgScore,
    };
  }

  private stockProfitability(data: StockFinancialData): { section: AnalysisSection; score: number | null } {
    const parts: string[] = [];
    const scores: number[] = [];

    if (data.profitMargin != null) {
      const pm = data.profitMargin * 100;
      if (pm < 0) {
        parts.push(`El margen de beneficio neto es negativo (${pm.toFixed(1)}%), la empresa está generando pérdidas.`);
        scores.push(10);
      } else if (pm < 10) {
        parts.push(`El margen de beneficio neto del ${pm.toFixed(1)}% es bajo, indicando márgenes ajustados.`);
        scores.push(35);
      } else if (pm < 20) {
        parts.push(`El margen de beneficio neto del ${pm.toFixed(1)}% es saludable y competitivo.`);
        scores.push(65);
      } else {
        parts.push(`El margen de beneficio neto del ${pm.toFixed(1)}% es excelente, reflejando una fuerte rentabilidad.`);
        scores.push(85);
      }
    }

    if (data.operatingMargin != null) {
      const om = data.operatingMargin * 100;
      if (om < 0) {
        parts.push(`El margen operativo es negativo (${om.toFixed(1)}%).`);
        scores.push(10);
      } else if (om < 15) {
        parts.push(`El margen operativo del ${om.toFixed(1)}% es moderado.`);
        scores.push(45);
      } else if (om < 30) {
        parts.push(`El margen operativo del ${om.toFixed(1)}% es sólido.`);
        scores.push(70);
      } else {
        parts.push(`El margen operativo del ${om.toFixed(1)}% es excepcional, indicando un alto poder de fijación de precios.`);
        scores.push(90);
      }
    }

    if (data.roe != null) {
      const roe = data.roe * 100;
      if (roe < 0) {
        parts.push(`El ROE es negativo (${roe.toFixed(1)}%), lo que indica que la empresa destruye valor para los accionistas.`);
        scores.push(10);
      } else if (roe < 10) {
        parts.push(`El ROE del ${roe.toFixed(1)}% es bajo comparado con la media del mercado (~15-20%).`);
        scores.push(35);
      } else if (roe < 20) {
        parts.push(`El ROE del ${roe.toFixed(1)}% es adecuado y está en línea con la media del mercado.`);
        scores.push(60);
      } else {
        parts.push(`El ROE del ${roe.toFixed(1)}% es excelente, indicando una gestión muy eficiente del capital.`);
        scores.push(85);
      }
    }

    if (data.roa != null) {
      const roa = data.roa * 100;
      if (roa < 0) {
        parts.push(`El ROA es negativo (${roa.toFixed(1)}%).`);
        scores.push(10);
      } else if (roa < 5) {
        parts.push(`El ROA del ${roa.toFixed(1)}% es bajo.`);
        scores.push(35);
      } else if (roa < 10) {
        parts.push(`El ROA del ${roa.toFixed(1)}% es adecuado.`);
        scores.push(60);
      } else {
        parts.push(`El ROA del ${roa.toFixed(1)}% es muy bueno, reflejando alta eficiencia en el uso de activos.`);
        scores.push(85);
      }
    }

    if (parts.length === 0) {
      parts.push('No se dispone de datos de rentabilidad para este activo.');
    }

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    return {
      section: { title: 'Rentabilidad', content: parts.join(' ') },
      score: avgScore,
    };
  }

  private stockGrowth(data: StockFinancialData): { section: AnalysisSection; score: number | null } {
    const parts: string[] = [];
    const scores: number[] = [];

    if (data.eps != null) {
      if (data.eps > 0) {
        parts.push(`El EPS (beneficio por acción) actual es de $${data.eps.toFixed(2)}, lo que confirma que la empresa genera beneficios.`);
        scores.push(60);
      } else {
        parts.push(`El EPS es negativo ($${data.eps.toFixed(2)}), indicando que la empresa está en pérdidas.`);
        scores.push(20);
      }
    }

    if (data.pegRatio != null && data.pegRatio > 0) {
      // PEG < 1 implies growth rate exceeds P/E, meaning rapid growth
      if (data.pegRatio < 1) {
        parts.push('El PEG ratio sugiere que el crecimiento esperado es superior a lo que el mercado descuenta, señal de fuerte potencial.');
        scores.push(80);
      } else if (data.pegRatio < 2) {
        parts.push('El crecimiento esperado es moderado en relación a su valoración.');
        scores.push(55);
      } else {
        parts.push('El crecimiento esperado es bajo en relación al precio que paga el mercado.');
        scores.push(30);
      }
    }

    // Infer growth signals from margin quality
    if (data.profitMargin != null && data.operatingMargin != null) {
      if (data.profitMargin > 0.15 && data.operatingMargin > 0.20) {
        parts.push('Los márgenes elevados proporcionan una base sólida para reinvertir en crecimiento futuro.');
        scores.push(70);
      }
    }

    if (parts.length === 0) {
      parts.push('No se dispone de datos suficientes para evaluar el potencial de crecimiento.');
    }

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    return {
      section: { title: 'Crecimiento', content: parts.join(' ') },
      score: avgScore,
    };
  }

  private stockStability(data: StockFinancialData): { section: AnalysisSection; score: number | null } {
    const parts: string[] = [];
    const scores: number[] = [];

    if (data.beta != null) {
      if (data.beta < 0.8) {
        parts.push(`La beta de ${data.beta.toFixed(2)} es baja, indicando menor volatilidad que el mercado — perfil defensivo.`);
        scores.push(80);
      } else if (data.beta < 1.2) {
        parts.push(`La beta de ${data.beta.toFixed(2)} es cercana a 1, el activo se mueve de forma similar al mercado.`);
        scores.push(60);
      } else if (data.beta < 1.8) {
        parts.push(`La beta de ${data.beta.toFixed(2)} es moderadamente alta, el activo amplifica los movimientos del mercado.`);
        scores.push(40);
      } else {
        parts.push(`La beta de ${data.beta.toFixed(2)} es muy alta, indicando alta volatilidad y sensibilidad al mercado.`);
        scores.push(20);
      }
    }

    if (data.fiftyTwoWeekHigh != null && data.fiftyTwoWeekLow != null) {
      const range = data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow;
      const rangePercent = (range / data.fiftyTwoWeekLow) * 100;
      if (rangePercent < 30) {
        parts.push(`El rango de 52 semanas es relativamente estrecho (${rangePercent.toFixed(0)}%), señal de estabilidad de precio.`);
        scores.push(70);
      } else if (rangePercent < 60) {
        parts.push(`El rango de 52 semanas es moderado (${rangePercent.toFixed(0)}%).`);
        scores.push(50);
      } else {
        parts.push(`El rango de 52 semanas es amplio (${rangePercent.toFixed(0)}%), indicando alta oscilación de precios.`);
        scores.push(30);
      }
    }

    if (data.dividendYield != null && data.dividendYield > 0.02) {
      parts.push(`El rendimiento por dividendo del ${(data.dividendYield * 100).toFixed(2)}% proporciona un componente de retorno estable.`);
      scores.push(70);
    }

    if (parts.length === 0) {
      parts.push('No se dispone de datos suficientes para evaluar la estabilidad financiera.');
    }

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    return {
      section: { title: 'Estabilidad Financiera', content: parts.join(' ') },
      score: avgScore,
    };
  }

  private stockRisks(data: StockFinancialData): { section: AnalysisSection } {
    const risks: string[] = [];

    if (data.peRatio != null && data.peRatio > 35) {
      risks.push('**Valoración elevada**: el P/E alto incrementa el riesgo de corrección si los resultados decepcionan.');
    }
    if (data.profitMargin != null && data.profitMargin < 0) {
      risks.push('**Empresa no rentable**: la ausencia de beneficios aumenta el riesgo financiero.');
    }
    if (data.beta != null && data.beta > 1.5) {
      risks.push('**Alta volatilidad**: la elevada beta implica mayor exposición a movimientos bruscos del mercado.');
    }
    if (data.roe != null && data.roe < 0) {
      risks.push('**Destrucción de valor**: el ROE negativo indica que la empresa no genera retorno sobre el capital.');
    }
    if (data.pegRatio != null && data.pegRatio > 2.5) {
      risks.push('**Crecimiento insuficiente para su precio**: el PEG alto sugiere que el mercado paga mucho por el crecimiento limitado.');
    }

    if (risks.length === 0) {
      risks.push('No se identifican riesgos fundamentales significativos con los datos disponibles.');
    }

    return {
      section: { title: 'Riesgos Fundamentales', content: risks.join('\n\n') },
    };
  }

  private buildStockSummary(outlook: FundamentalOutlook, score: number, data: StockFinancialData): string {
    const outlookLabels = { STRONG: 'Fuerte', MODERATE: 'Moderada', WEAK: 'Débil' };
    const parts: string[] = [];

    parts.push(`**Perspectiva: ${outlookLabels[outlook]}** (puntuación ${score}/100).`);

    if (outlook === 'STRONG') {
      parts.push('Los fundamentales del activo son sólidos, con métricas de valoración, rentabilidad y estabilidad favorables.');
      parts.push('El perfil general sugiere una inversión con fundamentos robustos.');
    } else if (outlook === 'MODERATE') {
      parts.push('El activo presenta una combinación mixta de factores positivos y negativos.');
      parts.push('Se recomienda un análisis más profundo antes de tomar decisiones de inversión.');
    } else {
      parts.push('Los fundamentales muestran señales de debilidad en varias métricas clave.');
      parts.push('Se recomienda precaución y un análisis más detallado de los factores de riesgo.');
    }

    return parts.join(' ');
  }

  // ── Crypto Analysis ─────────────────────────────────────────────────────

  private analyzeCrypto(symbol: string, data: CryptoFinancialData): FundamentalAnalysis {
    const overview = this.cryptoOverview(symbol, data);
    const valuation = this.cryptoValuation(data);
    const stability = this.cryptoStability(data);
    const risks = this.cryptoRisks(data);

    const scores = [valuation.score, stability.score].filter((s) => s !== null) as number[];
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 50;

    const outlook: FundamentalOutlook =
      avgScore >= 65 ? 'STRONG' : avgScore >= 40 ? 'MODERATE' : 'WEAK';

    const outlookLabels = { STRONG: 'Fuerte', MODERATE: 'Moderada', WEAK: 'Débil' };
    const summaryText = `**Perspectiva: ${outlookLabels[outlook]}** (puntuación ${avgScore}/100). ` +
      (outlook === 'STRONG'
        ? 'El criptoactivo muestra métricas de mercado favorables.'
        : outlook === 'MODERATE'
        ? 'El criptoactivo presenta indicadores mixtos; el mercado cripto es inherentemente volátil.'
        : 'El criptoactivo muestra señales de debilidad o datos insuficientes.');

    return {
      symbol,
      assetType: 'crypto',
      outlook,
      outlookScore: avgScore,
      sections: {
        overview: overview.section,
        valuation: valuation.section,
        profitability: { title: 'Rentabilidad', content: 'Las criptomonedas no generan beneficios empresariales tradicionales. La "rentabilidad" se evalúa mediante la apreciación del precio y el rendimiento del staking/yield farming si aplica.' },
        growth: { title: 'Crecimiento', content: 'El crecimiento de un criptoactivo depende de la adopción, desarrollo del ecosistema y sentimiento del mercado. Estos factores no se capturan completamente en los datos financieros tradicionales.' },
        stability: stability.section,
        risks: risks.section,
        summary: { title: 'Perspectiva Fundamental', content: summaryText },
      },
      analyzedAt: new Date().toISOString(),
    };
  }

  private cryptoOverview(symbol: string, data: CryptoFinancialData): { section: AnalysisSection } {
    const parts: string[] = [];
    parts.push(`${symbol} es un criptoactivo negociado en mercados descentralizados.`);

    if (data.marketCap != null) {
      parts.push(`Su capitalización de mercado es de ${this.formatLargeNumber(data.marketCap)}.`);
    }
    if (data.circulatingSupply != null) {
      parts.push(`Tiene un suministro circulante de ${this.formatLargeNumber(data.circulatingSupply)} unidades.`);
    }

    return { section: { title: 'Visión General', content: parts.join(' ') } };
  }

  private cryptoValuation(data: CryptoFinancialData): { section: AnalysisSection; score: number | null } {
    const parts: string[] = [];
    const scores: number[] = [];

    parts.push('Las criptomonedas no se evalúan con ratios P/E o PEG convencionales.');

    if (data.marketCap != null) {
      if (data.marketCap > 100e9) {
        parts.push('El criptoactivo pertenece al grupo de mega-capitalización, lo que sugiere madurez relativa en el ecosistema.');
        scores.push(65);
      } else if (data.marketCap > 10e9) {
        parts.push('Es un criptoactivo de gran capitalización con presencia consolidada.');
        scores.push(55);
      } else {
        parts.push('La capitalización es reducida, lo cual puede implicar mayor riesgo pero también mayor potencial.');
        scores.push(40);
      }
    }

    if (data.volume24h != null && data.marketCap != null && data.marketCap > 0) {
      const turnover = data.volume24h / data.marketCap;
      if (turnover > 0.1) {
        parts.push('La relación volumen/capitalización es alta, indicando liquidez elevada.');
        scores.push(70);
      } else if (turnover > 0.03) {
        parts.push('La liquidez es adecuada para operaciones normales.');
        scores.push(55);
      } else {
        parts.push('La liquidez relativa es baja, lo que puede generar deslizamientos de precio (slippage).');
        scores.push(30);
      }
    }

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    return {
      section: { title: 'Valoración', content: parts.join(' ') },
      score: avgScore,
    };
  }

  private cryptoStability(data: CryptoFinancialData): { section: AnalysisSection; score: number | null } {
    const parts: string[] = [];
    const scores: number[] = [];

    if (data.fiftyTwoWeekHigh != null && data.fiftyTwoWeekLow != null && data.fiftyTwoWeekLow > 0) {
      const rangePercent = ((data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow) / data.fiftyTwoWeekLow) * 100;
      if (rangePercent < 50) {
        parts.push(`El rango de 52 semanas es moderado para un criptoactivo (${rangePercent.toFixed(0)}%).`);
        scores.push(60);
      } else if (rangePercent < 150) {
        parts.push(`El rango de 52 semanas (${rangePercent.toFixed(0)}%) es típico del mercado cripto.`);
        scores.push(45);
      } else {
        parts.push(`El rango de 52 semanas es muy amplio (${rangePercent.toFixed(0)}%), reflejando alta volatilidad.`);
        scores.push(25);
      }
    }

    if (data.maxSupply != null) {
      parts.push(`El suministro máximo está limitado, lo cual puede ejercer presión deflacionaria a largo plazo.`);
      scores.push(60);
    }

    if (parts.length === 0) {
      parts.push('La estabilidad de los criptoactivos es inherentemente baja comparada con los activos tradicionales.');
      scores.push(35);
    }

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    return {
      section: { title: 'Estabilidad', content: parts.join(' ') },
      score: avgScore,
    };
  }

  private cryptoRisks(data: CryptoFinancialData): { section: AnalysisSection } {
    const risks: string[] = [];

    risks.push('**Volatilidad inherente**: los criptoactivos son sustancialmente más volátiles que los activos tradicionales.');
    risks.push('**Riesgo regulatorio**: cambios regulatorios pueden afectar significativamente al precio y la adopción.');

    if (data.marketCap != null && data.marketCap < 1e9) {
      risks.push('**Baja capitalización**: mayor riesgo de manipulación de precios y baja liquidez.');
    }

    return {
      section: { title: 'Riesgos Fundamentales', content: risks.join('\n\n') },
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private formatLargeNumber(n: number): string {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  }
}
