/**
 * Seeds all default site content into the site_content table.
 * Run: node src/seed/seedContent.js
 * Safe to re-run — uses ON CONFLICT DO NOTHING (upsert skips existing rows).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { supabase } = require('../config/db');

const rows = [
  // ── NAVIGATION ──────────────────────────────────────────────────────────
  { section: 'nav', content_key: 'announcement_ribbon',   content_value: 'Original Fine Art Heirlooms • Complimentary Wax-Sealed Calligraphy Scroll Included' },
  { section: 'nav', content_key: 'link_artist',           content_value: 'The Artist' },
  { section: 'nav', content_key: 'link_gallery',          content_value: 'Gallery' },
  { section: 'nav', content_key: 'link_store',            content_value: 'Store' },
  { section: 'nav', content_key: 'link_journal',          content_value: 'Journal' },
  { section: 'nav', content_key: 'link_commissions',      content_value: 'Commissions' },
  { section: 'nav', content_key: 'link_order_status',     content_value: 'Order Status' },

  // ── FOOTER ───────────────────────────────────────────────────────────────
  { section: 'footer', content_key: 'brand_tagline',      content_value: 'fine art & atelier' },
  { section: 'footer', content_key: 'brand_description',  content_value: 'An independent fine art atelier founded by artist Niharika, translating intimate human stories, spiritual devotions, and pop anime onto canvas and heavy archival sheets.' },
  { section: 'footer', content_key: 'quality_badge',      content_value: 'Handmade in India • Archival Quality Guarantee' },
  { section: 'footer', content_key: 'copyright',          content_value: 'Original Studio Acrylic & Oil Works • All Rights Reserved • © 2026 niharikartist' },
  { section: 'footer', content_key: 'guarantee_1_title',  content_value: '100% Original Fine Art' },
  { section: 'footer', content_key: 'guarantee_1_desc',   content_value: 'Individually handpainted with archival artist acrylics and oil glazes.' },
  { section: 'footer', content_key: 'guarantee_2_title',  content_value: 'Secure Pan-India Delivery' },
  { section: 'footer', content_key: 'guarantee_2_desc',   content_value: 'Multi-layered protective shockproof armor with real-time tracking.' },
  { section: 'footer', content_key: 'guarantee_3_title',  content_value: 'Personalized Calligraphy' },
  { section: 'footer', content_key: 'guarantee_3_desc',   content_value: 'Complimentary wax-sealed handwritten note penned on vintage parchment.' },
  { section: 'footer', content_key: 'guarantee_4_title',  content_value: 'Museum-Grade Framing' },
  { section: 'footer', content_key: 'guarantee_4_desc',   content_value: 'Solid finished teakwood framing with anti-glare protective shield.' },

  // ── HOME PAGE ─────────────────────────────────────────────────────────────
  { section: 'home', content_key: 'hero_label',             content_value: 'Fine Art Atelier • Bespoke Masterworks' },
  { section: 'home', content_key: 'hero_title_line1',       content_value: 'Preserving Tender Moments' },
  { section: 'home', content_key: 'hero_title_line2',       content_value: 'in Canvas & Gold Wax' },
  { section: 'home', content_key: 'hero_description',       content_value: 'We craft deeply personal, handpainted original keepsakes, graphite & colour pencil portraits, and live wedding artworks designed to outlast generations.' },
  { section: 'home', content_key: 'hero_btn_primary',       content_value: 'Explore Masterworks Gallery' },
  { section: 'home', content_key: 'hero_btn_secondary',     content_value: 'View Store Catalogue' },
  { section: 'home', content_key: 'hero_testimonial',       content_value: '"Unwrapping this handpainted piece felt like stepping into an intimate gallery of our childhood memories."' },
  { section: 'home', content_key: 'manifesto_label',        content_value: 'The Studio Philosophy' },
  { section: 'home', content_key: 'manifesto_title',        content_value: 'Art Created Not Merely to Be Seen, but to Be Felt' },
  { section: 'home', content_key: 'manifesto_body1',        content_value: 'niharikartist is an independent fine art atelier founded on the conviction that love and memory deserve permanent, physical form. In a world of fleeting digital messages, we hand-paint original keepsakes that serve as anchors of warmth.' },
  { section: 'home', content_key: 'manifesto_body2',        content_value: 'Every artwork is sketched in charcoal, rendered in archival acrylic and oil glazes, encased in solid teakwood moulding, and paired with custom wax-sealed calligraphy.' },
  { section: 'home', content_key: 'manifesto_quote',        content_value: '"Every brushstroke is a quiet devotion to the people who give our lives purpose."' },
  { section: 'home', content_key: 'manifesto_quote_author', content_value: '— Niharika, Founder & Fine Artist' },
  { section: 'home', content_key: 'featured_label',         content_value: 'Original Handcraft' },
  { section: 'home', content_key: 'featured_title',         content_value: 'Featured Store Masterworks' },
  { section: 'home', content_key: 'pillars_label',          content_value: 'Studio Standards' },
  { section: 'home', content_key: 'pillars_title',          content_value: 'The Making of an Heirloom' },

  // ── ARTIST / ABOUT PAGE ───────────────────────────────────────────────────
  { section: 'artist', content_key: 'hero_label',           content_value: 'The Atelier Philosophy' },
  { section: 'artist', content_key: 'hero_title_line1',     content_value: 'Until the World Gets to Step Inside' },
  { section: 'artist', content_key: 'hero_title_line2',     content_value: 'a Little World Inside You' },
  { section: 'artist', content_key: 'hero_description',     content_value: 'An intimate journey by artist Niharika — transforming fragile childhood memories, silent bonds of sisterhood, and eternal blooms into timeless, handpainted tactile heirlooms.' },
  { section: 'artist', content_key: 'origin_label',         content_value: 'Our Beginning' },
  { section: 'artist', content_key: 'origin_title',         content_value: 'Every Brushstroke is a Gentle Embrace' },
  { section: 'artist', content_key: 'origin_body1',         content_value: '"niharikartist" was born out of an intimate longing to hold on to feelings that words alone cannot capture. As siblings grow older and life moves fast, the quiet warmth of childhood memories — whispered secrets, playful rivalries, and comforting embraces — remains eternal.' },
  { section: 'artist', content_key: 'origin_body2',         content_value: 'We believe that true art should never be a mass-produced poster. It should cuddle your soul, reminding you every single day of the safe place you share with the people you cherish most in this world.' },
  { section: 'artist', content_key: 'origin_stat',          content_value: 'Over 500+ Handcrafted Heirlooms Delivered' },
  { section: 'artist', content_key: 'pillar1_title',        content_value: '100% Original Handpainted' },
  { section: 'artist', content_key: 'pillar1_desc',         content_value: 'Every frame is individually drafted with charcoal sketches, painted in rich archival acrylic layers, and sealed under museum-grade protective glazes.' },
  { section: 'artist', content_key: 'pillar2_title',        content_value: 'Wax-Sealed Calligraphy' },
  { section: 'artist', content_key: 'pillar2_desc',         content_value: 'We hand-pen your custom personal notes on textured vintage parchment using archival fountain ink, sealed with an authentic gold wax stamp.' },
  { section: 'artist', content_key: 'pillar3_title',        content_value: 'Emotional Keepsakes' },
  { section: 'artist', content_key: 'pillar3_desc',         content_value: "Designed to be cherished on Raksha Bandhan, birthdays, anniversaries, or simply to say 'thank you for being my safe space'." },
  { section: 'artist', content_key: 'craft_label',          content_value: 'Archival Permanence' },
  { section: 'artist', content_key: 'craft_title',          content_value: 'Crafted to Outlast Generations' },
  { section: 'artist', content_key: 'craft_body1',          content_value: 'We source hand-stretched heavy linen canvasses and solid seasoned teakwood moulding. Each frame is treated to withstand humidity, sunlight, and the passage of time.' },
  { section: 'artist', content_key: 'craft_body2',          content_value: "When your recipient opens their parcel, they don't just receive a gift — they receive a piece of timeless fine art that will hang proudly in their living space for decades to come." },
  { section: 'artist', content_key: 'cta_title',            content_value: 'Step Inside The Atelier Store' },
  { section: 'artist', content_key: 'cta_description',      content_value: 'Explore our full catalog of handpainted frames, eternal flower bouquets, and vintage calligraphy letters.' },
  { section: 'artist', content_key: 'cta_btn_primary',      content_value: 'Browse All Artworks' },
  { section: 'artist', content_key: 'cta_btn_secondary',    content_value: 'Book Custom Commission' },

  // ── GALLERY PAGE ─────────────────────────────────────────────────────────
  { section: 'gallery', content_key: 'page_label',          content_value: 'Masterworks Exhibition • Contemporary Portfolio' },
  { section: 'gallery', content_key: 'page_title',          content_value: 'The Fine Art' },
  { section: 'gallery', content_key: 'page_subtitle',       content_value: 'Explore authentic handpainted works, graphite & colour pencil portraits, live caricature studies, and live wedding paintings created by artist Niharika.' },

  // ── SHOP PAGE ─────────────────────────────────────────────────────────────
  { section: 'shop', content_key: 'page_label',             content_value: 'Original Artworks & Fine Art Prints' },
  { section: 'shop', content_key: 'page_title',             content_value: 'Original Fine Art &' },
  { section: 'shop', content_key: 'page_title_script',      content_value: 'Catalogue' },
  { section: 'shop', content_key: 'page_subtitle',          content_value: 'Each artwork is rendered on archival canvas or heavyweight ivory paper, accompanied by our signature handwritten wax-sealed scroll.' },

  // ── COMMUNITY / JOURNAL PAGE ──────────────────────────────────────────────
  { section: 'community', content_key: 'page_label',        content_value: 'The Atelier Journal' },
  { section: 'community', content_key: 'page_title',        content_value: 'Patron Reflections & Stories' },
  { section: 'community', content_key: 'page_subtitle',     content_value: 'Behind every handpainted frame is an intimate tale of reunions, whispered gratitude, and quiet love.' },
  { section: 'community', content_key: 'story1_title',      content_value: 'A Bond Across Oceans: The London & Mumbai Connection' },
  { section: 'community', content_key: 'story1_author',     content_value: 'Aarav & Meera S.' },
  { section: 'community', content_key: 'story1_excerpt',    content_value: 'Living 4,000 miles apart, opening the "Whispers of Twilight" keepsake frame on Raksha Bandhan brought our entire childhood back into our living room.' },
  { section: 'community', content_key: 'story2_title',      content_value: 'Sunlight in a Winter Apartment' },
  { section: 'community', content_key: 'story2_author',     content_value: 'Dr. Ananya Roy' },
  { section: 'community', content_key: 'story2_excerpt',    content_value: 'The delicate hand-sculpted petals of "Solace in Golden Light" brighten every morning. It has become the spiritual focal point of our home library.' },
  { section: 'community', content_key: 'story3_title',      content_value: 'An Unbroken Vow Inked in Gold Wax' },
  { section: 'community', content_key: 'story3_author',     content_value: 'Kabir & Rohan V.' },
  { section: 'community', content_key: 'story3_excerpt',    content_value: 'Reading our personal letter handwritten in fountain script and breaking the gold wax seal felt like opening a historic heirloom from a century ago.' },
  { section: 'community', content_key: 'cta_title',         content_value: 'Share Your Atelier Memory' },
  { section: 'community', content_key: 'cta_description',   content_value: 'Did your niharikartist frame create a cherished moment? Send us your story or photo to be archived in our exhibition annals.' },
  { section: 'community', content_key: 'cta_btn',           content_value: 'Submit Chronicle' },

  // ── COMMISSIONS / CONTACT PAGE ────────────────────────────────────────────
  { section: 'contact', content_key: 'page_label',          content_value: 'Studio Dialogue' },
  { section: 'contact', content_key: 'page_title',          content_value: 'Bespoke Art Commissions & Inquiries' },
  { section: 'contact', content_key: 'page_subtitle',       content_value: 'Seeking a custom handpainted sibling portrait, a personalized memory canvas, or a private exhibition booking? Artist Niharika accepts limited private commissions.' },
  { section: 'contact', content_key: 'panel_title',         content_value: 'Atelier Direct' },
  { section: 'contact', content_key: 'email',               content_value: 'hello@niharikartist.com' },
  { section: 'contact', content_key: 'phone',               content_value: '+91 98765 43210' },
  { section: 'contact', content_key: 'address',             content_value: 'niharikartist Fine Art Atelier, India' },
  { section: 'contact', content_key: 'schedule_title',      content_value: 'Commission Production Schedule' },
  { section: 'contact', content_key: 'schedule_desc',       content_value: 'Custom works require between 5 to 8 business days for initial composition sketches, layered oil/acrylic curing, varnishing, and solid teak framing.' },
  { section: 'contact', content_key: 'success_title',       content_value: 'Commission Request Received' },
  { section: 'contact', content_key: 'success_desc',        content_value: 'Thank you for reaching out. Artist Niharika will personally review your concept and reach out via email within 24 hours.' },
  { section: 'contact', content_key: 'submit_btn',          content_value: 'Submit Studio Commission' },
];

async function seed() {
  console.log(`Seeding ${rows.length} content rows...`);

  // Insert in batches of 20
  const batchSize = 20;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map(r => ({
      ...r,
      content_type: r.content_type || 'text',
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('site_content')
      .upsert(batch, { onConflict: 'section,content_key', ignoreDuplicates: true })
      .select();

    if (error) {
      console.error('Batch error:', error.message);
    } else {
      inserted += data?.length || 0;
      skipped += batch.length - (data?.length || 0);
    }
  }

  console.log(`✅ Done — ${inserted} inserted, ${skipped} already existed`);
}

seed().catch(e => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
