-- Migration: Add email verification columns to users table
-- Created at: 2026-03-29

ALTER TABLE users ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN codigo_verificacion VARCHAR(6);
ALTER TABLE users ADD COLUMN codigo_expiracion TIMESTAMP;
