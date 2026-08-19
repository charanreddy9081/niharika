const { supabase } = require('../config/db');

// ─── GET all content (public) ─────────────────────────────────────────────
exports.getAllContent = async (req, res) => {
  try {
    const { section } = req.query;
    let query = supabase.from('site_content').select('*');
    if (section) query = query.eq('section', section);

    const { data, error } = await query.order('section').order('content_key');
    if (error) throw error;

    // Return as flat map keyed by "section.key" for easy frontend lookup
    const map = {};
    (data || []).forEach(row => {
      if (!map[row.section]) map[row.section] = {};
      map[row.section][row.content_key] = row.content_value;
    });

    return res.json({ success: true, data: map, rows: data });
  } catch (err) {
    console.error('Error fetching site content:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT update a single content entry (admin) ────────────────────────────
exports.updateContent = async (req, res) => {
  try {
    const { section, content_key, content_value } = req.body;

    if (!section || !content_key || content_value === undefined) {
      return res.status(400).json({ success: false, message: 'section, content_key, and content_value are required.' });
    }

    const { data, error } = await supabase
      .from('site_content')
      .upsert(
        { section, content_key, content_value, updated_at: new Date().toISOString() },
        { onConflict: 'section,content_key' }
      )
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error updating site content:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PUT bulk update multiple entries (admin) ─────────────────────────────
exports.bulkUpdateContent = async (req, res) => {
  try {
    const { updates } = req.body; // [{ section, content_key, content_value }]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'updates array is required.' });
    }

    const rows = updates.map(u => ({
      section: u.section,
      content_key: u.content_key,
      content_value: u.content_value,
      content_type: u.content_type || 'text',
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('site_content')
      .upsert(rows, { onConflict: 'section,content_key' })
      .select();

    if (error) throw error;
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error bulk updating site content:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};
