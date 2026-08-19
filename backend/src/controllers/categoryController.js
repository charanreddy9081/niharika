const { supabase } = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    const mappedCategories = categories.map(c => ({ ...c, _id: c.id }));
    return res.json({ success: true, data: mappedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
