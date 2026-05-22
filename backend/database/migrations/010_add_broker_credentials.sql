-- API credentials for external brokers, stored encrypted per user
CREATE TABLE broker_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    broker VARCHAR(20) NOT NULL CHECK (broker IN ('alpaca')), -- extend CHECK when adding new brokers
    api_key_enc TEXT NOT NULL,
    api_secret_enc TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, broker)
);
