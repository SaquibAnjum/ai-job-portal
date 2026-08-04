const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Environment SMTP variables:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';

if (!user || !pass) {
  console.error('❌ Missing SMTP_USER or SMTP_PASS!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user, pass },
});

console.log('\nTesting transporter.verify()...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Verification Error:', error);
  } else {
    console.log('✅ SMTP Connection Successfully Verified!');
  }
});
