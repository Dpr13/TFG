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
      etf_horizon: 'ETF de la gestora {family}. El análisis se centra en la eficiencia de costes (TER), solidez de activos (AUM) y consistencia histórica.',
      templates: {
        stability_beta: 'Beta de {beta} ({benchmark}). El activo cotiza en un rango de {currency}{low} - {currency}{high}. El momentum de corto plazo es el factor dominante.',
        stability_mkt_cap: 'Capitalización de mercado de {cap}. Indica madurez y resistencia estructural ante ciclos largos.',
        stability_crypto_cycle: 'Cotizando al {pos}% del rango anual ({low} - {high}). {note}',
        pos_high_note: 'Cerca de máximos anuales, sugiriendo cautela por posible agotamiento del movimiento.',
        pos_low_note: 'Cerca de mínimos anuales, lo que podría representar una zona de acumulación histórica.',
        pos_neutral_note: 'En zona neutral de ciclo intermedio.',
        stability_insufficient: 'Datos de rango histórico insuficientes para determinar la fase del ciclo actual con precisión.',
        stability_etf_beta: 'Beta a 3 años de {beta}. {note}',
        beta_low_note: 'Menor volatilidad que su benchmark.',
        beta_high_note: 'Activo con volatilidad superior al mercado.',
        growth_eps_pos: 'Beneficio por acción positivo de {currency}{eps}. El mercado reacciona favorablemente a la rentabilidad inmediata.',
        growth_eps_neg: 'Ausencia de beneficios recientes ({currency}{eps}), lo que genera presión bajista en el corto plazo.',
        growth_peg: 'PEG Ratio de {peg}. Indica si el crecimiento proyectado justifica el múltiplo pagado.',
        growth_lt_peg: 'Ratio PEG de {peg}. Refleja la capacidad estructural de crecer por encima del mercado.',
        growth_not_avail: 'Datos de crecimiento no disponibles para este activo en las fuentes consultadas.',
        growth_etf_aum: 'AUM de {aum}. TER (Gastos totales): {ter}%. {note}',
        ter_low_note: 'Ratio de gastos muy eficiente para el inversor.',
        ter_high_note: 'Se recomienda vigilar el impacto de las comisiones en el largo plazo.',
        profitability_margins: 'Margen neto del {margin}% y ROE del {roe}%. Estos datos confirman la eficiencia operativa actual.',
        profitability_op_margin: 'Margen operativo del {margin}%. Refleja la capacidad de convertir ingresos en beneficio bruto sostenido.',
        profitability_lt_roe: 'ROE sostenible del {roe}%. El ROE es el motor principal de creación de valor a una década vista.',
        profitability_crypto_liq: 'Volumen de negociación en 24h de {vol}. Representa un {pct}% de su capitalización total. {note}',
        liq_high_note: 'Alta liquidez y rotación, ideal para operativa activa.',
        liq_mod_note: 'Nivel de actividad moderado.',
        liq_val_note: 'El volumen transaccionado es un indicador vital de la vigencia y adopción del protocolo por parte de los usuarios.',
        profitability_etf_return: 'Retorno medio a 5 años: {return5}% (YTD: {ytd}%). {note}',
        ret_long_note: 'La consistencia a largo plazo es el factor determinante.',
        ret_short_note: 'El rendimiento YTD marca el momentum actual del fondo.',
        valuation_pe: 'P/E Ratio actual de {pe}. En el corto plazo, el mercado valida múltiplos comparativos.',
        valuation_pe_mid: 'Ratio P/E actual de {pe}. Valoración moderada en contexto de ciclo. Se prioriza el crecimiento vs múltiplos estáticos.',
        valuation_div: 'Rentabilidad por dividendo del {yield}%. Factor clave en el retorno total a largo plazo.',
        valuation_crypto_issuance: 'Capitalización de mercado de {cap}. {note}',
        issuance_complete: 'Emisión completada al {pct}% del total máximo previsto ({max} unidades).',
        issuance_circulating: 'Oferta circulante actual de {circ}. No existe un límite máximo definido en protocolo, lo que implica un factor de vigilancia sobre la inflación del activo.',
        issuance_not_avail: 'Datos de suministro circulante no disponibles. El tamaño del mercado indica la relevancia del proyecto en el ecosistema DeFi/Crypto.',
        valuation_etf_pe: 'P/E ponderado: {pe}. Rentabilidad por dividendo: {yield}%. {note}',
        div_dist: 'ETF de distribución.',
        div_acc: 'Probablemente de acumulación.',
        summary_template: '**Perspectiva a {range}: {outlook}** (puntuación {score}/100). En este horizonte, el análisis se ha centrado en los factores determinantes para el éxito a {range}.',
        overview_template: '{symbol} analizado bajo el prisma de un horizonte de {range}.',
        overview_crypto_generic: '{symbol} analizado en base a su capitalización de mercado y métricas de red disponibles.',
        risks_crypto: 'Riesgos regulatorios, de custodia (claves privadas), de concentración de ballenas y de alta volatilidad intrínseca. Se recomienda considerar la correlación con Bitcoin y el sentimiento general del mercado.',
        risks_etf: 'Tracking error, riesgo de contrapartida (si es sintético), riesgo de cierre (AUM bajo) y concentración sectorial.'
      }
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
      etf_horizon: 'ETF from manager {family}. The analysis focuses on cost efficiency (TER), asset solidity (AUM), and historical consistency.',
      templates: {
        stability_beta: 'Beta of {beta} ({benchmark}). The asset trades in a range of {currency}{low} - {currency}{high}. Short-term momentum is the dominant factor.',
        stability_mkt_cap: 'Market capitalization of {cap}. Indicates maturity and structural resilience across long cycles.',
        stability_crypto_cycle: 'Trading at {pos}% of the annual range ({low} - {high}). {note}',
        pos_high_note: 'Near annual highs, suggesting caution due to potential movement exhaustion.',
        pos_low_note: 'Near annual lows, which could represent a historical accumulation zone.',
        pos_neutral_note: 'In neutral intermediate cycle zone.',
        stability_insufficient: 'Insufficient historical range data to accurately determine current cycle phase.',
        stability_etf_beta: '3-year Beta of {beta}. {note}',
        beta_low_note: 'Lower volatility than its benchmark.',
        beta_high_note: 'Asset with volatility higher than the market.',
        growth_eps_pos: 'Positive earnings per share of {currency}{eps}. The market reacts favorably to immediate profitability.',
        growth_eps_neg: 'Lack of recent earnings ({currency}{eps}), creating bearish pressure in the short term.',
        growth_peg: 'PEG Ratio of {peg}. Indicates whether projected growth justifies the paid multiple.',
        growth_lt_peg: 'PEG Ratio of {peg}. Reflects the structural ability to grow above the market.',
        growth_not_avail: 'Growth data not available for this asset in accessed sources.',
        growth_etf_aum: 'AUM of {aum}. TER (Total Expenses): {ter}%. {note}',
        ter_low_note: 'Very efficient expense ratio for the investor.',
        ter_high_note: 'Monitoring the impact of fees over the long term is recommended.',
        profitability_margins: 'Net margin of {margin}% and ROE of {roe}%. These figures confirm current operating efficiency.',
        profitability_op_margin: 'Operating margin of {margin}%. Reflects the ability to convert revenue into sustained gross profit.',
        profitability_lt_roe: 'Sustainable ROE of {roe}%. ROE is the main engine of value creation over a decade.',
        profitability_crypto_liq: '24h trading volume of {vol}. Represents {pct}% of its total capitalization. {note}',
        liq_high_note: 'High liquidity and turnover, ideal for active operations.',
        liq_mod_note: 'Moderate activity level.',
        liq_val_note: 'Transacted volume is a vital indicator of protocol validity and user adoption.',
        profitability_etf_return: '5-year average return: {return5}% (YTD: {ytd}%). {note}',
        ret_long_note: 'Long-term consistency is the determining factor.',
        ret_short_note: 'YTD performance marks the current fund momentum.',
        valuation_pe: 'Current P/E Ratio of {pe}. In the short term, the market validates comparative multiples.',
        valuation_pe_mid: 'Current P/E Ratio of {pe}. Moderate valuation in a cycle context. Growth is prioritized vs static multiples.',
        valuation_div: 'Dividend yield of {yield}%. Key factor in total return over the long term.',
        valuation_crypto_issuance: 'Market capitalization of {cap}. {note}',
        issuance_complete: 'Issuance completed at {pct}% of the total maximum predicted ({max} units).',
        issuance_circulating: 'Current circulating supply of {circ}. There is no maximum limit defined in the protocol, implying a monitoring factor on asset inflation.',
        issuance_not_avail: 'Circulating supply data not available. Market size indicates project relevance in the DeFi/Crypto ecosystem.',
        valuation_etf_pe: 'Weighted P/E: {pe}. Dividend yield: {yield}%. {note}',
        div_dist: 'Distribution ETF.',
        div_acc: 'Probably an accumulation fund.',
        summary_template: '**Outlook for {range}: {outlook}** (score {score}/100). In this horizon, the analysis has focused on the determining factors for success over {range}.',
        overview_template: '{symbol} analyzed under the lens of a {range} horizon.',
        overview_crypto_generic: '{symbol} analyzed based on market capitalization and available network metrics.',
        risks_crypto: 'Regulatory risks, custody risks (private keys), whale concentration, and high intrinsic volatility. Consideration of correlation with Bitcoin and general market sentiment is recommended.',
        risks_etf: 'Tracking error, counterparty risk (if synthetic), closure risk (low AUM), and sector concentration.'
      }
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
  },
  de: {
    signals: {
      'COMPRA FUERTE': 'STARKER KAUF',
      'COMPRA': 'KAUFEN',
      'NEUTRAL': 'NEUTRAL',
      'VENTA': 'VERKAUFEN',
      'VENTA FUERTE': 'STARKER VERKAUF',
    },
    indicators: {
      rsi: 'RSI',
      macd: 'MACD',
      bollinger: 'Bollinger-Bänder',
      movingAverages: 'Gleitende Durchschnitte',
      obv: 'OBV',
    },
    details: {
      macd_gt_signal: 'MACD > Signal',
      macd_lt_signal: 'MACD < Signal',
      hist_pos_inc: 'Positives und steigendes Histogramm',
      hist_pos_dec: 'Positives, aber fallendes Histogramm',
      hist_neg: 'Negatives Histogramm',
      bb_upper: 'Preis über dem oberen Band',
      bb_lower: 'Preis unter dem unteren Band',
      bb_inside: 'Preis innerhalb der Bänder',
      obv_trend_up: 'OBV im Aufwärtstrend',
      obv_trend_side: 'Seitlicher OBV',
      obv_trend_down: 'OBV im Abwärtstrend',
      price_gt_sma200: 'Preis > SMA200',
      price_lt_sma200: 'Preis < SMA200',
      price_gt_sma50: 'Preis > SMA50',
      price_lt_sma50: 'Preis < SMA50',
      golden_cross: 'SMA50 > SMA200 (Golden Cross)',
      death_cross: 'SMA50 < SMA200 (Death Cross)',
      rsi_bullish: 'bullish momentum without overbought',
      rsi_neutral: 'neutral-bullish',
      rsi_weak: 'weakening',
      rsi_overbought: 'overbought',
      rsi_oversold: 'oversold',
    },
    explanation: {
      top_contributor: '{name} ist der günstigste Indikator.',
      weakness: '{name} zeigt Schwäche: {detail}.',
      converge_pos: 'Technische Indikatoren konvergieren zu einem positiven Signal.',
      mixed_signal: 'Das technische Signal ist gemischt.',
      caution: 'Technische Indikatoren raten zur Vorsicht.',
    },
    fundamental: {
      sections: {
        stability: 'Dynamik & Volatilität',
        growth: 'Aktuelle Ergebnisse',
        profitability: 'Aktuelle Rentabilität',
        valuation: 'Unmittelbare Bewertung',
        overview: 'Aktuelle Performance',
        risks: 'Wichtigste Risiken',
        summary: 'Executive Summary',
        horizon: 'Logik des Zeithorizonts'
      },
      outlooks: {
        STRONG: 'Stark',
        MODERATE: 'Mittel',
        WEAK: 'Schwach'
      },
      ranges: {
        '6mo': '6 Monate',
        '1y': '1 Jahr',
        '3y': '3 Jahre',
        '5y': '5 Jahre',
        '10y': '10 Jahre'
      },
      benchmarks: {
        sp500: 'vs S&P 500',
        ibex35: 'vs IBEX 35',
        ftse100: 'vs FTSE 100',
        cac40: 'vs CAC 40',
        dax: 'vs DAX',
        none: 'Benchmark nicht angegeben'
      },
      stock_horizons: {
        short: 'Kurzfristige Analyse: Priorisiert Momentum, Quartalsergebnisse und Volatilität. ROE und strukturelle Margen werden als sekundäre Faktoren betrachtet.',
        mid: 'Mittelfristige Analyse: Konzentriert sich auf das Gleichgewicht zwischen Bewertung und Wachstum (PEG). Die tägliche Volatilität wird ignoriert, um sich auf die operative Ausführung und die Margen zu konzentrieren.',
        long: 'Langfristige Analyse: Exklusiver Fokus auf Kapitaleffizienz (ROE) und Wettbewerbsvorteile. Volatilität und kurzfristige Nachrichten gelten als irrelevantes Rauschen.'
      },
      crypto_horizon: 'Krypto-Analyse: Fokus auf Netzwerkmetriken (Angebot), Marktliquidität und Positionierung im Jahreszyklus.',
      etf_horizon: 'ETF der Fondsgesellschaft {family}. Die Analyse konzentriert sich auf Kosteneffizienz (TER), Beständigkeit der Vermögenswerte (AUM) und historische Konsistenz.',
      templates: {
        stability_beta: 'Beta von {beta} ({benchmark}). Der Vermögenswert wird in einem Bereich von {currency}{low} - {currency}{high} gehandelt. Das kurzfristige Momentum ist der dominierende Faktor.',
        stability_mkt_cap: 'Marktkapitalisierung von {cap}. Zeigt Reife und strukturelle Widerstandsfähigkeit über lange Zyklen an.',
        stability_crypto_cycle: 'Handel bei {pos}% der jährlichen Spanne ({low} - {high}). {note}',
        pos_high_note: 'In der Nähe der Jahreshochs, was zur Vorsicht wegen möglicher Erschöpfung der Bewegung mahnt.',
        pos_low_note: 'In der Nähe der Jahrestiefs, was eine historische Akkumulationszone darstellen könnte.',
        pos_neutral_note: 'In einer neutralen Zwischenzykluszone.',
        stability_insufficient: 'Unzureichende historische Bereichsdaten, um die aktuelle Zyklusphase genau zu bestimmen.',
        stability_etf_beta: '3-Jahres-Beta von {beta}. {note}',
        beta_low_note: 'Geringere Volatilität als sein Benchmark.',
        beta_high_note: 'Vermögenswert mit einer Volatilität, die über der des Marktes liegt.',
        growth_eps_pos: 'Positiver Gewinn je Aktie von {currency}{eps}. Der Markt reagiert positiv auf die unmittelbare Rentabilität.',
        growth_eps_neg: 'Fehlende jüngste Gewinne ({currency}{eps}), was kurzfristig rückläufigen Druck erzeugt.',
        growth_peg: 'PEG-Verhältnis von {peg}. Gibt an, ob das prognostizierte Wachstum das gezahlte Multiple rechtfertigt.',
        growth_lt_peg: 'PEG-Verhältnis von {peg}. Spiegelt die strukturelle Fähigkeit wider, über dem Markt zu wachsen.',
        growth_not_avail: 'Wachstumsdaten für dieses Asset in den aufgerufenen Quellen nicht verfügbar.',
        growth_etf_aum: 'AUM von {aum}. TER (Gesamtkostenquote): {ter}%. {note}',
        ter_low_note: 'Sehr effiziente Kostenquote für den Anleger.',
        ter_high_note: 'Es wird empfohlen, die Auswirkungen der Gebühren langfristig zu überwachen.',
        profitability_margins: 'Nettomarge von {margin}% und ROE von {roe}%. Diese Zahlen bestätigen die aktuelle operative Effizienz.',
        profitability_op_margin: 'Operative Marge von {margin}%. Spiegelt die Fähigkeit wider, Einnahmen in nachhaltigen Bruttogewinn umzuwandeln.',
        profitability_lt_roe: 'Nachhaltiger ROE von {roe}%. Der ROE ist der Hauptmotor für die Wertschöpfung über ein Jahrzehnt.',
        profitability_crypto_liq: '24-Stunden-Handelsvolumen von {vol}. Repräsentiert {pct}% seiner Gesamtkapitalisierung. {note}',
        liq_high_note: 'Hohe Liquidität und Umschlagshäufigkeit, ideal für aktive Operationen.',
        liq_mod_note: 'Moderates Aktivitätsniveau.',
        liq_val_note: 'Das Transaktionsvolumen ist ein entscheidender Indikator für die Gültigkeit des Protokolls und die Benutzerakzeptanz.',
        profitability_etf_return: 'Durchschnittliche 5-Jahres-Rendite: {return5}% (YTD: {ytd}%). {note}',
        ret_long_note: 'Langfristige Konsistenz ist der entscheidende Faktor.',
        ret_short_note: 'Die YTD-Performance kennzeichnet das aktuelle Fonds-Momentum.',
        valuation_pe: 'Aktuelles KGV von {pe}. Kurzfristig validiert der Markt vergleichende Multiplikatoren.',
        valuation_pe_mid: 'Aktuelles KGV von {pe}. Moderate Bewertung im Kontext eines Zyklus. Wachstum wird gegenüber statischen Multiplikatoren priorisiert.',
        valuation_div: 'Dividendenrendite von {yield}%. Schlüsselfaktor für die Gesamtrendite auf lange Sicht.',
        valuation_crypto_issuance: 'Marktkapitalisierung von {cap}. {note}',
        issuance_complete: 'Emission bei {pct}% des prognostizierten Gesamtmaximums abgeschlossen ({max} Einheiten).',
        issuance_circulating: 'Aktuelles zirkulierendes Angebot von {circ}. Es gibt keine im Protokoll definierte Höchstgrenze, was einen Überwachungsfaktor für die Asset-Inflation impliziert.',
        issuance_not_avail: 'Daten zum zirkulierenden Angebot nicht verfügbar. Die Marktgröße zeigt die Relevanz des Projekts im DeFi/Krypto-Ökosystem an.',
        valuation_etf_pe: 'Gewichtetes KGV: {pe}. Dividendenrendite: {yield}%. {note}',
        div_dist: 'Ausschüttender ETF.',
        div_acc: 'Wahrscheinlich ein Akkumulationsfonds.',
        summary_template: '**Ausblick für {range}: {outlook}** (Punktzahl {score}/100). In diesem Horizont hat sich die Analyse auf die entscheidenden Faktoren für den Erfolg über {range} konzentriert.',
        overview_template: '{symbol} analysiert unter dem Prisma eines {range}-Horizonts.',
        overview_crypto_generic: '{symbol} analysiert basierend auf Marktkapitalisierung und verfügbaren Netzwerkmetriken.',
        risks_crypto: 'Regulatorische Risiken, Verwahrrisiken (private Schlüssel), Walkonzentration und hohe intrinsische Volatilität. Die Berücksichtigung der Korrelation mit Bitcoin und der allgemeinen Marktstimmung wird empfohlen.',
        risks_etf: 'Tracking Error, Kontrahentenrisiko (falls synthetisch), Schließungsrisiko (niedriges AUM) und Sektorkonzentration.'
      }
    },
    risk: {
      errors: {
        symbolRequired: 'Symbol ist erforderlich',
        insufficientData: 'Unzureichende Daten',
        assetNotFound: 'Asset nicht gefunden',
        failedCalculation: 'Berechnung fehlgeschlagen'
      }
    },
    comparison: {
      errors: {
        selectCount: 'Wählen Sie zwischen 2 und 3 Assets.',
        selectValid: 'Wählen Sie mindestens 2 gültige Assets.',
        internal: 'Interner Fehler.',
        minTwo: 'Mindestens 2 Assets erforderlich.',
        aiUnavailable: 'KI-Dienst nicht verfügbar.'
      }
    },
    recommendation: {
      errors: {
        symbolRequired: 'Symbol ist erforderlich',
        invalidDirection: 'Richtung muss LONG oder SHORT sein',
        invalidSLMethod: 'Ungültige Stop-Loss-Methode',
        tpMethodRequired: 'Mindestens eine Take-Profit-Methode erforderlich',
        invalidCapital: 'Kapital muss > 0 sein',
        invalidRisk: 'Risikoprozentsatz muss zwischen 0,1 und 100 liegen',
        noData: 'Keine Daten gefunden.',
        failedATR: 'ATR konnte nicht ermittelt werden.',
        noSupport: 'Keine Unterstützung gefunden.',
        noResistance: 'Keine Widerstände gefunden.',
        slAboveLong: 'Stop-Loss muss für Long unter dem Einstiegspreis liegen.',
        slBelowShort: 'Stop-Loss muss für Short über dem Einstiegspreis liegen.',
        internal: 'Interner Fehler'
      },
      labels: {
        fixedPct: 'Fixes %',
        dynamicATR: 'Dynamischer ATR',
        support: 'Support',
        resistance: 'Resistance',
        atrDetected: 'Stop Loss bei 1.5x ATR (${atr})',
        supportDetected: 'Support bei ${price}',
        resistanceDetected: 'Widerstand bei ${price}',
        bollingerUpper: 'Oberes Bollinger',
        bollingerLower: 'Unteres Bollinger',
        riskReward: 'R/R 1:{ratio}'
      },
      warnings: {
        tightSL: 'Sehr enger Stop Loss.',
        wideSL: 'Sehr weiter Stop Loss.',
        lowQuality: 'Geringe Qualität.',
        veryTightSL: 'Stop Loss ist zu eng.',
        lowVol: 'Aktuelle Volatilität ist sehr gering.',
        insufficientCapital: 'Nicht genügend Kapital.',
        tpBelowLong: 'TP unter Einstiegspreis.',
        tpAboveShort: 'TP über Einstiegspreis.',
        noValidTP: 'Kein gültiger TP.',
        noATRTP: 'Unzureichende Daten für TP.',
        noSupportTP: 'Kein Support für TP.',
        noResisTP: 'Kein Widerstand für TP.'
      },
      reasoning: {
        base: 'Berechnetes Vertrauen ({confidence}%). ',
        high: 'Gute Konfluenz.',
        low: 'Vorsicht.',
        mixed: 'Gemischter Ausblick.'
      }
    }
  },
  fr: {
    signals: {
      'COMPRA FUERTE': 'ACHAT FORT',
      'COMPRA': 'ACHETER',
      'NEUTRAL': 'NEUTRE',
      'VENTA': 'VENDRE',
      'VENTA FUERTE': 'VENTE FORTE',
    },
    indicators: {
      rsi: 'RSI',
      macd: 'MACD',
      bollinger: 'Bandes de Bollinger',
      movingAverages: 'Moyennes Mobiles',
      obv: 'OBV',
    },
    details: {
      macd_gt_signal: 'MACD > Signal',
      macd_lt_signal: 'MACD < Signal',
      hist_pos_inc: 'Histogramme positif et croissant',
      hist_pos_dec: 'Histogramme positif mais décroissant',
      hist_neg: 'Histogramme négatif',
      bb_upper: 'Prix au-dessus de la bande supérieure',
      bb_lower: 'Prix en dessous de la bande inférieure',
      bb_inside: 'Prix à l\'intérieur des bandes',
      obv_trend_up: 'OBV en tendance haussière',
      obv_trend_side: 'OBV latéral',
      obv_trend_down: 'OBV en tendance baissière',
      price_gt_sma200: 'Prix > SMA200',
      price_lt_sma200: 'Prix < SMA200',
      price_gt_sma50: 'Prix > SMA50',
      price_lt_sma50: 'Prix < SMA50',
      golden_cross: 'SMA50 > SMA200 (Golden Cross)',
      death_cross: 'SMA50 < SMA200 (Death Cross)',
      rsi_bullish: 'momentum haussier sans surachat',
      rsi_neutral: 'neutre-haussier',
      rsi_weak: 'affaiblissement',
      rsi_overbought: 'surachat',
      rsi_oversold: 'survente',
    },
    explanation: {
      top_contributor: '{name} est l\'indicateur le plus favorable.',
      weakness: '{name} montre une faiblesse : {detail}.',
      converge_pos: 'Les indicateurs techniques convergent vers un signal positif.',
      mixed_signal: 'Le signal technique est mixte.',
      caution: 'Les indicateurs techniques suggèrent la prudence.',
    },
    fundamental: {
      sections: {
        stability: 'Dynamique & Volatilité',
        growth: 'Résultats Récents',
        profitability: 'Rentabilité Récente',
        valuation: 'Valorisation Immédiate',
        overview: 'Performance Récente',
        risks: 'Risques Clés',
        summary: 'Résumé Exécutif',
        horizon: 'Logique de l\'Horizon Temporel'
      },
      outlooks: {
        STRONG: 'Fort',
        MODERATE: 'Modéré',
        WEAK: 'Faible'
      },
      ranges: {
        '6mo': '6 mois',
        '1y': '1 an',
        '3y': '3 ans',
        '5y': '5 ans',
        '10y': '10 ans'
      },
      benchmarks: {
        sp500: 'vs S&P 500',
        ibex35: 'vs IBEX 35',
        ftse100: 'vs FTSE 100',
        cac40: 'vs CAC 40',
        dax: 'vs DAX',
        none: 'benchmark non spécifié'
      },
      stock_horizons: {
        short: 'Analyse à Court Terme : Donnez la priorité au momentum, aux résultats trimestriels et à la volatilité. Le ROE et les marges structurelles sont considérés comme des facteurs secondaires.',
        mid: 'Analyse à Moyen Terme : Se concentre sur l\'équilibre entre valorisation et croissance (PEG). La volatilité quotidienne est ignorée pour se concentrer sur l\'exécution opérationnelle et les marges.',
        long: 'Analyse à Long Terme : Focus exclusif sur l\'efficacité du capital (ROE) et l\'avantage concurrentiel. La volatilité et les nouvelles à court terme sont considérées comme du bruit non pertinent.'
      },
      crypto_horizon: 'Analyse Crypto : Focus sur les métriques de réseau (offre), liquidité du marché et positionnement dans le cycle annuel.',
      etf_horizon: 'ETF de la société de gestion {family}. L\'analyse se concentre sur l\'efficacité des coûts (TER), la solidité des actifs (AUM) et la cohérence historique.',
      templates: {
        stability_beta: 'Bêta de {beta} ({benchmark}). L\'actif se négocie dans une fourchette de {currency}{low} - {currency}{high}. Le momentum à court terme est le facteur dominant.',
        stability_mkt_cap: 'Capitalisation boursière de {cap}. Indique la maturité et la résilience structurelle sur de longs cycles.',
        stability_crypto_cycle: 'Se négocie à {pos}% de la fourchette annuelle ({low} - {high}). {note}',
        pos_high_note: 'Proche des plus hauts annuels, suggérant la prudence en raison d\'un épuisement potentiel du mouvement.',
        pos_low_note: 'Proche des plus bas annuels, ce qui pourrait représenter une zone d\'accumulation historique.',
        pos_neutral_note: 'Dans une zone de cycle intermédiaire neutre.',
        stability_insufficient: 'Données de fourchette historique insuffisantes pour déterminer avec précision la phase actuelle du cycle.',
        stability_etf_beta: 'Bêta à 3 ans de {beta}. {note}',
        beta_low_note: 'Volatilité plus faible que son indice de référence.',
        beta_high_note: 'Actif avec une volatilité supérieure au marché.',
        growth_eps_pos: 'Bénéfice par action positif de {currency}{eps}. Le marché réagit favorablement à la rentabilité immédiate.',
        growth_eps_neg: 'Absence de bénéfices récents ({currency}{eps}), créant une pression baissière à court terme.',
        growth_peg: 'Ratio PEG de {peg}. Indique si la croissance projetée justifie le multiple payé.',
        growth_lt_peg: 'Ratio PEG de {peg}. Reflète la capacité structurelle à croître au-dessus du marché.',
        growth_not_avail: 'Données de croissance non disponibles pour cet actif dans les sources consultées.',
        growth_etf_aum: 'AUM de {aum}. TER (Gastos totales): {ter}%. {note}',
        ter_low_note: 'Ratio de frais très efficace pour l\'investisseur.',
        ter_high_note: 'Il est recommandé de surveiller l\'impact des frais sur le long terme.',
        profitability_margins: 'Marge nette de {margin}% et ROE de {roe}%. Ces chiffres confirment l\'efficacité opérationnelle actuelle.',
        profitability_op_margin: 'Marge opérationnelle de {margin}%. Reflète la capacité à convertir les revenus en bénéfice brut soutenu.',
        profitability_lt_roe: 'ROE durable de {roe}%. Le ROE est le principal moteur de création de valeur sur une décennie.',
        profitability_crypto_liq: 'Volume de transactions sur 24h de {vol}. Représente {pct}% de sa capitalisation totale. {note}',
        liq_high_note: 'Liquidité et rotation élevées, idéal pour les opérations actives.',
        liq_mod_note: 'Niveau d\'activité modéré.',
        liq_val_note: 'Le volume transigé est un indicateur vital de la validité du protocole et de l\'adoption par les utilisateurs.',
        profitability_etf_return: 'Rendement moyen sur 5 ans : {return5}% (YTD : {ytd}%). {note}',
        ret_long_note: 'La cohérence à long terme est le facteur déterminant.',
        ret_short_note: 'La performance YTD marque le momentum actuel du fonds.',
        valuation_pe: 'Ratio P/E actuel de {pe}. À court terme, le marché valide les multiples comparatifs.',
        valuation_pe_mid: 'Ratio P/E actuel de {pe}. Valorisation modérée dans un contexte de cycle. La croissance est priorisée par rapport aux multiples statiques.',
        valuation_div: 'Rendement du dividende de {yield}%. Facteur clé du rendement total à long terme.',
        valuation_crypto_issuance: 'Capitalisation boursière de {cap}. {note}',
        issuance_complete: 'Émission complétée à {pct}% du maximum total prévu ({max} unités).',
        issuance_circulating: 'Offre circulante actuelle de {circ}. Il n\'y a pas de limite maximale définie dans le protocole, ce qui implique un facteur de surveillance sur l\'inflation de l\'actif.',
        issuance_not_avail: 'Données sur l\'offre circulante non disponibles. La taille du marché indique la pertinence du projet dans l\'écosystème DeFi/Crypto.',
        valuation_etf_pe: 'P/E pondéré : {pe}. Rendement du dividende : {yield}%. {note}',
        div_dist: 'ETF de distribution.',
        div_acc: 'Probablement un fonds d\'accumulation.',
        summary_template: '**Perspectives pour {range} : {outlook}** (score {score}/100). Sur cet horizon, l\'analyse s\'est concentrée sur les facteurs déterminants pour le succès sur {range}.',
        overview_template: '{symbol} analysé sous le prisme d\'un horizon de {range}.',
        overview_crypto_generic: '{symbol} analysé sur la base de la capitalisation boursière et des métriques de réseau disponibles.',
        risks_crypto: 'Risques réglementaires, risques de conservation (clés privées), concentration des baleines et volatilité intrinsèque élevée. La prise en compte de la corrélation avec le Bitcoin et du sentiment général du marché est recommandée.',
        risks_etf: 'Erreur de suivi, risque de contrepartie (si synthétique), risque de clôture (faible AUM) et concentration sectorielle.'
      }
    },
    risk: {
      errors: {
        symbolRequired: 'Symbole requis',
        insufficientData: 'Données insuffisantes',
        assetNotFound: 'Actif non trouvé',
        failedCalculation: 'Échec du calcul'
      }
    },
    comparison: {
      errors: {
        selectCount: 'Sélectionnez entre 2 et 3 actifs.',
        selectValid: 'Sélectionnez au plus 2 actifs valides.',
        internal: 'Erreur interne.',
        minTwo: 'Au moins 2 actifs sont requis.',
        aiUnavailable: 'Service IA indisponible.'
      }
    },
    recommendation: {
      errors: {
        symbolRequired: 'Symbole requis',
        invalidDirection: 'La direction doit être LONG ou SHORT',
        invalidSLMethod: 'Méthode Stop Loss invalide',
        tpMethodRequired: 'Au moins une méthode Take Profit requise',
        invalidCapital: 'Le capital doit être > 0',
        invalidRisk: 'Le pourcentage de risque doit être entre 0,1 et 100',
        noData: 'Aucune donnée trouvée.',
        failedATR: 'Impossible d\'obtenir l\'ATR.',
        noSupport: 'Aucun support détecté.',
        noResistance: 'Aucune résistance détectée.',
        slAboveLong: 'Stop loss doit être en dessous du prix pour long.',
        slBelowShort: 'Stop loss doit être au-dessus du prix pour short.',
        internal: 'Erreur interne'
      },
      labels: {
        fixedPct: 'Fixe %',
        dynamicATR: 'ATR dynamique',
        support: 'Support',
        resistance: 'Resistance',
        atrDetected: 'Stop Loss à 1.5x ATR (${atr})',
        supportDetected: 'Support à ${price}',
        resistanceDetected: 'Résistance à ${price}',
        bollingerUpper: 'Bollinger supérieure',
        bollingerLower: 'Bollinger inférieure',
        riskReward: 'R/R 1:{ratio}'
      },
      warnings: {
        tightSL: 'Stop loss très serré.',
        wideSL: 'Stop loss très large.',
        lowQuality: 'Faible qualité.',
        veryTightSL: 'Stop loss trop serré.',
        lowVol: 'Volatilité actuelle est très faible.',
        insufficientCapital: 'Capital insuffisant.',
        tpBelowLong: 'TP en dessous du prix d\'entrée.',
        tpAboveShort: 'TP au-dessus du prix d\'entrée.',
        noValidTP: 'Aucun TP valide.',
        noATRTP: 'Données insuffisantes pour TP.',
        noSupportTP: 'Aucun support pour TP.',
        noResisTP: 'Aucune résistance pour TP.'
      },
      reasoning: {
        base: 'Confiance calculée ({confidence}%). ',
        high: 'Bonne confluence.',
        low: 'Prudence.',
        mixed: 'Perspectives mixtes.'
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
    if (lang.includes('en')) return 'en';
    if (lang.includes('es')) return 'es';
    if (lang.includes('de')) return 'de';
    if (lang.includes('fr')) return 'fr';
  }
  return 'es';
};
