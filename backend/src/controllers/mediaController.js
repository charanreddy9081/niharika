/**
 * Media Library Controller
 * Uses Supabase Storage bucket: 'media'
 * Public URL format: {SUPABASE_URL}/storage/v1/object/public/media/{fileName}
 */
const { supabase } = require('../config/db');

const BUCKET = 'media';

// ─── GET /api/admin/media ─────────────────────────────────────────────────
exports.listMedia = async (req, res) => {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      limit: 500,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) throw error;

    const files = (data || [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => ({
        name: f.name,
        size: f.metadata?.size || 0,
        created_at: f.created_at,
        url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${f.name}`,
      }));

    return res.json({ success: true, data: files });
  } catch (err) {
    console.error('listMedia error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/admin/media/upload ─────────────────────────────────────────
exports.uploadMedia = async (req, res) => {
  try {
    const { fileName, fileData, contentType } = req.body;

    if (!fileName || !fileData || !contentType) {
      return res.status(400).json({ success: false, message: 'fileName, fileData and contentType are required.' });
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(fileData, 'base64');

    // Sanitise filename — remove spaces, lowercase
    const safeName = `${Date.now()}_${fileName.replace(/\s+/g, '_').toLowerCase()}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(safeName, buffer, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safeName}`;
    return res.status(201).json({ success: true, url, name: safeName });
  } catch (err) {
    console.error('uploadMedia error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/admin/media/:fileName ────────────────────────────────────
exports.deleteMedia = async (req, res) => {
  try {
    const { fileName } = req.params;
    const { error } = await supabase.storage.from(BUCKET).remove([decodeURIComponent(fileName)]);
    if (error) throw error;
    return res.json({ success: true, message: 'File deleted.' });
  } catch (err) {
    console.error('deleteMedia error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
