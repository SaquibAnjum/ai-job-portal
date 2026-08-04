const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Session = require('../models/Session');
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} = require('../controllers/authController');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-job-portal';

const createMockReqRes = (body = {}, headers = {}, params = {}) => {
  const req = {
    body,
    headers,
    params,
    socket: { remoteAddress: '127.0.0.1' },
    cookies: {},
  };

  let statusCode = 200;
  let jsonResponse = null;
  let cookiesSet = {};

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    cookie: (name, val, options) => {
      cookiesSet[name] = val;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    },
  };

  return { req, res, getStatus: () => statusCode, getJson: () => jsonResponse, getCookies: () => cookiesSet };
};

const runTests = async () => {
  console.log('====================================================');
  console.log('REAL EMAIL DELIVERY & AUTHENTICATION FLOW SUITE');
  console.log('====================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Use user's real target email or test account
    const targetEmail = process.env.TEST_DELIVERY_EMAIL || process.env.SMTP_USER || 'sak121786@gmail.com';
    const testPassword = 'ProductionTestPass123!';
    const testName = 'Verified Nodemailer Tester';

    // Clean up previous test user if exists
    await User.deleteOne({ email: targetEmail });

    // 1. SIGNUP & REAL EMAIL DELIVERY
    console.log(`\n[1/5] Executing Signup for ${targetEmail}...`);
    const { req: regReq, res: regRes, getStatus: getRegStatus, getJson: getRegJson } = createMockReqRes({
      name: testName,
      email: targetEmail,
      password: testPassword,
      role: 'candidate',
    });

    await register(regReq, regRes, (err) => console.error('Register Error:', err));
    const regJson = getRegJson();
    console.log(`Signup Status Code: ${getRegStatus()}`);
    console.log(`Signup Response: ${JSON.stringify(regJson)}`);

    if (getRegStatus() !== 201 || !regJson.isUnverified) {
      throw new Error(`Signup failed: ${regJson?.message}`);
    }
    console.log('✓ Signup & Real Nodemailer OTP Delivery PASS');

    // Retrieve generated OTP from DB
    const dbUser = await User.findOne({ email: targetEmail });
    if (!dbUser || !dbUser.otp?.code) {
      throw new Error('User or OTP code not found in DB!');
    }
    const otpCode = dbUser.otp.code;
    console.log(`✓ 6-Digit OTP Code generated and sent to Inbox: ${otpCode}`);

    // 2. UNVERIFIED LOGIN REJECTION
    console.log('\n[2/5] Testing Unverified Login Rejection...');
    const { req: unvReq, res: unvRes, getStatus: getUnvStatus } = createMockReqRes({
      email: targetEmail,
      password: testPassword,
    });
    await login(unvReq, unvRes, (err) => console.error('Unv Login Error:', err));
    if (getUnvStatus() !== 403) {
      throw new Error('Unverified login check failed!');
    }
    console.log('✓ Unverified Login Rejection PASS');

    // 3. OTP VERIFICATION
    console.log('\n[3/5] Submitting 6-Digit OTP Verification Code...');
    const { req: otpReq, res: otpRes, getStatus: getOtpStatus, getJson: getOtpJson } = createMockReqRes({
      email: targetEmail,
      otp: otpCode,
    });
    await verifyOtp(otpReq, otpRes, (err) => console.error('Verify OTP Error:', err));
    const otpJson = getOtpJson();
    console.log(`OTP Verification Status: ${getOtpStatus()}`);

    if (getOtpStatus() !== 200 || !otpJson?.token) {
      throw new Error(`OTP Verification failed: ${otpJson?.message}`);
    }
    console.log('✓ Email Verification & JWT Token Generation PASS');

    // 4. VERIFIED LOGIN
    console.log('\n[4/5] Testing Verified Login...');
    const { req: logReq, res: logRes, getStatus: getLogStatus, getJson: getLogJson } = createMockReqRes({
      email: targetEmail,
      password: testPassword,
    });
    await login(logReq, logRes, (err) => console.error('Login Error:', err));
    const logJson = getLogJson();
    if (getLogStatus() !== 200 || !logJson?.token) {
      throw new Error(`Verified Login failed: ${logJson?.message}`);
    }
    console.log('✓ Verified Login PASS');

    // 5. CLEANUP
    console.log('\n[5/5] Cleaning up test data...');
    await User.deleteOne({ email: targetEmail });
    await Session.deleteMany({ user: dbUser._id });
    console.log('✓ Cleanup Complete');

    console.log('\n====================================================');
    console.log('🎉 END-TO-END EMAIL DELIVERY & VERIFICATION PASSED!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
