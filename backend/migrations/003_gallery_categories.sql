-- Migration: 003_gallery_categories.sql
-- Creates gallery_categories lookup table

CREATE TABLE IF NOT EXISTS gallery_categories (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery_categories DISABLE ROW LEVEL SECURITY;
GRANT ALL ON gallery_categories TO anon, authenticated, service_role;

-- Seed default categories
INSERT INTO gallery_categories (name, sort_order) VALUES
  ('Painting',             1),
  ('Pencil Portraits',     2),
  ('Caricature',           3),
  ('Live Wedding Painting',4)
ON CONFLICT (name) DO NOTHING;
