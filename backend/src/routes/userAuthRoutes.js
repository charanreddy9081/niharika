const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userAuthController');
const { protectUser } = require('../middleware/authMiddleware');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        protectUser, ctrl.getMe);
router.post('/logout',   ctrl.logout);
router.get('/debug',     ctrl.debugRegister); // temp debug — remove after fix

module.exports = router;
