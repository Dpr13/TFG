# 🗄️ Base de Datos - TFG Análisis de Riesgo Financiero

## 📋 Resumen del Esquema

### Tablas Principales (Implementación Inmediata)

| Tabla | Descripción | Propósito |
|-------|-------------|-----------|
| **users** | Usuarios del sistema | Autenticación y preferencias |
| **user_watchlists** | Activos favoritos | Personalización por usuario |
| **price_history** | Precios históricos | Datos OHLCV para cálculos |
| **financial_data_cache** | Caché de datos financieros | Reducir llamadas a APIs externas |

### Tablas Opcionales (Funcionalidad Futura)

| Tabla | Descripción |
|-------|-------------|
| **portfolios** | Carteras de inversión |
| **portfolio_positions** | Posiciones en cada cartera |

---

## 🚀 Instalación y Configuración

### 1. Instalar PostgreSQL

#### En Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### En macOS:
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### En Windows:
Descarga desde: https://www.postgresql.org/download/windows/

### 2. Crear Base de Datos

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE tfg_risk_analysis;

# Crear usuario
CREATE USER tfg_user WITH PASSWORD 'tu_password_segura';

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE tfg_risk_analysis TO tfg_user;

# Salir
\q
```

### 3. Ejecutar el Schema

```bash
# Desde el directorio backend/database
psql -U tfg_user -d tfg_risk_analysis -f schema.sql
```

---

## 🔧 Configuración del Backend

### Opción A: Usando Prisma (Recomendado)

#### 1. Instalar Prisma
```bash
cd backend
npm install prisma @prisma/client
npx prisma init
```

#### 2. Configurar `.env`
```env
DATABASE_URL="postgresql://tfg_user:tu_password@localhost:5432/tfg_risk_analysis?schema=public"
```

#### 3. Crear `prisma/schema.prisma`
Prisma generará el esquema automáticamente desde la base de datos:
```bash
npx prisma db pull
npx prisma generate
```

### Opción B: Usando TypeORM

#### 1. Instalar TypeORM
```bash
npm install typeorm pg reflect-metadata
```

#### 2. Configurar conexión en `src/config/database.ts`
```typescript
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "tfg_user",
  password: "tu_password",
  database: "tfg_risk_analysis",
  synchronize: false, // ¡Usar migraciones!
  logging: true,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
});
```

---

## 📊 Migración de Datos Existentes

Si tienes datos en JSON (como `assets.json` y `prices.json`), necesitas migrarlos:

### Script de Migración (ejemplo con Prisma)

```typescript
// scripts/migrate-json-to-db.ts
import { PrismaClient } from '@prisma/client';
import prices from '../src/data/prices.json';

const prisma = new PrismaClient();

async function migrateHistoricalPrices() {
  console.log('Migrando precios históricos...');
  
  for (const price of prices) {
    await prisma.price_history.upsert({
      where: {
        symbol_date: {
          symbol: price.assetId,
          date: new Date(price.date)
        }
      },
      update: {
        close: price.price,
        currency: price.currency || 'USD'
      },
      create: {
        symbol: price.assetId,
        date: new Date(price.date),
        close: price.price,
        currency: price.currency || 'USD'
      }
    });
  }
  
  console.log('✅ Migración completada');
}

migrateHistoricalPrices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 🔄 Actualización Incremental de Precios

### Lógica Recomendada

```typescript
// services/price-sync.service.ts
export class PriceSyncService {
  async syncPriceHistory(symbol: string) {
    // 1. Obtener última fecha en la base de datos
    const lastPrice = await prisma.price_history.findFirst({
      where: { symbol },
      orderBy: { date: 'desc' }
    });
    
    // 2. Determinar desde qué fecha pedir datos
    const startDate = lastPrice 
      ? new Date(lastPrice.date.getTime() + 86400000) // +1 día
      : new Date('2020-01-01'); // Primera vez
    
    // 3. Pedir datos nuevos a la API
    const newPrices = await yahooFinanceAPI.getHistoricalPrices(
      symbol, 
      startDate, 
      new Date()
    );
    
    // 4. Guardar solo los nuevos
    for (const price of newPrices) {
      await prisma.price_history.upsert({
        where: { symbol_date: { symbol, date: price.date } },
        update: { ...price },
        create: { symbol, ...price }
      });
    }
  }
}
```

---

## 🗑️ Limpieza de Caché Expirado

### Cron Job o Script Periódico

```typescript
// scripts/clean-expired-cache.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanExpiredCache() {
  const result = await prisma.financial_data_cache.deleteMany({
    where: {
      expires_at: {
        lt: new Date() // Menor que ahora
      }
    }
  });
  
  console.log(`🗑️ Eliminados ${result.count} registros de caché expirados`);
}

cleanExpiredCache()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Ejecutar periódicamente con cron:
```bash
# Cada día a las 3 AM
0 3 * * * cd /path/to/backend && npm run clean:cache
```

---

## 🔍 Consultas Útiles

### Obtener precios de un activo con rango de fechas
```sql
SELECT * FROM price_history
WHERE symbol = 'AAPL'
  AND date BETWEEN '2026-01-01' AND '2026-02-01'
ORDER BY date ASC;
```

### Obtener watchlist de un usuario con datos actuales
```sql
SELECT 
  w.asset_symbol,
  w.asset_name,
  w.asset_type,
  p.close as last_price,
  p.date as last_price_date
FROM user_watchlists w
LEFT JOIN LATERAL (
  SELECT close, date 
  FROM price_history 
  WHERE symbol = w.asset_symbol 
  ORDER BY date DESC 
  LIMIT 1
) p ON true
WHERE w.user_id = '...'
ORDER BY w.added_at DESC;
```

### Verificar caché válido
```sql
SELECT symbol, last_updated, expires_at
FROM financial_data_cache
WHERE symbol = 'AAPL'
  AND expires_at > CURRENT_TIMESTAMP;
```

---

## 📈 Rendimiento y Optimización

### Índices Creados
- **users**: email
- **user_watchlists**: user_id, asset_symbol
- **price_history**: symbol, date, (symbol, date)
- **financial_data_cache**: symbol, expires_at, GIN(data)

### Consejos de Optimización
1. **Usar conexiones pool**: Configura un pool de conexiones en Prisma/TypeORM
2. **Cachear consultas frecuentes**: Usa Redis para consultas muy repetidas
3. **Paginación**: No devuelvas miles de precios de una vez
4. **Índices compuestos**: Ya incluidos en el schema para consultas comunes

---

## 🔐 Seguridad

### Variables de Entorno (`.env`)
```env
# Database
DATABASE_URL="postgresql://tfg_user:password@localhost:5432/tfg_risk_analysis"

# JWT
JWT_SECRET="tu_secret_super_seguro_aqui"
JWT_EXPIRES_IN="7d"

# API Keys (si las usas)
YAHOO_FINANCE_API_KEY=""
```

### Nunca expongas
- ❌ Contraseñas en código
- ❌ Tokens de API en repositorio
- ❌ DATABASE_URL en logs

---

## ✅ Checklist de Implementación

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada
- [ ] Schema ejecutado (`schema.sql`)
- [ ] ORM configurado (Prisma/TypeORM)
- [ ] Variables de entorno configuradas
- [ ] Datos JSON migrados a PostgreSQL
- [ ] Endpoints adaptados para usar base de datos
- [ ] Sistema de autenticación implementado
- [ ] Actualización incremental de precios funcionando
- [ ] Limpieza de caché configurada

---

## 🆘 Troubleshooting

### Error: "role does not exist"
```bash
sudo -u postgres createuser tfg_user
```

### Error: "peer authentication failed"
Edita `/etc/postgresql/14/main/pg_hba.conf`:
```
# Cambia "peer" por "md5"
local   all   all   md5
host    all   all   127.0.0.1/32   md5
```

### Ver tablas creadas
```bash
psql -U tfg_user -d tfg_risk_analysis -c "\dt"
```

---

## 📚 Recursos Adicionales

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeORM Docs](https://typeorm.io/)
- [Node.js + PostgreSQL Best Practices](https://node-postgres.com/)
