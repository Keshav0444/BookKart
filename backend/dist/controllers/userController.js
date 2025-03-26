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
exports.editUserProfile = void 0;
const express_1 = require("express");
const responseHandler_1 = require("../utils/responseHandler");
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
/**
 * Edit User Profile by ID
 * Route: PUT /profile/:userId
 */
const editUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params; // Extract userId from request parameters
        if (!userId) {
            return (0, responseHandler_1.response)(res, 400, "User ID is required.");
        }
        console.log('this is userId', userId);
        const { name, email, phoneNumber } = req.body;
        console.log('this is req.body', req.body);
        // Find the user by ID and update the profile fields
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { name, email, phoneNumber }, { new: true, runValidators: true }).select("-password -verificationToken -resetPasswordToken -resetPasswordExpires");
        console.log(updatedUser);
        if (!updatedUser) {
            return (0, responseHandler_1.response)(res, 404, "User not found.");
        }
        return (0, responseHandler_1.response)(res, 200, "User profile updated successfully.", updatedUser);
    }
    catch (error) {
        return (0, responseHandler_1.response)(res, 500, "Internal server error.", error);
    }
});
exports.editUserProfile = editUserProfile;
exports.default = router;
