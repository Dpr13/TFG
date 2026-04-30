export type Language = 'es' | 'en' | 'de' | 'fr';

export const i18n = {
  es: {
    signals: {
      'COMPRA FUERTE': 'COMPRA FUERTE',
      'COMPRA': 'COMPRA',
      'NEUTRAL': 'NEUTRAL',
      'VENTA': 'VENTA',
      'VENTA FUERTE': 'VENTA FUERTE',
    },
    indicators: {
      movingAverages: 'Medias Móviles',
      bollinger: 'Bandas de Bollinger',
      obv: 'Volumen / OBV',
    },
    details: {
      macd_gt_signal: 'MACD > Signal',
      macd_lt_signal: 'MACD < Signal',
      hist_pos_inc: 'Histograma positivo y creciente',
      hist_pos_dec: 'Histograma positivo pero decreciente',
      hist_neg: 'Histograma negativo',
      bb_upper: 'Precio por encima de la banda superior (sobrecompra, señal bajista)',
      bb_lower: 'Precio por debajo de la banda inferior (sobrevendido, oportunidad de compra)',
      bb_inside: 'Precio dentro de las bandas (comportamiento neutral)',
      obv_trend_up: 'OBV en tendencia alcista (acumulación)',
      obv_trend_side: 'OBV lateral',
      obv_trend_down: 'OBV en tendencia bajista (distribución)',
      price_gt_sma200: 'Precio > SMA200',
      price_lt_sma200: 'Precio < SMA200',
      price_gt_sma50: 'Precio > SMA50',
      price_lt_sma50: 'Precio < SMA50',
      golden_cross: 'SMA50 > SMA200 (Cruce Dorado)',
      death_cross: 'SMA50 < SMA200 (Cruce de la Muerte)',
      rsi_bullish: 'momentum alcista sin sobrecompra',
      rsi_neutral: 'neutro-alcista',
      rsi_weak: 'debilitamiento',
      rsi_overbought: 'sobrecompra',
      rsi_oversold: 'sobrevendido',
    },
    explanation: {
      top_contributor: '{name} es el indicador más favorable ({score}/{maxScore} pts, {pct}%).',
      weakness: '{name} muestra debilidad: {detail}.',
      converge_pos: 'Los indicadores técnicos convergen en una señal positiva.',
      mixed_signal: 'La señal técnica es mixta, se recomienda vigilar la evolución de los indicadores.',
      caution: 'Los indicadores técnicos sugieren precaución en el corto plazo.',
    },
    fundamental: {
      sections: {
        stability: 'Momentum y Volatilidad',
        growth: 'Resultados Recientes',
        profitability: 'Rentabilidad Reciente',
        valuation: 'Valoración Inmediata',
        overview: 'Desempeño Reciente',
        risks: 'Riesgos Clave',
        summary: 'Resumen Ejecutivo',
        horizon: 'Lógica del Horizonte Temporal'
      },
      outlooks: {
        STRONG: 'Fuerte',
        MODERATE: 'Moderada',
        WEAK: 'Débil'
      },
      ranges: {
        '6mo': '6 meses',
        '1y': '1 año',
        '3y': '3 años',
        '5y': '5 años',
        '10y': '10 años'
      },
      benchmarks: {
        sp500: 'vs S&P 500',
        ibex35: 'vs IBEX 35',
        ftse100: 'vs FTSE 100',
        cac40: 'vs CAC 40',
        dax: 'vs DAX',
        none: 'benchmark no especificado'
      },
      stock_horizons: {
        short: 'Análisis de Corto Plazo: Prioriza momentum, resultados trimestrales y volatilidad. El ROE y los márgenes estructurales se consideran factores secundarios.',
        mid: 'Análisis de Medio Plazo: Se centra en el equilibrio entre valoración y crecimiento (PEG). Se ignora la volatilidad diaria para enfocarse en la ejecución operativa y márgenes.',
        long: 'Análisis de Largo Plazo: Enfoque exclusivo en la eficiencia del capital (ROE) y el foso competitivo. La volatilidad de corto plazo y las noticias se consideran ruido irrelevante.'
      },
      crypto_horizon: 'Análisis Crypto: Enfoque en métricas de red (supply), liquidez de mercado y posicionamiento en el ciclo anual.',
      etf_horizon: 'ETF de la gestora {family}. El análisis se centra en la eficiencia de costes (TER), solidez de activos (AUM) y consistencia histórica.'
    },
    risk: {
      errors: {
        symbolRequired: 'El símbolo es obligatorio',
        insufficientData: 'Datos insuficientes para {symbol}: se necesitan al menos {required} puntos, se tienen {actual}',
        assetNotFound: 'El activo con símbolo \'{symbol}\' no fue encontrado',
        failedCalculation: 'Error al calcular las métricas de riesgo'
      }
    },
    comparison: {
      errors: {
        selectCount: 'Selecciona entre 2 y 3 activos.',
        selectValid: 'Selecciona al menos 2 activos válidos.',
        internal: 'Error interno al comparar activos.',
        minTwo: 'Se necesitan al menos 2 activos.',
        aiUnavailable: 'Servicio de IA no disponible.'
      }
    },
    recommendation: {
      errors: {
        symbolRequired: 'El símbolo es obligatorio',
        invalidDirection: 'La dirección debe ser LONG o SHORT',
        invalidSLMethod: 'Método de Stop Loss no válido',
        tpMethodRequired: 'Debe seleccionar al menos un método de Take Profit',
        invalidCapital: 'El capital debe ser mayor que 0',
        invalidRisk: 'El porcentaje de riesgo debe estar entre 0.1 y 100',
        noData: 'No se encontraron datos para el activo seleccionado.',
        failedATR: 'No se pudo obtener el ATR para el cálculo dinámico.',
        noSupport: 'No se detectaron soportes por debajo del precio actual. Usa el método de porcentaje fijo.',
        noResistance: 'No se detectaron resistencias por encima del precio actual. Usa el método de porcentaje fijo.',
        slAboveLong: 'El stop loss debe estar por debajo del precio de entrada para una posición larga.',
        slBelowShort: 'El stop loss debe estar por encima del precio de entrada para una posición corta.',
        internal: 'Error interno al calcular la recomendación'
      },
      labels: {
        fixedPct: '% Fijo',
        dynamicATR: 'ATR Dinámico',
        support: 'Soporte',
        resistance: 'Resistencia',
        atrDetected: 'Stop Loss a 1.5x ATR (${atr})',
        supportDetected: 'Soporte detectado en ${price}',
        resistanceDetected: 'Resistencia detectada en ${price}',
        bollingerUpper: 'Bollinger Superior',
        bollingerLower: 'Bollinger Inferior',
        riskReward: 'R/B 1:{ratio}'
      },
      warnings: {
        tightSL: 'Stop loss muy ajustado. Alta probabilidad de activación por ruido de mercado.',
        wideSL: 'Stop loss muy amplio. El tamaño de posición resultante será muy pequeño.',
        lowQuality: 'Operación de baja calidad: El ratio Riesgo/Beneficio del objetivo es menor a 1.5.',
        veryTightSL: 'El Stop Loss está demasiado ajustado (< 0.5x ATR). Alta probabilidad de activación prematura.',
        lowVol: 'La volatilidad actual (ATR) es muy baja. El mercado podría estar en un rango lateral.',
        insufficientCapital: 'El tamaño de posición supera el capital disponible. Considera reducir el riesgo o aumentar el stop loss.',
        tpBelowLong: 'El TP ({label}) está por debajo del precio de entrada para larga. Se descarta.',
        tpAboveShort: 'El TP ({label}) está por encima del precio de entrada para corta. Se descarta.',
        noValidTP: 'No hay niveles de TP válidos que cumplan con la dirección de la operación.',
        noATRTP: 'No hay datos suficientes de Bollinger para este cálculo de TP.',
        noSupportTP: 'No hay soportes por debajo para usar como TP. Usa otro método adicional.',
        noResisTP: 'No hay resistencias por encima para usar como TP. Usa otro método adicional.'
      },
      reasoning: {
        base: 'Confianza calculada ({confidence}%). ',
        high: 'Existe buena confluencia entre la tendencia técnica y la dirección elegida de la operación, apoyada por una volatilidad adecuada.',
        low: 'Precaución: El panorama técnico entra en conflicto fuerte con la dirección elegida, o la volatilidad actual del mercado no justifica el riesgo.',
        mixed: 'El panorama técnico es mixto o neutral para esta dirección; se recomienda gestión estricta del nivel de Stop Loss.'
      }
    }
  },
  en: {
    signals: {
      'COMPRA FUERTE': 'STRONG BUY',
      'COMPRA': 'BUY',
      'NEUTRAL': 'NEUTRAL',
      'VENTA': 'SELL',
      'VENTA FUERTE': 'STRONG SELL',
    },
    indicators: {
      movingAverages: 'Moving Averages',
      bollinger: 'Bollinger Bands',
      obv: 'Volume / OBV',
    },
    details: {
      macd_gt_signal: 'MACD > Signal',
      macd_lt_signal: 'MACD < Signal',
      hist_pos_inc: 'Positive and increasing histogram',
      hist_pos_dec: 'Positive but decreasing histogram',
      hist_neg: 'Negative histogram',
      bb_upper: 'Price above upper band (overbought, bearish signal)',
      bb_lower: 'Price below lower band (oversold, buying opportunity)',
      bb_inside: 'Price inside bands (neutral behavior)',
      obv_trend_up: 'OBV in upward trend (accumulation)',
      obv_trend_side: 'Side OBV',
      obv_trend_down: 'OBV in downward trend (distribution)',
      price_gt_sma200: 'Price > SMA200',
      price_lt_sma200: 'Price < SMA200',
      price_gt_sma50: 'Price > SMA50',
      price_lt_sma50: 'Price < SMA50',
      golden_cross: 'SMA50 > SMA200 (Golden Cross)',
      death_cross: 'SMA50 < SMA200 (Death Cross)',
      rsi_bullish: 'bullish momentum without overbought',
      rsi_neutral: 'neutral-bullish',
      rsi_weak: 'weakening',
      rsi_overbought: 'overbought',
      rsi_oversold: 'oversold',
    },
    explanation: {
      top_contributor: '{name} is the most favorable indicator ({score}/{maxScore} pts, {pct}%).',
      weakness: '{name} shows weakness: {detail}.',
      converge_pos: 'Technical indicators converge on a positive signal.',
      mixed_signal: 'The technical signal is mixed; monitoring indicator evolution is recommended.',
      caution: 'Technical indicators suggest caution in the short term.',
    },
    fundamental: {
      sections: {
        stability: 'Momentum & Volatility',
        growth: 'Recent Results',
        profitability: 'Recent Profitability',
        valuation: 'Immediate Valuation',
        overview: 'Recent Performance',
        risks: 'Key Risks',
        summary: 'Executive Summary',
        horizon: 'Time Horizon Logic'
      },
      outlooks: {
        STRONG: 'Strong',
        MODERATE: 'Moderate',
        WEAK: 'Weak'
      },
      ranges: {
        '6mo': '6 months',
        '1y': '1 year',
        '3y': '3 years',
        '5y': '5 years',
        '10y': '10 years'
      },
      benchmarks: {
        sp500: 'vs S&P 500',
        ibex35: 'vs IBEX 35',
        ftse100: 'vs FTSE 100',
        cac40: 'vs CAC 40',
        dax: 'vs DAX',
        none: 'benchmark not specified'
      },
      stock_horizons: {
        short: 'Short-term Analysis: Prioritizes momentum, quarterly results, and volatility. ROE and structural margins are considered secondary factors.',
        mid: 'Medium-term Analysis: Focuses on the balance between valuation and growth (PEG). Daily volatility is ignored to focus on operating execution and margins.',
        long: 'Long-term Analysis: Exclusive focus on capital efficiency (ROE) and competitive moat. Short-term volatility and news are considered irrelevant noise.'
      },
      crypto_horizon: 'Crypto Analysis: Focus on network metrics (supply), market liquidity, and positioning in the annual cycle.',
      etf_horizon: 'ETF from manager {family}. The analysis focuses on cost efficiency (TER), asset solidity (AUM), and historical consistency.'
    },
    risk: {
      errors: {
        symbolRequired: 'Symbol parameter is required',
        insufficientData: 'Insufficient data for {symbol}: need at least {required} data points, got {actual}',
        assetNotFound: 'Asset with symbol \'{symbol}\' not found',
        failedCalculation: 'Failed to calculate risk metrics'
      }
    },
    comparison: {
      errors: {
        selectCount: 'Select between 2 and 3 assets.',
        selectValid: 'Select at least 2 valid assets.',
        internal: 'Internal error comparing assets.',
        minTwo: 'At least 2 assets are required.',
        aiUnavailable: 'AI service currently unavailable.'
      }
    },
    recommendation: {
      errors: {
        symbolRequired: 'Symbol is required',
        invalidDirection: 'Direction must be LONG or SHORT',
        invalidSLMethod: 'Invalid Stop Loss method',
        tpMethodRequired: 'At least one Take Profit method must be selected',
        invalidCapital: 'Capital must be greater than 0',
        invalidRisk: 'Risk percentage must be between 0.1 and 100',
        noData: 'No data found for the selected asset.',
        failedATR: 'Could not obtain ATR for dynamic calculation.',
        noSupport: 'No supports detected below current price. Use fixed percentage method.',
        noResistance: 'No resistances detected above current price. Use fixed percentage method.',
        slAboveLong: 'Stop loss must be below entry price for a long position.',
        slBelowShort: 'Stop loss must be above entry price for a short position.',
        internal: 'Internal error calculating recommendation'
      },
      labels: {
        fixedPct: 'Fixed %',
        dynamicATR: 'Dynamic ATR',
        support: 'Support',
        resistance: 'Resistance',
        atrDetected: 'Stop Loss at 1.5x ATR (${atr})',
        supportDetected: 'Support detected at ${price}',
        resistanceDetected: 'Resistance detected at ${price}',
        bollingerUpper: 'Upper Bollinger',
        bollingerLower: 'Lower Bollinger',
        riskReward: 'R/R 1:{ratio}'
      },
      warnings: {
        tightSL: 'Very tight stop loss. High probability of activation due to market noise.',
        wideSL: 'Very wide stop loss. The resulting position size will be very small.',
        lowQuality: 'Low quality trade: Target Risk/Reward ratio is less than 1.5.',
        veryTightSL: 'Stop Loss is too tight (< 0.5x ATR). High probability of premature activation.',
        lowVol: 'Current volatility (ATR) is very low. The market might be in a range-bound state.',
        insufficientCapital: 'Position size exceeds available capital. Consider reducing risk or increasing stop loss.',
        tpBelowLong: 'TP ({label}) is below entry price for long. It is discarded.',
        tpAboveShort: 'TP ({label}) is above entry price for short. It is discarded.',
        noValidTP: 'No valid TP levels meet the trade direction.',
        noATRTP: 'Insufficient Bollinger data for this TP calculation.',
        noSupportTP: 'No supports below to use as TP. Use another additional method.',
        noResisTP: 'No resistances above to use as TP. Use another additional method.'
      },
      reasoning: {
        base: 'Calculated confidence ({confidence}%). ',
        high: 'There is good confluence between technical trend and chosen trade direction, supported by adequate volatility.',
        low: 'Caution: The technical outlook strongly conflicts with the chosen direction, or current market volatility does not justify the risk.',
        mixed: 'The technical outlook is mixed or neutral for this direction; strict management of Stop Loss level is recommended.'
      }
    }
  }
};

export const getLanguage = (acceptLanguage?: string): Language => {
  if (!acceptLanguage) {
    // If no header, check localStorage from user session
    return 'es';
  }
  const lang = acceptLanguage.toLowerCase();
  // Parse quality values and get the most preferred language
  const languages = lang.split(',').map(l => {
    const [lang, q] = l.split(';');
    const quality = q ? parseFloat(q.replace('q=', '')) : 1;
    return { lang: lang.trim(), quality };
  }).sort((a, b) => b.quality - a.quality);
  
  for (const { lang } of languages) {
    if (lang.includes('de')) return 'de';
    if (lang.includes('fr')) return 'fr';
    if (lang.includes('en')) return 'en';
    if (lang.includes('es')) return 'es';
  }
  return 'es';
};
