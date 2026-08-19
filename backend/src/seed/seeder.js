require('dotenv').config();
const { connectDB, getIsConnected, memoryStore } = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Setting = require('../models/Setting');
const Order = require('../models/Order');
const seedData = require('./seedData');

const seedDB = async () => {
  await connectDB();
  const isDb = getIsConnected();

  if (isDb) {
    try {
      console.log('🧹 Clearing existing collections in MongoDB Atlas...');
      await Product.deleteMany({});
      await Category.deleteMany({});
      await Setting.deleteMany({});

      console.log('🌱 Inserting products...');
      await Product.insertMany(seedData.products);

      console.log('🌱 Inserting categories...');
      await Category.insertMany(seedData.categories);

      console.log('🌱 Inserting settings...');
      await Setting.create(seedData.settings);

      // Create a sample demo order for instant order tracking
      await Order.create({
        order_id: 'NA-84920',
        customer: {
          first_name: 'Aanya',
          last_name: 'Sharma',
          email: 'aanya@example.com',
          phone: '+91 98765 43210'
        },
        shipping_address: {
          street: '42 Lotus Boulevard, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          country: 'India'
        },
        items: [{
          product_id: 'sample-1',
          name: 'Side by Side, Forever',
          price: 699,
          quantity: 1,
          image: 'https://niharikartist.com/wp-content/uploads/2026/08/pomelli_photoshoot-1-2.png',
          selected_size: 'Standard Keepsake Frame (6x6 in)',
          custom_note: 'For the best brother in the world!'
        }],
        subtotal: 699,
        shipping_fee: 0,
        discount: 0,
        total: 699,
        payment_method: 'online',
        payment_status: 'paid',
        order_status: 'Crafting in Studio',
        tracking_number: 'SR-928374102',
        courier_partner: 'Shiprocket Premium Air',
        timeline: [
          { status: 'Ordered', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), note: 'Order placed & confirmed' },
          { status: 'Crafting in Studio', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), note: 'Artist is handcrafting acrylic detailing' }
        ]
      });

      console.log('✅ MongoDB Atlas Seed Completed Successfully!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Seeder Error:', err);
      process.exit(1);
    }
  } else {
    console.log('🌱 Loading memory store fallback with seed data...');
    memoryStore.products = seedData.products.map((p, i) => ({ ...p, _id: 'mem_p_' + (i + 1) }));
    memoryStore.categories = seedData.categories.map((c, i) => ({ ...c, _id: 'mem_c_' + (i + 1) }));
    memoryStore.settings = { ...seedData.settings, _id: 'mem_setting_1' };
    console.log('✅ Memory store populated with 17 products, categories, and settings.');
    process.exit(0);
  }
};

seedDB();
