const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public read of site settings
router.get('/', settingController.getSettings);

// Protected Admin update of settings
router.put('/', protectAdmin, settingController.updateSettings);

module.exports = router;
