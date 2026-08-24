const express = require('express');
const router = express.Router();
const { getShippingRates } = require('../services/shippingService');

// GET /api/shipping/rate?pincode=500010
router.get('/rate', (req, res) => {
  const { pincode } = req.query;

  if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid 6-digit pincode.',
    });
  }

  const rates = getShippingRates(pincode);
  if (!rates) {
    return res.status(400).json({
      success: false,
      message: 'Could not calculate shipping for this pincode.',
    });
  }

  return res.json({ success: true, data: rates });
});

module.exports = router;
