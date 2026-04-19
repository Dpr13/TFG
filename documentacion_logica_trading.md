# Documentación Técnica: Lógica de Recomendación Pro

Este documento detalla el funcionamiento interno del sistema avanzado de recomendación de trading implementado, centrándose en el **ATR Dinámico** y el **Motor de Confianza**.

## 1. Stop Loss: ATR Dinámico
A diferencia de un porcentaje fijo, el **ATR (Average True Range)** permite que el Stop Loss se adapte a la "respiración" natural del activo.

### El Cálculo
1. **Detección de Volatilidad:** El sistema calcula el rango verdadero (True Range) de las últimas **14 velas**.
2. **Suavizado de Wilder:** Se aplica una media móvil especializada para evitar picos de volatilidad aleatorios.
3. **Multiplicador de Ruido (1.5x):** 
   - **LONG:** `Entrada - (ATR * 1.5)`
   - **SHORT:** `Entrada + (ATR * 1.5)`

> [!TIP]
> Usamos **1.5x** porque estadísticamente sitúa el Stop Loss justo fuera del ruido estadístico del mercado. Si el precio toca este nivel, es una señal clara de que la tendencia ha cambiado y no es solo una fluctuación normal.

---

## 2. Sistema de Confianza (Puntuación 0-100)
La confianza no es un número aleatorio, sino el resultado de un **sistema de puntos determinista** ejecutado en el backend.

### Factores que suman/restan puntos:
| Factor | Impacto | Lógica Técnica |
| :--- | :--- | :--- |
| **Alineación de Señal** | **+15 / -20** | Compara tu dirección (LONG/SHORT) con la clasificación del sistema (RSI/MACD/Medias). |
| **Volatilidad (ATR)** | **-15** | Si el ATR es demasiado bajo (<0.5% del precio), se resta puntuación por ser un mercado lateral e impredecible. |
| **Confluencia de TP** | **+5** | Si los objetivos de beneficio coinciden entre varios métodos, aumenta la fiabilidad. |
| **Nota Técnica Base** | **Variable** | Puntuación de 0 a 100 basada puramente en indicadores técnicos promediados. |

---

## 3. Arquitectura Híbrida: Código vs. IA

Para garantizar la máxima fiabilidad en tu TFG, el sistema divide responsabilidades:

### A. El Código (Backend TypeScript)
- **Responsabilidad:** Matemáticas y Datos.
- **Qué hace:** Calcula los niveles de precios exactos, los ratios de riesgo/beneficio y la cifra final de confianza (0-100%).
- **Por qué:** Evita errores de cálculo o "alucinaciones" numéricas comunes en los modelos de lenguaje.

### B. El Cerebro (IA Groq/Llama 3.3)
- **Responsabilidad:** Narrativa y Contexto.
- **Qué hace:** Lee los números generados por el código y redacta el **Resumen** y la **Justificación Profesional**.
- **Por qué:** Proporciona un análisis cualitativo que explica el "porqué" de los números, simulando el juicio de un analista humano.

---

## 4. Validaciones de Seguridad
El sistema incluye avisos automáticos (**Warnings**) si detecta:
- **Ratio R/B < 1.5:** Operación de baja calidad (arriesgas mucho para ganar poco).
- **SL < 0.5x ATR:** Stop Loss demasiado ajustado (te sacará el ruido del mercado).
- **Posición > Capital:** El tamaño de la posición supera tus fondos disponibles según el riesgo configurado.
