const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminMe, logoutAdmin, changePassword, forgotPassword, resetPassword } = require('../controllers/adminAuthController');
const { protectAdmin } = require('../middleware/authMiddleware');

const artistImageController = require('../controllers/artistImageController');
const siteContentController = require('../controllers/siteContentController');
const journalController = require('../controllers/journalController');
const homeTransitionController = require('../controllers/homeTransitionController');
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

// Gallery categories
const galleryCategoryController = require('../controllers/galleryCategoryController');
router.get('/gallery-categories', protectAdmin, galleryCategoryController.getCategories);
router.post('/gallery-categories', protectAdmin, galleryCategoryController.createCategory);
router.delete('/gallery-categories/:id', protectAdmin, galleryCategoryController.deleteCategory);

router.get('/orders', protectAdmin, orderController.getAllOrders);
router.put('/orders/:id/status', protectAdmin, orderController.updateOrderStatus);
router.delete('/orders/clear-all', protectAdmin, orderController.clearAllOrders);

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

// Journal Stories (admin)
router.get('/journal', protectAdmin, journalController.getAllStories);
router.post('/journal', protectAdmin, journalController.createStory);
router.put('/journal/:id', protectAdmin, journalController.updateStory);
router.delete('/journal/:id', protectAdmin, journalController.deleteStory);

// Home Transition Images (admin)
router.get('/home-transition', protectAdmin, homeTransitionController.getAllImages);
router.post('/home-transition', protectAdmin, homeTransitionController.uploadImage);
router.put('/home-transition/reorder', protectAdmin, homeTransitionController.reorderImages);
router.put('/home-transition/:id', protectAdmin, homeTransitionController.updateImage);
router.put('/home-transition/:id/replace', protectAdmin, homeTransitionController.replaceImage);
router.delete('/home-transition/:id', protectAdmin, homeTransitionController.deleteImage);

// ── CMS Phase 1 (admin) ───────────────────────────────────────────────────
const cms = require('../controllers/cmsController');

// Media Library
router.get('/media',                protectAdmin, require('../controllers/mediaController').listMedia);
router.post('/media/upload',        protectAdmin, require('../controllers/mediaController').uploadMedia);
router.delete('/media/:fileName',   protectAdmin, require('../controllers/mediaController').deleteMedia);

// FAQs
router.get('/cms/faqs',              protectAdmin, (req, res) => { req.query.admin = 'true'; cms.getFaqs(req, res); });
router.post('/cms/faqs',             protectAdmin, cms.createFaq);
router.put('/cms/faqs/reorder',      protectAdmin, cms.reorderFaqs);
router.put('/cms/faqs/:id',          protectAdmin, cms.updateFaq);
router.delete('/cms/faqs/:id',       protectAdmin, cms.deleteFaq);

// Testimonials
router.get('/cms/testimonials',         protectAdmin, (req, res) => { req.query.admin = 'true'; cms.getTestimonials(req, res); });
router.post('/cms/testimonials',        protectAdmin, cms.createTestimonial);
router.put('/cms/testimonials/:id',     protectAdmin, cms.updateTestimonial);
router.delete('/cms/testimonials/:id',  protectAdmin, cms.deleteTestimonial);

// Website Settings
router.get('/cms/settings',  protectAdmin, cms.getSettings);
router.put('/cms/settings',  protectAdmin, cms.updateSettings);

// Social Links
router.get('/cms/social-links',      protectAdmin, (req, res) => { req.query.admin = 'true'; cms.getSocialLinks(req, res); });
router.post('/cms/social-links',     protectAdmin, cms.createSocialLink);
router.put('/cms/social-links/:id',  protectAdmin, cms.updateSocialLink);

// SEO Settings
router.get('/cms/seo',        protectAdmin, cms.getSeoSettings);
router.get('/cms/seo/:slug',  protectAdmin, cms.getSeoSettings);
router.put('/cms/seo/:slug',  protectAdmin, cms.updateSeoSettings);

module.exports = router;
