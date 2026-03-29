-- Fix: Change codigo_expiracion from TIMESTAMP to TIMESTAMPTZ
-- The TIMESTAMP type drops timezone info, causing expiration checks to fail
-- due to UTC vs local time mismatch.
-- Created at: 2026-03-29

ALTER TABLE users ALTER COLUMN codigo_expiracion TYPE TIMESTAMPTZ;
