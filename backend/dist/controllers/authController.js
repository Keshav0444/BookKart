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
exports.checkUserAuth = exports.logout = exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyEmail = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = __importDefault(require("crypto"));
const emailConfig_1 = require("../config/emailConfig");
const responseHandler_1 = require("../utils/responseHandler");
const generateToken_1 = require("../utils/generateToken");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, agreeTerms } = req.body;
        const existingUser = yield User_1.default.findOne({ email });
        console.log(existingUser);
        if (existingUser) {
            return (0, responseHandler_1.response)(res, 400, 'User already exists');
        }
        const verificationToken = crypto_1.default.randomBytes(20).toString('hex');
        const user = new User_1.default({ name, email, password, agreeTerms, verificationToken });
        yield user.save();
        const result = yield (0, emailConfig_1.sendVerificationEmail)(user.email, verificationToken);
        console.log(result);
        return (0, responseHandler_1.response)(res, 201, 'Registration successful. Please check your email to verify your account.');
    }
    catch (error) {
        console.log(error);
        return (0, responseHandler_1.response)(res, 500, 'An error occurred during registration. Please try again.');
    }
});
exports.register = register;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const user = yield User_1.default.findOne({ verificationToken: token });
        if (!user) {
            return (0, responseHandler_1.response)(res, 400, 'Invalid or expired verification token');
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        const accessToken = (0, generateToken_1.generateToken)(user);
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        yield user.save();
        return (0, responseHandler_1.response)(res, 200, 'Email verified successfully. You can now log in to your account.');
    }
    catch (error) {
        return (0, responseHandler_1.response)(res, 500, 'An error occurred while verifying your email. Please try again.');
    }
});
exports.verifyEmail = verifyEmail;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user || !(yield user.comparePassword(password))) {
            return (0, responseHandler_1.response)(res, 401, 'Invalid email or password');
        }
        if (!user.isVerified) {
            return (0, responseHandler_1.response)(res, 401, 'Please verify your email before logging in. Check your inbox for the verification link.');
        }
        // Use the generateToken function
        const accessToken = (0, generateToken_1.generateToken)(user);
        // Set the token in the cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        return (0, responseHandler_1.response)(res, 200, 'Login successful', { user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        return (0, responseHandler_1.response)(res, 500, 'An error occurred during login. Please try again.');
    }
});
exports.login = login;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        console.log(email);
        const user = yield User_1.default.findOne({ email });
        console.log('this is user', user);
        if (!user) {
            return (0, responseHandler_1.response)(res, 404, 'No account found with this email address');
        }
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        yield user.save();
        yield (0, emailConfig_1.sendPasswordResetEmail)(user.email, resetToken);
        return (0, responseHandler_1.response)(res, 200, 'A password reset link has been sent to your email address');
    }
    catch (error) {
        console.log(error);
        return (0, responseHandler_1.response)(res, 500, 'An error occurred while processing your request. Please try again.');
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const user = yield User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return (0, responseHandler_1.response)(res, 400, 'Invalid or expired password reset token');
        }
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        return (0, responseHandler_1.response)(res, 200, 'Your password has been successfully reset. You can now log in with your new password.');
    }
    catch (error) {
        return (0, responseHandler_1.response)(res, 500, 'An error occurred while resetting your password. Please try again.');
    }
});
exports.resetPassword = resetPassword;
const logout = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear the access token cookie
        res.clearCookie("access_token", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        return (0, responseHandler_1.response)(res, 200, "Successfully logged out.");
    }
    catch (error) {
        console.error("Logout Error:", error);
        return (0, responseHandler_1.response)(res, 500, "An error occurred while processing your request. Please try again.");
    }
});
exports.logout = logout;
const checkUserAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        if (!userId) {
            return (0, responseHandler_1.response)(res, 400, 'Unauthenticated! Please login before accessing the data');
        }
        const user = yield User_1.default.findById(userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
        console.log(user);
        if (!user) {
            return (0, responseHandler_1.response)(res, 403, 'User not found');
        }
        return (0, responseHandler_1.response)(res, 201, 'User retrieved and allowed to use bookkart', user);
    }
    catch (error) {
        return (0, responseHandler_1.response)(res, 500, 'Internal server error', error);
    }
});
exports.checkUserAuth = checkUserAuth;
