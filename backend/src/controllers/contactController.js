const { supabase } = require('../config/db');

exports.submitInquiry = async (req, res) => {
  try {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    const mapped = { ...inquiry, _id: inquiry.id };
    return res.status(201).json({ success: true, message: 'Your message has been received! Our studio will be in touch shortly.', data: mapped });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const mapped = inquiries.map(i => ({ ...i, _id: i.id }));
    return res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });

    const cleanEmail = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    if (existing) {
      return res.json({ success: true, message: 'You are already on the VIP Early Access list!' });
    }

    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .insert([{ email: cleanEmail }])
      .select()
      .single();

    if (error) throw error;
    const mapped = { ...subscriber, _id: subscriber.id };
    return res.status(201).json({ success: true, message: 'Welcome to VIP Early Access! You will be notified first.', data: mapped });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const mapped = subscribers.map(s => ({ ...s, _id: s.id }));
    return res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
