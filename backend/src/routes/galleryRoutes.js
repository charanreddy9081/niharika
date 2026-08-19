const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', galleryController.getGallery);
router.get('/:id', galleryController.getGalleryById);

// Protected Admin endpoints
router.post('/', protectAdmin, galleryController.createGalleryItem);
router.put('/:id', protectAdmin, galleryController.updateGalleryItem);
router.delete('/:id', protectAdmin, galleryController.deleteGalleryItem);

module.exports = router;
