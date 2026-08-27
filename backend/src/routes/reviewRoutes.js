const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { protectUser } = require('../middleware/authMiddleware');

// Public — approved reviews only
router.get('/', ctrl.getApprovedReviews);

// Authenticated users — submit review
router.post('/', protectUser, ctrl.submitReview);

module.exports = router;
