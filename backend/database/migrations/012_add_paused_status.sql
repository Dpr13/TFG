-- Add 'paused' as a valid bot status
ALTER TABLE bots DROP CONSTRAINT IF EXISTS bots_status_check;
ALTER TABLE bots ADD CONSTRAINT bots_status_check CHECK (status IN ('running', 'paused', 'stopped'));
