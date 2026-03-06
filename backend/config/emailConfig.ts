import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    const from = process.env.EMAIL_USER;
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
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