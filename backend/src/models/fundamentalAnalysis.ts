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
  assetType: 'stock' | 'crypto' | 'etf';
  outlook: FundamentalOutlook;
  outlookScore: number; // 0-100
  sections: Record<string, AnalysisSection>;
  analyzedAt: string;
}
