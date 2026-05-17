# Auditoría: PDF (Memoria) vs Repositorio

## Fuente
- Memoria (PDF): [TFG/Memoria_Plataforma_Web_de_análisis_de_riesgo_y_recomendaciónbasada_en_inteligencia_artificial-12.pdf](TFG/Memoria_Plataforma_Web_de_análisis_de_riesgo_y_recomendaciónbasada_en_inteligencia_artificial-12.pdf)
- Extracción paginada (para referencias por línea/página): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt)

## Resumen ejecutivo
La mayoría de afirmaciones técnicas del PDF (stack, arquitectura en capas, IA con Groq + `llama-3.3-70b-versatile`, cálculo determinista de SL/TP, métricas de riesgo, testing Vitest + Selenium/Mocha) están implementadas en el repositorio.

Gaps / desajustes más claros (del PDF frente al código actual):
- Comparación por **normalización de series temporales**: se describe en el PDF, pero no se observa implementado en backend/frontend de comparación.
- “Caché en base de datos” para reducir llamadas externas: el PDF lo afirma; en el repo **existen tablas** en el esquema SQL (`financial_data_cache`, `price_history`), pero no se observa uso desde el backend. El caché efectivo observado es principalmente **en memoria** (Map + TTL).
- “Divergencias de momentum basadas en MACD y volumen”: el PDF lo menciona, pero no se ve un módulo explícito de divergencias en el servicio técnico.
- Frontend: el PDF afirma Recharts como librería de series temporales; en el repo conviven **Recharts** (para gráficos de páginas concretas) y **Lightweight Charts** (para velas/indicadores).

---

## Matriz de verificación (claims principales)

### 1) Stack frontend
**Claim (PDF)**: React + TypeScript, Vite, React Router, Tailwind, Axios.
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L462-L488)

**Repo**: OK.
- Dependencias y scripts: [TFG/frontend/package.json](TFG/frontend/package.json#L1-L37)
- Ruteo SPA: [TFG/frontend/src/App.tsx](TFG/frontend/src/App.tsx#L1-L77)
- Axios centralizado + JWT + Accept-Language: [TFG/frontend/src/services/api.ts](TFG/frontend/src/services/api.ts#L1-L27)

**Claim (PDF)**: “Representación visual… mediante Recharts… mostrar precios históricos/indicadores”
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L473)

**Repo**: PARCIAL.
- Recharts está instalado y se usa (p.ej. estrategias/psychoanalysis): [TFG/frontend/package.json](TFG/frontend/package.json#L12-L20)
- Pero las velas/indicadores principales usan Lightweight Charts (script global): [TFG/frontend/index.html](TFG/frontend/index.html#L1-L16)
- Ejemplo de uso de Lightweight Charts en panel técnico: [TFG/frontend/src/components/TechnicalAnalysisPanel.tsx](TFG/frontend/src/components/TechnicalAnalysisPanel.tsx#L9-L13)

### 2) Stack backend
**Claim (PDF)**: Node.js + TypeScript, Express, arquitectura por capas (routes → controllers → services → repositories → providers), PostgreSQL + `pg`, JWT, bcrypt, Nodemailer.
- Evidencia PDF (Express/PostgreSQL/bcrypt/Nodemailer):
  - [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L500-L516)
- Evidencia PDF (capas): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L671-L704)

**Repo**: PARCIAL (por email), resto OK.
- Dependencias backend: [TFG/backend/package.json](TFG/backend/package.json#L1-L35)
- Montaje Express + `/api`: [TFG/backend/src/app.ts](TFG/backend/src/app.ts#L1-L29)
- Enrutado por módulos: [TFG/backend/src/routes/index.ts](TFG/backend/src/routes/index.ts#L1-L38)
- Pool PostgreSQL (`pg`): [TFG/backend/src/config/index.ts](TFG/backend/src/config/index.ts#L1-L26)
- Middleware JWT: [TFG/backend/src/middleware/auth.middleware.ts](TFG/backend/src/middleware/auth.middleware.ts#L1-L26)
- Hash/compare bcrypt: [TFG/backend/src/services/user.service.ts](TFG/backend/src/services/user.service.ts#L1-L36)
- Email transaccional: se usa **Brevo SDK** (no Nodemailer):
  - Dependencia `@getbrevo/brevo`: [TFG/backend/package.json](TFG/backend/package.json#L17-L30)
  - Implementación: [TFG/backend/src/services/email.service.ts](TFG/backend/src/services/email.service.ts#L1-L109)

### 3) Integración de datos financieros (Yahoo Finance)
**Claim (PDF)**: uso de `yahoo-finance2` + limpieza/transformación/normalización por inconsistencias.
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L523-L531)

**Repo**: OK.
- Dependencia: [TFG/backend/package.json](TFG/backend/package.json#L19-L31)
- Provider (adaptación intervalos/rangos, filtrado de quotes inválidas, recuperación parcial en errores de validación):
  - [TFG/backend/src/providers/YahooFinanceMarketDataProvider.ts](TFG/backend/src/providers/YahooFinanceMarketDataProvider.ts#L49-L121)
  - [TFG/backend/src/providers/YahooFinanceMarketDataProvider.ts](TFG/backend/src/providers/YahooFinanceMarketDataProvider.ts#L122-L215)

### 4) Autenticación y flujo de datos
**Claim (PDF)**: token JWT en requests, middleware valida token, respuesta JSON.
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L681-L706)

**Repo**: OK.
- Axios añade Bearer (frontend): [TFG/frontend/src/services/api.ts](TFG/frontend/src/services/api.ts#L9-L27)
- Backend valida Bearer + JWT (middleware): [TFG/backend/src/middleware/auth.middleware.ts](TFG/backend/src/middleware/auth.middleware.ts#L7-L26)

### 5) Funcionalidades: búsqueda y consulta de activos
**Claim (PDF)**: búsqueda por ticker, muestra precio actual, históricos, indicadores, fundamentales.
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L842-L864)

**Repo**: OK.
- Frontend (página de activos): [TFG/frontend/src/pages/AssetsPage.tsx](TFG/frontend/src/pages/AssetsPage.tsx)
- Backend (rutas assets + history):
  - [TFG/backend/src/routes/assets.routes.ts](TFG/backend/src/routes/assets.routes.ts#L13-L33)
  - [TFG/backend/src/routes/price.routes.ts](TFG/backend/src/routes/price.routes.ts#L7)

### 6) Análisis técnico
**Claim (PDF)**: SMA/EMA, RSI, MACD, Bollinger, OBV, ATR; señal agregada COMPRA FUERTE/…/VENTA FUERTE; patrones Golden/Death Cross y “divergencias” basadas en MACD/volumen.
- Evidencia PDF (indicadores): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L878-L891)

**Repo**:
- Indicadores + scoring y clases: OK.
  - Servicio técnico (scoring + Golden/Death Cross): [TFG/backend/src/services/technicalAnalysis.service.ts](TFG/backend/src/services/technicalAnalysis.service.ts#L444-L476)
  - Panel técnico con clases (COMPRA/VENTA/etc): [TFG/frontend/src/components/TechnicalAnalysisPanel.tsx](TFG/frontend/src/components/TechnicalAnalysisPanel.tsx#L14-L22)
- Divergencias: NO ENCONTRADO (no se observa módulo explícito).
  - Búsqueda de “diverg” en el servicio técnico no arroja resultados.

### 7) Análisis fundamental
**Claim (PDF)**: PER/ROE/márgenes/dividendos/market cap/EPS/beta + Indicador Buffett (EEUU) + adaptación por horizonte y por tipo de activo (acciones/cripto/ETF).
- Evidencia PDF (métricas + Buffett): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L903-L909)

**Repo**: OK.
- Servicio fundamental (multi-tipo, multi-horizonte): [TFG/backend/src/services/fundamentalAnalysis.service.ts](TFG/backend/src/services/fundamentalAnalysis.service.ts)
- Indicador Buffett: [TFG/backend/src/controllers/buffett.controller.ts](TFG/backend/src/controllers/buffett.controller.ts)

### 8) Análisis cuantitativo / riesgo
**Claim (PDF)**: volatilidad anualizada, max drawdown, Sharpe, Sortino, Calmar, VaR 95%, beta; clasificación LOW/MEDIUM/HIGH.
- Evidencia PDF (métricas): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L936-L938)
- Evidencia PDF (LOW/MEDIUM/HIGH): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L947-L948)

**Repo**: OK.
- Métricas (√252, Sharpe/Sortino/VaR/Calmar/MDD): [TFG/backend/src/utils/riskCalculations.ts](TFG/backend/src/utils/riskCalculations.ts)

### 9) Watchlist
**Claim (PDF)**: añadir/eliminar, consulta rápida, persistencia en PostgreSQL.
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L962-L971)

**Repo**: OK.
- Rutas watchlist (auth required): [TFG/backend/src/routes/watchlist.routes.ts](TFG/backend/src/routes/watchlist.routes.ts#L1-L32)
- Repositorio SQL en PostgreSQL: [TFG/backend/src/repositories/watchlist.repository.ts](TFG/backend/src/repositories/watchlist.repository.ts#L1-L88)

### 10) Comparación de activos
**Claim (PDF)**: comparación multi-activo + advertencias cuando métricas no son comparables entre tipos.
- Evidencia PDF (no comparables): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1017-L1020)

**Repo**: OK (en UI).
- Warning tipo mixto: [TFG/frontend/src/pages/ComparePage.tsx](TFG/frontend/src/pages/ComparePage.tsx#L702-L716)

**Claim (PDF)**: comparación basada en **normalización de series temporales**.
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L981-L986)

**Repo**: NO ENCONTRADO.
- Backend comparación devuelve métricas agregadas (% cambio periodo, volatilidad, Sharpe, VaR, MDD, beta), pero no una serie normalizada: [TFG/backend/src/services/comparison.service.ts](TFG/backend/src/services/comparison.service.ts#L145-L200)
- En frontend no se observa normalización/serie base 0/100 para comparar rendimientos.

### 11) IA (Groq) + arquitectura híbrida
**Claim (PDF)**: Groq SDK, modelo `llama-3.3-70b-versatile`, contexto estructurado IAContexto, prompt engineering, temperatura baja (0.3), paralelización, timeouts y recorte de historial.
- Evidencia PDF (Groq + modelo + temp): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1346-L1366)
- Evidencia PDF (modelo justificación): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1392-L1406)
- Evidencia PDF (optimización): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1479-L1492)
- Evidencia PDF (IAContexto / construirContexto): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1270-L1316) y [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1612-L1661)

**Repo**: OK (con matices en prompts/temperaturas según módulo).
- Groq + modelo: [TFG/backend/src/services/ia.service.ts](TFG/backend/src/services/ia.service.ts#L1-L11)
- `IAContexto` + `construirContexto`: [TFG/backend/src/services/ia.service.ts](TFG/backend/src/services/ia.service.ts#L12-L110)
- `temperature: 0.3` (justificación): [TFG/backend/src/services/ia.service.ts](TFG/backend/src/services/ia.service.ts#L330-L336)
- Paralelo + timeouts (Promise.allSettled + Promise.race): [TFG/backend/src/services/ia.service.ts](TFG/backend/src/services/ia.service.ts#L341-L361)
- Recorte historial chat (slice -10): [TFG/backend/src/services/ia.service.ts](TFG/backend/src/services/ia.service.ts#L421-L428)
- Prompt con restricción “no inventar datos” (chat): [TFG/backend/src/services/ia.service.ts](TFG/backend/src/services/ia.service.ts#L402-L416)

### 12) Recomendación / estrategia determinista
**Claim (PDF)**: SL por % fijo / ATR dinámico / soporte; TP por RR / Bollinger / resistencia; escoger opción conservadora; warnings (RR < 1.5, ATR bajo, posición > capital).
- Evidencia PDF (caso AAPL warnings): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1167-L1172)
- Evidencia PDF (lógica SL/TP): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1423-L1451)

**Repo**: OK.
- SL: FIXED_PCT / DYNAMIC_ATR / SUPPORT_RESISTANCE: [TFG/backend/src/services/recommendation.service.ts](TFG/backend/src/services/recommendation.service.ts#L47-L89)
- TP: RISK_REWARD / SUPPORT_RESISTANCE / BOLLINGER: [TFG/backend/src/services/recommendation.service.ts](TFG/backend/src/services/recommendation.service.ts#L113-L205)
- Warning RR < 1.5: [TFG/backend/src/services/recommendation.service.ts](TFG/backend/src/services/recommendation.service.ts#L235)
- Warning SL < 0.5×ATR: [TFG/backend/src/services/recommendation.service.ts](TFG/backend/src/services/recommendation.service.ts#L240)
- Warning ATR bajo: [TFG/backend/src/services/recommendation.service.ts](TFG/backend/src/services/recommendation.service.ts#L243)
- Position sizing y warning por exceder capital: [TFG/backend/src/services/recommendation.service.ts](TFG/backend/src/services/recommendation.service.ts#L250-L268)

### 13) Testing
**Claim (PDF)**: Vitest unitario + Selenium WebDriver + Mocha para E2E.
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L545-L548)

**Repo**: OK.
- Vitest en backend: [TFG/backend/package.json](TFG/backend/package.json#L6-L18)
- Tests unitarios riesgo: [TFG/backend/src/utils/__tests__/riskCalculations.test.ts](TFG/backend/src/utils/__tests__/riskCalculations.test.ts#L1)
- E2E Selenium + Mocha: [TFG/e2e/package.json](TFG/e2e/package.json#L1-L18)

### 14) Noticias de mercado
**Claim (PDF)**: la plataforma integra “consulta de noticias” relevantes del mercado como parte del flujo de análisis.
- Evidencia PDF (mención funcional): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L239-L262)

**Repo**: OK.
- Rutas (`/api/news`, `/api/noticias/mercados`, `/api/noticias/activo/:ticker`): [TFG/backend/src/routes/news.routes.ts](TFG/backend/src/routes/news.routes.ts#L1-L17)
- Controlador (Yahoo Finance Search API): [TFG/backend/src/controllers/news.controller.ts](TFG/backend/src/controllers/news.controller.ts#L34-L170)

### 15) Usuarios: verificación de email + recuperación de contraseña
**Claim (PDF)**: verificación de cuentas y recuperación de contraseña por email (menciona Nodemailer).
- Evidencia PDF (Nodemailer): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L512-L516)

**Repo**: PARCIAL (funcionalidad OK, librería distinta).
- Endpoints públicos (register/login/verificar/reenviar/forgot/reset): [TFG/backend/src/routes/users.routes.ts](TFG/backend/src/routes/users.routes.ts#L7-L18)
- Verificación + reenvío de código: [TFG/backend/src/controllers/user.controller.ts](TFG/backend/src/controllers/user.controller.ts#L106-L163)
- Forgot/reset password: [TFG/backend/src/controllers/user.controller.ts](TFG/backend/src/controllers/user.controller.ts#L254-L311)
- Envío de email: Brevo (no Nodemailer): [TFG/backend/src/services/email.service.ts](TFG/backend/src/services/email.service.ts#L1-L109)

### 16) Persistencia: operaciones y estrategias
**Claim (PDF)**: PostgreSQL se usa para persistencia de entidades “como usuarios, configuraciones o historiales de operaciones”.
- Evidencia PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L500-L510)

**Repo**: OK.
- Tablas `strategies` y `operations`: [TFG/backend/database/schema.sql](TFG/backend/database/schema.sql#L63-L87)
- Repository SQL operaciones: [TFG/backend/src/repositories/operation.repository.ts](TFG/backend/src/repositories/operation.repository.ts#L41-L107)
- Repository SQL estrategias: [TFG/backend/src/repositories/strategy.repository.ts](TFG/backend/src/repositories/strategy.repository.ts#L33-L70)
- Endpoints CRUD operaciones: [TFG/backend/src/routes/operations.routes.ts](TFG/backend/src/routes/operations.routes.ts#L7-L17)
- Endpoints strategies (+performance): [TFG/backend/src/routes/strategies.routes.ts](TFG/backend/src/routes/strategies.routes.ts#L7-L14)

---

## Claims con evidencia débil o desajuste

1) Caché persistente en PostgreSQL (mercado)
- Claim PDF (caché en BD): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L753)
- En schema SQL existen tablas relacionadas con persistencia/caché de mercado (`price_history`, `financial_data_cache`):
  - [TFG/backend/database/schema.sql](TFG/backend/database/schema.sql#L38-L61)
- Observado en backend: caché efectivo en memoria (Map + TTL) y deduplicación de peticiones en curso; no se observan consultas/lecturas/escrituras a `financial_data_cache`/`price_history` en los services actuales.
  - [TFG/backend/src/services/financialData.service.ts](TFG/backend/src/services/financialData.service.ts#L16-L83)
- Estado: PARCIAL.

2) Nodemailer (PDF) vs Brevo (repo)
- Claim PDF: Nodemailer para verificación/recuperación: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L512-L516)
- Repo: Brevo SDK: [TFG/backend/src/services/email.service.ts](TFG/backend/src/services/email.service.ts#L1-L109)
- Estado: PARCIAL (misma funcionalidad, distinta implementación).

3) Normalización de series en comparación
- Claim PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L981-L986)
- Observado en repo: no hay transformación de series a base 0/100 ni correlación.
- Estado: NO ENCONTRADO.

4) Divergencias MACD/volumen
- Claim PDF: [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L889)
- Observado en repo: no hay implementación explícita.
- Estado: NO ENCONTRADO.

5) Prompt del Apéndice A.1 vs prompts reales
- Claim PDF (prompt ejemplo en español y restricciones): [TFG/.tmp_memoria_pdf_paged.txt](TFG/.tmp_memoria_pdf_paged.txt#L1572-L1600)
- Observado en repo: prompt de resumen está en inglés y fija 3 frases + restricciones (no SL/TP), pero la temperatura del resumen es 0.4 (la justificación sí usa 0.3).
  - [TFG/backend/src/services/ia.service.ts](TFG/backend/src/services/ia.service.ts#L222-L260)
  - [TFG/backend/src/services/ia.service.ts](TFG/backend/src/services/ia.service.ts#L330-L336)
- Estado: PARCIAL.
