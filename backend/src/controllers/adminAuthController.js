const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabase } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// ─── Login ────────────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server authentication error' });
  }
};

// ─── Get current admin ────────────────────────────────────────────────────
const getAdminMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, admin: req.admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────
const logoutAdmin = async (req, res) => {
  res.status(200).json({ success: true, message: 'Admin logged out successfully' });
};

// ─── Change Password (requires current password + JWT) ───────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current password, new password, and confirmation.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the current password.' });
    }

    // Fetch fresh admin record (req.admin is from token, may not have password hash)
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', req.admin.id)
      .single();

    if (error || !admin) {
      return res.status(404).json({ success: false, message: 'Administrator account not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password: hashedPassword })
      .eq('id', req.admin.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to update password. Please try again.' });
    }

    console.log(`✅ Password changed for admin: ${admin.email}`);

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error while changing password.' });
  }
};

// ─── Forgot Password — send reset token via SendGrid ─────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your administrator email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, name')
      .eq('email', cleanEmail)
      .single();

    // Always respond with success to prevent email enumeration
    if (error || !admin) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.'
      });
    }

    // Generate a secure reset token (expires in 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store hashed token + expiry in admin_users table
    // These columns may not exist yet — if they don't, the email is still sent
    // with manual instructions. Run the migration to add them.
    const { error: tokenError } = await supabase
      .from('admin_users')
      .update({
        reset_token: resetTokenHash,
        reset_token_expiry: resetTokenExpiry
      })
      .eq('id', admin.id);

    if (tokenError) {
      // Columns don't exist yet — still send email but log the issue
      console.warn('⚠️  reset_token columns missing in admin_users. Run migration. Token not stored.');
    }

    // Build reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Send email via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'orders@niharikartist.com';

      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><style>
        body{margin:0;padding:0;background:#050f0b;font-family:'Segoe UI',Arial,sans-serif;color:#fbf8f1;}
        .wrapper{max-width:560px;margin:0 auto;background:#071610;border:1px solid rgba(232,200,114,0.25);border-radius:16px;overflow:hidden;}
        .header{background:linear-gradient(135deg,#081d14,#0d2b1e);padding:32px 36px;text-align:center;border-bottom:1px solid rgba(232,200,114,0.2);}
        .brand{font-size:28px;font-weight:300;color:#fbf5e6;letter-spacing:2px;font-family:Georgia,serif;}
        .tagline{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#a3b8af;margin-top:4px;}
        .body{padding:32px 36px;}
        .btn{display:inline-block;background:linear-gradient(135deg,#fbf5e6,#e8c872);color:#050f0b;font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;border-radius:40px;text-decoration:none;margin:20px 0;}
        .footer{background:#040e0a;padding:18px 36px;text-align:center;font-size:11px;color:#627a70;border-top:1px solid rgba(255,255,255,0.05);}
        .warn{background:#1a0a0a;border:1px solid rgba(220,38,38,0.3);border-radius:10px;padding:14px 18px;font-size:12px;color:#fca5a5;margin-top:20px;}
      </style></head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="brand">niharikartist</div>
            <div class="tagline">fine art atelier • admin portal</div>
          </div>
          <div class="body">
            <h2 style="font-size:20px;font-weight:400;color:#fbf5e6;margin:0 0 8px;font-family:Georgia,serif;">Password Reset Request</h2>
            <p style="color:#a3b8af;font-size:13px;margin:0 0 20px;">Hi ${admin.name || 'Administrator'}, we received a request to reset your admin portal password.</p>
            <p style="color:#a3b8af;font-size:13px;margin:0 0 8px;">Click the button below to set a new password. This link expires in <strong style="color:#e8c872;">1 hour</strong>.</p>
            <div style="text-align:center;">
              <a href="${resetUrl}" class="btn">Reset My Password</a>
            </div>
            <p style="color:#627a70;font-size:11px;margin-top:12px;word-break:break-all;">
              Or copy this URL into your browser:<br>
              <span style="color:#a3b8af;">${resetUrl}</span>
            </p>
            <div class="warn">
              <strong>Didn't request this?</strong> Ignore this email — your password will not change. If you're concerned, contact your studio administrator.
            </div>
          </div>
          <div class="footer">&copy; 2026 niharikartist fine art atelier • Security Notification</div>
        </div>
      </body>
      </html>
      `;

      try {
        await sgMail.send({
          to: cleanEmail,
          from: { email: fromEmail, name: 'niharikartist Studio' },
          subject: 'Admin Password Reset — niharikartist Studio',
          html
        });
        console.log(`✅ Password reset email sent to ${cleanEmail}`);
      } catch (emailErr) {
        console.error('Reset email send failed:', emailErr?.response?.body || emailErr.message);
      }
    } else {
      console.warn(`⚠️  SendGrid not configured. Reset URL for ${cleanEmail}: ${resetUrl}`);
    }

    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── Reset Password (via token from email link) ───────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;

    if (!token || !email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const cleanEmail = email.toLowerCase().trim();

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, reset_token, reset_token_expiry, is_active')
      .eq('email', cleanEmail)
      .single();

    if (error || !admin || !admin.is_active) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    }

    // Check token match and expiry
    if (!admin.reset_token || admin.reset_token !== tokenHash) {
      return res.status(400).json({ success: false, message: 'Invalid reset token. Please request a new reset link.' });
    }

    if (!admin.reset_token_expiry || new Date(admin.reset_token_expiry) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset link has expired. Please request a new one.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', admin.id);

    if (updateError) {
      console.error('Reset password update error:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
    }

    console.log(`✅ Password reset completed for admin: ${cleanEmail}`);

    return res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { loginAdmin, getAdminMe, logoutAdmin, changePassword, forgotPassword, resetPassword };
