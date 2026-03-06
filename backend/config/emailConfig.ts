import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Lazy initialisation — avoids crashing at startup when the key is missing
let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('⚠️  Email service disabled: RESEND_API_KEY is not set.');
    return null;
  }
  _resend = new Resend(key);
  console.log('Email service (Resend) is configured and ready.');
  return _resend;
}

const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const resend = getResend();
  if (!resend) return false;
  try {
    const from = process.env.EMAIL_FROM ?? 'BookKart <onboarding@resend.dev>';
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error('Email sending failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Email sending failed:', err);
    return false;
  }
};

export const sendVerificationEmail = async (to: string, token: string): Promise<boolean> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = `
    <h1>Welcome to BookKart!</h1>
    <p>Thank you for registering. Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(to, 'Verify Your Email - BookKart', html);
};

export const sendPasswordResetEmail = async (to: string, token: string): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
    <h1>Reset Your Password</h1>
    <p>You have requested to reset your password. Click the link below to set a new password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
  `;
  return sendEmail(to, 'Reset Your Password - BookKart', html);
};