const { supabase } = require('../config/db');

const mapToDb = (data) => {
  if (!data) return data;
  const mapped = { ...data };
  if (mapped.imageUrl !== undefined) { mapped.image_url = mapped.imageUrl; delete mapped.imageUrl; }
  if (mapped.thumbnailUrl !== undefined) { mapped.thumbnail_url = mapped.thumbnailUrl; delete mapped.thumbnailUrl; }
  if (mapped.originalUrl !== undefined) { mapped.original_url = mapped.originalUrl; delete mapped.originalUrl; }
  if (mapped.sortOrder !== undefined) { mapped.sort_order = mapped.sortOrder; delete mapped.sortOrder; }
  if (mapped.isFeatured !== undefined) { mapped.is_featured = mapped.isFeatured; delete mapped.isFeatured; }
  delete mapped._id;
  delete mapped.createdAt;
  delete mapped.updatedAt;
  return mapped;
};

const mapFromDb = (doc) => {
  if (!doc) return doc;
  return {
    ...doc,
    _id: doc.id,
    imageUrl: doc.image_url,
    thumbnailUrl: doc.thumbnail_url,
    originalUrl: doc.original_url,
    sortOrder: doc.sort_order,
    isFeatured: doc.is_featured,
  };
};

const mapIds = docs => {
  if (!docs) return [];
  return docs.map(mapFromDb);
};

// GET all gallery items with search and category filtering
exports.getGallery = async (req, res) => {
  try {
    const { category, search, featured, sort } = req.query;
    let query = supabase.from('galleries').select('*');

    if (category && category !== 'All' && category !== 'all') {
      query = query.ilike('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (sort === 'oldest') {
      query = query.order('sort_order', { ascending: false }).order('created_at', { ascending: true });
    } else if (sort === 'title') {
      query = query.order('title', { ascending: true });
    } else {
      query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    }

    const { data: items, error } = await query;
    if (error) throw error;

    return res.json({ success: true, count: items.length, data: mapIds(items) });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ success: false, message: 'Server error fetching gallery' });
  }
};

// GET single gallery item by slug or ID
exports.getGalleryById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = supabase.from('galleries').select('*');
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: item, error } = await query.single();
    if (error || !item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    return res.json({ success: true, data: mapFromDb(item) });
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST create gallery item (Admin)
exports.createGalleryItem = async (req, res) => {
  try {
    const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const newItem = {
      ...req.body,
      slug,
      thumbnailUrl: req.body.thumbnailUrl || req.body.imageUrl
    };

    const { data: existing } = await supabase.from('galleries').select('id').eq('slug', slug).single();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Artwork already exists with this slug' });
    }

    const { data: item, error } = await supabase.from('galleries').insert([mapToDb(newItem)]).select().single();
    if (error) throw error;

    return res.status(201).json({ success: true, data: mapFromDb(item) });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT update gallery item (Admin)
exports.updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: item, error } = await supabase.from('galleries').update(mapToDb(req.body)).eq('id', id).select().single();
    if (error || !item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    return res.json({ success: true, data: mapFromDb(item) });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE gallery item (Admin)
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, count } = await supabase.from('galleries').delete({ count: 'exact' }).eq('id', id);
    if (error || count === 0) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    return res.json({ success: true, message: 'Gallery item removed' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
