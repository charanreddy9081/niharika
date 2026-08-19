const { supabase } = require('../config/db');

// GET all active stories (public)
exports.getStories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('journal_stories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching journal stories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET all stories including inactive (admin)
exports.getAllStories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('journal_stories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching all journal stories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST create story (admin)
exports.createStory = async (req, res) => {
  try {
    const { title, author, excerpt, image_url, is_active, display_order } = req.body;
    if (!title || !author || !excerpt) {
      return res.status(400).json({ success: false, message: 'title, author, and excerpt are required.' });
    }
    const { data, error } = await supabase
      .from('journal_stories')
      .insert([{
        title: title.trim(),
        author: author.trim(),
        excerpt: excerpt.trim(),
        image_url: image_url || '/images/product_1_1.jpg',
        is_active: is_active !== false,
        display_order: Number(display_order) || 0
      }])
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Error creating journal story:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT update story (admin)
exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.id;
    const { data, error } = await supabase
      .from('journal_stories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Story not found' });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error updating journal story:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE story (admin)
exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('journal_stories').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Story deleted' });
  } catch (err) {
    console.error('Error deleting journal story:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
