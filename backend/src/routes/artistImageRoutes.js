const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/artistImageController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public — frontend fetches active images
router.get('/', ctrl.getArtistImages);

// Admin protected
router.get('/all', protectAdmin, ctrl.getAllArtistImages);
router.post('/', protectAdmin, ctrl.createArtistImage);
router.post('/upload', protectAdmin, ctrl.uploadArtistImageFile);
router.put('/:id', protectAdmin, ctrl.updateArtistImage);
router.delete('/:id', protectAdmin, ctrl.deleteArtistImage);

module.exports = router;
