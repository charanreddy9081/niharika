const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'niharikartist_fine_art_jwt_secret_key_2026';
const JWT_EXPIRES = '30d';

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, type: 'user' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function safeUser(u) {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    phone: u.phone || '',
    emailVerified: u.email_verified,
    createdAt: u.created_at,
  };
}

// ─── POST /api/users/register ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ success: false, message: 'First and last name are required.' });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const normalEmail = email.toLowerCase().trim();

    // Check duplicate
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalEmail)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: normalEmail,
        phone: phone?.trim() || null,
        password_hash,
        email_verified: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Register insert error:', error.message, error.code, error.details);
      throw error;
    }

    const token = makeToken(user);
    return res.status(201).json({ success: true, message: 'Account created successfully!', token, user: safeUser(user) });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  }
};

// ─── POST /api/users/login ────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalEmail = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalEmail)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please register first.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    const token = makeToken(user);
    return res.json({ success: true, message: `Welcome back, ${user.first_name}!`, token, user: safeUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── GET /api/users/me ────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    console.error('GetMe error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── POST /api/users/logout ───────────────────────────────────────────────
exports.logout = (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
};

// ─── GET /api/users/debug ─────────────────────────────────────────────────
exports.debugRegister = async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      return res.json({ success: false, stage: 'select', error: error.message, code: error.code });
    }
    const testEmail = `test_${Date.now()}@debug.com`;
    const hash = await bcrypt.hash('test123', 1);
    const { data: ins, error: insErr } = await supabase
      .from('users')
      .insert([{ first_name: 'Test', last_name: 'User', email: testEmail, password_hash: hash, email_verified: false }])
      .select().single();
    if (insErr) {
      return res.json({ success: false, stage: 'insert', error: insErr.message, code: insErr.code, details: insErr.details });
    }
    await supabase.from('users').delete().eq('email', testEmail);
    return res.json({ success: true, message: 'users table working correctly' });
  } catch (e) {
    return res.json({ success: false, stage: 'exception', error: e.message });
  }
};
