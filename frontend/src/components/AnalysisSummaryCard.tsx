import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export type AnalysisVariant = 'success' | 'warning' | 'danger' | 'info';

interface AnalysisSummaryCardProps {
  score: number;
  classification: string;
  explanation: string | React.ReactNode;
  variant: AnalysisVariant;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const VARIANT_STYLES: Record<AnalysisVariant, { text: string; bg: string; border: string; gauge: string }> = {
  success: {
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50/80 dark:bg-green-900/30',
    border: 'border-green-100 dark:border-green-900/50',
    gauge: '#22c55e',
  },
  warning: {
    text: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    border: 'border-yellow-200 dark:border-yellow-800/50',
    gauge: '#eab308',
  },
  danger: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-100 dark:border-red-900/50',
    gauge: '#ef4444',
  },
  info: {
    text: 'text-blue-600 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-800/10',
    border: 'border-blue-100 dark:border-blue-700/30',
    gauge: '#3b82f6',
  },
};

export function ScoreGauge({ score, classification, variant }: { score: number; classification: string; variant: AnalysisVariant }) {
  const { darkMode } = useTheme();
  const styles = VARIANT_STYLES[variant];
  const radius = 42;
  const circumference = Math.PI * radius; // Half circle
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center flex-shrink-0 select-none">
      <svg width="110" height="65" viewBox="0 0 110 65" className="overflow-visible">
        {/* Background track */}
        <path
          d="M13,58 A42,42 0 0,1 97,58"
          fill="none"
          stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress track */}
        <path
          d="M13,58 A42,42 0 0,1 97,58"
          fill="none"
          stroke={styles.gauge}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Score text */}
        <text
          x="55"
          y="50"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill={darkMode ? "white" : "#1f2937"}
        >
          {score}
        </text>
        <text
          x="55"
          y="62"
          textAnchor="middle"
          fontSize="9"
          fontWeight="medium"
          fill={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
        >
          /100
        </text>
      </svg>
      <span className={`text-xs font-bold mt-1 uppercase tracking-wider ${styles.text}`}>
        {classification}
      </span>
    </div>
  );
}

export default function AnalysisSummaryCard({
  score,
  classification,
  explanation,
  variant,
  children,
  footer,
}: AnalysisSummaryCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={`rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-8 ${styles.bg} border ${styles.border} transition-all duration-300 shadow-sm`}>
      <ScoreGauge score={score} classification={classification} variant={variant} />
      
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="flex-1">
          {typeof explanation === 'string' ? (
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-medium">
              {explanation}
            </p>
          ) : (
            explanation
          )}
        </div>
        
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}

        {footer && (
          <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
