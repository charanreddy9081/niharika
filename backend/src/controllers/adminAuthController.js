const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query Supabase for admin user
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server authentication error' });
  }
};

const getAdminMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      admin: req.admin
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const logoutAdmin = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin logged out successfully'
  });
};

module.exports = {
  loginAdmin,
  getAdminMe,
  logoutAdmin
};
