const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public customer routes
router.post('/inquiry', contactController.submitInquiry);
router.post('/subscribe', contactController.subscribeNewsletter);

// Protected Admin-only routes
router.get('/inquiries', protectAdmin, contactController.getInquiries);
router.get('/subscribers', protectAdmin, contactController.getSubscribers);

module.exports = router;
