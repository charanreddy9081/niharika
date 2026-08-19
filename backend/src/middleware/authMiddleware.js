const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'niharikartist_fine_art_jwt_secret_key_2026';

const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '401 Unauthorized: Access denied. Please log in as an administrator.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !admin || !admin.is_active) {
      return res.status(401).json({ success: false, message: '401 Unauthorized: Administrator account not found or inactive.' });
    }
    
    req.admin = admin;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '401 Unauthorized: Invalid or expired administrator session.'
    });
  }
};

module.exports = {
  protectAdmin,
  JWT_SECRET
};
