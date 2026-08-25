/**
 * CMS Phase 1 Controller
 * Handles: faq_items, testimonials, website_settings, social_links, seo_settings
 */
const { supabase } = require('../config/db');

// ─── helpers ─────────────────────────────────────────────────────────────────
const ok  = (res, data)         => res.json({ success: true, data });
const err = (res, e, status=500) => {
  console.error('[CMS]', e.message);
  res.status(status).json({ success: false, message: e.message });
};

// ══════════════════════════════════════════════════════════════════════════════
// FAQ ITEMS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/faqs          – public: published only
exports.getFaqs = async (req, res) => {
  try {
    const adminMode = req.query.admin === 'true';
    let q = supabase.from('faq_items').select('*').order('sort_order', { ascending: true });
    if (!adminMode) q = q.eq('is_published', true);
    const { data, error } = await q;
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// POST /api/admin/cms/faqs
exports.createFaq = async (req, res) => {
  try {
    const { question, answer, category, sort_order, is_published } = req.body;
    if (!question?.trim() || !answer?.trim())
      return res.status(400).json({ success: false, message: 'Question and answer are required.' });
    const { data, error } = await supabase.from('faq_items')
      .insert([{ question: question.trim(), answer: answer.trim(), category: category || 'General', sort_order: sort_order || 0, is_published: is_published !== false }])
      .select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// PUT /api/admin/cms/faqs/:id
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('faq_items').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// DELETE /api/admin/cms/faqs/:id
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('faq_items').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'FAQ deleted.' });
  } catch (e) { err(res, e); }
};

// PUT /api/admin/cms/faqs/reorder  – body: [{ id, sort_order }]
exports.reorderFaqs = async (req, res) => {
  try {
    const items = req.body;
    await Promise.all(items.map(({ id, sort_order }) =>
      supabase.from('faq_items').update({ sort_order }).eq('id', id)
    ));
    res.json({ success: true, message: 'Reordered.' });
  } catch (e) { err(res, e); }
};

// ══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const adminMode = req.query.admin === 'true';
    let q = supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
    if (!adminMode) q = q.eq('is_published', true);
    const { data, error } = await q;
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// POST /api/admin/cms/testimonials
exports.createTestimonial = async (req, res) => {
  try {
    const { name, designation, location, review, rating, photo_url, is_published, sort_order } = req.body;
    if (!name?.trim() || !review?.trim())
      return res.status(400).json({ success: false, message: 'Name and review are required.' });
    const { data, error } = await supabase.from('testimonials')
      .insert([{ name: name.trim(), designation, location, review: review.trim(), rating: rating || 5, photo_url, is_published: is_published !== false, sort_order: sort_order || 0 }])
      .select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// PUT /api/admin/cms/testimonials/:id
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('testimonials').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// DELETE /api/admin/cms/testimonials/:id
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (e) { err(res, e); }
};

// ══════════════════════════════════════════════════════════════════════════════
// WEBSITE SETTINGS  (single row — id = '00000000-0000-0000-0000-000000000001')
// ══════════════════════════════════════════════════════════════════════════════
const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/cms/settings
exports.getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase.from('website_settings').select('*').eq('id', SETTINGS_ID).single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// PUT /api/admin/cms/settings
exports.updateSettings = async (req, res) => {
  try {
    const allowed = [
      'site_name','site_tagline','contact_email','contact_phone','whatsapp_number',
      'address','favicon_url','logo_url','theme_color','meta_title','meta_description'
    ];
    const payload = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) payload[k] = req.body[k]; });
    const { data, error } = await supabase.from('website_settings').update(payload).eq('id', SETTINGS_ID).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// ══════════════════════════════════════════════════════════════════════════════
// SOCIAL LINKS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/social-links
exports.getSocialLinks = async (req, res) => {
  try {
    const adminMode = req.query.admin === 'true';
    let q = supabase.from('social_links').select('*').order('sort_order', { ascending: true });
    if (!adminMode) q = q.eq('is_visible', true);
    const { data, error } = await q;
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// PUT /api/admin/cms/social-links/:id  (update url / visibility / label)
exports.updateSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('social_links').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// POST /api/admin/cms/social-links  (add a custom platform)
exports.createSocialLink = async (req, res) => {
  try {
    const { platform, label, url, icon, sort_order } = req.body;
    if (!platform?.trim() || !url?.trim())
      return res.status(400).json({ success: false, message: 'Platform and URL are required.' });
    const { data, error } = await supabase.from('social_links')
      .insert([{ platform: platform.trim().toLowerCase(), label, url, icon: icon || platform, sort_order: sort_order || 99 }])
      .select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// ══════════════════════════════════════════════════════════════════════════════
// SEO SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/seo               – all pages
// GET /api/cms/seo/:slug         – single page
exports.getSeoSettings = async (req, res) => {
  try {
    const { slug } = req.params || {};
    if (slug) {
      const { data, error } = await supabase.from('seo_settings').select('*').eq('page_slug', slug).single();
      if (error) throw error;
      return ok(res, data);
    }
    const { data, error } = await supabase.from('seo_settings').select('*').order('page_label', { ascending: true });
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};

// PUT /api/admin/cms/seo/:slug
exports.updateSeoSettings = async (req, res) => {
  try {
    const { slug } = req.params;
    const allowed = ['meta_title','meta_description','meta_keywords','og_title','og_description','og_image_url','canonical_url'];
    const payload = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) payload[k] = req.body[k]; });
    const { data, error } = await supabase.from('seo_settings').update(payload).eq('page_slug', slug).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { err(res, e); }
};
