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
exports.createOrUpdateAddressByUserId = exports.getAddressByUserId = void 0;
const Address_1 = __importDefault(require("../models/Address")); // Import the Address model
const responseHandler_1 = require("../utils/responseHandler");
const User_1 = __importDefault(require("../models/User"));
// Function to get address by userId
const getAddressByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        if (!userId) {
            return (0, responseHandler_1.response)(res, 400, 'User not found');
        }
        // Find the address by userId
        const address = yield User_1.default.findById(userId).populate('addresses');
        if (!address) {
            return (0, responseHandler_1.response)(res, 404, 'Address not found');
        }
        return (0, responseHandler_1.response)(res, 200, 'Address fetched successfully', address);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, 'Error fetching address');
    }
});
exports.getAddressByUserId = getAddressByUserId;
const createOrUpdateAddressByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        const { phoneNumber, addressLine1, addressLine2, city, state, pincode, addressId } = req.body;
        console.log(req.body);
        if (!userId) {
            return (0, responseHandler_1.response)(res, 400, 'User not found');
        }
        // Validate required fields
        if (!phoneNumber || !addressLine1 || !city || !state || !pincode) {
            return (0, responseHandler_1.response)(res, 400, 'All address fields are required');
        }
        // Check if an addressId is provided for update
        if (addressId) {
            // Find and update the existing address
            const existingAddress = yield Address_1.default.findById(addressId);
            if (!existingAddress) {
                return (0, responseHandler_1.response)(res, 404, 'Address not found');
            }
            existingAddress.phoneNumber = phoneNumber;
            existingAddress.addressLine1 = addressLine1;
            existingAddress.addressLine2 = addressLine2;
            existingAddress.city = city;
            existingAddress.state = state;
            existingAddress.pincode = pincode;
            // Save the updated address
            yield existingAddress.save();
            return (0, responseHandler_1.response)(res, 200, 'Address updated successfully', existingAddress);
        }
        else {
            // Create a new address if no addressId is provided
            const newAddress = new Address_1.default({
                user: userId,
                addressLine1,
                addressLine2,
                phoneNumber,
                city,
                state,
                pincode,
            });
            // Save the new address
            yield newAddress.save();
            // Add the new address to the user's addresses array
            yield User_1.default.findByIdAndUpdate(userId, { $push: { addresses: newAddress._id } }, { new: true });
            return (0, responseHandler_1.response)(res, 201, 'Address added successfully', newAddress);
        }
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, 'Error creating or updating address');
    }
});
exports.createOrUpdateAddressByUserId = createOrUpdateAddressByUserId;
