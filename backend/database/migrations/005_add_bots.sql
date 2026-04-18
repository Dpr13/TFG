-- Paper trading bots
CREATE TABLE bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    strategy VARCHAR(30) NOT NULL CHECK (strategy IN ('momentum', 'mean-reversion')),
    status VARCHAR(20) NOT NULL DEFAULT 'stopped' CHECK (status IN ('running', 'stopped')),
    initial_capital DECIMAL(15,2) NOT NULL DEFAULT 10000,
    current_capital DECIMAL(15,2) NOT NULL DEFAULT 10000,
    position_size DECIMAL(15,6) NOT NULL DEFAULT 0,
    position_entry_price DECIMAL(15,5),
    params JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual trades executed by a bot
CREATE TABLE bot_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity DECIMAL(15,6) NOT NULL,
    fill_price DECIMAL(15,5) NOT NULL,
    pnl DECIMAL(15,2),
    executed_at TIMESTAMPTZ DEFAULT NOW()
);
