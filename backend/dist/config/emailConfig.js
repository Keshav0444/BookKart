"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Lazy initialisation — avoids crashing at startup when the key is missing
let _resend = null;
function getResend() {
    if (_resend)
        return _resend;
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        console.warn('⚠️  Email service disabled: RESEND_API_KEY is not set.');
        return null;
    }
    _resend = new resend_1.Resend(key);
    console.log('Email service (Resend) is configured and ready.');
    return _resend;
}
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const resend = getResend();
    if (!resend)
        return false;
    try {
        const from = (_a = process.env.EMAIL_FROM) !== null && _a !== void 0 ? _a : 'BookKart <onboarding@resend.dev>';
        const { error } = yield resend.emails.send({ from, to, subject, html });
        if (error) {
            console.error('Email sending failed:', error);
            return false;
        }
        return true;
    }
    catch (err) {
        console.error('Email sending failed:', err);
        return false;
    }
});
const sendVerificationEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    const html = `
    <h1>Welcome to BookKart!</h1>
    <p>Thank you for registering. Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
    return sendEmail(to, 'Verify Your Email - BookKart', html);
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
    <h1>Reset Your Password</h1>
    <p>You have requested to reset your password. Click the link below to set a new password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
  `;
    return sendEmail(to, 'Reset Your Password - BookKart', html);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
