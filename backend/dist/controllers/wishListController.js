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
exports.getWishlist = exports.removeFromWishlist = exports.addToWishlist = void 0;
const wishList_1 = __importDefault(require("../models/wishList"));
const Products_1 = __importDefault(require("../models/Products"));
const responseHandler_1 = require("../utils/responseHandler");
const cache_1 = require("../utils/cache");
const WISHLIST_KEY = (userId) => `wishlist:${userId}`;
const WISHLIST_TTL = 300; // 5 minutes
const addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        const { productId } = req.body;
        const product = yield Products_1.default.findById(productId);
        if (!product) {
            return (0, responseHandler_1.response)(res, 404, 'Product not found');
        }
        let wishlist = yield wishList_1.default.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new wishList_1.default({ user: userId, products: [] });
        }
        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            yield wishlist.save();
        }
        // Invalidate wishlist cache
        yield (0, cache_1.cacheDel)(WISHLIST_KEY(userId));
        return (0, responseHandler_1.response)(res, 200, 'Product added to wishlist', wishlist);
    }
    catch (error) {
        return (0, responseHandler_1.response)(res, 500, 'Error adding product to wishlist');
    }
});
exports.addToWishlist = addToWishlist;
const removeFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        const { productId } = req.params;
        const wishlist = yield wishList_1.default.findOne({ user: userId });
        if (!wishlist) {
            return (0, responseHandler_1.response)(res, 404, 'Wishlist not found');
        }
        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        yield wishlist.save();
        // Invalidate wishlist cache
        yield (0, cache_1.cacheDel)(WISHLIST_KEY(userId));
        return (0, responseHandler_1.response)(res, 200, 'Product removed from wishlist', wishlist);
    }
    catch (error) {
        return (0, responseHandler_1.response)(res, 500, 'Error removing product from wishlist');
    }
});
exports.removeFromWishlist = removeFromWishlist;
const getWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        const key = WISHLIST_KEY(userId);
        // Try cache first
        const cached = yield (0, cache_1.cacheGet)(key);
        if (cached) {
            return (0, responseHandler_1.response)(res, 200, 'Wishlist fetched successfully', cached);
        }
        const wishlist = yield wishList_1.default.findOne({ user: userId }).populate('products');
        if (!wishlist) {
            return (0, responseHandler_1.response)(res, 404, 'Wishlist not found');
        }
        yield (0, cache_1.cacheSet)(key, wishlist, WISHLIST_TTL);
        (0, responseHandler_1.response)(res, 200, 'Wishlist fetched successfully', wishlist);
    }
    catch (error) {
        (0, responseHandler_1.response)(res, 500, 'Error fetching wishlist');
    }
});
exports.getWishlist = getWishlist;
