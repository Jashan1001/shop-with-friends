const express = require('express');
const router = express.Router();

const { signup, login, refresh, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { signupSchema, loginSchema } = require('../schemas/authSchemas');

// Rate limit + validate, then controller
router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login',  authLimiter, validate(loginSchema),  login);
router.post('/refresh', refresh);
router.post('/logout',  protect, logout);  // protect runs first, then logout
router.get('/me',       protect, getMe);

module.exports = router;