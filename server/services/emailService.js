const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!user || !pass) {
    console.error('[Email Setup Error]: SMTP_USER or SMTP_PASS is missing in environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    service: host.includes('gmail') ? 'gmail' : undefined,
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || 'NexHire AI Platform <sak121786@gmail.com>';
  const transporter = createTransporter();

  if (!transporter) {
    console.error(`[Email Failed]: Cannot send email to ${to}. SMTP Transporter configuration is incomplete.`);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
      },
    });
    console.log(`[Nodemailer Email Delivered Successfully]: MessageID=${info.messageId} To=${to}`);
    return true;
  } catch (err) {
    console.error('[Nodemailer Delivery Error]:', {
      message: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
    });
    return false;
  }
};

const sendVerificationEmail = async (user, otpCode) => {
  const subject = `NexHire AI Verification Code: ${otpCode}`;
  const text = `Hello ${user.name},\n\nYour NexHire.AI verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this message.`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 16px; background: #0f172a; color: #f8fafc; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">NexHire.AI</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">AI-Powered Career & Recruitment Platform</p>
      </div>

      <div style="background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #334155;">
        <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Welcome, <strong>${user.name}</strong>! Thank you for joining NexHire.AI. Please use the 6-digit verification code below to complete your account registration:
        </p>

        <div style="font-size: 36px; font-weight: 800; color: #38bdf8; letter-spacing: 8px; margin: 28px 0; text-align: center; background: #090d16; padding: 18px; border-radius: 10px; border: 1px solid #0284c7;">
          ${otpCode}
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-bottom: 0;">
          ⏱️ This verification code will expire in <strong>10 minutes</strong>.
        </p>
      </div>

      <div style="margin-top: 24px; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          If you did not request this account creation, please ignore this email.
        </p>
      </div>
    </div>
  `;
  return await sendEmail({ to: user.email, subject, text, html });
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 16px; background: #0f172a; color: #f8fafc; border: 1px solid #1e293b;">
      <h2 style="color: #10b981;">🎉 Account Verified & Ready!</h2>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Hello <strong>${user.name}</strong>, your email address has been successfully verified!
      </p>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        You can now log in and take full advantage of NexHire's AI Resume Parser, AI ATS Optimizer, and AI Job Recommendations.
      </p>
    </div>
  `;
  return await sendEmail({ to: user.email, subject: 'Welcome to NexHire AI Platform', html });
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 16px; background: #0f172a; color: #f8fafc; border: 1px solid #1e293b;">
      <h2 style="color: #f43f5e;">Password Reset Request</h2>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Hello <strong>${user.name}</strong>, we received a request to reset your NexHire account password.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">Reset My Password</a>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        This reset link will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.
      </p>
    </div>
  `;
  return await sendEmail({ to: user.email, subject: '🔐 NexHire AI Password Reset Link', html });
};

const sendInterviewEmail = async (candidate, jobTitle, scheduledAt, meetingLink) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 16px; background: #0f172a; color: #f8fafc; border: 1px solid #1e293b;">
      <h2 style="color: #a855f7;">Interview Invitation: ${jobTitle}</h2>
      <p style="color: #cbd5e1;">Dear ${candidate.name},</p>
      <p style="color: #cbd5e1;">You have been invited for an interview scheduled on <strong>${new Date(scheduledAt).toLocaleString()}</strong>.</p>
      <p style="margin-top: 16px;"><a href="${meetingLink}" style="color: #38bdf8; font-weight: bold;">Join Video Meeting Call</a></p>
    </div>
  `;
  return await sendEmail({ to: candidate.email, subject: `Interview Invitation: ${jobTitle}`, html });
};

const sendOfferEmail = async (candidate, jobTitle, salary) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 16px; background: #0f172a; color: #f8fafc; border: 1px solid #1e293b;">
      <h2 style="color: #10b981;">🎉 Official Job Offer: ${jobTitle}</h2>
      <p style="color: #cbd5e1;">Dear ${candidate.name},</p>
      <p style="color: #cbd5e1;">We are delighted to issue your official offer for <strong>${jobTitle}</strong> with a starting salary of <strong>$${Number(salary).toLocaleString()}</strong>.</p>
    </div>
  `;
  return await sendEmail({ to: candidate.email, subject: `Official Job Offer: ${jobTitle}`, html });
};

const sendStatusUpdateEmail = async (candidate, jobTitle, status, reason = '') => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 16px; background: #0f172a; color: #f8fafc; border: 1px solid #1e293b;">
      <h2 style="color: #38bdf8;">Application Status Update</h2>
      <p style="color: #cbd5e1;">Your application status for <strong>${jobTitle}</strong> has been updated to: <strong style="color: #facc15;">${status}</strong>.</p>
      ${reason ? `<p style="color: #94a3b8; font-size: 13px; margin-top: 12px;">Feedback: ${reason}</p>` : ''}
    </div>
  `;
  return await sendEmail({ to: candidate.email, subject: `Application Status Updated: ${jobTitle}`, html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendInterviewEmail,
  sendOfferEmail,
  sendStatusUpdateEmail,
};
