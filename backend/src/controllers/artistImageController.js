const { supabase } = require('../config/db');

// ─── GET all active artist images (public) ────────────────────────────────
exports.getArtistImages = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('artist_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching artist images:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET all artist images (admin — includes inactive) ────────────────────
exports.getAllArtistImages = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('artist_images')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching all artist images:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST upload artist image (admin) ────────────────────────────────────
exports.createArtistImage = async (req, res) => {
  try {
    const { title, description, storage_path, image_url, is_active, is_featured, display_order } = req.body;

    if (!image_url) {
      return res.status(400).json({ success: false, message: 'image_url is required.' });
    }

    const { data, error } = await supabase
      .from('artist_images')
      .insert([{
        title: title || '',
        description: description || '',
        storage_path: storage_path || '',
        image_url,
        is_active: is_active !== false,
        is_featured: is_featured === true,
        display_order: display_order || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Error creating artist image:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PUT update artist image metadata (admin) ─────────────────────────────
exports.updateArtistImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_active, is_featured, display_order } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data, error } = await supabase
      .from('artist_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Image not found' });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error updating artist image:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── DELETE artist image (admin) — removes DB record + Storage file ───────
exports.deleteArtistImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the record first to get storage_path
    const { data: img, error: fetchErr } = await supabase
      .from('artist_images')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchErr || !img) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Delete from DB
    const { error: delErr } = await supabase
      .from('artist_images')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;

    // Delete from Storage (non-blocking — DB record already gone)
    if (img.storage_path) {
      const { error: storageErr } = await supabase.storage
        .from('artist-images')
        .remove([img.storage_path]);

      if (storageErr) {
        console.warn('Storage file delete warning:', storageErr.message);
      }
    }

    return res.json({ success: true, message: 'Artist image deleted' });
  } catch (err) {
    console.error('Error deleting artist image:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST upload file to Supabase Storage (admin) ─────────────────────────
exports.uploadArtistImageFile = async (req, res) => {
  try {
    // Expect: multipart/form-data with field 'file'
    // We use raw buffer from express middleware
    const { fileName, fileData, contentType } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, message: 'fileName and fileData (base64) are required.' });
    }

    const buffer = Buffer.from(fileData, 'base64');
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `artist/${Date.now()}_${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from('artist-images')
      .upload(storagePath, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false
      });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabase.storage
      .from('artist-images')
      .getPublicUrl(storagePath);

    return res.status(201).json({
      success: true,
      storage_path: storagePath,
      image_url: publicUrl
    });
  } catch (err) {
    console.error('Error uploading artist image file:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
