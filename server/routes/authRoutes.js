const express = require('express');
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleLogin,
  getMe,
  getSessions,
  revokeSession,
  logout,
  logoutAll,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Public Authentication Routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.post('/google', googleLogin);

// Protected Authentication & Session Routes
router.get('/me', protect, getMe);
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, revokeSession);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);

module.exports = router;
