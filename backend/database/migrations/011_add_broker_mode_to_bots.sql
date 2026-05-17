-- Broker execution mode per bot: internal simulation or real broker account
ALTER TABLE bots
    ADD COLUMN broker_mode VARCHAR(20) NOT NULL DEFAULT 'simulated'
        CHECK (broker_mode IN ('simulated', 'alpaca_paper', 'alpaca_live'));

-- Commission paid per trade in account currency (0 for simulated bots)
ALTER TABLE bot_trades
    ADD COLUMN commission DECIMAL(15,6) NOT NULL DEFAULT 0;
