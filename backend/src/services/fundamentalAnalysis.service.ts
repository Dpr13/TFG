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
      content: this.fillTemplate(t.templates.stability_beta, {
        beta: data.beta?.toFixed(2) || 'N/A',
        benchmark,
        currency,
        low: data.fiftyTwoWeekLow?.toFixed(2) || 'N/A',
        high: data.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'
      })
    };
    scores.push({ val: momentumScore, weight: 0.4 });

    // 2. Recent Earnings (TTM)
    let earningsScore = 50;
    if (data.eps != null) {
      earningsScore = data.eps > 0 ? 70 : 20;
    }

    const earningsTemplate = data.eps && data.eps > 0 
      ? t.templates.growth_eps_pos 
      : t.templates.growth_eps_neg;
    
    sections.growth = { 
      title: t.sections.growth, 
      content: this.fillTemplate(earningsTemplate, {
        currency,
        eps: data.eps?.toFixed(2) || '0.00'
      })
    };
    scores.push({ val: earningsScore, weight: 0.3 });

    // 3. Profitability (Short Term - Requested)
    let profitScore = 50;
    if (data.profitMargin != null && data.roe != null) {
      profitScore = (data.profitMargin > 0.1 ? 70 : 40) + (data.roe > 0.15 ? 10 : 0);
    }
    sections.profitability = { 
      title: t.sections.profitability, 
      content: this.fillTemplate(t.templates.profitability_margins, {
        margin: (data.profitMargin ? data.profitMargin * 100 : 0).toFixed(2),
        roe: (data.roe ? data.roe * 100 : 0).toFixed(2)
      })
    };
    scores.push({ val: profitScore, weight: 0.2 });

    // 4. Current Valuation (Point-in-time)
    let valScore = 50;
    if (data.peRatio != null) {
      valScore = data.peRatio < 25 ? 70 : 30;
    }
    sections.valuation = { 
      title: t.sections.valuation, 
      content: this.fillTemplate(t.templates.valuation_pe, {
        pe: data.peRatio?.toFixed(2) || 'N/A'
      })
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
      content: this.fillTemplate(t.templates.growth_peg, {
        peg: data.pegRatio?.toFixed(2) || 'N/A'
      })
    };
    scores.push({ val: growthScore, weight: 0.5 });

    // 2. Operating Execution (Margins)
    let marginScore = 50;
    if (data.operatingMargin != null) {
      marginScore = data.operatingMargin > 0.2 ? 80 : data.operatingMargin > 0.1 ? 55 : 30;
    }
    sections.profitability = { 
      title: t.sections.profitability, 
      content: this.fillTemplate(t.templates.profitability_op_margin, {
        margin: ((data.operatingMargin || 0) * 100).toFixed(2)
      })
    };
    scores.push({ val: marginScore, weight: 0.3 });

    // 3. Valuation (P/E normalized)
    let valScore = 50;
    if (data.peRatio != null) {
      valScore = data.peRatio < 20 ? 75 : 45;
    }
    sections.valuation = { 
      title: t.sections.valuation, 
      content: this.fillTemplate(t.templates.valuation_pe_mid, {
        pe: data.peRatio?.toFixed(2) || 'N/A'
      })
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
    const currency = this.getCurrencySymbol(data.financialCurrency);

    // 1. Structural Quality (ROE / Capital Efficiency)
    let qualityScore = 50;
    if (data.roe != null) {
      qualityScore = data.roe > 0.2 ? 90 : data.roe > 0.12 ? 65 : 35;
    }
    sections.profitability = { 
      title: t.sections.profitability, 
      content: this.fillTemplate(t.templates.profitability_lt_roe, {
        roe: (data.roe ? data.roe * 100 : 0).toFixed(2)
      })
    };
    scores.push({ val: qualityScore, weight: 0.4 });

    // 2. Business Moat (Market Cap & Stability)
    let moatScore = 50;
    if (data.marketCap != null) {
      moatScore = data.marketCap > 100e9 ? 80 : data.marketCap > 10e9 ? 60 : 40;
    }
    sections.stability = { 
      title: t.sections.stability, 
      content: this.fillTemplate(t.templates.stability_mkt_cap, {
        cap: this.formatLargeNumber(data.marketCap || 0)
      })
    };
    scores.push({ val: moatScore, weight: 0.2 });

    // 3. Crecimiento (Long Term - Requested)
    let growthScore = 50;
    let growthContent = '';
    if (data.pegRatio == null) {
      growthScore = 50;
      growthContent = t.templates.growth_not_avail;
    } else {
      growthScore = data.pegRatio < 1.2 ? 75 : 50;
      growthContent = this.fillTemplate(t.templates.growth_lt_peg, {
        peg: data.pegRatio.toFixed(2)
      });
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
      content: this.fillTemplate(t.templates.valuation_div, {
        yield: ((data.dividendYield || 0) * 100).toFixed(2)
      })
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

    // 1. Market Positioning (Valuation)
    let posScore = 50;
    let posContent = this.fillTemplate(t.templates.valuation_crypto_issuance, {
      cap: this.formatLargeNumber(data.marketCap)
    });
    
    if (data.circulatingSupply && data.maxSupply) {
      const completion = data.circulatingSupply / data.maxSupply;
      posContent += ' ' + this.fillTemplate(t.templates.issuance_complete, {
        pct: (completion * 100).toFixed(2),
        max: this.formatLargeNumber(data.maxSupply)
      });
      posScore = completion > 0.9 ? 85 : 60;
    } else if (data.circulatingSupply) {
      posContent += ' ' + this.fillTemplate(t.templates.issuance_circulating, {
        circ: this.formatLargeNumber(data.circulatingSupply)
      });
      posScore = 45;
    } else {
      posContent += ' ' + t.templates.issuance_not_avail;
    }
    
    sections.valuation = { title: t.sections.valuation, content: posContent };
    scores.push({ val: posScore, weight: 0.25 });

    // 2. Activity and Liquidity (Profitability)
    let liqScore = 50;
    let liqContent = this.fillTemplate(t.templates.profitability_crypto_liq, {
      vol: this.formatLargeNumber(data.volume24h),
      pct: (data.volume24h && data.marketCap ? (data.volume24h / data.marketCap) * 100 : 0).toFixed(2),
      note: ''
    });
    
    if (data.volume24h && data.marketCap) {
      const liqRatio = data.volume24h / data.marketCap;
      liqScore = liqRatio > 0.05 ? 80 : liqRatio > 0.01 ? 60 : 40;
      const note = liqRatio > 0.05 ? t.templates.liq_high_note : t.templates.liq_mod_note;
      liqContent = this.fillTemplate(t.templates.profitability_crypto_liq, {
        vol: this.formatLargeNumber(data.volume24h),
        pct: (liqRatio * 100).toFixed(2),
        note
      });
    } else {
      liqContent = this.fillTemplate(t.templates.profitability_crypto_liq, {
        vol: this.formatLargeNumber(data.volume24h),
        pct: '0.00',
        note: t.templates.liq_val_note
      });
    }
    
    sections.profitability = { title: t.sections.profitability, content: liqContent };
    scores.push({ val: liqScore, weight: 0.25 });

    // 3. Price Behavior & Cycle (Stability)
    let priceScore = 50;
    if (data.fiftyTwoWeekHigh != null && data.fiftyTwoWeekLow != null) {
      const rangeDist = data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow;
      const currentPrice = data.marketCap && data.circulatingSupply ? data.marketCap / data.circulatingSupply : data.fiftyTwoWeekLow + rangeDist * 0.5;
      const pos = rangeDist > 0 ? ((currentPrice - data.fiftyTwoWeekLow) / rangeDist) * 100 : 50;
      
      priceScore = pos < 25 ? 85 : pos > 75 ? 35 : 55;
      const note = pos > 80 ? t.templates.pos_high_note : pos < 20 ? t.templates.pos_low_note : t.templates.pos_neutral_note;
      
      sections.stability = { 
        title: t.sections.stability, 
        content: this.fillTemplate(t.templates.stability_crypto_cycle, {
          pos: pos.toFixed(2),
          low: this.formatLargeNumber(data.fiftyTwoWeekLow),
          high: this.formatLargeNumber(data.fiftyTwoWeekHigh),
          note
        })
      };
    } else {
      sections.stability = { 
        title: t.sections.stability, 
        content: t.templates.stability_insufficient 
      };
    }
    scores.push({ val: priceScore, weight: 0.25 });

    // 4. Recent Momentum (Overview)
    let changeScore = 50;
    if (data.fiftyTwoWeekChange != null && !isNaN(data.fiftyTwoWeekChange)) {
      changeScore = data.fiftyTwoWeekChange > 0 ? 75 : 30;
      sections.overview = { 
        title: t.sections.overview, 
        content: this.fillTemplate(t.templates.overview_template, {
          symbol: symbol,
          range: (t.ranges as any)[range] || range
        })
      };
    } else {
      sections.overview = { 
        title: t.sections.overview, 
        content: this.fillTemplate(t.templates.overview_crypto_generic, { symbol }) 
      };
    }
    scores.push({ val: changeScore, weight: 0.25 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 70 ? 'STRONG' : totalScore >= 45 ? 'MODERATE' : 'WEAK';

    sections.risks = { 
      title: t.sections.risks, 
      content: t.templates.risks_crypto
    };

    return this.assembleAnalysis(symbol, 'crypto', outlook, totalScore, sections, lang, range, t.crypto_horizon);
  }

  // ── ETF Analysis ────────────────────────────────────────────────────────

  private analyzeETF(symbol: string, data: StockFinancialData, lang: Language, range: string): FundamentalAnalysis {
    const sections: Record<string, AnalysisSection> = {};
    const scores: { val: number; weight: number }[] = [];
    const t = i18n[lang].fundamental;

    // 1. Historical Returns (Profitability)
    let retScore = 50;
    if (data.fiveYearAverageReturn != null || data.threeYearAverageReturn != null) {
      const avg = (data.fiveYearAverageReturn || data.threeYearAverageReturn || 0);
      retScore = avg > 0.1 ? 85 : avg > 0.05 ? 65 : 40;
    }
    
    sections.profitability = { 
      title: t.sections.profitability, 
      content: this.fillTemplate(t.templates.profitability_etf_return, {
        return5: (data.fiveYearAverageReturn ? data.fiveYearAverageReturn * 100 : 0).toFixed(2),
        ytd: (data.ytdReturn ? data.ytdReturn * 100 : 0).toFixed(2),
        note: ['5y', '10y'].includes(range) ? t.templates.ret_long_note : t.templates.ret_short_note
      })
    };
    scores.push({ val: retScore, weight: 0.35 });

    // 2. Cost and Efficiency (Growth)
    let costScore = 50;
    if (data.annualReportExpenseRatio != null) {
      costScore = data.annualReportExpenseRatio < 0.002 ? 90 : data.annualReportExpenseRatio < 0.005 ? 70 : 40;
    }
    sections.growth = { 
      title: t.sections.growth, 
      content: this.fillTemplate(t.templates.growth_etf_aum, {
        aum: this.formatLargeNumber(data.totalAssets || 0),
        ter: (data.annualReportExpenseRatio ? data.annualReportExpenseRatio * 100 : 0).toFixed(2),
        note: data.annualReportExpenseRatio && data.annualReportExpenseRatio < 0.002 ? t.templates.ter_low_note : t.templates.ter_high_note
      })
    };
    scores.push({ val: costScore, weight: 0.25 });

    // 3. Risk (Stability/Beta)
    let riskScore = 50;
    if (data.beta3Year != null) {
      riskScore = data.beta3Year < 1.0 ? 75 : 45;
    }
    sections.stability = { 
      title: t.sections.risks, 
      content: this.fillTemplate(t.templates.stability_etf_beta, {
        beta: data.beta3Year?.toFixed(2) || 'N/A',
        note: data.beta3Year && data.beta3Year < 1 ? t.templates.beta_low_note : t.templates.beta_high_note
      })
    };
    scores.push({ val: riskScore, weight: 0.2 });

    // 4. Valuation and Dividend
    let divScore = 50;
    if (range === '6mo' || range === '1y') {
      divScore = 50;
    } else if (data.dividendYield != null) {
      divScore = data.dividendYield > 0.02 ? 80 : 55;
    }
    sections.valuation = { 
      title: t.sections.valuation, 
      content: this.fillTemplate(t.templates.valuation_etf_pe, {
        pe: data.peRatio?.toFixed(2) || 'N/A',
        yield: (data.dividendYield ? data.dividendYield * 100 : 0).toFixed(2),
        note: data.dividendYield && data.dividendYield > 0 ? t.templates.div_dist : t.templates.div_acc
      })
    };
    scores.push({ val: divScore, weight: 0.2 });

    const totalScore = Math.round(scores.reduce((acc, s) => acc + (s.val * s.weight), 0));
    const outlook: FundamentalOutlook = totalScore >= 65 ? 'STRONG' : totalScore >= 40 ? 'MODERATE' : 'WEAK';

    sections.risks = { 
      title: t.sections.risks, 
      content: t.templates.risks_etf
    };

    const horizonNote = this.fillTemplate(t.etf_horizon, {
      family: data.fundFamily || 'N/A'
    });
    return this.assembleAnalysis(symbol, 'etf', outlook, totalScore, sections, lang, range, horizonNote);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private fillTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const key in data) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(data[key]));
    }
    return result;
  }

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

    const summaryText = this.fillTemplate(t.templates.summary_template, {
      range: rangeLabel,
      outlook: outlookLabel,
      score
    });

    const finalSections: Record<string, AnalysisSection> = {
      overview: { 
        title: t.sections.overview, 
        content: this.fillTemplate(t.templates.overview_template, {
          symbol,
          range: rangeLabel
        })
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
