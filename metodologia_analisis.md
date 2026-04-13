# Metodología de Análisis de Riesgos y Activos

Este documento detalla la lógica interna, el propósito y la formulación matemática de los tres pilares de análisis integrados en la plataforma, así como el funcionamiento del sistema de puntuación general.

---

## 1. Análisis Cuantitativo (Riesgo Estadístico)

Este análisis es puramente matemático y se basa en el histórico de precios del activo. Su objetivo es medir la **estabilidad y el riesgo de pérdida**.

### Métricas Implementadas:
| Métrica | Definición | Relevancia |
| :--- | :--- | :--- |
| **Volatilidad Anualizada** | Desviación estándar de los retornos diarios multiplicada por $\sqrt{252}$ (para anualizar). | Mide cuánto fluctúa el precio. >40% se considera riesgo alto. |
| **Max Drawdown** | La mayor caída porcentual desde un máximo histórico hasta su punto más bajo en el periodo. | Indica el "peor escenario" real que ha sufrido un inversor. |
| **Sharpe Ratio** | (Retorno - Tasa libre de riesgo) / Volatilidad. | Mide si la rentabilidad compensa el riesgo. >1 es bueno, >2 excelente. |
| **Value at Risk (VaR 95%)** | Estimación estadística de la pérdida máxima diaria con un 95% de confianza. | Ayuda a dimensionar el tamaño de la posición y el capital en riesgo. |
| **Calmar Ratio** | Retorno medio anualizado / Max Drawdown. | Evalúa si el beneficio histórico compensa la mayor caída sufrida. |

---

## 2. Análisis Fundamental (Valor e Inercia)

Implementado mediante un motor de reglas en el backend, evalúa la salud financiera del activo con un sistema de **puntuación ponderada (0-100)** que se adapta al horizonte temporal seleccionado.

### Lógica de Ponderación (Ejemplo: Acciones):
- **Corto Plazo (Momemtum):** Prioriza el Momentum (40%) y los Resultados Recientes (30%).
- **Largo Plazo (Calidad):** Prioriza la Calidad estructural / ROE (40%) y el Foso Competitivo (20%).

### Adaptación por Tipo de Activo:
- **Empresas (Stocks):** Evaluación de rentabilidad (ROE), valoración (P/E) y eficiencia operativa.
- **Criptomonedas:** Análisis de métricas de red (Supply circulante vs máximo), liquidez y posición en el ciclo anual.
- **ETFs:** Enfoque en eficiencia de costes (Expense Ratio), activos bajo gestión (AUM) y consistencia del retorno a 5 años.

---

## 3. Análisis Técnico (Momentum de Mercado)

Busca patrones en la acción del precio actual para determinar señales de entrada o salida mediante la confluencia de indicadores.

### Composición de la Señal (Máx. 100 pts):
1.  **Medias Móviles (30 pts):** Comprueba si el precio está sobre las medias estructurales (SMA50/200).
2.  **RSI (20 pts):** Detecta niveles de sobrecompra o sobreventa.
3.  **MACD (20 pts):** Analiza la inercia de la tendencia mediante el cruce de medias rápidas/lentas.
4.  **Bandas de Bollinger (15 pts):** Mide la dispersión del precio respecto a su media.
5.  **OBV (15 pts):** Confirma la señal mediante el flujo de volumen (acumulación vs distribución).

---

## 4. La Puntuación General (Media de Comparativa)

En la herramienta de **Comparativa de Activos**, se genera una puntuación porcentual que sirve de veredicto rápido.

### ¿Qué es una "Victoria Métrica"?
El término se refiere al resultado lógico de comparar un dato entre varios activos. En el código (`ComparePage.tsx`), existen tres funciones principales que determinan estas "victorias":

1.  **Comparativa Directa (`pickWinner`):** Para métricas donde "más es mejor" (como el ROE o Dividendo) o "menos es mejor" (como el P/E o la Volatilidad), el activo con el mejor valor absoluto se lleva la "victoria".
2.  **Rango Objetivo (`rsiWinner`):** En el RSI (14), no gana el más alto ni el más bajo. Se considera una "victoria" si el valor está en la zona de salud (entre 40 y 60), indicando momentum sin sobrecompra.
3.  **Validación Booleana (`boolWinner`):** Se asigna una victoria si se cumple una confluencia técnica, como que el precio actual esté por encima de sus medias móviles (`sobre_sma50`, `sobre_sma200`).

### Cálculo de la Media
$$\text{Media General} = \left( \frac{\text{Victorias Métricas}}{\text{Total Métricas Analizadas}} \right) \times 100$$
- Un activo con un **80%** significa que ha resultado ganador o saludable en 8 de cada 10 comparativas frente a sus rivales.

> [!IMPORTANT]
> Una puntuación del 100% significa que el activo es superior en **todas** las dimensiones analizadas respecto a los otros activos en el horizonte temporal elegido, no que sea una inversión "segura".

---

## 5. Tabla de Equivalencias (Semántica)

Para facilitar la lectura, el sistema traduce los porcentajes numéricos a etiquetas verbales y colores en la interfaz:

| Tipo de Análisis | Rango Score | Etiqueta en UI | Significado Técnico |
| :--- | :--- | :--- | :--- |
| **Fundamental** | 65 - 100 | **Fuerte** | Salud financiera y crecimiento sólidos. |
| | 40 - 64 | **Moderada** | Mix de fortalezas y debilidades. |
| | 0 - 39 | **Débil** | Riesgos fundamentales significativos. |
| **Técnico** | 80 - 100 | **Compra Fuerte** | Confluencia alcista total de indicadores. |
| | 60 - 79 | **Compra** | Momentum alcista predominante. |
| | 40 - 59 | **Neutral** | Lateralidad o falta de tendencia clara. |
| | 20 - 39 | **Venta** | Momentum bajista predominante. |
| | 0 - 19 | **Venta Fuerte** | Confluencia bajista total. |
| **Riesgo (Risk Level)** | Volat < 15% / DD < 10% | **Bajo** | Activo estable con caídas controladas. |
| | Volat < 30% / DD < 25% | **Medio** | Volatilidad típica de mercado. |
| | Volat > 30% / DD > 25% | **Alto** | Activo muy volátil (ej. Cryptos). |

---

## 6. Caso de Estudio: Técnico de TSLA (Puntuación 72/100)

Usando la imagen facilitada, así es como el sistema traduce los datos técnicos a "Victorias":

| Indicador | Resultado TSLA | Valoración para la "Media" | ¿Es Victoria? |
| :--- | :--- | :--- | :--- |
| **RSI (14)** | 61.0 | Rango saludable (momentum sin sobrecompra). | **SÍ** (20/20 pts) |
| **MACD** | Positivo/Creciente | El histograma confirma fuerza alcista. | **SÍ** (20/20 pts) |
| **Volumen/OBV** | Alcista (Acumulación) | El volumen confirma el interés de compra. | **SÍ** (15/15 pts) |
| **Medias Móviles** | Debilidad / Death Cross | Precio < SMA200 y SMA50 < SMA200. | **NO / PARCIAL** (10/30 pts) |
| **Bollinger** | Neutral | Precio dentro de las bandas (sin anomalía). | **NEUTRAL** (7/15 pts) |

---

## 7. Caso de Estudio 2: Fundamental de TSLA (10 años)

En la segunda imagen, TSLA obtiene un **50/100 (Perspectiva Moderada)**. Para un horizonte de 10 años, el sistema prioriza la **eficiencia del capital y la valoración**.

| Métrica | Valor TSLA | Evaluación para "Victoria" | ¿Es Victoria? |
| :--- | :--- | :--- | :--- |
| **P/E Ratio** | 314.43 | Muy elevado (valoración cara). | **NO** (Pierde contra casi cualquier rival) |
| **ROE** | 4.93% | Bajo para una tecnológica a largo plazo. | **NO / NEUTRAL** (Se espera >15%) |
| **Margen Neto** | 4.00% | Ajustado para el sector. | **NEUTRAL** |
| **Beta** | 1.92 | Volatilidad doble que el mercado. | **NO** (En riesgo, se prefiere <1.20) |
| **Market Cap** | 1.27 B | Dominio masivo del mercado. | **SÍ** (Difícil de batir en tamaño) |

---

## 8. Anatomía del Score (Fórmula Exacta)

Para responder por qué es **50** y no 54, el sistema no usa una escala lineal continua, sino un sistema de **"cubetas" o rangos (bins)** con pesos fijos:

### La Fórmula de TSLA (Horizonte 10 años):
$$\text{Score} = (Q \times 0.4) + (M \times 0.2) + (G \times 0.2) + (R \times 0.2)$$

Donde:
1.  **Calidad (Q - 40%):** ROE 4.93% $\to$ Cubeta Baja $\to$ **35 pts**.
2.  **Foso (M - 20%):** Market Cap > 100B $\to$ Cubeta Máxima $\to$ **80 pts**.
3.  **Crecimiento (G - 20%):** Valor base $\to$ **50 pts**.
4.  **Retorno (R - 20%):** Div 0% $\to$ **50 pts**.

**Cálculo:** $14 + 16 + 10 + 10 = \mathbf{50}$.

---

## 9. El Factor Humano: Psicoanálisis

A diferencia de los tres anteriores, el **Psicoanálisis** no analiza el activo, sino al **usuario** (sesgos, over-trading, disciplina emocional).

---

## 10. Desglose Técnico de Puntuaciones (Fundamental)

A continuación se detallan las "cubetas" exactas de puntos que el sistema asigna a cada métrica según los umbrales definidos en el código del servidor (`FundamentalAnalysisService.ts`).

### A. Acciones (Stocks)

| Horizonte | Bloque | Métrica | Umbral $\to$ Puntos | Peso |
| :--- | :--- | :--- | :--- | :--- |
| **Corto Plazo** (<= 1y) | Momentum | Posición 52 sem | >70% $\to$ 80 pts \| <30% $\to$ 30 pts \| Otros $\to$ 50 pts | 40% |
| | Earnings | EPS (TTM) | >0 $\to$ 70 pts \| <=0 $\to$ 20 pts | 30% |
| | Rentabilidad | Margen/ROE | Margen >10% $\to$ 70 pts + (ROE >15% $\to$ +10 pts) | 20% |
| | Valoración | P/E Ratio | <25 $\to$ 70 pts \| >25 $\to$ 30 pts | 10% |
| **Medio Plazo** (3y) | Crecimiento | Ratio PEG | <1.0 $\to$ 85 pts \| <2.0 $\to$ 60 pts \| >2.0 $\to$ 30 pts | 50% |
| | Ejecución | Margen Op. | >20% $\to$ 80 pts \| >10% $\to$ 55 pts \| Otros $\to$ 30 pts | 30% |
| | Valoración | P/E Ratio | <20 $\to$ 75 pts \| >20 $\to$ 45 pts | 20% |
| **Largo Plazo** (5-10y) | Calidad | ROE | >20% $\to$ 90 pts \| >12% $\to$ 65 pts \| Otros $\to$ 35 pts | 40% |
| | Foso | Market Cap | >100B $\to$ 80 pts \| >10B $\to$ 60 pts \| Otros $\to$ 40 pts | 20% |
| | Crecimiento | Ratio PEG | <1.2 $\to$ 75 pts \| Sin dato/Otros $\to$ 50 pts | 20% |
| | Retorno | Div. Yield | >2.0% $\to$ 75 pts \| <2.0% $\to$ 50 pts | 20% |

### B. Criptomonedas (Crypto)

| Bloque (Peso 25% c/u) | Métrica | Umbral $\to$ Puntos |
| :--- | :--- | :--- |
| **Posicionamiento** | Supply Emisión | >90% $\to$ 85 pts \| <90% $\to$ 60 pts \| Sin límite $\to$ 45 pts |
| **Liquidez** | Vol/Cap Ratio | >5.0% $\to$ 80 pts \| >1.0% $\to$ 60 pts \| <1.0% $\to$ 40 pts |
| **Ciclo de Precio** | Posición 52 sem | <25% (Suelo) $\to$ 85 pts \| >75% (Techo) $\to$ 35 pts \| Otros $\to$ 55 pts |
| **Momentum** | Cambio 52 sem | Positivo $\to$ 75 pts \| Negativo $\to$ 30 pts |

### C. Fondos (ETF)

| Bloque | Peso | Métrica | Umbral $\to$ Puntos |
| :--- | :--- | :--- | :--- |
| **Rentabilidad** | 35% | Retorno 5y/3y | >10% $\to$ 85 pts \| >5% $\to$ 65 pts \| <5% $\to$ 40 pts |
| **Eficiencia** | 25% | Gastos (TER) | <0.2% $\to$ 90 pts \| <0.5% $\to$ 70 pts \| >0.5% $\to$ 40 pts |
| **Riesgo** | 20% | Beta (3y) | <1.0 $\to$ 75 pts \| >1.0 $\to$ 45 pts |
| **Valoración** | 20% | Div. Yield | >2.0% $\to$ 80 pts \| <2.0% $\to$ 55 pts |
