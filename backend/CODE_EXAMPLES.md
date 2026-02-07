# Ejemplos de Código - Market Data Providers

## 📌 Uso Básico

### Ejemplo 1: Usar el Provider por Defecto (según configuración)

```typescript
import { PriceService } from './services/price.service';

// El servicio usa automáticamente el provider configurado en .env
const priceService = new PriceService();

// Obtener histórico de precios
const data = await priceService.getPriceHistory('AAPL');

if (data) {
  console.log(`Symbol: ${data.symbol}`);
  console.log(`Number of prices: ${data.prices.length}`);
  data.prices.forEach(price => {
    console.log(`${price.date}: $${price.close}`);
  });
} else {
  console.log('Symbol not found');
}
```

### Ejemplo 2: Usar Mock Provider Explícitamente

```typescript
import { PriceService } from './services/price.service';
import { MockMarketDataProvider } from './providers';

// Crear provider mock manualmente
const mockProvider = new MockMarketDataProvider();

// Inyectar el provider en el servicio
const priceService = new PriceService(mockProvider);

// Obtener datos
const data = await priceService.getPriceHistory('GOOGL');
console.log(data);
```

### Ejemplo 3: Usar Yahoo Finance Provider Directamente

```typescript
import { YahooFinanceMarketDataProvider } from './providers';

// Crear provider (no requiere API key)
const yahooProvider = new YahooFinanceMarketDataProvider();

// Obtener datos directamente del provider
try {
  const prices = await yahooProvider.getHistoricalPrices('MSFT');
  
  if (prices) {
    console.log('Historical prices:', prices);
  } else {
    console.log('No data found for this symbol');
  }
} catch (error) {
  console.error('Error fetching data:', error);
}

// También funciona con criptomonedas
const btcPrices = await yahooProvider.getHistoricalPrices('BTC');
console.log('Bitcoin prices:', btcPrices);
```

## 🧪 Testing - Siempre Usar Mock

### Test con Mock Provider

```typescript
import { describe, it, expect } from 'vitest';
import { PriceService } from '../price.service';
import { MockMarketDataProvider } from '../../providers';

describe('PriceService - Price History', () => {
  it('should return prices for valid symbol', async () => {
    // Arrange
    const mockProvider = new MockMarketDataProvider();
    const service = new PriceService(mockProvider);

    // Act
    const result = await service.getPriceHistory('AAPL');

    // Assert
    expect(result).not.toBeNull();
    expect(result?.symbol).toBe('AAPL');
    expect(result?.prices.length).toBeGreaterThan(0);
  });

  it('should return null for invalid symbol', async () => {
    const mockProvider = new MockMarketDataProvider();
    const service = new PriceService(mockProvider);

    const result = await service.getPriceHistory('INVALID');

    expect(result).toBeNull();
  });
});
```

### Test con Mock Personalizado

```typescript
import { describe, it, expect } from 'vitest';
import { PriceService } from '../price.service';
import { MarketDataProvider } from '../../providers/interfaces/MarketDataProvider';

describe('PriceService - Custom Mock', () => {
  it('should handle provider errors gracefully', async () => {
    // Custom mock que simula un error
    const errorProvider: MarketDataProvider = {
      async getHistoricalPrices(symbol: string) {
        throw new Error('Network error');
      },
    };

    const service = new PriceService(errorProvider);

    // Debería lanzar el error
    await expect(service.getPriceHistory('AAPL')).rejects.toThrow('Network error');
  });

  it('should work with custom data', async () => {
    // Custom mock con datos específicos
    const customProvider: MarketDataProvider = {
      async getHistoricalPrices(symbol: string) {
        if (symbol === 'TEST') {
          return [
            { date: '2024-01-01', close: 100 },
            { date: '2024-01-02', close: 101 },
          ];
        }
        return null;
      },
    };

    const service = new PriceService(customProvider);
    const result = await service.getPriceHistory('TEST');

    expect(result?.prices).toHaveLength(2);
    expect(result?.prices[0].close).toBe(100);
  });
});
```

## 🔧 Controlador con Manejo de Errores

```typescript
import { Request, Response } from 'express';
import { PriceService } from '../services/price.service';

const priceService = new PriceService();

export const getPriceHistory = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  // Validación de entrada
  if (!symbol || typeof symbol !== 'string') {
    res.status(400).json({ 
      error: 'Symbol parameter is required',
      message: 'Please provide a valid symbol (e.g., AAPL, GOOGL)'
    });
    return;
  }

  try {
    // Obtener datos del servicio
    const result = await priceService.getPriceHistory(symbol);

    // Si no se encuentra el símbolo
    if (!result) {
      res.status(404).json({ 
        error: `Asset with symbol '${symbol}' not found`,
        message: 'The requested symbol does not exist in our database'
      });
      return;
    }

    // Respuesta exitosa
    res.json(result);
    
  } catch (error) {
    // Manejo de errores (API rate limit, network, etc.)
    console.error('Error fetching price history:', error);
    
    res.status(500).json({
      error: 'Failed to fetch price history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
```

## 🏭 Factory Pattern - Elegir Provider Dinámicamente

```typescript
import { ProviderFactory } from './providers/ProviderFactory';

// El factory lee la configuración y devuelve el provider correcto
const provider = ProviderFactory.getMarketDataProvider();

// Usar el provider (puede ser Mock o YahooFinance según .env)
const prices = await provider.getHistoricalPrices('AAPL');
```

## 🔄 Cambiar Provider en Runtime

```typescript
import { ProviderFactory } from './providers/ProviderFactory';
import { PriceService } from './services/price.service';
import { YahooFinanceMarketDataProvider } from './providers';

// Obtener provider por defecto
const defaultProvider = ProviderFactory.getMarketDataProvider();
const service1 = new PriceService(defaultProvider);

// Cambiar a Yahoo Finance manualmente
const yahooProvider = new YahooFinanceMarketDataProvider();
const service2 = new PriceService(yahooProvider);

// service1 usa el provider configurado
// service2 siempre usa Yahoo Finance
```

## 🎭 Implementar Nuevo Provider

El sistema ya incluye YahooFinanceMarketDataProvider. Si necesitas implementar otro provider:

```typescript
// 1. Implementar la interfaz
import { MarketDataProvider } from './interfaces/MarketDataProvider';
import axios from 'axios';

export class BinanceProvider implements MarketDataProvider {
  async getHistoricalPrices(
    symbol: string
  ): Promise<Array<{ date: string; close: number }> | null> {
    try {
      // Llamar a Binance API
      const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
        params: {
          symbol: `${symbol}USDT`,
          interval: '1d'
        }
      });
      
      // Transformar respuesta al formato estándar
      return response.data.map((item: any) => ({
        date: new Date(item[0]).toISOString().split('T')[0],
        close: parseFloat(item[4]),
      }));
    } catch (error) {
      console.error('Binance error:', error);
      return null;
    }
  }
}

// 2. Usar el nuevo provider
import { BinanceProvider } from './providers/BinanceProvider';
import { PriceService } from './services/price.service';

const binanceProvider = new BinanceProvider();
const service = new PriceService(binanceProvider);

const data = await service.getPriceHistory('BTC');
```

## 📊 Comparar Múltiples Providers

```typescript
import { MockMarketDataProvider, YahooFinanceMarketDataProvider } from './providers';

async function compareProviders(symbol: string) {
  const mockProvider = new MockMarketDataProvider();
  const yahooProvider = new YahooFinanceMarketDataProvider();

  // Obtener datos de ambos
  const [mockData, realData] = await Promise.all([
    mockProvider.getHistoricalPrices(symbol),
    yahooProvider.getHistoricalPrices(symbol),
  ]);

  console.log('Mock data points:', mockData?.length);
  console.log('Real data points:', realData?.length);

  // Comparar precios
  if (mockData && realData) {
    const lastMock = mockData[mockData.length - 1];
    const lastReal = realData[realData.length - 1];
    
    console.log('Latest mock price:', lastMock);
    console.log('Latest real price:', lastReal);
  }
}

compareProviders('AAPL');
```

## 🔒 Validación y Sanitización

```typescript
import { PriceService } from './services/price.service';

async function getValidatedPriceHistory(symbol: string) {
  // Validar símbolo
  if (!symbol || symbol.length === 0) {
    throw new Error('Symbol cannot be empty');
  }

  // Sanitizar: solo letras y números
  const sanitized = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (sanitized.length === 0) {
    throw new Error('Invalid symbol format');
  }

  // Límite de longitud
  if (sanitized.length > 10) {
    throw new Error('Symbol too long (max 10 characters)');
  }

  // Obtener datos
  const service = new PriceService();
  const data = await service.getPriceHistory(sanitized);

  return data;
}

// Uso
try {
  const data = await getValidatedPriceHistory('AAPL');
  console.log(data);
} catch (error) {
  console.error('Validation error:', error);
}
```

## 💾 Cache Simple para API Externa

```typescript
import { YahooFinanceMarketDataProvider } from './providers';

class CachedYahooFinanceProvider extends YahooFinanceMarketDataProvider {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 60 * 60 * 1000; // 1 hora

  async getHistoricalPrices(symbol: string) {
    const now = Date.now();
    const cached = this.cache.get(symbol);

    // Si hay cache válido, devolverlo
    if (cached && now - cached.timestamp < this.cacheDuration) {
      console.log(`Cache hit for ${symbol}`);
      return cached.data;
    }

    // Si no hay cache, obtener de la API
    console.log(`Cache miss for ${symbol}, fetching from API`);
    const data = await super.getHistoricalPrices(symbol);

    // Guardar en cache
    if (data) {
      this.cache.set(symbol, { data, timestamp: now });
    }

    return data;
  }
}

// Uso
const cachedProvider = new CachedYahooFinanceProvider();
const service = new PriceService(cachedProvider);

// Primera llamada: API request
await service.getPriceHistory('AAPL');

// Segunda llamada: desde cache
await service.getPriceHistory('AAPL');
```
