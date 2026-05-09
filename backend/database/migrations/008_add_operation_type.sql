ALTER TABLE operations
  ADD COLUMN IF NOT EXISTS type VARCHAR(5) NOT NULL DEFAULT 'long'
    CHECK (type IN ('long', 'short'));
