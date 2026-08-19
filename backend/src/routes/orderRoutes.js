const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public customer routes
router.post('/', orderController.createOrder);
router.get('/track', orderController.trackOrder);

// Protected Admin-only routes
router.get('/', protectAdmin, orderController.getAllOrders);
router.put('/:id/status', protectAdmin, orderController.updateOrderStatus);

module.exports = router;
