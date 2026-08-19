const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/siteContentController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public — all pages fetch content on load
router.get('/', ctrl.getAllContent);

// Admin protected
router.put('/update', protectAdmin, ctrl.updateContent);
router.put('/bulk', protectAdmin, ctrl.bulkUpdateContent);

module.exports = router;
