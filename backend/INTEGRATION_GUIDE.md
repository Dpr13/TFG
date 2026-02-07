# Guía de Integración - Yahoo Finance Market Data Provider

## 📋 Resumen de Cambios

Se ha implementado el patrón **Strategy** para desacoplar la fuente de datos de mercado, permitiendo cambiar entre datos mock y API externa sin modificar la lógica de negocio.

## 🗂️ Archivos Creados

### Providers
- `src/providers/interfaces/MarketDataProvider.ts` - Interfaz que define el contrato para proveedores
- `src/providers/MockMarketDataProvider.ts` - Implementación con datos JSON locales
- `src/providers/YahooFinanceMarketDataProvider.ts` - Implementación con API de Yahoo Finance (gratis, sin API key)
- `src/providers/ProviderFactory.ts` - Factory para instanciar el provider correcto según config
- `src/providers/index.ts` - Exports centralizados

### Configuración
- `src/config/index.ts` - Configuración centralizada con variables de entorno
- `.env` - Variables de entorno

## 📝 Archivos Modificados

### Services
- `src/services/price.service.ts`
  - Ahora recibe `MarketDataProvider` en el constructor (inyección de dependencias)
  - Método `getPriceHistory` ahora es `async` y retorna `Promise`
  - Ya no depende directamente del `MarketDataRepository`

### Controllers
- `src/controllers/price.controller.ts`
  - Ahora instancia `PriceService` una sola vez
  - Método `getPriceHistory` ahora es `async`
  - Añadido manejo de errores con try-catch

### Documentación
- `README.md` - Actualizado con información sobre providers y configuración

## 🚀 Cómo Usar

### 1. Instalar dependencias

```bash
cd backend
npm install axios dotenv
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado:

**Para producción (API real de Yahoo Finance - por defecto):**
```env
PORT=3001
NODE_ENV=development
MARKET_DATA_PROVIDER=yahoo-finance
# No se requiere API key - Yahoo Finance es gratuito
```

**Para testing (datos mock):**
```env
PORT=3001
NODE_ENV=development
MARKET_DATA_PROVIDER=mock
```

### 3. Ejecutar el servidor

```bash
npm run dev
```

### 4. Probar el endpoint

```bash
# Con Yahoo Finance provider (datos reales, gratis)
curl http://localhost:3001/api/assets/AAPL/history

# Con Bitcoin
curl http://localhost:3001/api/assets/BTC/history

# Con mock provider (datos JSON locales)
# Cambia MARKET_DATA_PROVIDER=mock en .env
curl http://localhost:3001/api/assets/AAPL/history
```

## 🧪 Testing

Los tests **siempre** usan el `MockMarketDataProvider`, nunca hacen llamadas reales a la API:

```typescript
// En tus tests
import { PriceService } from '../price.service';
import { MockMarketDataProvider } from '../../providers';

describe('PriceService', () => {
  it('should get price history', async () => {
    const mockProvider = new MockMarketDataProvider();
    const service = new PriceService(mockProvider);
    
    const result = await service.getPriceHistory('AAPL');
    
    expect(result).not.toBeNull();
    expect(result?.symbol).toBe('AAPL');
  });
});
```

## 🔍 Flujo de Datos

```
1. Request: GET /api/assets/AAPL/history
                    ↓
2. Router: price.routes.ts
                    ↓
3. Controller: price.controller.ts
                    ↓
4. Service: PriceService.getPriceHistory()
                    ↓
5. Provider: (elegido por ProviderFactory según config)
   - MockMarketDataProvider → Lee JSON local
   - YahooFinanceMarketDataProvider → Llama a Yahoo Finance API (gratis)
                    ↓
6. Response: { symbol: "AAPL", prices: [...] }
```

## 📊 Formato de Respuesta

Ambos providers normalizan los datos al mismo formato:

```typescript
{
  symbol: string;
  name?: string;   // Nombre del activo (opcional)
  prices: Array<{
    date: string;    // ISO format: "2024-01-01"
    close: number;   // Precio de cierre
  }>;
}
```

## 🎯 Ventajas del Diseño

1. **Desacoplamiento**: La lógica de negocio no sabe de dónde vienen los datos
2. **Testeable**: Fácil inyectar mocks en tests
3. **Extensible**: Agregar nuevos providers (Binance, Coinbase) es trivial
4. **Configurable**: Cambiar proveedor sin modificar código, solo `.env`
5. **Sin API Keys**: Yahoo Finance es gratuito y no requiere autenticación
6. **Preparado para DB**: En el futuro, agregar `DatabaseMarketDataProvider` sin cambios en services

## 🔄 Agregar Nuevo Provider (Ejemplo: Binance)

```typescript
// 1. Crear src/providers/BinanceMarketDataProvider.ts
export class BinanceMarketDataProvider implements MarketDataProvider {
  async getHistoricalPrices(symbol: string): Promise<Array<{date: string, close: number}> | null> {
    // Implementar lógica de Binance API
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: { symbol: `${symbol}USDT`, interval: '1d' }
    });
    // Transformar y retornar datos
  }
}

// 2. Actualizar ProviderFactory.ts
case 'binance':
  this.instance = new BinanceMarketDataProvider();
  break;

// 3. Actualizar config/index.ts para aceptar 'binance' como opción
```

## ✅ Ventajas de Yahoo Finance

- **Gratuito** - No requiere API key ni registro
- **Sin límites** - No hay límite de peticiones por día
- **Datos en tiempo real** - Actualización continua
- **Cobertura amplia** - Acciones, criptomonedas, ETFs, commodities
- **Históricos completos** - Años de datos históricos
- **Intervalos flexibles** - 1m, 5m, 15m, 1h, 1d, 1wk, 1mo

## 📚 Recursos

- [Yahoo Finance](https://finance.yahoo.com/)
- [Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
