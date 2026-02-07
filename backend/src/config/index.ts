import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
