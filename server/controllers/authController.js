const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Subscription = require('../models/Subscription');
const Session = require('../models/Session');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');
const { logAudit } = require('../middlewares/auditMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_access_key_2026_antigravity';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_2026_antigravity';

const generateAccessToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = async (user, statusCode, res, req) => {
  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Store active session in DB
  const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
  const userAgent = req ? req.headers['user-agent'] || 'Browser' : 'Browser';

  await Session.create({
    user: user._id,
    token: refreshToken,
    ipAddress,
    userAgent,
    isValid: true,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        status: user.status,
      },
    });
};

// @desc    Register user with OTP generation
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Prevent Duplicate Signup
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account already exists with this email. Please login instead.',
      });
    }

    // Generate 6-digit OTP code with 10-min expiration
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || 'candidate',
      isVerified: false,
      status: 'Active',
      otp: {
        code: otpCode,
        expiresAt: otpExpires,
        resendCount: 0,
        lastResendAt: new Date(),
      },
    });

    if (user.role === 'candidate') {
      await CandidateProfile.create({ user: user._id });
      await Subscription.create({ user: user._id, plan: 'Free', aiCredits: 50 });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.create({ user: user._id });
      await Subscription.create({ user: user._id, plan: 'Recruiter Pro', aiCredits: 200 });
    }

    // Send verification email via Nodemailer
    const emailSent = await sendVerificationEmail(user, otpCode);

    if (!emailSent) {
      // Rollback user and related objects if email fails to deliver
      await User.deleteOne({ _id: user._id });
      if (user.role === 'candidate') {
        await CandidateProfile.deleteOne({ user: user._id });
        await Subscription.deleteOne({ user: user._id });
      } else if (user.role === 'recruiter') {
        await RecruiterProfile.deleteOne({ user: user._id });
        await Subscription.deleteOne({ user: user._id });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to deliver OTP verification email. Please verify your email address or SMTP credentials.',
      });
    }

    await logAudit(user._id, user.email, 'USER_REGISTER', 'User', user._id, { role: user.role }, req);

    res.status(201).json({
      success: true,
      isUnverified: true,
      email: user.email,
      message: 'Account created! Please check your email for the 6-digit verification code.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Email with 6-digit OTP
// @route   POST /api/v1/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and verification code' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: 'Account is already verified. Please sign in.' });
    }

    if (!user.otp || user.otp.code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save({ validateBeforeSave: false });

    await sendWelcomeEmail(user);
    await logAudit(user._id, user.email, 'EMAIL_VERIFIED', 'User', user._id, {}, req);

    await sendTokenResponse(user, 200, res, req);
  } catch (err) {
    next(err);
  }
};

// @desc    Resend OTP Verification Code
// @route   POST /api/v1/auth/resend-otp
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified. Please sign in.' });
    }

    const resendCount = user.otp?.resendCount || 0;
    if (resendCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP resend limit reached (5/5). Please contact support if you need assistance.',
      });
    }

    // Countdown cooldown check (60s)
    if (user.otp?.lastResendAt && Date.now() - new Date(user.otp.lastResendAt).getTime() < 60000) {
      const waitSeconds = Math.ceil((60000 - (Date.now() - new Date(user.otp.lastResendAt).getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another code.`,
      });
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: newOtpCode,
      expiresAt: newExpiresAt,
      resendCount: resendCount + 1,
      lastResendAt: new Date(),
    };

    await user.save({ validateBeforeSave: false });

    const emailSent = await sendVerificationEmail(user, newOtpCode);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to deliver verification email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${user.email}`,
      resendCount: resendCount + 1,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user with verification & status check
// @route   POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Require Email Verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: 'Please verify your email address before logging in.',
      });
    }

    // Check Account Status
    if (user.status && user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended or deactivated. Please contact support.',
      });
    }

    await logAudit(user._id, user.email, 'USER_LOGIN', 'User', user._id, {}, req);
    await sendTokenResponse(user, 200, res, req);
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh Token with Rotation
// @route   POST /api/v1/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const session = await Session.findOne({ token: refreshToken, isValid: true });

    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid session or revoked refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || (user.status && user.status !== 'Active')) {
      return res.status(401).json({ success: false, message: 'User account inactive or not found' });
    }

    // Invalidate old session token (Rotation)
    session.isValid = false;
    await session.save();

    // Issue new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    await Session.create({
      user: user._id,
      token: newRefreshToken,
      ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      isValid: true,
    });

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'lax',
    };

    res
      .status(200)
      .cookie('token', newAccessToken, cookieOptions)
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json({
        success: true,
        token: newAccessToken,
        refreshToken: newRefreshToken,
      });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user, resetUrl);
    res.status(200).json({ success: true, message: 'Password reset link sent to your email address (expires in 15 mins).' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset link' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Invalidate previous sessions
    await Session.updateMany({ user: user._id }, { isValid: false });

    await logAudit(user._id, user.email, 'PASSWORD_RESET', 'User', user._id, {}, req);
    await sendTokenResponse(user, 200, res, req);
  } catch (err) {
    next(err);
  }
};

// @desc    Google OAuth Login
// @route   POST /api/v1/auth/google
exports.googleLogin = async (req, res, next) => {
  try {
    const { name, email, avatar, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required for Google Sign-In' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        password: crypto.randomBytes(16).toString('hex'),
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: role || 'candidate',
        isVerified: true,
        status: 'Active',
      });

      if (user.role === 'candidate') {
        await CandidateProfile.create({ user: user._id });
        await Subscription.create({ user: user._id, plan: 'Free', aiCredits: 50 });
      } else if (user.role === 'recruiter') {
        await RecruiterProfile.create({ user: user._id });
        await Subscription.create({ user: user._id, plan: 'Recruiter Pro', aiCredits: 200 });
      }
    }

    await logAudit(user._id, user.email, 'GOOGLE_LOGIN', 'User', user._id, {}, req);
    await sendTokenResponse(user, 200, res, req);
  } catch (err) {
    next(err);
  }
};

// @desc    Get Current User
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;

    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ user: user._id }).populate('savedJobs');
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id }).populate('company');
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Active User Sessions
// @route   GET /api/v1/auth/sessions
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ user: req.user.id, isValid: true }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    next(err);
  }
};

// @desc    Revoke Single Session
// @route   DELETE /api/v1/auth/sessions/:id
exports.revokeSession = async (req, res, next) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, { isValid: false });
    res.status(200).json({ success: true, message: 'Session revoked successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookies & invalidate session
// @route   POST /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      await Session.findOneAndUpdate({ token: refreshToken }, { isValid: false });
    }
    res.cookie('token', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
    res.cookie('refreshToken', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout from all devices
// @route   POST /api/v1/auth/logout-all
exports.logoutAll = async (req, res, next) => {
  try {
    await Session.updateMany({ user: req.user.id }, { isValid: false });
    res.cookie('token', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
    res.cookie('refreshToken', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
    res.status(200).json({ success: true, message: 'Logged out from all devices successfully' });
  } catch (err) {
    next(err);
  }
};
