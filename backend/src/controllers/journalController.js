const { supabase } = require('../config/db');

function slugify(text) {
  return String(text).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET published articles (public)
exports.getStories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('journal_stories')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    // Fallback: try is_active if is_published column doesn't exist yet
    try {
      const { data, error: e2 } = await supabase
        .from('journal_stories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (e2) throw e2;
      return res.json({ success: true, count: data.length, data });
    } catch (e3) {
      console.error('Error fetching journal stories:', e3);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

// GET single article by slug or id (public)
exports.getStoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/.test(slug);
    let query = supabase.from('journal_stories').select('*');
    if (isUUID) query = query.eq('id', slug);
    else query = query.eq('slug', slug);
    const { data, error } = await query.single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Article not found' });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching journal story:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET all articles including drafts (admin)
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

// POST create article (admin)
exports.createStory = async (req, res) => {
  try {
    const {
      title, subtitle, category, author, article_date,
      excerpt, content, quote, image_url,
      is_featured, is_published, display_order
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'title and author are required.' });
    }

    const slug = slugify(title) + '-' + Date.now().toString(36);

    const { data, error } = await supabase
      .from('journal_stories')
      .insert([{
        title: title.trim(),
        slug,
        subtitle: subtitle || '',
        category: category || 'Patron Chronicle',
        author: author.trim(),
        article_date: article_date || new Date().toISOString().split('T')[0],
        excerpt: excerpt || '',
        content: content || '',
        quote: quote || '',
        image_url: image_url || '',
        is_featured: is_featured === true,
        is_published: is_published !== false,
        is_active: is_published !== false,
        display_order: Number(display_order) || 0,
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

// PUT update article (admin)
exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.id;
    // Keep is_active in sync with is_published
    if (updates.is_published !== undefined) updates.is_active = updates.is_published;

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

// DELETE article (admin)
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
