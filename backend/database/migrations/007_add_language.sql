-- Migración: Añadir columna de idioma al usuario
-- Valores posibles: 'es' (español, por defecto) y 'en' (inglés)
ALTER TABLE users ADD COLUMN language VARCHAR(5) DEFAULT 'es' NOT NULL;
