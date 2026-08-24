/**
 * Seeds the 8 pillar step CMS keys + gallery_categories table.
 * Run once: node src/seed/seedPillarSteps.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PILLAR_KEYS = [
  { section: 'home', content_key: 'pillars_step1_title', content_value: '1. Charcoal Draft',      content_type: 'text' },
  { section: 'home', content_key: 'pillars_step1_desc',  content_value: 'Hand-sketched with artist charcoal to capture intimate posture and emotion.', content_type: 'text' },
  { section: 'home', content_key: 'pillars_step2_title', content_value: '2. Archival Glazes',      content_type: 'text' },
  { section: 'home', content_key: 'pillars_step2_desc',  content_value: 'Multi-layered lightfast acrylics and protective anti-UV museum varnish.',    content_type: 'text' },
  { section: 'home', content_key: 'pillars_step3_title', content_value: '3. Teakwood Framing',     content_type: 'text' },
  { section: 'home', content_key: 'pillars_step3_desc',  content_value: 'Solid seasoned wood framing with seamless corners and anti-glare shield.',   content_type: 'text' },
  { section: 'home', content_key: 'pillars_step4_title', content_value: '4. Gold Wax Seal',        content_type: 'text' },
  { section: 'home', content_key: 'pillars_step4_desc',  content_value: 'Complimentary personal note penned on vintage parchment and sealed in gold.', content_type: 'text' },
];

const CATEGORIES = [
  { name: 'Painting',              sort_order: 1 },
  { name: 'Pencil Portraits',      sort_order: 2 },
  { name: 'Caricature',            sort_order: 3 },
  { name: 'Live Wedding Painting', sort_order: 4 },
];

async function run() {
  console.log('Seeding pillar step CMS keys…');
  for (const row of PILLAR_KEYS) {
    const { error } = await supabase
      .from('site_content')
      .upsert(row, { onConflict: 'section,content_key' });
    if (error) console.error(`  ✗ ${row.content_key}:`, error.message);
    else console.log(`  ✓ ${row.content_key}`);
  }

  console.log('\nCreating gallery_categories table and seeding…');
  // Create table if not exists (via raw insert — will fail gracefully if table missing)
  for (const cat of CATEGORIES) {
    const { error } = await supabase
      .from('gallery_categories')
      .upsert(cat, { onConflict: 'name' });
    if (error) console.error(`  ✗ ${cat.name}:`, error.message);
    else console.log(`  ✓ ${cat.name}`);
  }

  console.log('\nDone.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
