# Backend - API de Análisis de Riesgo Financiero

Backend para TFG desarrollado con Node.js + TypeScript + Express.

## 🏗️ Arquitectura

```
┌─────────────┐
│   Routes    │  ← Define endpoints HTTP
└──────┬──────┘
       │
┌──────▼──────┐
│ Controllers │  ← Maneja req/res HTTP
└──────┬──────┘
       │
┌──────▼──────┐
│  Services   │  ← Lógica de negocio
└──────┬──────┘
       │
┌──────▼──────┐
│ Repository  │  ← Acceso a datos
└──────┬──────┘
       │
┌──────▼──────┐
│ Data (JSON) │  ← Mock data
└─────────────┘
```

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── app.ts                    # Configuración Express
│   ├── server.ts                 # Punto de entrada
│   ├── models/                   # Interfaces TypeScript
│   │   ├── asset.ts
│   │   └── price.ts
│   ├── data/                     # Datos mock (JSON)
│   │   ├── assets.json
│   │   └── prices.json
│   ├── repositories/             # Capa de acceso a datos
│   │   └── marketData.repository.ts
│   ├── services/                 # Lógica de negocio
│   │   ├── asset.service.ts
│   │   ├── price.service.ts
│   │   └── __tests__/
│   ├── controllers/              # Manejo de HTTP
│   │   ├── asset.controller.ts
│   │   └── price.controller.ts
│   └── routes/                   # Definición de rutas
│       ├── index.ts
│       ├── assets.routes.ts
│       └── price.routes.ts
├── tsconfig.json
└── package.json
```

## 🚀 Comandos

```bash
# Desarrollo (con hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start

# Tests
npm test
```

## 📡 API Endpoints

### GET /api/assets
Devuelve lista de activos financieros disponibles.

**Respuesta:**
```json
[
  {
    "id": "1",
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "category": "Equity"
  }
]
```

### GET /api/assets/:symbol/history
Devuelve histórico de precios para un activo específico.

**Parámetros:**
- `symbol` (string): Símbolo del activo (ej: AAPL, GOOGL, BTC)

**Respuesta exitosa (200):**
```json
{
  "symbol": "AAPL",
  "prices": [
    { "date": "2024-01-01", "close": 180.25 },
    { "date": "2024-01-02", "close": 182.50 }
  ]
}
```

**Respuesta error (404):**
```json
{
  "error": "Asset with symbol 'INVALID' not found"
}
```

## 🧪 Testing

Ejecutar tests unitarios:
```bash
npm test
```

Ejecutar tests sin modo watch:
```bash
npm test -- --run
```

## 🔧 Tecnologías

- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipado estático
- **Express** - Framework web
- **Vitest** - Testing framework

## 📝 Notas de Desarrollo

- **Separación de responsabilidades**: Cada capa tiene una responsabilidad clara
- **Desacoplamiento**: El repository puede ser fácilmente reemplazado por API externa o DB
- **Type safety**: TypeScript strict mode habilitado
- **Testing**: Tests unitarios para servicios
- **Mock data**: Datos JSON para desarrollo sin dependencias externas

## 🎯 Próximos Pasos

- [ ] Añadir cálculos de métricas de riesgo (volatilidad, VaR, etc.)
- [ ] Integrar API externa para datos reales
- [ ] Implementar base de datos
- [ ] Añadir autenticación
- [ ] Documentación con Swagger/OpenAPI
