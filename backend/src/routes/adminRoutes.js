const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminMe, logoutAdmin } = require('../controllers/adminAuthController');
const { protectAdmin } = require('../middleware/authMiddleware');

const productController = require('../controllers/productController');
const galleryController = require('../controllers/galleryController');
const orderController = require('../controllers/orderController');
const contactController = require('../controllers/contactController');
const settingController = require('../controllers/settingController');

// Auth endpoints
router.post('/login', loginAdmin);
router.get('/me', protectAdmin, getAdminMe);
router.post('/logout', protectAdmin, logoutAdmin);

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

module.exports = router;
