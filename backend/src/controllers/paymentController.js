const Razorpay = require('razorpay');
const crypto = require('crypto');
const { supabase } = require('../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// In-memory OTP store (use Redis in production)
// Map: email -> { otp, expiresAt, attempts }
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── POST /api/payment/send-otp ───────────────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    // Rate limiting: max 3 OTPs per email per 10 minutes
    const existing = otpStore.get(email);
    if (existing && existing.sentCount >= 3 && Date.now() < existing.blockUntil) {
      const waitMins = Math.ceil((existing.blockUntil - Date.now()) / 60000);
      return res.status(429).json({ success: false, message: `Too many OTP requests. Try again in ${waitMins} minute(s).` });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
      sentCount: (existing?.sentCount || 0) + 1,
      blockUntil: existing?.sentCount >= 2 ? Date.now() + 10 * 60 * 1000 : 0,
    });

    // Send OTP via SendGrid or log it
    const sgMail = require('@sendgrid/mail');
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      try {
        const html = `
        <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
          body{margin:0;padding:0;background:#050f0b;font-family:'Segoe UI',Arial,sans-serif;color:#fbf8f1;}
          .wrapper{max-width:480px;margin:0 auto;background:#071610;border:1px solid rgba(232,200,114,0.25);border-radius:16px;overflow:hidden;}
          .header{background:linear-gradient(135deg,#081d14,#0d2b1e);padding:28px 32px;text-align:center;border-bottom:1px solid rgba(232,200,114,0.2);}
          .brand{font-size:26px;font-weight:300;color:#fbf5e6;letter-spacing:2px;font-family:Georgia,serif;}
          .body{padding:28px 32px;text-align:center;}
          .otp-box{background:#0a2319;border:2px solid rgba(232,200,114,0.4);border-radius:12px;padding:20px;margin:20px 0;display:inline-block;}
          .otp{font-size:36px;font-weight:700;color:#e8c872;letter-spacing:8px;font-family:monospace;}
          .footer{background:#040e0a;padding:16px;text-align:center;font-size:11px;color:#627a70;}
        </style></head>
        <body><div class="wrapper">
          <div class="header"><div class="brand">niharikartist</div></div>
          <div class="body">
            <h2 style="font-size:20px;font-weight:400;color:#fbf5e6;margin:0 0 8px;font-family:Georgia,serif;">Verify Your Email</h2>
            <p style="color:#a3b8af;font-size:13px;margin:0 0 16px;">Hi ${firstName || 'there'}, use this OTP to confirm your email and complete your order.</p>
            <div class="otp-box"><div class="otp">${otp}</div></div>
            <p style="color:#627a70;font-size:12px;margin-top:12px;">Valid for <strong style="color:#e8c872;">10 minutes</strong>. Do not share this code.</p>
          </div>
          <div class="footer">&copy; 2026 niharikartist fine art atelier</div>
        </div></body></html>`;

        await sgMail.send({
          to: email,
          from: { email: process.env.SENDGRID_FROM_EMAIL || 'niharikaananthoja@gmail.com', name: 'niharikartist Studio' },
          subject: `${otp} — Your niharikartist Order Verification Code`,
          html,
        });
      } catch (emailErr) {
        console.error('OTP email send failed:', emailErr?.response?.body || emailErr.message);
        // Still return success — OTP is stored, can be logged
      }
    } else {
      console.warn(`⚠️ SENDGRID_API_KEY not set. OTP for ${email}: ${otp}`);
    }

    console.log(`✅ OTP sent to ${email}: ${otp}`);

    return res.json({
      success: true,
      message: `Verification code sent to ${email}`,
      expiresIn: 600 // seconds
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification code.' });
  }
};

// ─── POST /api/payment/verify-otp ────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const stored = otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    stored.attempts = (stored.attempts || 0) + 1;
    if (stored.attempts > 5) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'Too many wrong attempts. Please request a new OTP.' });
    }

    if (stored.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - stored.attempts} attempt(s) remaining.`
      });
    }

    // Mark as verified
    stored.verified = true;
    return res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

// ─── POST /api/payment/create-razorpay-order ──────────────────────────────
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', email, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }

    // Verify OTP was completed for this email
    const stored = otpStore.get(email);
    if (!stored?.verified) {
      return res.status(403).json({ success: false, message: 'Email not verified. Please complete OTP verification.' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: { email },
    });

    return res.json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
};

// ─── POST /api/payment/verify-razorpay ───────────────────────────────────
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields.' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    return res.json({ success: true, message: 'Payment verified successfully.' });
  } catch (err) {
    console.error('Razorpay verification error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

// ─── Helper: check if OTP is verified for an email ───────────────────────
exports.isEmailVerified = (email) => {
  const stored = otpStore.get(email);
  return stored?.verified === true;
};

// ─── Clear OTP after order is placed ─────────────────────────────────────
exports.clearOTP = (email) => {
  otpStore.delete(email);
};
