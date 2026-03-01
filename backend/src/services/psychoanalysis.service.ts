import { Operation } from '../models/operation';
import {
  GeneralStats,
  AssetStats,
  TemporalStats,
  BehaviorStats,
  PsychoAnalysisSummary,
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
    const behaviorStats = calculateBehaviorStats(operations);

    return {
      generalStats,
      assetStats,
      temporalStats,
      behaviorStats,
    };
  },
};

function getEmptySummary(): PsychoAnalysisSummary {
  return {
    generalStats: {
      totalOperations: 0,
      totalPnL: 0,
      winRate: 0,
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
    behaviorStats: {
      opsAfterWin: 0,
      opsAfterLoss: 0,
      recoveryAttempts: 0,
      recoverySuccessRate: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
    },
  };
}

// EXPANSIÓN: Aquí iría análisis de correlación con patrones técnicos
function calculateGeneralStats(operations: Operation[]): GeneralStats {
  const wins = operations.filter(op => op.pnl > 0).length;
  const winRate = (wins / operations.length) * 100;
  const totalPnL = operations.reduce((sum, op) => sum + op.pnl, 0);

  // EXPANSIÓN: Calcular Expected Value (promedio por operación)
  // EXPANSIÓN: Calcular Profit Factor (ganancias totales / pérdidas totales)

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
    bestDay: bestDay.date ? bestDay : { date: '', pnl: 0 },
    worstDay: worstDay.date ? worstDay : { date: '', pnl: 0 },
    bestAsset: bestAsset.symbol ? bestAsset : { symbol: '', pnl: 0 },
    worstAsset: worstAsset.symbol ? worstAsset : { symbol: '', pnl: 0 },
  };
}

// EXPANSIÓN: Aquí iría análisis de volatilidad del activo
// EXPANSIÓN: Aquí iría cálculo de Sharpe Ratio por activo
function calculateAssetStats(operations: Operation[]): AssetStats[] {
  const assetMap = new Map<string, Operation[]>();

  operations.forEach(op => {
    if (!assetMap.has(op.symbol)) {
      assetMap.set(op.symbol, []);
    }
    assetMap.get(op.symbol)!.push(op);
  });

  const stats: AssetStats[] = [];
  assetMap.forEach((ops, symbol) => {
    const wins = ops.filter(op => op.pnl > 0).length;
    const totalPnL = ops.reduce((sum, op) => sum + op.pnl, 0);
    const avgPnL = totalPnL / ops.length;

    stats.push({
      symbol,
      operations: ops.length,
      totalPnL,
      winRate: (wins / ops.length) * 100,
      avgPnL,
    });
  });

  return stats.sort((a, b) => b.totalPnL - a.totalPnL);
}

// EXPANSIÓN: Aquí iría análisis por hora del día
// EXPANSIÓN: Aquí iría análisis por tipo de sesión (premarket, regular, afterhours)
function calculateTemporalStats(operations: Operation[]): TemporalStats {
  const daysMap = new Map<number, Operation[]>();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  operations.forEach(op => {
    const dayNum = new Date(op.date).getDay();
    if (!daysMap.has(dayNum)) {
      daysMap.set(dayNum, []);
    }
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

  const sortedByPnL = [...dayOfWeek].sort((a, b) => b.totalPnL - a.totalPnL);
  const bestDayOfWeek = sortedByPnL[0]?.day || '';
  const worstDayOfWeek = sortedByPnL[sortedByPnL.length - 1]?.day || '';

  return {
    dayOfWeek,
    bestDayOfWeek,
    worstDayOfWeek,
  };
}

// EXPANSIÓN: Aquí iría detección de sobre-trading emocional
// EXPANSIÓN: Aquí iría cálculo de "impulsivity score" (0-100)
// EXPANSIÓN: Aquí iría análisis de ciclos emocionales
// EXPANSIÓN: Aquí iría generación de alertas de comportamiento riesgoso
function calculateBehaviorStats(operations: Operation[]): BehaviorStats {
  const sorted = [...operations].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let opsAfterWin = 0;
  let opsAfterLossCount = 0;
  let recoveryAttempts = 0;
  let recoverySuccesses = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  for (let i = 0; i < sorted.length; i++) {
    const op = sorted[i];
    const isWin = op.pnl > 0;

    // Conteo de op después de win/loss
    if (i > 0) {
      const prevOp = sorted[i - 1];
      if (prevOp.pnl > 0) {
        opsAfterWin++;
      } else if (prevOp.pnl < 0) {
        opsAfterLossCount++;
        recoveryAttempts++; // intento de recuperación
        if (isWin) {
          recoverySuccesses++;
        }
      }
    }

    // Rachas
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

  const countAfterLossOps = sorted.filter((op, i) => i > 0 && sorted[i - 1].pnl < 0).length;

  return {
    opsAfterWin: countAfterLossOps > 0 ? Math.round((opsAfterWin / countAfterLossOps) * 100) / 100 : 0,
    opsAfterLoss:
      opsAfterLossCount > 0 ? Math.round((opsAfterLossCount / opsAfterLossCount) * 100) / 100 : 0,
    recoveryAttempts,
    recoverySuccessRate:
      recoveryAttempts > 0 ? Math.round((recoverySuccesses / recoveryAttempts) * 100) : 0,
    longestWinStreak,
    longestLossStreak,
  };
}
