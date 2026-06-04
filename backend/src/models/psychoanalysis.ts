// ============================================================================
// PSYCHOANALYSIS MODEL
// ============================================================================
// Define la estructura para el análisis psicológico/comportamental del trader
//
// EXPANSIONES FUTURAS:
// - Análisis de patrones horarios (mejor hora del día)
// - Detección de ciclos emocionales
// - Análisis de sesiones (Premarket, Regular, After-hours)
// - Predicción de comportamiento basada en histórico
// - Puntuación de disciplina personal
// - Tracking de emociones vs resultados
// - Análisis de sobre-trading detectado automáticamente
// - Machine Learning para predicción de comportamiento futuro
// - Recomendaciones personalizadas basadas en patrones
// - Análisis de correlación entre activos y emociones
// ============================================================================

// Estadísticas generales del operador
export interface GeneralStats {
  totalOperations: number;
  totalPnL: number;
  winRate: number; // porcentaje
  expectedValue: number; // PnL medio por operación
  profitFactor: number; // suma ganancias / suma pérdidas absolutas
  bestDay: { date: string; pnl: number };
  worstDay: { date: string; pnl: number };
  bestAsset: { symbol: string; pnl: number };
  worstAsset: { symbol: string; pnl: number };
}

// Rendimiento por activo
export interface AssetStats {
  symbol: string;
  operations: number;
  totalPnL: number;
  winRate: number;
  avgPnL: number;
  bestTrade: number;
  worstTrade: number;
  volatility: number;   // desviación estándar del PnL
  sharpeRatio: number;  // avgPnL / volatility (0 si volatility = 0)
}

// Patrones temporales
export interface TemporalStats {
  dayOfWeek: {
    day: string;
    operations: number;
    totalPnL: number;
    winRate: number;
  }[];
  bestDayOfWeek: string;
  worstDayOfWeek: string;
}

// Rendimiento por dirección (long vs short)
export interface DirectionalSide {
  operations: number;
  totalPnL: number;
  winRate: number;
  avgPnL: number;
  avgPnLPct: number;
}

export interface DirectionalStats {
  long: DirectionalSide;
  short: DirectionalSide;
}

// Análisis de comportamiento
export interface BehaviorStats {
  opsAfterWin: number; // fracción de ops que siguen a una ganancia
  opsAfterLoss: number; // fracción de ops que siguen a una pérdida
  recoveryAttempts: number; // ops inmediatas post-pérdida
  recoverySuccessRate: number; // % de recuperaciones exitosas
  longestWinStreak: number;
  longestLossStreak: number;
  overtradingScore: number; // 0-100: intensidad de sobreoperación detectada
  impulsivityScore: number; // 0-100: tendencia a operar impulsivamente tras pérdidas
}

// Alerta de comportamiento de riesgo detectada automáticamente
export interface RiskAlert {
  type: 'overtrading' | 'revenge_trading' | 'loss_spiral';
  severity: 'low' | 'medium' | 'high';
  messageParams: Record<string, number | string>; // parámetros para que el frontend genere el mensaje en el idioma correcto
}

// Resumen general del psicoanálisis
export interface PsychoAnalysisSummary {
  generalStats: GeneralStats;
  assetStats: AssetStats[];
  temporalStats: TemporalStats;
  directionalStats: DirectionalStats;
  behaviorStats: BehaviorStats;
  alerts: RiskAlert[];
  disciplineScore: number; // 0-100: disciplina global del operador
  recommendations: string[];
  analysisMode: 'static' | 'adaptive'; // 'static' con < 30 ops, 'adaptive' con >= 30
}

// EXPANSIONES FUTURAS:
/*
export interface PsychologicalProfile {
  traderType: 'aggressive' | 'conservative' | 'balanced';
  discipline: number; // 0-100
  emotionalControl: number; // 0-100
  consistency: number; // 0-100
  riskTolerance: number; // 0-100
}

export interface HourlyStats {
  hour: string;
  operations: number;
  avgPnL: number;
  winRate: number;
}

export interface RiskFlag {
  type: 'overtrading' | 'emotionalTrading' | 'revenge' | 'chasing';
  severity: 'low' | 'medium' | 'high';
  description: string;
  triggeredAt: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface PredictedBehavior {
  likelyToOvertrade: number; // 0-100, probabilidad
  expectedWinRate: number;
  predictedPnLNextWeek: number;
  confidenceLevel: number; // 0-100
}
*/


