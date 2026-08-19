const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminMe, logoutAdmin, changePassword, forgotPassword, resetPassword } = require('../controllers/adminAuthController');
const { protectAdmin } = require('../middleware/authMiddleware');

const artistImageController = require('../controllers/artistImageController');
const siteContentController = require('../controllers/siteContentController');
const productController = require('../controllers/productController');
const galleryController = require('../controllers/galleryController');
const orderController = require('../controllers/orderController');
const contactController = require('../controllers/contactController');
const settingController = require('../controllers/settingController');

// Auth endpoints
router.post('/login', loginAdmin);
router.get('/me', protectAdmin, getAdminMe);
router.post('/logout', protectAdmin, logoutAdmin);

// Password management
router.post('/change-password', protectAdmin, changePassword);  // requires JWT — logged-in admin
router.post('/forgot-password', forgotPassword);                // public — sends reset email
router.post('/reset-password', resetPassword);                  // public — consumes reset token

// Protected Admin API Endpoints
router.get('/products', protectAdmin, productController.getProducts);
router.post('/products', protectAdmin, productController.createProduct);
router.post('/products/sync', protectAdmin, productController.syncShopProducts);
router.put('/products/:id', protectAdmin, productController.updateProduct);
router.delete('/products/:id', protectAdmin, productController.deleteProduct);

router.get('/gallery', protectAdmin, galleryController.getGallery);
router.post('/gallery', protectAdmin, galleryController.createGalleryItem);
router.put('/gallery/:id', protectAdmin, galleryController.updateGalleryItem);
router.delete('/gallery/:id', protectAdmin, galleryController.deleteGalleryItem);

router.get('/orders', protectAdmin, orderController.getAllOrders);
router.put('/orders/:id/status', protectAdmin, orderController.updateOrderStatus);

router.get('/inquiries', protectAdmin, contactController.getInquiries);
router.get('/subscribers', protectAdmin, contactController.getSubscribers);

router.get('/settings', protectAdmin, settingController.getSettings);
router.put('/settings', protectAdmin, settingController.updateSettings);

// Artist Images (admin)
router.get('/artist-images', protectAdmin, artistImageController.getAllArtistImages);
router.post('/artist-images', protectAdmin, artistImageController.createArtistImage);
router.post('/artist-images/upload', protectAdmin, artistImageController.uploadArtistImageFile);
router.put('/artist-images/:id', protectAdmin, artistImageController.updateArtistImage);
router.delete('/artist-images/:id', protectAdmin, artistImageController.deleteArtistImage);

// Site Content (admin)
router.get('/content', protectAdmin, siteContentController.getAllContent);
router.put('/content/update', protectAdmin, siteContentController.updateContent);
router.put('/content/bulk', protectAdmin, siteContentController.bulkUpdateContent);

module.exports = router;
