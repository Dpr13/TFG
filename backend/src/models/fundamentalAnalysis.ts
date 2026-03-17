/**
 * Fundamental Analysis models
 * Structured output from the rule-based analysis engine
 */

export type FundamentalOutlook = 'STRONG' | 'MODERATE' | 'WEAK';

export interface AnalysisSection {
  title: string;
  content: string;
}

export interface FundamentalAnalysis {
  symbol: string;
  assetType: 'stock' | 'crypto';
  outlook: FundamentalOutlook;
  outlookScore: number; // 0-100
  sections: {
    overview: AnalysisSection;
    valuation: AnalysisSection;
    profitability: AnalysisSection;
    growth: AnalysisSection;
    stability: AnalysisSection;
    risks: AnalysisSection;
    summary: AnalysisSection;
  };
  analyzedAt: string;
}
