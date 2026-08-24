const { supabase } = require('../config/db');
const { Resend } = require('resend');

const FROM_EMAIL  = process.env.RESEND_FROM_EMAIL || 'niharikaananthoja@niharikartist.shop';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'niharikaananthoja@gmail.com';

exports.submitInquiry = async (req, res) => {
  try {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    const mapped = { ...inquiry, _id: inquiry.id };

    // Send email notification to admin — fire-and-forget
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { name, email, phone, message, commission_subject, inquiry_type, artistic_vision } = req.body;
      const body = message || artistic_vision || '';
      const subject = commission_subject || inquiry_type || 'Studio Inquiry';

      resend.emails.send({
        from: `niharikartist Studio <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        replyTo: email || FROM_EMAIL,
        subject: `📩 New Commission: ${subject} — ${name}`,
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;background:#050f0b;color:#fbf8f1;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;border:1px solid rgba(232,200,114,0.25)">
            <h2 style="color:#e8c872;font-weight:300;margin:0 0 20px">New Studio Commission Inquiry</h2>
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr><td style="color:#a3b8af;padding:6px 0;width:140px">Name</td><td style="color:#fbf5e6">${name || '—'}</td></tr>
              <tr><td style="color:#a3b8af;padding:6px 0">Email</td><td style="color:#fbf5e6"><a href="mailto:${email}" style="color:#e8c872">${email || '—'}</a></td></tr>
              <tr><td style="color:#a3b8af;padding:6px 0">Phone</td><td style="color:#fbf5e6">${phone || '—'}</td></tr>
              <tr><td style="color:#a3b8af;padding:6px 0">Category</td><td style="color:#fbf5e6">${inquiry_type || '—'}</td></tr>
              <tr><td style="color:#a3b8af;padding:6px 0">Subject</td><td style="color:#fbf5e6">${subject}</td></tr>
              <tr><td style="color:#a3b8af;padding:6px 0;vertical-align:top">Message</td><td style="color:#fbf5e6;white-space:pre-wrap">${body || '—'}</td></tr>
            </table>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(232,200,114,0.2);font-size:11px;color:#627a70">
              Submitted via niharikartist.shop/contact
            </div>
          </div>`,
      }).catch(err => console.error('Commission email failed:', err.message));
    }

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
