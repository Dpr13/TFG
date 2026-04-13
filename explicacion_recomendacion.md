# Sistema de Recomendaciones de Operación

Este documento detalla la implementación técnica, lógica de negocio y la integración con Inteligencia Artificial del módulo de Recomendaciones.

---

## 1. Arquitectura del Sistema

El módulo sigue un flujo de datos reactivo y distribuido entre el frontend y múltiples micro-servicios en el backend:

1.  **Vista (`RecommendationPage.tsx`)**: Captura los parámetros del usuario (Símbolo, Intervalo, Gestión de Riesgo).
2.  **Servicio de Recomendación (`recommendation.service.ts`)**: Orquesta el cálculo de niveles de precios y gestión de riesgo.
3.  **Servicio Técnico (`technicalAnalysis.service.ts`)**: Proporciona los datos OHLCV, indicadores (RSI, MACD, Bollinger, SMA) y detección de Soportes/Resistencias.
4.  **Servicio de Inteligencia Artificial (`ia.service.ts`)**: Procesa el contexto de la operación para generar narrativas y soporte por chat.

---

## 2. Lógica de Cálculo de Niveles

La recomendación se basa en reglas matemáticas deterministas para asegurar la objetividad técnica.

### A. Ejecución del Stop Loss (SL)
El sistema ofrece dos métodos principales:
- **Porcentaje Fijo:** Calcula el SL aplicando un % de pérdida directa sobre el precio de entrada.

#### Detección de Soportes y Resistencias (S/R)
El sistema no usa líneas fijas, sino un algoritmo de **Pivotes Locales**:
1.  **Ventana Deslizante:** Dependiendo del intervalo (ej: 10 velas para diario), el sistema busca picos (máximos) y valles (mínimos). Un precio es un pico si es el más alto de su entorno (izquierda y derecha).
2.  **Validación de Fortaleza:** Para cada nivel detectado, el backend escanea todo el histórico y cuenta cuántas veces el precio de cierre ha "tocado" esa zona (con una tolerancia del ±0.5%). A más toques, mayor es la **fuerza** del nivel.
3.  **Selección del SL:** El algoritmo filtra los 3 niveles más recientes y elige el que mejor proteja la posición según la dirección elegida.

### B. Take Profit (TP) Ponderado
Se pueden activar múltiples métodos simultáneamente:
1.  **Ratio Riesgo/Beneficio (R/B):** Multiplica la distancia del SL por un factor (ej: 1:2) para proyectar el objetivo.
2.  **Soportes/Resistencias:** Proyecta el objetivo al siguiente nivel de resistencia (Long) o soporte (Short).
3.  **Bandas de Bollinger:** En **LONG**, el objetivo es la banda superior; en **SHORT**, la banda inferior.

---

## 3. Gestión del Riesgo y Tamaño de Posición

A diferencia de un análisis simple, este módulo calcula la **viabilidad financiera** de la operación:

$$\text{Dinero en Riesgo} = \text{Capital Total} \times \text{\% de Riesgo por Op.}$$
$$\text{Tamaño de Posición (unidades)} = \frac{\text{Dinero en Riesgo}}{\text{Precio Entrada} - \text{Precio SL}}$$
$$\text{Valor Total de la Posición} = \text{Tamaño de Posición} \times \text{Precio Entrada}$$

> [!WARNING]
> Si el Valor Total supera el Capital Disponible, el sistema lanza una alerta de apalancamiento o insuficiencia de fondos.

---

## 4. Cerebro de IA: Groq (Llama-3.3-70b)

La IA no calcula los niveles (lo que garantiza precisión matemática), sino que los **interpreta** mediante tres módulos:

### I. Resumen Narrativo (`generarResumen`)
Genera 3 frases clave:
- Estado técnico actual.
- Justificación de los niveles propuestos.
- Riesgos críticos a vigilar.

### II. Justificación Técnica (`generarJustificacion`)
Explica la **Confluencia de Indicadores**. Por ejemplo: *"Aunque el RSI indica sobreventa (alcista), el precio está bajo la SMA200 (bajista), lo que genera una señal de baja fiabilidad."*

### III. Chat Adaptativo (`chatIA`)
Permite al usuario preguntar dudas sobre la operación propuesta. El sistema inyecta todo el contexto de la recomendación (niveles, indicadores, riesgo) en el `systemPrompt` para que la IA responda con conocimiento preciso del activo.

---

## 5. Visualización Avanzada

Se utiliza la librería **Lightweight Charts** para renderizar:
- Gráfico de velas (Candlesticks).
- Líneas dinámicas de Entrada (Gris), SL (Rojo) y TPs (Verde).
- Capas de indicadores (SMA50, SMA200, Bandas de Bollinger).
- Soportes y Resistencias detectados automáticamente.

---

## 6. Detalle del Código (Soportes y Resistencias)

La lógica reside en la función `calcSupportResistance` dentro de `TechnicalAnalysisService.ts`. Aquí tienes el fragmento clave de cómo el algoritmo detecta estos niveles:

```typescript
private calcSupportResistance(highs: number[], lows: number[], closes: number[], dates: string[], window: number) {
  const half = Math.floor(window / 2);
  
  // 1. Identificar Picos y Valles (Pivotes) mediante una ventana deslizante
  for (let i = half; i < highs.length - half; i++) {
    let isMax = true;
    for (let j = i - half; j <= i + half; j++) {
      if (j !== i && highs[j] >= highs[i]) { isMax = false; break; }
    }
    if (isMax) localMaxima.push({ price: highs[i], idx: i });
  }

  // 2. Calcular Fortaleza (conteo de toques históricos)
  const calcStrength = (price: number): number => {
    const tolerance = price * 0.005; // 0.5% de margen térmico
    return closes.filter(c => Math.abs(c - price) <= tolerance).length;
  };

  // 3. Exportar los niveles más recientes con su fuerza calculada
  const resistances = localMaxima.slice(-3).map(m => ({
    price: m.price,
    date: dates[m.idx],
    strength: calcStrength(m.price),
    type: 'resistance'
  }));
                   
  return { supports, resistances };
}
```

### Por qué funciona así:
- **Pivotes (Fractales):** El primer bucle asegura que el punto elegido sea un "máximo local". Si en un entorno de 10 velas (5 atrás y 5 adelante) ninguna es más alta que la vela `i`, entonces la vela `i` es una resistencia potencial.
- **Validación por Cierres:** Aunque el pivote se detecta con los `highs` (emoción), la fuerza (`strength`) se mide con los `closes` (consenso). Si el precio de cierre ha vuelto a esa zona muchas veces, el nivel es sólido.
- **Tolerancia:** El uso de `price * 0.005` convierte una línea fina en una **zona de precios**, que es mucho más realista en el trading real.
