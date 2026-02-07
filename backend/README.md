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
┌──────▼──────────────────┐
│ MarketDataProvider (IF) │  ← Abstracción de datos
└──────┬──────────────────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
┌──────┐  ┌────────────────┐
│ Mock │  │ Yahoo Finance  │
└──────┘  └────────────────┘
```

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── app.ts                    # Configuración Express
│   ├── server.ts                 # Punto de entrada
│   ├── config/                   # Configuración de la app
│   │   └── index.ts              # Variables de entorno
│   ├── models/                   # Interfaces TypeScript
│   │   ├── asset.ts
│   │   └── price.ts
│   ├── data/                     # Datos mock (JSON)
│   │   ├── assets.json
│   │   └── prices.json
│   ├── providers/                # Proveedores de datos
│   │   ├── interfaces/
│   │   │   └── MarketDataProvider.ts
│   │   ├── MockMarketDataProvider.ts
│   │   ├── YahooFinanceMarketDataProvider.ts
│   │   └── ProviderFactory.ts
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
├── .env.example                  # Ejemplo de variables de entorno
├── tsconfig.json
└── package.json
```

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo (con hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start

# Tests
npm test
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```bash
cp .env.example .env
```

Variables disponibles:

- `PORT`: Puerto del servidor (default: 3001)
- `NODE_ENV`: Entorno de ejecución (development/production)
- `MARKET_DATA_PROVIDER`: Proveedor de datos de mercado
  - `yahoo-finance`: Usa API de Yahoo Finance (gratuita, sin API key, recomendado)
  - `mock`: Usa datos JSON locales (recomendado para testing)

### Proveedores de Datos (Market Data Providers)

El sistema usa el patrón Strategy para desacoplar la fuente de datos del mercado:

#### YahooFinanceMarketDataProvider (Recomendado)
- Consume API gratuita de Yahoo Finance
- **No requiere API key** - Totalmente gratis
- Sin límite de peticiones
- Datos en tiempo real para acciones y criptomonedas
- Soporta datos históricos e intraday
- Configuración: `MARKET_DATA_PROVIDER=yahoo-finance` (por defecto)

#### MockMarketDataProvider
- Usa archivos JSON locales (`src/data/`)
- Ideal para testing y desarrollo sin conexión
- No requiere conexión externa
- Configuración: `MARKET_DATA_PROVIDER=mock`

**Ejemplo de configuración para Yahoo Finance:**
```env
MARKET_DATA_PROVIDER=yahoo-finance
# No se requiere API key
```

**Ejemplo de configuración para Mock:**
```env
MARKET_DATA_PROVIDER=mock
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
- **Axios** - Cliente HTTP para APIs externas
- **Dotenv** - Gestión de variables de entorno

## 📝 Notas de Desarrollo

- **Separación de responsabilidades**: Cada capa tiene una responsabilidad clara
- **Desacoplamiento**: MarketDataProvider permite cambiar fuente de datos sin modificar lógica de negocio
- **Strategy Pattern**: Múltiples proveedores de datos intercambiables
- **Type safety**: TypeScript strict mode habilitado
- **Testing**: Tests unitarios para servicios (siempre usan mock provider)
- **Mock data**: Datos JSON para desarrollo sin dependencias externas
- **Inyección de dependencias**: Los servicios reciben sus dependencias (testeable)

## 🎯 Próximos Pasos

- [ ] Añadir cálculos de métricas de riesgo (volatilidad, VaR, etc.)
- [ ] Implementar caché para respuestas de Yahoo Finance
- [ ] Implementar base de datos para almacenar históricos
- [ ] Añadir datos intraday (cada hora/minuto) desde Yahoo Finance
- [ ] Añadir más proveedores (Binance para crypto, etc.)
- [ ] Añadir autenticación
- [ ] Documentación con Swagger/OpenAPI
- [ ] Rate limiting para proteger la API
