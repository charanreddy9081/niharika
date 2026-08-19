const { supabase } = require('../config/db');

const BUCKET = 'home-transition-images';

// GET active images — public (home page)
exports.getActiveImages = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('home_transition_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching home transition images:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET all images — admin
exports.getAllImages = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('home_transition_images')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching all home transition images:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST upload file to storage and save record — admin
exports.uploadImage = async (req, res) => {
  try {
    const { title, fileData, fileName, contentType, display_order, is_active } = req.body;

    if (!fileData && !req.body.image_url) {
      return res.status(400).json({ success: false, message: 'fileData (base64) or image_url is required.' });
    }

    let image_url = req.body.image_url || '';
    let storage_path = '';

    // Upload file to Storage if base64 provided
    if (fileData) {
      const buffer = Buffer.from(fileData, 'base64');
      const safeName = (fileName || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
      storage_path = `home/${Date.now()}_${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storage_path, buffer, { contentType: contentType || 'image/jpeg', upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storage_path);
      image_url = publicUrl;
    }

    // Get current max display_order if not provided
    let order = Number(display_order) || 0;
    if (!display_order) {
      const { data: existing } = await supabase
        .from('home_transition_images')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      order = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;
    }

    const { data, error } = await supabase
      .from('home_transition_images')
      .insert([{
        title: title || '',
        image_url,
        storage_path,
        display_order: order,
        is_active: is_active !== false,
      }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Error uploading home transition image:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update metadata — admin
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, is_active, display_order } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (is_active !== undefined) updates.is_active = is_active;
    if (display_order !== undefined) updates.display_order = Number(display_order);

    const { data, error } = await supabase
      .from('home_transition_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Image not found' });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error updating home transition image:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT replace image file — admin
exports.replaceImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileData, fileName, contentType, image_url: directUrl } = req.body;

    // Fetch existing record
    const { data: existing, error: fetchErr } = await supabase
      .from('home_transition_images')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ success: false, message: 'Image not found' });

    let newImageUrl = directUrl || existing.image_url;
    let newStoragePath = existing.storage_path;

    if (fileData) {
      // Upload new file
      const buffer = Buffer.from(fileData, 'base64');
      const safeName = (fileName || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
      newStoragePath = `home/${Date.now()}_${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(newStoragePath, buffer, { contentType: contentType || 'image/jpeg', upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(newStoragePath);
      newImageUrl = publicUrl;

      // Delete old file from storage if it was stored in this bucket
      if (existing.storage_path) {
        await supabase.storage.from(BUCKET).remove([existing.storage_path]).catch(e =>
          console.warn('Old file cleanup warning:', e.message)
        );
      }
    }

    const { data, error } = await supabase
      .from('home_transition_images')
      .update({ image_url: newImageUrl, storage_path: newStoragePath, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error replacing home transition image:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE image — admin
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: img, error: fetchErr } = await supabase
      .from('home_transition_images')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchErr || !img) return res.status(404).json({ success: false, message: 'Image not found' });

    const { error: delErr } = await supabase
      .from('home_transition_images')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;

    // Remove from storage (non-blocking)
    if (img.storage_path) {
      supabase.storage.from(BUCKET).remove([img.storage_path])
        .catch(e => console.warn('Storage delete warning:', e.message));
    }

    return res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    console.error('Error deleting home transition image:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT bulk reorder — admin
exports.reorderImages = async (req, res) => {
  try {
    const { order } = req.body; // [{ id, display_order }]
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ success: false, message: 'order array is required' });
    }

    const updates = order.map(({ id, display_order }) =>
      supabase.from('home_transition_images')
        .update({ display_order: Number(display_order), updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    await Promise.all(updates);
    return res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    console.error('Error reordering home transition images:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
