-- ============================================================
-- Migration 004: Phase 1 CMS Tables
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. FAQ Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faq_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    TEXT DEFAULT 'General',
  sort_order  INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE faq_items DISABLE ROW LEVEL SECURITY;
GRANT ALL ON faq_items TO anon, authenticated, service_role;

-- ── 2. Testimonials ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  designation  TEXT,
  location     TEXT,
  review       TEXT NOT NULL,
  rating       INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  photo_url    TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
GRANT ALL ON testimonials TO anon, authenticated, service_role;

-- ── 3. Website Settings (single-row config) ──────────────────
CREATE TABLE IF NOT EXISTS website_settings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name       TEXT DEFAULT 'niharikartist',
  site_tagline    TEXT DEFAULT 'Haute Fine Art Atelier',
  contact_email   TEXT DEFAULT 'niharikaananthoja@niharikartist.shop',
  contact_phone   TEXT DEFAULT '+91 98765 43210',
  whatsapp_number TEXT DEFAULT '919876543210',
  address         TEXT DEFAULT 'niharikartist Fine Art Atelier, India',
  favicon_url     TEXT DEFAULT '/logo.png',
  logo_url        TEXT DEFAULT '/logo.png',
  theme_color     TEXT DEFAULT '#050f0b',
  meta_title      TEXT DEFAULT 'niharikartist | Haute Fine Art Atelier & Handcrafted Keepsakes',
  meta_description TEXT DEFAULT 'Original acrylic & oil paintings, sentimental sibling keepsakes, everlasting botanicals, and wax-sealed calligraphy letters by artist Niharika.',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE website_settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON website_settings TO anon, authenticated, service_role;

-- Insert default row
INSERT INTO website_settings (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ── 4. Social Media Links ────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_links (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform     TEXT NOT NULL UNIQUE,  -- 'instagram', 'facebook', etc.
  label        TEXT NOT NULL,
  url          TEXT NOT NULL DEFAULT '#',
  icon         TEXT DEFAULT 'instagram',
  is_visible   BOOLEAN DEFAULT TRUE,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE social_links DISABLE ROW LEVEL SECURITY;
GRANT ALL ON social_links TO anon, authenticated, service_role;

-- Seed default social links
INSERT INTO social_links (platform, label, url, icon, sort_order) VALUES
  ('instagram',  'Instagram',  'https://www.instagram.com/niharikartist', 'instagram', 1),
  ('facebook',   'Facebook',   'https://www.facebook.com/niharikartist',  'facebook',  2),
  ('youtube',    'YouTube',    'https://www.youtube.com/@niharikartist',  'youtube',   3),
  ('whatsapp',   'WhatsApp',   'https://wa.me/919876543210',              'whatsapp',  4),
  ('pinterest',  'Pinterest',  'https://www.pinterest.com/niharikartist', 'pinterest', 5)
ON CONFLICT (platform) DO NOTHING;

-- ── 5. SEO Settings per page ─────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug        TEXT NOT NULL UNIQUE,  -- 'home', 'about', 'gallery', etc.
  page_label       TEXT NOT NULL,
  meta_title       TEXT,
  meta_description TEXT,
  meta_keywords    TEXT,
  og_title         TEXT,
  og_description   TEXT,
  og_image_url     TEXT,
  canonical_url    TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE seo_settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON seo_settings TO anon, authenticated, service_role;

-- Seed default SEO rows for all pages
INSERT INTO seo_settings (page_slug, page_label, meta_title, meta_description) VALUES
  ('home',         'Home Page',          'niharikartist | Haute Fine Art Atelier & Handcrafted Keepsakes', 'Original acrylic & oil paintings, sentimental sibling keepsakes, everlasting botanicals, and wax-sealed calligraphy letters by artist Niharika.'),
  ('about',        'About / Artist',     'Meet Artist Niharika | niharikartist Fine Art Atelier',          'Discover the story behind niharikartist — an independent fine art atelier translating human memories into timeless handpainted heirlooms.'),
  ('gallery',      'Gallery',            'Masterworks Gallery | niharikartist',                            'Browse 50+ original handpainted masterworks — portraits, spiritual art, anime fanart, and bespoke keepsakes.'),
  ('shop',         'Shop / Store',       'Handcrafted Artwork Store | niharikartist',                      'Shop original handpainted artworks, pencil portraits, and wax-sealed calligraphy keepsakes.'),
  ('contact',      'Commissions',        'Book a Commission | niharikartist Studio',                       'Commission a custom handpainted portrait, sibling heirloom frame, or calligraphy letter from artist Niharika.'),
  ('journal',      'Journal',            'Atelier Journal | niharikartist',                                'Read patron stories, exhibition chronicles, and studio insights from niharikartist.'),
  ('faq',          'FAQ',                'Frequently Asked Questions | niharikartist',                     'Find answers to common questions about ordering, shipping, customisation, and our studio policies.'),
  ('shipping',     'Shipping Policy',    'Shipping & Delivery Policy | niharikartist',                     'Learn about our shipping timelines, packaging standards, and delivery guarantees across India.'),
  ('terms',        'Terms & Conditions', 'Terms & Conditions | niharikartist',                             'Read the terms of service for niharikartist fine art atelier.'),
  ('privacy',      'Privacy Policy',     'Privacy Policy | niharikartist',                                 'Understand how niharikartist collects, uses, and protects your personal data.'),
  ('refund',       'Refund Policy',      'Refund & Returns Policy | niharikartist',                        'Read our refund and replacement policy for handpainted artwork orders.')
ON CONFLICT (page_slug) DO NOTHING;

-- ── 6. Auto-update updated_at triggers ───────────────────────
CREATE OR REPLACE FUNCTION update_cms_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS faq_items_updated_at ON faq_items;
CREATE TRIGGER faq_items_updated_at BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

DROP TRIGGER IF EXISTS testimonials_updated_at ON testimonials;
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

DROP TRIGGER IF EXISTS website_settings_updated_at ON website_settings;
CREATE TRIGGER website_settings_updated_at BEFORE UPDATE ON website_settings FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

DROP TRIGGER IF EXISTS seo_settings_updated_at ON seo_settings;
CREATE TRIGGER seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

-- ── 7. Seed FAQ items ─────────────────────────────────────────
INSERT INTO faq_items (question, answer, sort_order) VALUES
  ('Are all artworks individually handpainted by artist Niharika?',
   'Yes, absolutely. Every piece in our atelier is an authentic original artwork sketched by hand with charcoal, painted with fine artist-grade acrylic and oil pigments, and finished with protective museum-grade glazes. No two frames are identical.',
   1),
  ('How does the complimentary wax-sealed gift calligraphy note work?',
   'During checkout or on any product page, you can write a personal message (up to 150 words). Our artist hand-inks your words on textured aged parchment using vintage fountain calligraphy, rolled, and sealed with our signature melted gold-leaf wax emblem.',
   2),
  ('What are the delivery timelines across India?',
   'Because pieces are handcrafted to order, please allow 2 to 3 business days for painting, curing, and framing. Dispatches are handled via Express Air courier with real-time tracking, arriving within 2–4 business days in metropolitan hubs and 4–6 days regionally.',
   3),
  ('How is the fine art protected during transit?',
   'Each frame is protected in archival glassine paper, surrounded by reinforced 4-corner impact buffers, wrapped in multi-layer shockproof air cushioning, and housed within our heavy-duty atelier presentation box.',
   4),
  ('What is your studio transit guarantee?',
   'If any piece is damaged in transit, notify our studio with unboxing photos/video within 48 hours and we will rush a handcrafted replacement to your door at zero additional cost.',
   5)
ON CONFLICT DO NOTHING;

-- ── 8. Seed testimonials ──────────────────────────────────────
INSERT INTO testimonials (name, designation, location, review, rating, sort_order) VALUES
  ('Priya Sharma',    'Sister Gift',     'Mumbai',    'The portrait of my sister and me brought tears to our eyes. Niharika captured every detail — our smiles, the warmth, the bond. Worth every rupee.', 5, 1),
  ('Arjun Mehta',     'Anniversary Gift','Delhi',     'Ordered a custom couple portrait for our anniversary. The packaging was stunning, the art was breathtaking. Our living room feels like a gallery now.',  5, 2),
  ('Divya Krishnan',  'Birthday Gift',   'Chennai',   'The wax-sealed calligraphy letter was the most thoughtful touch. My mom cried happy tears. Will definitely order again for special occasions.',             5, 3)
ON CONFLICT DO NOTHING;
