const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public catalog routes
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);

// Protected Admin-only routes
router.post('/', protectAdmin, productController.createProduct);
router.put('/:id', protectAdmin, productController.updateProduct);
router.delete('/:id', protectAdmin, productController.deleteProduct);

module.exports = router;
