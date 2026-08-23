const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');

router.post('/send-otp',              ctrl.sendOTP);
router.post('/verify-otp',            ctrl.verifyOTP);
router.post('/create-razorpay-order', ctrl.createRazorpayOrder);
router.post('/verify-razorpay',       ctrl.verifyRazorpayPayment);

module.exports = router;
