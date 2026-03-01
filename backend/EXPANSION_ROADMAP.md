# Roadmap de Expansión - Sistema de Trading Journal

## 📋 Descripción General

Este documento mapea todas las áreas de expansión identificadas en el código fuente. Los desarrolladores pueden usar este roadmap como guía para implementar nuevas funcionalidades manteniendo la arquitectura limpia.

## 🏗️ Modelos de Datos (Backend)

### 1. **Operation Model** (`src/models/operation.ts`)
**Expansiones Planeadas:**
- ✅ Commission tracking - Registrar comisiones por operación
- ✅ Order types - Diferenciar entre LIMIT, MARKET, STOP
- ✅ Timeframes - Clasificación por timeframe (1m, 5m, 1h, 4h, daily)
- ✅ Technical indicators - Snapshots de indicadores al momento de operación
- ✅ Custom tags - Sistema de etiquetado flexible
- ✅ Risk/Reward analysis - Análisis RR para cada operación

### 2. **Strategy Model** (`src/models/strategy.ts`)
**Expansiones Planeadas:**
- ✅ Strategy parameters - ATR periods, moving averages, thresholds
- ✅ Trading rules - Condiciones de entrada/salida
- ✅ Confidence levels - Grado de confianza (0-100%)
- ✅ Allowed symbols - Símbolos permitidos por estrategia
- ✅ Performance metrics - Win rate, profit factor por estrategia
- ✅ Active status - Toggle para estrategias activas/inactivas
- ✅ Versioning - v1.0, v1.1, v2.0, etc.

### 3. **Psychoanalysis Model** (`src/models/psychoanalysis.ts`)
**Expansiones Planeadas:**
- ✅ Hourly analysis - Patrones por hora del día
- ✅ Emotional cycles - Ciclos emocionales detectados
- ✅ Over-trading index - Score 0-100 de sobre-trading
- ✅ ML prediction - Predicciones con machine learning
- ✅ Risk flags - Comportamientos de riesgo identificados
- ✅ Recommendations - Recomendaciones personalizadas
- ✅ Psychological profile - Perfil psicológico del trader

## 🗂️ Repositorios (Data Persistence)

### **Operation Repository** (`src/repositories/operation.repository.ts`)
**Migraciones Futuras:**
- MongoDB para escalabilidad en producción
- Redis cache para operaciones frecuentes
- Indexación por fecha y símbolo
- Replicación automática para backup
- Audit trail completo
- Pagination para grandes resultados
- Full-text search en notas

### **Strategy Repository** (`src/repositories/strategy.repository.ts`)
**Migraciones Futuras:**
- Relaciones con Operations (foreign keys)
- Versionado de cambios
- Soporte para compartir entre usuarios
- Template system
- Scored ranking de estrategias
- Archivado soft-delete

## 🧠 Servicios (Business Logic)

### **Operation Service** (`src/services/operation.service.ts`)
**Validaciones y Mejoras:**
- Validación avanzada con zod/joi
- Caché en memoria con TTL
- Búsqueda avanzada con filtros
- Export a CSV
- Análisis integrado
- Auditoría de cambios
- Sincronización con brokers

### **Strategy Service** (`src/services/strategy.service.ts`)
**Funcionalidades:**
- Cálculo de performance
- Comparación entre estrategias
- Backtesting de operaciones históricas
- Validación de parámetros
- Auto-tagging inteligente
- Clonación de estrategias
- Sugerencias basadas en patrones

### **Psychoanalysis Service** (`src/services/psychoanalysis.service.ts`)
**Cálculos Adicionales:**
- Expected Value por operación
- Profit Factor (total ganancias/total pérdidas)
- Volatilidad de resultados
- Sharpe Ratio
- Índice de over-trading
- Trading emocional score
- Detección de anomalías

## 🔌 Controladores (HTTP Handlers)

### **Operation Controller** (`src/controllers/operation.controller.ts`)
**Mejoras:**
- Validación de entrada con schemas
- Rate limiting
- Multi-usuario con autenticación
- Logging detallado
- Pagination en getAll()
- Caching de respuestas
- Compresión (gzip)
- Transacciones ACID

### **Strategy Controller** (`src/controllers/strategy.controller.ts`)
**Validaciones:**
- Nombres únicos de estrategias
- Soft delete (archivado)
- Versioning automático
- Cálculo real-time de métricas
- Endpoint de comparación

### **Psychoanalysis Controller** (`src/controllers/psychoanalysis.controller.ts`)
**Endpoints Nuevos:**
- `/psychoanalysis/discipline` - Score de disciplina
- `/psychoanalysis/emotion-cycle` - Ciclos emocionales
- `/psychoanalysis/anomalies` - Comportamientos anómalos
- `/psychoanalysis/hourly` - Análisis por horas
- `/psychoanalysis/prediction` - ML predictions
- `/psychoanalysis/pdf` - Exportación PDF

## 🛣️ Rutas (API Endpoints)

### **Operations Routes** (`src/routes/operations.routes.ts`)
**Endpoints Sugeridos:**
```
GET    /operations/stats/yearly
POST   /operations/import
GET    /operations/export
GET    /operations/search?symbol=&minPnL=&maxPnL=
GET    /operations/strategy/:strategyId
PATCH  /operations/:id
GET    /operations/trending
POST   /operations/batch
```

### **Strategies Routes** (`src/routes/strategies.routes.ts`)
**Endpoints Sugeridos:**
```
GET    /strategies/:id/performance
POST   /strategies/:id/backtest
POST   /strategies/:id/clone
GET    /strategies/comparison?ids=id1,id2
GET    /strategies/trending
GET    /strategies/templates
PATCH  /strategies/:id
GET    /strategies/:id/operations
```

### **Psychoanalysis Routes** (`src/routes/psychoanalysis.routes.ts`)
**Endpoints Sugeridos:**
```
GET    /psychoanalysis/discipline
GET    /psychoanalysis/emotion-cycle
GET    /psychoanalysis/anomalies
GET    /psychoanalysis/alert
GET    /psychoanalysis/hourly
GET    /psychoanalysis/prediction
POST   /psychoanalysis/feedback
GET    /psychoanalysis/report/pdf
GET    /psychoanalysis/benchmark
```

## 🎨 Componentes Frontend

### **CalendarPage** (`src/pages/CalendarPage.tsx`)
**Vistas y Características:**
- Weekly view + Yearly overview
- Heatmap de rentabilidad
- Exportación a PDF/imagen
- Filtrado avanzado (por estrategia, tipo, símbolo)
- Integración con calendario del sistema
- Alertas de anomalías
- Ciclos lunares/eventos externos
- Sincronización con calendarios externos

### **DailyOperationsModal** (`src/components/DailyOperationsModal.tsx`)
**Mejoras:**
- Validación de precios (buy < sell)
- Autocompletar símbolo
- Calculadora de PnL en tiempo real
- Import desde CSV
- Auditoría de cambios
- Templates de operaciones

### **StrategiesPage** (`src/pages/StrategiesPage.tsx`)
**Funcionalidades:**
- Dashboard de backtesting
- Clonación de estrategias
- Ranking por rentabilidad
- Alertas para cambios de status
- Badges de logros
- System templates predefinidos
- Integración con ML para sugerencias

### **PsychoanalysisPage** (`src/pages/PsychoanalysisPage.tsx`)
**Enhancements:**
- Scoring de disciplina (0-100)
- ML-powered predictions
- Detección de anomalías
- Alertas automáticas
- Análisis horario (heat maps)
- Gamificación con badges
- Evolution tracking mensual
- Correlación con mercado
- PDF export with charts
- Benchmarking vs otros traders

## 🔐 Infraestructura y Seguridad

### **API Configuration** (`src/services/api.ts`)
**Seguridad y Performance:**
- JWT authentication + refresh tokens
- Retry automático con backoff
- HTTP caching strategy
- Request deduplication
- Payload compression
- Data encryption
- Client-side rate limiting
- Request tracing IDs
- Centralized logging
- Latency analytics

### **Services Index** (`src/services/index.ts`)
**Integraciones:**
- Autenticación/autorización
- Offline-first sync con IndexedDB
- Persistent cache
- WebSocket real-time updates
- Automatic retry logic
- CSV/Excel export-import
- Broker API integrations
- Webhooks para notificaciones

## 📊 Priorización de Expansiones

### **Alto Impacto, Baja Complejidad** ⭐⭐⭐
1. Commission tracking en Operation model
2. CSV export/import para operaciones
3. Basic strategy performance dashboard
4. Weekly/monthly/yearly calendar views
5. PDF export del psychoanalysis report

### **Alto Impacto, Complejidad Media** ⭐⭐
1. Validation schemas con zod
2. Strategy backtesting simple
3. Hourly analysis en psychoanalysis
4. WebSocket real-time updates
5. Caching strategy completa

### **Alto Impacto, Alta Complejidad** ⭐
1. ML-powered predictions
2. Full broker API integration
3. Multi-usuario con roles
4. MongoDB migration
5. Offline-first architecture

## 🛠️ Cómo Usar Este Roadmap

1. **Para Desarrolladores:** Buscar `// EXPANSIÓN:` en el código para identificar puntos de expansión específicos
2. **Para Project Managers:** Usar este documento para planificación de sprints
3. **Para Code Reviews:** Verificar que nuevas funcionalidades sigan el patrón de comentarios similar
4. **Para Documentación:** Mantener este archivo actualizado cuando se implementen nuevas features

## 📝 Notas Importantes

- Todos los puntos de expansión están documentados INLINE en el código
- Las migraciones de base de datos deben preservar compatibilidad hacia atrás
- Los endpoints nuevos deben seguir el patrón RESTful existente
- Las nuevas funcionalidades deben incluir tests unitarios
- La documentación debe actualizarse en paralelo con la implementación

---

**Última Actualización:** [Current Date]
**Versión:** 1.0
