const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://niharikartist.shop',
    'https://niharikartist.netlify.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect Database
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'niharikartist',
    mode: 'Haute Fine Art Atelier & Sentimental Keepsakes',
    time: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/artist-images', require('./routes/artistImageRoutes'));
app.use('/api/content', require('./routes/siteContentRoutes'));
app.use('/api/journal', require('./routes/journalRoutes'));
app.use('/api/home-transition', require('./routes/homeTransitionRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/shipping', require('./routes/shippingRoutes'));
app.use('/api/users',   require('./routes/userAuthRoutes'));
app.use('/api/cms',     require('./routes/cmsRoutes'));
app.use('/api/admin',   require('./routes/adminRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Niharikartist Studio Server running on http://localhost:${PORT}`);
});
