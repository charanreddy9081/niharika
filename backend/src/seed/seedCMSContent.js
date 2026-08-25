/**
 * Seeds shipping, privacy, and other page content keys into site_content.
 * Run once: node src/seed/seedCMSContent.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rows = [
  // Shipping page
  { section: 'shipping', content_key: 'page_label', content_value: 'Studio Logistics', content_type: 'text' },
  { section: 'shipping', content_key: 'page_title',  content_value: 'Shipping & Delivery Policy', content_type: 'text' },
  { section: 'shipping', content_key: 'para_1', content_value: 'At niharikartist, each artwork is handpainted and customized to order. Please allow 2 to 3 business days for our studio artists to complete your piece, apply the protective varnish, and frame it securely.', content_type: 'text' },
  { section: 'shipping', content_key: 'para_2', content_value: 'Shipping charges are calculated at checkout based on your pincode. We dispatch via India Post Speed Post and Registered Parcel from Alwal, Hyderabad.', content_type: 'text' },
  { section: 'shipping', content_key: 'para_3', content_value: 'Once dispatched, packages are routed via India Post. Delivery timelines range between 1–4 business days for metropolitan cities and 4–7 business days for other regional areas.', content_type: 'text' },
  { section: 'shipping', content_key: 'para_4', content_value: 'You will receive live tracking updates via email as soon as your parcel leaves our studio.', content_type: 'text' },

  // Privacy page
  { section: 'privacy', content_key: 'page_label', content_value: 'Data Protection', content_type: 'text' },
  { section: 'privacy', content_key: 'page_title',  content_value: 'Privacy Policy', content_type: 'text' },
  { section: 'privacy', content_key: 'para_1', content_value: 'We respect your privacy and are committed to safeguarding the personal information you share with us.', content_type: 'text' },
  { section: 'privacy', content_key: 'para_2', content_value: 'When you place an order or contact our studio, we collect your name, shipping address, email address, and phone number solely to process your order, deliver your package, and communicate tracking updates.', content_type: 'text' },
  { section: 'privacy', content_key: 'para_3', content_value: 'We never sell, rent, or trade your personal data to third parties. All online payments are handled securely through encrypted payment gateways.', content_type: 'text' },
];

async function run() {
  console.log('Seeding CMS content keys…');
  for (const row of rows) {
    const { error } = await supabase
      .from('site_content')
      .upsert(row, { onConflict: 'section,content_key' });
    if (error) console.error(`  ✗ ${row.section}.${row.content_key}:`, error.message);
    else console.log(`  ✓ ${row.section}.${row.content_key}`);
  }
  console.log('\nDone.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
