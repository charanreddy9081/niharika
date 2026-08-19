const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/homeTransitionController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public — home page fetches active images
router.get('/', ctrl.getActiveImages);

// Admin protected
router.get('/all', protectAdmin, ctrl.getAllImages);
router.post('/', protectAdmin, ctrl.uploadImage);
router.put('/reorder', protectAdmin, ctrl.reorderImages);
router.put('/:id', protectAdmin, ctrl.updateImage);
router.put('/:id/replace', protectAdmin, ctrl.replaceImage);
router.delete('/:id', protectAdmin, ctrl.deleteImage);

module.exports = router;
