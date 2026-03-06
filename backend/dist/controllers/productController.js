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
exports.getProductsBySeller = exports.deleteProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const Products_1 = __importDefault(require("../models/Products"));
const responseHandler_1 = require("../utils/responseHandler");
const cloudnaryConfig_1 = require("../config/cloudnaryConfig");
const cache_1 = require("../utils/cache");
const PRODUCTS_ALL_KEY = 'products:all';
const PRODUCT_KEY = (id) => `products:${id}`;
const PRODUCTS_SELLER_KEY = (sellerId) => `products:seller:${sellerId}`;
const PRODUCTS_SELLER_PREFIX = 'products:seller:';
const PRODUCTS_TTL = 300; // 5 minutes
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, price, category, condition, author, subject, edition, finalPrice, shippingCharge, classType, paymentMode, paymentDetails } = req.body;
        const images = req.files;
        const loggedInUser = req.id;
        if (!images || images.length === 0) {
            return (0, responseHandler_1.response)(res, 400, 'No images provided');
        }
        let parsedPaymentDetails = JSON.parse(paymentDetails);
        // Validate payment details
        if (paymentMode === 'UPI' && (!parsedPaymentDetails || !parsedPaymentDetails.upiId)) {
            return (0, responseHandler_1.response)(res, 400, 'UPI ID is required for UPI payment mode.');
        }
        if (paymentMode === 'Bank Account' &&
            (!parsedPaymentDetails || !parsedPaymentDetails.bankDetails ||
                !parsedPaymentDetails.bankDetails.accountNumber ||
                !parsedPaymentDetails.bankDetails.ifscCode ||
                !parsedPaymentDetails.bankDetails.bankName)) {
            return (0, responseHandler_1.response)(res, 400, 'Complete bank details are required for Bank Account payment mode.');
        }
        // Upload each file to Cloudinary and store the resulting URLs
        const uploadPromises = images.map(file => (0, cloudnaryConfig_1.uploadFileToCloudinary)(file));
        const uploadedImages = yield Promise.all(uploadPromises);
        const imageUrls = uploadedImages.map(image => image.secure_url);
        const product = new Products_1.default({
            title,
            description,
            price,
            classType,
            subject,
            images: imageUrls,
            category,
            condition,
            author,
            edition,
            seller: loggedInUser,
            finalPrice,
            shippingCharge,
            paymentMode,
            paymentDetails: parsedPaymentDetails
        });
        yield product.save();
        // Invalidate product list caches
        yield Promise.all([
            (0, cache_1.cacheDel)(PRODUCTS_ALL_KEY),
            (0, cache_1.cacheDelByPrefix)(PRODUCTS_SELLER_PREFIX),
        ]);
        return (0, responseHandler_1.response)(res, 201, 'Product created successfully', product);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, 'Error creating product');
    }
});
exports.createProduct = createProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Try cache first
        const cached = yield (0, cache_1.cacheGet)(PRODUCTS_ALL_KEY);
        if (cached) {
            return (0, responseHandler_1.response)(res, 200, 'Products fetched successfully', cached);
        }
        const products = yield Products_1.default.find()
            .sort({ createdAt: -1 })
            .populate('seller', 'name email');
        yield (0, cache_1.cacheSet)(PRODUCTS_ALL_KEY, products, PRODUCTS_TTL);
        (0, responseHandler_1.response)(res, 200, 'Products fetched successfully', products);
    }
    catch (error) {
        (0, responseHandler_1.response)(res, 500, 'Error fetching products');
    }
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = PRODUCT_KEY(req.params.id);
        // Try cache first
        const cached = yield (0, cache_1.cacheGet)(key);
        if (cached) {
            return (0, responseHandler_1.response)(res, 200, 'Product fetched successfully', cached);
        }
        const product = yield Products_1.default.findById(req.params.id)
            .populate({
            path: 'seller',
            select: 'name email profilePicture phoneNumber addresses',
            populate: {
                path: 'addresses',
                model: 'Address',
            },
        });
        if (!product) {
            return (0, responseHandler_1.response)(res, 404, 'Product not found');
        }
        yield (0, cache_1.cacheSet)(key, product, PRODUCTS_TTL);
        (0, responseHandler_1.response)(res, 200, 'Product fetched successfully', product);
    }
    catch (error) {
        (0, responseHandler_1.response)(res, 500, 'Error fetching product');
    }
});
exports.getProductById = getProductById;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Products_1.default.findByIdAndDelete(req.params.productId);
        if (!product) {
            return (0, responseHandler_1.response)(res, 404, 'Product not found');
        }
        // Invalidate related caches
        yield Promise.all([
            (0, cache_1.cacheDel)(PRODUCTS_ALL_KEY, PRODUCT_KEY(req.params.productId)),
            (0, cache_1.cacheDelByPrefix)(PRODUCTS_SELLER_PREFIX),
        ]);
        (0, responseHandler_1.response)(res, 200, 'Product deleted successfully');
    }
    catch (error) {
        (0, responseHandler_1.response)(res, 500, 'Error deleting product');
    }
});
exports.deleteProduct = deleteProduct;
const getProductsBySeller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = req.params.sellerId;
        if (!sellerId) {
            return (0, responseHandler_1.response)(res, 400, 'Seller ID is required');
        }
        const key = PRODUCTS_SELLER_KEY(sellerId);
        // Try cache first
        const cached = yield (0, cache_1.cacheGet)(key);
        if (cached) {
            return (0, responseHandler_1.response)(res, 200, 'Products fetched successfully', cached);
        }
        const products = yield Products_1.default.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .populate('seller', 'name email profilePicture phoneNumber');
        if (products.length === 0) {
            return (0, responseHandler_1.response)(res, 202, 'No products found for this seller');
        }
        yield (0, cache_1.cacheSet)(key, products, PRODUCTS_TTL);
        return (0, responseHandler_1.response)(res, 200, 'Products fetched successfully', products);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, 'Error fetching products');
    }
});
exports.getProductsBySeller = getProductsBySeller;
