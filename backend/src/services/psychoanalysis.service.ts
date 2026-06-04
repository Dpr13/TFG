import { Operation } from '../models/operation';
import {
  GeneralStats,
  AssetStats,
  TemporalStats,
  DirectionalStats,
  BehaviorStats,
  PsychoAnalysisSummary,
  RiskAlert,
} from '../models/psychoanalysis';

// ============================================================================
// PSYCHOANALYSIS SERVICE
// ============================================================================
// Análisis psicológico y comportamental del operador
//
// EXPANSIONES FUTURAS:
// - Machine Learning para predicción de comportamiento
// - Análisis de ciclos emocionales basado en histórico
// - Detección automática de patrones anomalía/anormales
// - Scoring de disciplines 0-100
// - Alertas en tiempo real de comportamiento riesgoso
// - Análisis de correlación: estados emocionales vs rentabilidad
// - Generación de reportes PDF personalizados
// - Integración con análisis técnico (correlación con mercado)
// - Histórico de evolución psicológica
// - Gamificación y badges por mejora de comportamiento
// ============================================================================

const ADAPTIVE_MIN_OPS = 30;

export const psychoanalysisService = {
  async analyzeOperations(operations: Operation[]): Promise<PsychoAnalysisSummary> {
    if (operations.length === 0) {
      return getEmptySummary();
    }

    const analysisMode: 'static' | 'adaptive' = operations.length >= ADAPTIVE_MIN_OPS ? 'adaptive' : 'static';

    const generalStats = calculateGeneralStats(operations);
    const assetStats = calculateAssetStats(operations);
    const temporalStats = calculateTemporalStats(operations);
    const directionalStats = calculateDirectionalStats(operations);
    const baseBehaviorStats = calculateBehaviorStats(operations);
    const alerts = detectRiskAlerts(operations, analysisMode);

    const overtradingScore = calculateOvertradingScore(operations, analysisMode);
    const impulsivityScore = calculateImpulsivityScore(baseBehaviorStats, alerts);
    const behaviorStats = { ...baseBehaviorStats, overtradingScore, impulsivityScore };
    const disciplineScore = calculateDisciplineScore(generalStats, behaviorStats, alerts);
    const recommendations = generateRecommendations();

    return {
      generalStats,
      assetStats,
      temporalStats,
      directionalStats,
      behaviorStats,
      alerts,
      disciplineScore,
      recommendations,
      analysisMode,
    };
  },
};

function getEmptySummary(): PsychoAnalysisSummary {
  return {
    generalStats: {
      totalOperations: 0,
      totalPnL: 0,
      winRate: 0,
      expectedValue: 0,
      profitFactor: 0,
      bestDay: { date: '', pnl: 0 },
      worstDay: { date: '', pnl: 0 },
      bestAsset: { symbol: '', pnl: 0 },
      worstAsset: { symbol: '', pnl: 0 },
    },
    assetStats: [],
    temporalStats: {
      dayOfWeek: [
        { day: 'Lunes', operations: 0, totalPnL: 0, winRate: 0 },
        { day: 'Martes', operations: 0, totalPnL: 0, winRate: 0 },
        { day: 'Miércoles', operations: 0, totalPnL: 0, winRate: 0 },
        { day: 'Jueves', operations: 0, totalPnL: 0, winRate: 0 },
        { day: 'Viernes', operations: 0, totalPnL: 0, winRate: 0 },
        { day: 'Sábado', operations: 0, totalPnL: 0, winRate: 0 },
        { day: 'Domingo', operations: 0, totalPnL: 0, winRate: 0 },
      ],
      bestDayOfWeek: '',
      worstDayOfWeek: '',
    },
    directionalStats: {
      long:  { operations: 0, totalPnL: 0, winRate: 0, avgPnL: 0, avgPnLPct: 0 },
      short: { operations: 0, totalPnL: 0, winRate: 0, avgPnL: 0, avgPnLPct: 0 },
    },
    behaviorStats: {
      opsAfterWin: 0,
      opsAfterLoss: 0,
      recoveryAttempts: 0,
      recoverySuccessRate: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      overtradingScore: 0,
      impulsivityScore: 0,
    },
    alerts: [],
    disciplineScore: 0,
    recommendations: [],
    analysisMode: 'static',
  };
}

// EXPANSIÓN: Aquí iría análisis de correlación con patrones técnicos
function calculateGeneralStats(operations: Operation[]): GeneralStats {
  const wins = operations.filter(op => op.pnl > 0).length;
  const winRate = (wins / operations.length) * 100;
  const totalPnL = operations.reduce((sum, op) => sum + op.pnl, 0);

  const expectedValue = totalPnL / operations.length;

  const grossWins = operations.filter(op => op.pnl > 0).reduce((sum, op) => sum + op.pnl, 0);
  const grossLosses = Math.abs(operations.filter(op => op.pnl < 0).reduce((sum, op) => sum + op.pnl, 0));
  // 9.99 = sin pérdidas registradas (no hay divisor); valor simbólico de máxima eficiencia
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 9.99 : 0;

  // Datos por día
  const statsByDate = new Map<string, number>();
  operations.forEach(op => {
    const current = statsByDate.get(op.date) || 0;
    statsByDate.set(op.date, current + op.pnl);
  });

  const dates = Array.from(statsByDate.entries());
  const bestDay = dates.reduce((max, [date, pnl]) => (pnl > max.pnl ? { date, pnl } : max), {
    date: '',
    pnl: -Infinity,
  });
  const worstDay = dates.reduce((min, [date, pnl]) => (pnl < min.pnl ? { date, pnl } : min), {
    date: '',
    pnl: Infinity,
  });

  // Datos por activo
  const statsByAsset = new Map<string, number>();
  operations.forEach(op => {
    const current = statsByAsset.get(op.symbol) || 0;
    statsByAsset.set(op.symbol, current + op.pnl);
  });

  const assets = Array.from(statsByAsset.entries());
  const bestAsset = assets.reduce((max, [symbol, pnl]) => (pnl > max.pnl ? { symbol, pnl } : max), {
    symbol: '',
    pnl: -Infinity,
  });
  const worstAsset = assets.reduce(
    (min, [symbol, pnl]) => (pnl < min.pnl ? { symbol, pnl } : min),
    { symbol: '', pnl: Infinity }
  );

  return {
    totalOperations: operations.length,
    totalPnL,
    winRate,
    expectedValue,
    profitFactor,
    bestDay: bestDay.date ? bestDay : { date: '', pnl: 0 },
    worstDay: worstDay.date ? worstDay : { date: '', pnl: 0 },
    bestAsset: bestAsset.symbol ? bestAsset : { symbol: '', pnl: 0 },
    worstAsset: worstAsset.symbol ? worstAsset : { symbol: '', pnl: 0 },
  };
}

function calculateAssetStats(operations: Operation[]): AssetStats[] {
  const assetMap = new Map<string, Operation[]>();

  operations.forEach(op => {
    if (!assetMap.has(op.symbol)) assetMap.set(op.symbol, []);
    assetMap.get(op.symbol)!.push(op);
  });

  const stats: AssetStats[] = [];
  assetMap.forEach((ops, symbol) => {
    const wins = ops.filter(op => op.pnl > 0).length;
    const totalPnL = ops.reduce((sum, op) => sum + op.pnl, 0);
    const avgPnL = totalPnL / ops.length;
    const bestTrade = Math.max(...ops.map(op => op.pnl));
    const worstTrade = Math.min(...ops.map(op => op.pnl));
    const variance = ops.reduce((sum, op) => sum + (op.pnl - avgPnL) ** 2, 0) / ops.length;
    const volatility = Math.sqrt(variance);
    const sharpeRatio = volatility > 0 ? avgPnL / volatility : 0;

    stats.push({
      symbol,
      operations: ops.length,
      totalPnL,
      winRate: (wins / ops.length) * 100,
      avgPnL,
      bestTrade,
      worstTrade,
      volatility,
      sharpeRatio,
    });
  });

  return stats.sort((a, b) => b.totalPnL - a.totalPnL);
}

function calculateTemporalStats(operations: Operation[]): TemporalStats {
  const daysMap = new Map<number, Operation[]>();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  operations.forEach(op => {
    const dayNum = new Date(op.date).getDay();
    if (!daysMap.has(dayNum)) daysMap.set(dayNum, []);
    daysMap.get(dayNum)!.push(op);
  });

  const dayOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const ops = daysMap.get(i) || [];
    const wins = ops.filter(op => op.pnl > 0).length;
    const totalPnL = ops.reduce((sum, op) => sum + op.pnl, 0);
    dayOfWeek.push({
      day: dayNames[i],
      operations: ops.length,
      totalPnL,
      winRate: ops.length > 0 ? (wins / ops.length) * 100 : 0,
    });
  }

  const daysWithOps = dayOfWeek.filter(d => d.operations > 0);
  const sortedByPnL = [...daysWithOps].sort((a, b) => b.totalPnL - a.totalPnL);
  const bestDayOfWeek = sortedByPnL[0]?.day || '';
  const worstDayOfWeek = sortedByPnL[sortedByPnL.length - 1]?.day || '';

  return { dayOfWeek, bestDayOfWeek, worstDayOfWeek };
}

function calculateDirectionalStats(operations: Operation[]): DirectionalStats {
  const buildSide = (ops: Operation[]) => {
    if (ops.length === 0) return { operations: 0, totalPnL: 0, winRate: 0, avgPnL: 0, avgPnLPct: 0 };
    const wins = ops.filter(o => o.pnl > 0).length;
    const totalPnL = ops.reduce((s, o) => s + o.pnl, 0);
    const avgPnLPct = ops.reduce((s, o) => s + o.pnlPercentage, 0) / ops.length;
    return {
      operations: ops.length,
      totalPnL,
      winRate: (wins / ops.length) * 100,
      avgPnL: totalPnL / ops.length,
      avgPnLPct,
    };
  };

  return {
    long:  buildSide(operations.filter(o => o.type === 'long')),
    short: buildSide(operations.filter(o => o.type === 'short')),
  };
}

function calculateBehaviorStats(
  operations: Operation[]
): Omit<BehaviorStats, 'overtradingScore' | 'impulsivityScore'> {
  const sorted = [...operations].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let opsAfterWin = 0;
  let opsAfterLoss = 0;
  let recoveryAttempts = 0;
  let recoverySuccesses = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  for (let i = 0; i < sorted.length; i++) {
    const op = sorted[i];
    const isWin = op.pnl > 0;

    if (i > 0) {
      const prevOp = sorted[i - 1];
      if (prevOp.pnl > 0) {
        opsAfterWin++;
      } else if (prevOp.pnl < 0) {
        opsAfterLoss++;
        recoveryAttempts++;
        if (isWin) recoverySuccesses++;
      }
    }

    if (isWin) {
      currentWinStreak++;
      currentLossStreak = 0;
    } else if (op.pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
    }

    longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
  }

  // fracción de ops que siguen a una ganancia/pérdida sobre el total de ops con predecesor
  const totalFollowing = sorted.length - 1;
  return {
    opsAfterWin: totalFollowing > 0 ? Math.round((opsAfterWin / totalFollowing) * 100) / 100 : 0,
    opsAfterLoss: totalFollowing > 0 ? Math.round((opsAfterLoss / totalFollowing) * 100) / 100 : 0,
    recoveryAttempts,
    recoverySuccessRate:
      recoveryAttempts > 0 ? Math.round((recoverySuccesses / recoveryAttempts) * 100) : 0,
    longestWinStreak,
    longestLossStreak,
  };
}

function buildOpsByDay(operations: Operation[], minThreshold = 8): { opsByDay: Map<string, number>; threshold: number } {
  const opsByDay = new Map<string, number>();
  operations.forEach(op => opsByDay.set(op.date, (opsByDay.get(op.date) || 0) + 1));
  const dayCount = opsByDay.size || 1;
  const avgDayOps = operations.length / dayCount;
  const threshold = Math.max(minThreshold, Math.round(avgDayOps * 3));
  return { opsByDay, threshold };
}

function calculateOvertradingScore(operations: Operation[], mode: 'static' | 'adaptive' = 'static'): number {
  if (operations.length === 0) return 0;
  const minThreshold = mode === 'adaptive' ? 3 : 8;
  const { opsByDay, threshold } = buildOpsByDay(operations, minThreshold);
  const dayCount = opsByDay.size || 1;
  const overtradingDays = [...opsByDay.values()].filter(count => count >= threshold).length;
  return Math.min(100, Math.round((overtradingDays / dayCount) * 300));
}


function calculateImpulsivityScore(
  behaviorStats: Omit<BehaviorStats, 'overtradingScore' | 'impulsivityScore'>,
  alerts: RiskAlert[]
): number {
  let score = 0;
  const total = behaviorStats.opsAfterWin + behaviorStats.opsAfterLoss;
  if (total > 0) {
    // más ops tras pérdida que tras ganancia = más impulsividad (hasta 40 pts)
    score += Math.round((behaviorStats.opsAfterLoss / total) * 40);
  }
  if (alerts.some(a => a.type === 'revenge_trading')) score += 35;
  if (alerts.some(a => a.type === 'loss_spiral')) score += 25;
  return Math.min(100, score);
}

function calculateDisciplineScore(
  generalStats: GeneralStats,
  behaviorStats: BehaviorStats,
  alerts: RiskAlert[]
): number {
  let score = 100;
  score -= Math.round(behaviorStats.overtradingScore * 0.3);
  score -= Math.round(behaviorStats.impulsivityScore * 0.3);
  for (const alert of alerts) {
    if (alert.severity === 'high') score -= 15;
    else if (alert.severity === 'medium') score -= 8;
    else score -= 3;
  }
  if (generalStats.winRate > 60) score += 10;
  else if (generalStats.winRate > 50) score += 5;
  return Math.max(0, Math.min(100, score));
}

// Las recomendaciones se generan en el frontend para soportar i18n
function generateRecommendations(): string[] {
  return [];
}

function detectRiskAlerts(operations: Operation[], mode: 'static' | 'adaptive'): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const sorted = [...operations].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // --- Overtrading: días con volumen anormalmente alto respecto a la media ---
  const minThreshold = mode === 'adaptive' ? 3 : 8;
  const { opsByDay, threshold } = buildOpsByDay(operations, minThreshold);
  const overtradingDays = [...opsByDay.entries()].filter(([, count]) => count >= threshold);
  const dayCount = opsByDay.size || 1;
  const avgDayOps = operations.length / dayCount;
  const maxDayOps = Math.max(...opsByDay.values());

  if (overtradingDays.length > 0) {
    alerts.push({
      type: 'overtrading',
      severity: overtradingDays.length >= 3 ? 'high' : overtradingDays.length >= 2 ? 'medium' : 'low',
      messageParams: { days: overtradingDays.length, max: maxDayOps, avg: avgDayOps.toFixed(1) },
    });
  }

  // --- Revenge trading: más operaciones de lo habitual después de una pérdida en el mismo día ---
  // Agrupa las ops por día respetando el orden cronológico (createdAt)
  const opsByDayMap = new Map<string, Operation[]>();
  for (const op of sorted) {
    if (!opsByDayMap.has(op.date)) opsByDayMap.set(op.date, []);
    opsByDayMap.get(op.date)!.push(op);
  }

  let revengeDays = 0;
  for (const dayOps of opsByDayMap.values()) {
    const firstLossIdx = dayOps.findIndex(op => op.pnl < 0);
    if (firstLossIdx === -1) continue; // día sin pérdidas, no aplica
    const postLossOps = dayOps.length - firstLossIdx - 1;
    // Si las ops abiertas tras la primera pérdida superan la media diaria, es sospechoso
    if (postLossOps > avgDayOps) revengeDays++;
  }

  if (revengeDays > 0) {
    alerts.push({
      type: 'revenge_trading',
      severity: revengeDays >= 4 ? 'high' : revengeDays >= 2 ? 'medium' : 'low',
      messageParams: { days: revengeDays },
    });
  }

  // --- Loss spiral: rachas de pérdidas consecutivas inusualmente largas ---
  // Recoge la longitud de cada racha de pérdidas consecutivas
  const lossStreaks: number[] = [];
  let currentStreak = 0;
  for (const op of sorted) {
    if (op.pnl < 0) {
      currentStreak++;
    } else {
      if (currentStreak > 0) lossStreaks.push(currentStreak);
      currentStreak = 0;
    }
  }
  if (currentStreak > 0) lossStreaks.push(currentStreak);

  const longestStreak = lossStreaks.length > 0 ? Math.max(...lossStreaks) : 0;
  let spiralSeverity: 'low' | 'medium' | 'high' | null = null;

  if (mode === 'adaptive' && lossStreaks.length >= 5) {
    // Umbral = percentil 85 de las rachas históricas del trader
    const sortedStreaks = [...lossStreaks].sort((a, b) => a - b);
    const p85 = sortedStreaks[Math.floor(sortedStreaks.length * 0.85)];
    if (longestStreak > Math.round(p85 * 2))   spiralSeverity = 'high';
    else if (longestStreak > Math.round(p85 * 1.5)) spiralSeverity = 'medium';
    else if (longestStreak > p85)               spiralSeverity = 'low';
  } else {
    // Umbrales estáticos cuando no hay suficiente historial
    if (longestStreak >= 7)      spiralSeverity = 'high';
    else if (longestStreak >= 5) spiralSeverity = 'medium';
    else if (longestStreak >= 3) spiralSeverity = 'low';
  }

  if (spiralSeverity) {
    alerts.push({
      type: 'loss_spiral',
      severity: spiralSeverity,
      messageParams: { streak: longestStreak },
    });
  }

  return alerts;
}
