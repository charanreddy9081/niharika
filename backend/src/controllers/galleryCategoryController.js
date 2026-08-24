const { supabase } = require('../config/db');

// ─── GET /api/admin/gallery-categories ───────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getCategories error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/admin/gallery-categories ──────────────────────────────────
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }
    const trimmed = name.trim();

    // Check duplicate (case-insensitive)
    const { data: existing } = await supabase
      .from('gallery_categories')
      .select('id')
      .ilike('name', trimmed)
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ success: false, message: `Category "${trimmed}" already exists.` });
    }

    const { data, error } = await supabase
      .from('gallery_categories')
      .insert([{ name: trimmed }])
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('createCategory error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/admin/gallery-categories/:id ────────────────────────────
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('gallery_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    console.error('deleteCategory error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
