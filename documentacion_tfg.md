# Documentación del Proyecto TFG: Plataforma de Análisis Financiero y Asistencia con IA

Esta documentación sirve como base estructurada para la memoria del Trabajo de Fin de Grado (TFG), detallando la conceptualización, arquitectura técnica y funcionalidades de un ecosistema centrado en el análisis y recomendación de activos.

---

## 0. Introducción

### Motivación
El ecosistema de inversión para traders minoristas o particulares suele ser caótico e ineficiente. La motivación principal detrás de este proyecto surge de identificar tres grandes problemas en la industria actual:
1. **Herramientas fragmentadas:** Los inversores utilizan una aplicación web para seguir cotizaciones (ej. TradingView), otra diferente para leer noticias de mercado y otra para recibir análisis fundamental.
2. **Falta de integración con Inteligencia Artificial:** Si bien los LLMs (Grandes Modelos de Lenguaje) son capaces de procesar altos volúmenes de parámetros, la mayoría de plataformas financieras no los han nativizado para traducir datos crudos a lenguaje natural explicativo.
3. **Complejidad para inversores no expertos:** Las plataformas de grado profesional abruman a los principiantes con exceso de indicadores sin explicar qué implican realmente de forma confluente. 
La misión es unificar estos flujos en una sola interfaz limpia y asistida por IA.

### Objetivos

**Objetivo General:**
Diseñar, desarrollar y desplegar una plataforma web integral (SPA + API REST) orientada a inversores, capaz de facilitar la búsqueda, comparación y análisis técnico-fundamental de activos financieros, enriquecida por un motor de recomendaciones automatizadas usando Inteligencia Artificial.

**Objetivos Específicos:**
- **Sistema Integrado:** Desarrollar una API REST escalable con Node.js y flujos segregados.
- **Datos en vivo:** Integrar proveedores financieros para obtener datos bursátiles del mundo real (tickers, cierres diarios, volúmenes).
- **Asistencia con IA:** Desarrollar un sistema de recomendación semántico apoyado en los modelos fundacionales de Groq.
- **Visualización interactiva:** Proveer gráficos técnicos renderizados de forma dinámica, fluidos y limpios.
- **Comparativa de Mercados:** Crear un motor estadístico que perfile e iguale las rentabilidades de activos dispares para su correcta comparación visual.

---

## 1. Descripción general

- **Nombre del proyecto:** Plataforma Integral de Análisis Financiero y Asistencia con IA.
- **Funcionalidades principales:**
  - Búsqueda detallada y cotización de activos (acciones, criptomonedas, divisas).
  - Exploración mediante herramientas de Análisis Técnico (gráficos interactivos, medias móviles, bandas de Bollinger, MACD).
  - Herramientas de Análisis Fundamental (P/E, ROE, Dividendos).
  - Comparación concurrente de múltiples activos.
  - Motor analítico con IA (resúmenes técnicos narrativos, veredictos de rentabilidad y chat contextualizado con el activo).

---

## 2. Arquitectura de la aplicación

- **Descripción general:** Sigue un modelo Cliente-Servidor (SPA). El frontend maneja el renderizado de gráficos y estado de la sesión, delegando todo el peso de inferencia y la ingesta masiva de datos (Data Fetching) a la API del backend.
- **Tecnologías:**
  - **Backend:** Node.js, Express.js y TypeScript.
  - **Frontend:** React.js optimizado con Vite, TypeScript, Tailwind CSS, Recharts/Lightweight charts.
  - **Base de datos:** PostgreSQL.

---

## 3. Backend

- **Arquitectura Interna:** Patrón MVC avanzado separado en Rutas, Controladores y Capa de Servicio (donde el servicio actúa sobre Repositorios separados).
- **Rutas clave:**
  - `/api/assets/search` | Localizador de activos.
  - `/api/price/:symbol/history` | Obtención de series temporales.
  - `/api/comparison` | Análisis comparativo de métricas y correlación.
  - `/api/ia/analyze` | Endpoints hacia el motor de Llama-3 de Groq.

---

## 4. Base de datos / Persistencia

- **Gestor:** PostgreSQL gestionado a través de transacciones directas usando `pg` (Postgres client for Node Node.js).
- **Modelos Principales:** 
  - `User`: Registro de usuarios y configuraciones visuales.
  - Tablas auxiliares para el almacenamiento de preferencias operativas (por ejemplo, `Watchlist` de símbolos elegidos) permitiendo recargas personalizadas al instante.

---

## 5. Funcionalidades clave (Flujos)

- **Análisis Técnico Dinámico:**
  El sistema recoge los últimos OHLC (Open, High, Low, Close) históricos y volumen. El cliente procesa de inmediato el gráfico interactivo (pudiendo arrastrar, redimensionar).
- **El Comparador (Normalización de Series):**
  Para comparar, digamos Tesla ($170) con un céntimo de Dogecoin, es imperativo establecer un origen estadístico 0%. El backend toma ambas series y transforma todos los días subsiguientes en crecimientos relativos al día X inicial.

---

## 6. Sistema de Inteligencia Artificial

Esta es la piedra angular del proyecto, cerrando la brecha entre la data matemática y la comprensión del inversor.

### 6.1 Flujo completo de la IA

1. **La petición:** El usuario presiona "Obtener Recomendación/Análisis" desde la vista de un activo (Ej. Microsoft - MSFT). Opcionalmente señala su intervalo (1D, 1W) y un precio de entrada objetivo.
2. **Transformación del Backend:** El controlador intercepta la solicitud. Descarga el precio en vivo, el RSI de 14 días, si el precio cruza su Media Móvil de 50 o 200 días y variables clave como el MACD o el P/E ratio.
3. **El envío al Modelo:** Todos estos datos matemáticos se interpolan crudos y descritos hacia un texto maestro oculto (Prompt). 
4. **La Devolución:** El modelo en forma paralela procesa la petición de resumen o el chat contextual usando la API de Groq y devuelve la salida textual, la cual es empujada nuevamente al frontend.
5. **Visualización:** El usuario visualiza cajas de texto legibles, humanizadas y limpias categorizando el activo, sin ver la complejidad subyacente.

### 6.2 Construcción del Prompt

El principio utilizado en Node.js es la **inyección contextual restringida**. Se evita que la IA alucine pasándole parámetros cerrados. No se envía un JSON nativo en este caso, se formatea un string instructivo de forma semántica.

**Ejemplo de Prompt real inyectado (como Sistema):**
```text
Eres un analista técnico experto. Justifica la siguiente señal técnica de forma educativa:

Activo: AAPL | Señal: BUY (82/100 puntos)

Desglose de indicadores:
- Medias móviles: precio por encima de SMA50, por encima de SMA200
- RSI(14): 64.2 (zona neutral)
- MACD: histograma alcista
- Bandas de Bollinger: precio dentro de las bandas
- OBV: tendencia alcista

Explica en 4-5 frases en español:
1. Qué está diciendo cada indicador de forma individual.
2. Si los indicadores convergen o divergen entre sí.
3. Qué significa esa confluencia para la fiabilidad.
No uses bullet points. Usa lenguaje claro apto para inversores.
```

### 6.3 Modelo Utilizado

Se ha optado por implementar **Groq API**, e instanciado de manera específica el modelo **Llama-3.3-70B-Versatile**.
- **Rapidez y Latencia:** Groq utiliza unidades de procesamiento tensorial ultra-optimizadas asombrosamente rápidas (superiores a la interfaz REST tradicional). Devuelve ensayos enteros del mercado en milisegundos.
- **Coste-Eficiencia:** Comparado con GPT-4, Llama 3 en su parámetro 70B alcanza razonamiento cuasi-homográfico por una facción de su coste operativo en modo API.
- **Precisión Analítica:** Posee excelente entendimiento natural para seguir las reglas restrictivas dictadas en los prompts.

### 6.4 Limitaciones del Sistema IA

Pese a los impresionantes resultados, es crítico admitir ciertas deficiencias para el tribunal en el ámbito académico:
1. **Alucinaciones Estocásticas:** La IA sigue siendo fundamentalmente predictiva. Ocasionalmente podría asociar un MACD Positivo con mercado colapsando si no se le obliga (Prompt Engineering) a ser literal.
2. **No es una Bola de Cristal:** Este sistema analiza matemáticas estáticas previas; las decisiones finales y el riesgo monetario recaen enteramente en el humano. No sustituye a una firma de asesoramiento financiero regulada.
3. **Dependencia Temporal:** El bot opina exclusivamente sobre los indicadores estáticos alimentados en el microsegundo que se procesó el prompt, no sabe de la macroeconomía subyacente del día a no ser que se le alimenten noticias.

---

## 7. Decisiones de diseño

### Backend
- **¿Por qué Node.js y Express?** Su naturaleza asincrónica (I/O non-blocking) es idónea para lidiar contínuamente con descargas de APIs secundarias y pasarelas concurrentes hacia la LLM de Groq sin congelar el hilo principal.
- **¿Por qué TypeScript?** Era vital imponer tipado duro a los precios y los ratios. Intercambiar un Float por un String podría inutilizar todo un motor de recomendaciones o de validaciones de riesgo.

### Base de datos
- **¿Por qué PostgreSQL y no MongoDB?** Aunque Mongo se beneficia de objetos amorfos (JSON flexibles), las configuraciones de usuarios o asociaciones (ej. UserId 1 ligado a su propia configuración fija) resultan mejor abordadas con la rigurosidad SQL relacional, facilitando escaladas contables futuras (ej. validaciones de saldos).

### Datos financieros
- **¿Por qué Yahoo Finance (`yahoo-finance2`)?** Provee de una inmensa capa gratuita sin restricciones brutales de rate-limiting (a diferencia de Alphavantage o Coinmarketcap) en su nivel básico, además de abarcar con éxito no solo Criptomoneda, sino mercado accionario centralizado.

### Arquitectura general
- **¿Por qué Arquitectura Separada / SPA?** Para garantizar escalabilidad y experiencia fluida (tipo App de móvil). Construir plantillas estáticas de pug o EJS mataría la gracia dinámica de los gráficos técnicos Recharts que interactúan al mover el puntero del ratón en tiempo vivo.

---

## 8. Metodología

La organización temporal se ha definido bajo prácticas estrictamente adaptativas:
- **Modelo Iterativo e Incremental:** Se arrancó elaborando un cascarón básico con react enviando un 'hello world' a Node. Posteriormente, iteración a iteración, se sumaron módulos aislados (1. Auth -> 2. Gráficos -> 3. Inteligencia Artificial). Cada iteración debe funcionar por completo sin romper la base anterior.
- **Uso de control de versiones (Git):** Desplegado sobre repositorio central desarrollando en ramas unitarias, documentando retrocesos si la subida de un componente fallaba catastróficamente la visualización.

---

## 9. Evaluación del sistema

El performance del despliegue prototipo es alentador:
- **Tiempos de Respuesta HTTP:** Las peticiones a la base de datos se despachan en rangos de *~40ms a ~100ms*, y las rutas combinadas de inteligencia artificial promedian de forma contundente *~1 a 2 Segundos* (velocidad altísima para LLM debido a la red Groq).
- **UX de Calidad:** Flujo claro desde el Login, pasando por componentes de 'Carga' (Skeleton/Spinners) mientras los proveedores completan transferencias de velas japonesas.
- **Casos Reales Superados:** La IA ha justificado impecablemente análisis contradictorios, como situaciones donde AAPL sufría MACD alcista en corto plazo pero sobreventa agresiva a 52 semanas.

---

## 10. API y Testing

- **API REST Estándar:** El proyecto se estructura por completo mediante respuestas controladas en JSON y cabeceras enriquecidas (CORS para SPA permitida, Authorizations Bearer pasadas implícitas por Axios interceptors).
- **Testing (`Vitest`):** Foco exclusivo en validación algorítmica para Node. Los `servicios/` (donde reside el cálculo financiero y los sanitizadores matemáticos) son los únicos verificados para garantizar neutralidad pura sobre un `price_entrada` numérico antes de su pase a IA.

---

## 11. Librerías principales (Resumen)

- **Backend:** `express`, `pg`, `bcrypt` y `jsonwebtoken`, `groq-sdk`, `yahoo-finance2`
- **Frontend:** `react/vite`, `axios`, `tailwindcss` (disposición responsive), `recharts` / `lucide-react`.

---

## 12. Posibles mejoras (Trabajo Futuro)

Este TFG constituye un MVP (Producto Mínimo Viable) altamente escalable, del que se han planificado optimizaciones de orden técnico profundo:
1. **Conexiones WebSockets bidireccionales:** Implementar un canal con `Socket.io` y el proveedor de la API de mercado en vez de polling/HTTP Request. Proporcionaría saltos de precio ininterrumpidos en vivo (Tick-by-tick streaming) indispensable para traders interdiarios (Scalping).
2. **Módulo nativo de Backtesting Institucional:** Que el inversor ingrese condiciones (Ej. Si el RSI > 70 AND SMA200 cruza SMA50 -> Buy 10 AAPL) y el software replique dicha compra durante los últimos 10 años, extrayendo si habría ganado o perdido históricamente antes de ejecutar un céntimo.
3. **Machine Learning Predictivo Propio:** Más allá del LLM conversacional y generativo para 'Explicar' indicadores actuales, entrenar paralelamente en Python/Tensorflow Modelos LSTM u Open Series limitados a un activo particular para ensayar una predicción cuantitativa numérica con un % de acierto evaluable.

---

## 13. Conclusión

El proyecto ha logrado unificar en un entorno cohesionado múltiples tecnologías de altísima demanda (Single Page Applications + Inteligencias Artificiales Generativas), solucionando de lleno la deficiencia explicativa y de agregación que sufre hoy el trading particular. Sirve como prueba técnica robusta de cómo los LLMs no solo asisten para la ofimática o texto libre, sino que pueden procesar lógica analítica estricta si son configurados usando "Prompt Engineering" inyectado contextualmente de forma responsable.
