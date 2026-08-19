const { supabase } = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
    
    const mapped = settings ? { ...settings, _id: settings.id } : {};
    return res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    // Check if setting exists
    const { data: existing } = await supabase.from('settings').select('id').limit(1).single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('settings')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert([{ ...req.body }])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    const mappedResult = result ? { ...result, _id: result.id } : {};
    return res.json({ success: true, data: mappedResult });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
