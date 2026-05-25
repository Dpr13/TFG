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

export const psychoanalysisService = {
  async analyzeOperations(operations: Operation[]): Promise<PsychoAnalysisSummary> {
    if (operations.length === 0) {
      return getEmptySummary();
    }

    const generalStats = calculateGeneralStats(operations);
    const assetStats = calculateAssetStats(operations);
    const temporalStats = calculateTemporalStats(operations);
    const directionalStats = calculateDirectionalStats(operations);
    const baseBehaviorStats = calculateBehaviorStats(operations);
    const alerts = detectRiskAlerts(operations);

    const overtradingScore = calculateOvertradingScore(operations);
    const impulsivityScore = calculateImpulsivityScore(baseBehaviorStats, alerts);
    const behaviorStats = { ...baseBehaviorStats, overtradingScore, impulsivityScore };
    const disciplineScore = calculateDisciplineScore(generalStats, behaviorStats, alerts);
    const recommendations = generateRecommendations(generalStats, temporalStats, directionalStats, behaviorStats, assetStats, alerts);

    return {
      generalStats,
      assetStats,
      temporalStats,
      directionalStats,
      behaviorStats,
      alerts,
      disciplineScore,
      recommendations,
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
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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

function buildOpsByDay(operations: Operation[]): { opsByDay: Map<string, number>; threshold: number } {
  const opsByDay = new Map<string, number>();
  operations.forEach(op => opsByDay.set(op.date, (opsByDay.get(op.date) || 0) + 1));
  const dayCount = opsByDay.size || 1;
  const avgDayOps = operations.length / dayCount;
  const threshold = Math.max(8, Math.round(avgDayOps * 3));
  return { opsByDay, threshold };
}

function calculateOvertradingScore(operations: Operation[]): number {
  if (operations.length === 0) return 0;
  const { opsByDay, threshold } = buildOpsByDay(operations);
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

function generateRecommendations(
  generalStats: GeneralStats,
  temporalStats: TemporalStats,
  directionalStats: DirectionalStats,
  behaviorStats: BehaviorStats,
  assetStats: AssetStats[],
  alerts: RiskAlert[]
): string[] {
  const recs: string[] = [];

  if (generalStats.winRate < 40) {
    recs.push(`Tu tasa de aciertos es del ${generalStats.winRate.toFixed(1)}%. Estás cerrando más del 60% de operaciones en pérdida — revisa tus criterios de entrada.`);
  } else if (generalStats.winRate < 50) {
    recs.push(`Tu tasa de aciertos (${generalStats.winRate.toFixed(1)}%) está por debajo del 50%. Asegúrate de que tus ganancias medias superen tus pérdidas medias para mantener rentabilidad.`);
  }

  if (behaviorStats.overtradingScore > 60) {
    recs.push(`Tu índice de sobreoperación es elevado (${behaviorStats.overtradingScore}/100). Reduce el número de operaciones diarias y espera señales de mayor calidad.`);
  }

  if (behaviorStats.impulsivityScore > 60) {
    recs.push(`Alta impulsividad detectada (${behaviorStats.impulsivityScore}/100). Considera establecer un descanso obligatorio tras dos pérdidas consecutivas antes de volver a operar.`);
  }

  if (alerts.some(a => a.type === 'revenge_trading')) {
    recs.push('Se han detectado patrones de revenge trading. Establece un límite diario de pérdidas máximas y detén las operaciones al alcanzarlo.');
  }

  if (alerts.some(a => a.type === 'loss_spiral')) {
    recs.push('Hay secuencias de pérdidas crecientes en tu historial. Cuando una pérdida supere el doble de tu media, es señal de parar por el día.');
  }

  const daysWithOps = temporalStats.dayOfWeek.filter(d => d.operations > 0);
  if (daysWithOps.length > 1) {
    if (temporalStats.worstDayOfWeek) {
      recs.push(`Tus resultados son peores los ${temporalStats.worstDayOfWeek}. Considera operar con tamaños menores ese día o evitarlo directamente.`);
    }
    if (temporalStats.bestDayOfWeek && temporalStats.bestDayOfWeek !== temporalStats.worstDayOfWeek) {
      recs.push(`Tu mejor día de la semana es ${temporalStats.bestDayOfWeek}. Concentra tus mejores ideas en ese día.`);
    }
  }

  const { long, short } = directionalStats;
  if (long.operations >= 3 && short.operations >= 3) {
    if (long.winRate > short.winRate + 15) {
      recs.push(`Tu win rate en largos (${long.winRate.toFixed(1)}%) supera al de cortos (${short.winRate.toFixed(1)}%). Considera reducir operativas en corto hasta mejorar ese ratio.`);
    } else if (short.winRate > long.winRate + 15) {
      recs.push(`Tu win rate en cortos (${short.winRate.toFixed(1)}%) supera al de largos (${long.winRate.toFixed(1)}%). Tienes un sesgo bajista — aprovéchalo conscientemente.`);
    }
    if (long.avgPnL > 0 && short.avgPnL < 0) {
      recs.push(`En promedio pierdes dinero en operaciones en corto (${short.avgPnL.toFixed(2)}€ de media). Revisa tu criterio de entrada en corto.`);
    } else if (short.avgPnL > 0 && long.avgPnL < 0) {
      recs.push(`En promedio pierdes dinero en operaciones en largo (${long.avgPnL.toFixed(2)}€ de media). Revisa tu criterio de entrada en largo.`);
    }
  }

  const qualifiedAssets = assetStats.filter(a => a.operations >= 3);
  const bestSharpe = [...qualifiedAssets].sort((a, b) => b.sharpeRatio - a.sharpeRatio)[0];
  if (bestSharpe && bestSharpe.sharpeRatio > 0.5) {
    recs.push(`${bestSharpe.symbol} tiene el mejor Sharpe Ratio (${bestSharpe.sharpeRatio.toFixed(2)}), indicando buena rentabilidad ajustada al riesgo. Podría merecer más peso en tu operativa.`);
  }

  const highVolAsset = qualifiedAssets.find(a => a.volatility > Math.abs(a.avgPnL) * 3 && a.volatility > 0);
  if (highVolAsset) {
    recs.push(`${highVolAsset.symbol} muestra resultados muy inconsistentes (volatilidad: ${highVolAsset.volatility.toFixed(2)}). Considera reducir el tamaño de posición en este activo.`);
  }

  if (behaviorStats.recoverySuccessRate < 30 && behaviorStats.recoveryAttempts > 5) {
    recs.push(`Solo recuperas el ${behaviorStats.recoverySuccessRate}% de tus operaciones inmediatamente tras una pérdida. Evita operar impulsivamente después de cerrar en negativo.`);
  }

  return recs;
}

function detectRiskAlerts(operations: Operation[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const sorted = [...operations].sort((a, b) => a.date.localeCompare(b.date));

  // --- Over-trading: días con volumen anormalmente alto ---
  const { opsByDay, threshold } = buildOpsByDay(operations);
  const overtradingDays = [...opsByDay.entries()].filter(([, count]) => count >= threshold);
  const dayCount = opsByDay.size || 1;
  const avgDayOps = operations.length / dayCount;
  const maxDayOps = Math.max(...opsByDay.values());

  if (overtradingDays.length > 0) {
    alerts.push({
      type: 'overtrading',
      severity: overtradingDays.length >= 3 ? 'high' : overtradingDays.length >= 2 ? 'medium' : 'low',
      message: `Se detectaron ${overtradingDays.length} día(s) con volumen de operaciones anormalmente alto (máximo: ${maxDayOps} ops en un día, media: ${avgDayOps.toFixed(1)}).`,
    });
  }

  // --- Revenge trading: pico de operaciones tras 3+ pérdidas consecutivas ---
  let consecutiveLosses = 0;
  let revengeDetected = false;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].pnl < 0) {
      consecutiveLosses++;
    } else {
      consecutiveLosses = 0;
    }

    if (consecutiveLosses >= 3) {
      const nextOps = sorted.slice(i + 1, i + 4);
      const nextDates = new Set(nextOps.map(op => op.date));
      if (nextOps.length >= 3 && nextDates.size === 1) {
        revengeDetected = true;
        break;
      }
    }
  }

  if (revengeDetected) {
    alerts.push({
      type: 'revenge_trading',
      severity: 'high',
      message: 'Se detectó posible revenge trading: aumento brusco de operaciones tras una racha de 3 o más pérdidas consecutivas.',
    });
  }

  // --- Loss spiral: pérdidas consecutivas de magnitud creciente ---
  let spiralCount = 0;
  for (let i = 2; i < sorted.length; i++) {
    const a = sorted[i - 2].pnl;
    const b = sorted[i - 1].pnl;
    const c = sorted[i].pnl;
    if (a < 0 && b < 0 && c < 0 && Math.abs(b) > Math.abs(a) && Math.abs(c) > Math.abs(b)) {
      spiralCount++;
    }
  }

  if (spiralCount >= 2) {
    alerts.push({
      type: 'loss_spiral',
      severity: spiralCount >= 4 ? 'high' : 'medium',
      message: `Se detectaron ${spiralCount} secuencias de pérdidas crecientes. Las pérdidas aumentan progresivamente en magnitud.`,
    });
  }

  return alerts;
}
