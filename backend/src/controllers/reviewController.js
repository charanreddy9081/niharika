/**
 * Review Controller
 * Public: submit, get approved
 * Admin: list all, approve, reject, delete
 */
const { supabase } = require('../config/db');
const { sendTelegramMessage } = require('../services/telegramService');

// ─── GET /api/reviews — public approved reviews ───────────────────────────
exports.getApprovedReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_reviews')
      .select('id, user_name, designation, location, photo_url, rating, review, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getApprovedReviews error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/reviews — submit review (logged-in users only) ─────────────
exports.submitReview = async (req, res) => {
  try {
    const { rating, review, designation, location, photo_url } = req.body;
    const user = req.user; // set by protectUser middleware

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    if (!review?.trim() || review.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Review must be at least 10 characters.' });
    }

    // Check if this user already submitted a pending/approved review
    const { data: existing } = await supabase
      .from('user_reviews')
      .select('id, status')
      .eq('user_email', user.email)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      const msg = existing.status === 'approved'
        ? 'Your review is already published. Thank you!'
        : 'Your review is pending admin approval. We will publish it soon!';
      return res.status(409).json({ success: false, message: msg });
    }

    // Get user details from users table
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    const userName = userData
      ? `${userData.first_name} ${userData.last_name}`.trim()
      : user.email.split('@')[0];

    const { data: newReview, error } = await supabase
      .from('user_reviews')
      .insert([{
        user_id: user.id,
        user_name: userName,
        user_email: user.email,
        rating: Number(rating),
        review: review.trim(),
        designation: designation?.trim() || 'Verified Collector',
        location: location?.trim() || null,
        photo_url: photo_url?.trim() || null,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;

    // Telegram alert to admin
    const stars = '⭐'.repeat(Number(rating));
    const msg = [
      `📝 <b>New Review Submitted</b>`,
      ``,
      `<b>From:</b> ${userName} (${user.email})`,
      `<b>Rating:</b> ${stars} (${rating}/5)`,
      `<b>Review:</b>`,
      review.trim(),
      ``,
      `<b>Status:</b> Pending Admin Approval`,
      ``,
      `<a href="https://niharikartist.shop/admin">→ Open Admin Panel to approve</a>`,
    ].join('\n');

    sendTelegramMessage(msg).catch(e => console.error('Review Telegram failed:', e.message));

    return res.status(201).json({
      success: true,
      message: 'Thank you for your review! It will appear once approved by our team.',
      data: newReview,
    });
  } catch (err) {
    console.error('submitReview error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/reviews — all reviews (admin) ─────────────────────────
exports.getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;
    let q = supabase.from('user_reviews').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getAllReviews error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/admin/reviews/:id/status — approve or reject ────────────────
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const { data, error } = await supabase
      .from('user_reviews')
      .update({ status, admin_note: admin_note || null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Telegram confirmation
    const action = status === 'approved' ? '✅ Approved' : status === 'rejected' ? '❌ Rejected' : '⏳ Set to Pending';
    sendTelegramMessage(`${action} review from <b>${data.user_name}</b> — "${data.review.substring(0, 80)}…"`).catch(() => {});

    return res.json({ success: true, data });
  } catch (err) {
    console.error('updateReviewStatus error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/admin/reviews/:id ────────────────────────────────────────
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('user_reviews').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    console.error('deleteReview error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
