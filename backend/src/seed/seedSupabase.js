require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const seedData = require('./seedData');
const gallerySeedData = require('./gallerySeedData');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env to run migration.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const seedSupabase = async () => {
  try {
    console.log('🚀 Starting Supabase Data Migration...');

    // 1. Seed Admin User
    const adminEmail = 'admin@niharikartist.com';
    const { data: existingAdmin } = await supabase.from('admin_users').select('id').eq('email', adminEmail).single();
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('AdminPassword2026!', 10);
      const { error } = await supabase.from('admin_users').insert([{
        email: adminEmail,
        password: passwordHash,
        name: 'Atelier Director',
        role: 'admin'
      }]);
      if (error) throw error;
      console.log('👑 Seeded default admin user (admin@niharikartist.com)');
    }

    // 2. Seed Settings
    const { data: existingSettings } = await supabase.from('settings').select('id').limit(1).single();
    if (!existingSettings) {
      const defaultSettings = {
        hero_title: 'Fine Art Atelier & Sentimental Keepsakes',
        hero_subtitle: 'Where Sentiments Take Permanent Form',
        premiere_active: false,
        shipping_fee_threshold: 1500,
        shipping_flat_rate: 99
      };
      const { error } = await supabase.from('settings').insert([defaultSettings]);
      if (error) throw error;
      console.log('⚙️  Seeded application settings');
    }

    // 3. Seed Products
    const { count: productCount, error: pCountError } = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (pCountError) throw pCountError;
    if (productCount === 0) {
      const productsToInsert = seedData.products.map(p => {
        const { _id, createdAt, updatedAt, ...rest } = p;
        return rest;
      });
      const { error } = await supabase.from('products').insert(productsToInsert);
      if (error) throw error;
      console.log(`🌱 Seeded ${productsToInsert.length} products`);
    }

    // 4. Seed Gallery
    const { count: galleryCount, error: gCountError } = await supabase.from('galleries').select('*', { count: 'exact', head: true });
    if (gCountError) throw gCountError;
    if (galleryCount === 0) {
      const galleryToInsert = gallerySeedData.map(g => {
        const { _id, createdAt, updatedAt, imageUrl, thumbnailUrl, originalUrl, sortOrder, isFeatured, ...rest } = g;
        return {
          ...rest,
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          original_url: originalUrl,
          sort_order: sortOrder,
          is_featured: isFeatured
        };
      });
      const { error } = await supabase.from('galleries').insert(galleryToInsert);
      if (error) throw error;
      console.log(`🖼️ Seeded ${galleryToInsert.length} gallery items`);
    }

    // 5. Seed Orders (Optional)
    const { count: orderCount, error: oCountError } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    if (oCountError) throw oCountError;
    if (orderCount === 0 && seedData.initialOrders) {
      const ordersToInsert = seedData.initialOrders.map(o => {
        const { _id, createdAt, updatedAt, customer, total, order_status, subtotal, shipping_fee, tracking_number, ...rest } = o;
        return {
          ...rest,
          customer_name: `${customer.first_name} ${customer.last_name}`,
          customer_email: customer.email,
          customer_phone: customer.phone,
          total_amount: total,
          status: order_status
        };
      });
      const { error } = await supabase.from('orders').insert(ordersToInsert);
      if (error) throw error;
      console.log(`📦 Seeded ${ordersToInsert.length} initial orders`);
    }

    console.log('✅ Supabase Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

seedSupabase();
