-- Position-based journaling: replaces the flat operations model
-- positions: one record per trading position (can be partially closed)
CREATE TABLE positions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol           VARCHAR(20) NOT NULL,
  direction        VARCHAR(5) NOT NULL CHECK (direction IN ('long', 'short')),
  status           VARCHAR(6) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  quantity_total   DECIMAL(20,8) NOT NULL,
  quantity_open    DECIMAL(20,8) NOT NULL,
  avg_entry_price  DECIMAL(20,8) NOT NULL,
  strategy_id      UUID REFERENCES strategies(id) ON DELETE SET NULL,
  notes            TEXT,
  opened_at        DATE NOT NULL,
  closed_at        DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- position_trades: every individual execution linked to a position
CREATE TABLE position_trades (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id  UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action       VARCHAR(5) NOT NULL CHECK (action IN ('open', 'close')),
  quantity     DECIMAL(20,8) NOT NULL,
  price        DECIMAL(20,8) NOT NULL,
  pnl          DECIMAL(20,8),
  pnl_pct      DECIMAL(10,4),
  executed_at  DATE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_positions_user_status  ON positions(user_id, status);
CREATE INDEX idx_pos_trades_user_date   ON position_trades(user_id, executed_at);
CREATE INDEX idx_pos_trades_position    ON position_trades(position_id);
