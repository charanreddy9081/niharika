-- Migration 005: user_reviews table
-- Stores reviews submitted by logged-in users, pending admin approval

CREATE TABLE IF NOT EXISTS user_reviews (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name    TEXT NOT NULL,
  user_email   TEXT NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review       TEXT NOT NULL,
  designation  TEXT,          -- e.g. "Verified Buyer", "Collector"
  location     TEXT,
  photo_url    TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note   TEXT,          -- optional internal note from admin
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_reviews DISABLE ROW LEVEL SECURITY;
GRANT ALL ON user_reviews TO anon, authenticated, service_role;

-- Index for fast status queries
CREATE INDEX IF NOT EXISTS user_reviews_status_idx ON user_reviews (status);
CREATE INDEX IF NOT EXISTS user_reviews_user_idx   ON user_reviews (user_email);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS user_reviews_updated_at ON user_reviews;
CREATE TRIGGER user_reviews_updated_at
  BEFORE UPDATE ON user_reviews
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();
