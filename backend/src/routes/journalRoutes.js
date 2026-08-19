const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/journalController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public
router.get('/', ctrl.getStories);

// Admin
router.get('/all', protectAdmin, ctrl.getAllStories);
router.post('/', protectAdmin, ctrl.createStory);
router.put('/:id', protectAdmin, ctrl.updateStory);
router.delete('/:id', protectAdmin, ctrl.deleteStory);

module.exports = router;
