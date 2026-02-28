-- ============================================================================
-- ESQUEMA DE BASE DE DATOS - TFG Análisis de Riesgo Financiero
-- ============================================================================
-- Motor: PostgreSQL 14+
-- Encoding: UTF-8
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA: users
-- Descripción: Almacena información de usuarios del sistema
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Preferencias del usuario
    notifications_enabled BOOLEAN DEFAULT true,
    dark_mode BOOLEAN DEFAULT false,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuarios
CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Usuarios del sistema';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt de la contraseña';
COMMENT ON COLUMN users.notifications_enabled IS 'Si el usuario quiere recibir notificaciones';


-- ============================================================================
-- TABLA: user_watchlists
-- Descripción: Activos favoritos/seguidos por cada usuario
-- ============================================================================
CREATE TABLE user_watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Información del activo
    asset_symbol VARCHAR(20) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'forex')),
    
    -- Auditoría
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Un usuario no puede tener el mismo activo duplicado
    UNIQUE(user_id, asset_symbol)
);

-- Índices para watchlists
CREATE INDEX idx_watchlists_user ON user_watchlists(user_id);
CREATE INDEX idx_watchlists_symbol ON user_watchlists(asset_symbol);

COMMENT ON TABLE user_watchlists IS 'Activos seguidos/favoritos de cada usuario';
COMMENT ON COLUMN user_watchlists.asset_symbol IS 'Símbolo del activo (ej: AAPL, BTC)';


-- ============================================================================
-- TABLA: price_history
-- Descripción: Precios históricos de activos financieros
-- ============================================================================
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificación
    symbol VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    
    -- Datos de precio (OHLCV)
    open DECIMAL(20, 8),
    high DECIMAL(20, 8),
    low DECIMAL(20, 8),
    close DECIMAL(20, 8) NOT NULL,
    volume BIGINT,
    
    -- Información adicional
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción: un símbolo solo puede tener un precio por fecha
    UNIQUE(symbol, date)
);

-- Índices para price_history
CREATE INDEX idx_price_symbol ON price_history(symbol);
CREATE INDEX idx_price_date ON price_history(date);
CREATE INDEX idx_price_symbol_date ON price_history(symbol, date DESC);

COMMENT ON TABLE price_history IS 'Histórico de precios diarios de activos';
COMMENT ON COLUMN price_history.close IS 'Precio de cierre (principal para cálculos)';
COMMENT ON COLUMN price_history.volume IS 'Volumen de transacciones';


-- ============================================================================
-- TABLA: financial_data_cache
-- Descripción: Caché de datos financieros obtenidos de APIs externas
-- Propósito: Evitar llamadas excesivas a Yahoo Finance y mejorar rendimiento
-- ============================================================================
CREATE TABLE financial_data_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificación
    symbol VARCHAR(20) NOT NULL UNIQUE,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'forex')),
    
    -- Datos financieros (formato JSON flexible)
    -- Para stocks: P/E, EPS, market cap, beta, ratios, etc.
    -- Para crypto: market cap, supply, ATH, etc.
    data JSONB NOT NULL,
    
    -- Control de caché
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para financial_data_cache
CREATE INDEX idx_financial_symbol ON financial_data_cache(symbol);
CREATE INDEX idx_financial_expires ON financial_data_cache(expires_at);
CREATE INDEX idx_financial_data_gin ON financial_data_cache USING GIN (data);

COMMENT ON TABLE financial_data_cache IS 'Caché de datos financieros de APIs externas';
COMMENT ON COLUMN financial_data_cache.data IS 'Datos financieros en formato JSON flexible';
COMMENT ON COLUMN financial_data_cache.expires_at IS 'Fecha de expiración del caché (ej: 24 horas)';


-- ============================================================================
-- TABLA OPCIONAL: portfolios (para funcionalidad futura)
-- Descripción: Carteras de inversión de usuarios
-- ============================================================================
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolios_user ON portfolios(user_id);

COMMENT ON TABLE portfolios IS 'Carteras de inversión de usuarios (funcionalidad futura)';


-- ============================================================================
-- TABLA OPCIONAL: portfolio_positions
-- Descripción: Posiciones (activos) dentro de cada cartera
-- ============================================================================
CREATE TABLE portfolio_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Activo
    symbol VARCHAR(20) NOT NULL,
    
    -- Detalles de la posición
    quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0),
    average_price DECIMAL(20, 8) NOT NULL,
    purchase_date DATE NOT NULL,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_positions_portfolio ON portfolio_positions(portfolio_id);
CREATE INDEX idx_positions_symbol ON portfolio_positions(symbol);

COMMENT ON TABLE portfolio_positions IS 'Posiciones de activos en carteras (funcionalidad futura)';


-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_history_updated_at
    BEFORE UPDATE ON price_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_positions_updated_at
    BEFORE UPDATE ON portfolio_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL - para desarrollo/testing)
-- ============================================================================

-- Usuario de prueba (contraseña: "password123" - hash bcrypt)
INSERT INTO users (name, email, password_hash, notifications_enabled, dark_mode)
VALUES (
    'Usuario Demo',
    'demo@tfg.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    true,
    false
);

-- Watchlist de ejemplo
INSERT INTO user_watchlists (user_id, asset_symbol, asset_name, asset_type)
SELECT 
    id,
    'AAPL',
    'Apple Inc.',
    'stock'
FROM users WHERE email = 'demo@tfg.com';

INSERT INTO user_watchlists (user_id, asset_symbol, asset_name, asset_type)
SELECT 
    id,
    'BTC',
    'Bitcoin',
    'crypto'
FROM users WHERE email = 'demo@tfg.com';


-- ============================================================================
-- COMENTARIOS FINALES
-- ============================================================================

-- RESUMEN DE TABLAS:
-- 1. users                   - Usuarios del sistema ✅
-- 2. user_watchlists         - Activos favoritos ✅
-- 3. price_history           - Precios históricos ✅
-- 4. financial_data_cache    - Caché de datos financieros ✅
-- 5. portfolios              - Carteras (opcional/futuro) 📋
-- 6. portfolio_positions     - Posiciones en carteras (opcional/futuro) 📋

-- NO SE INCLUYEN:
-- - risk_metrics_cache: Los cálculos se hacen en tiempo real sobre precios actuales

-- PRÓXIMOS PASOS:
-- 1. Configurar conexión PostgreSQL
-- 2. Instalar ORM (Prisma o TypeORM)
-- 3. Migrar datos de JSON a PostgreSQL
-- 4. Implementar autenticación (JWT)
-- 5. Implementar lógica de actualización incremental de precios
