-- Migration: Add user_searched_assets table
-- This table stores the assets searched by users for personalized asset discovery

CREATE TABLE IF NOT EXISTS user_searched_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_type asset_type_enum NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, asset_symbol)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_searched_assets_user_id ON user_searched_assets(user_id);

-- Create index for faster lookups by searched_at (for ordering)
CREATE INDEX IF NOT EXISTS idx_user_searched_assets_searched_at ON user_searched_assets(searched_at DESC);
