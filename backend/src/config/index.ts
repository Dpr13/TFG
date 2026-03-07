import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables from .env file
dotenv.config();

// Verificar si DATABASE_URL está configurada
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL no está configurada en .env');
}

// Determinar si necesitamos SSL basándonos en el host
const needsSSL = process.env.DATABASE_URL?.includes('supabase.co') || 
                 process.env.DATABASE_URL?.includes('amazonaws.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(needsSSL && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

/**
 * Application configuration
 * Centralized configuration loaded from environment variables
 */
export const config = {
  /**
   * Server port
   */
  port: process.env.PORT || 3001,

  /**
   * Market data provider type: 'mock' or 'yahoo-finance'
   * Default to 'yahoo-finance' for development (no API key required)
   */
  marketDataProvider: (process.env.MARKET_DATA_PROVIDER || 'yahoo-finance') as
    | 'mock'
    | 'yahoo-finance',

  /**
   * Environment
   */
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
};

// Exportar pool para uso en otros módulos
export { pool };
