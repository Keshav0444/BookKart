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
exports.handleRazorpayWebhook = exports.createPaymentWithRazorpay = exports.getUserOrders = exports.getOrderById = exports.createOrUpdateOrder = void 0;
const ProductOrder_1 = __importDefault(require("../models/ProductOrder"));
const cartItems_1 = __importDefault(require("../models/cartItems"));
const razorpay_1 = __importDefault(require("razorpay"));
const dotenv_1 = __importDefault(require("dotenv"));
const responseHandler_1 = require("../utils/responseHandler");
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const createOrUpdateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        const { orderId, shippingAddress, paymentMethod, totalAmount, paymentDetails } = req.body;
        const cart = yield cartItems_1.default.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return (0, responseHandler_1.response)(res, 400, 'Cart is empty');
        }
        let order = yield ProductOrder_1.default.findOne({ _id: orderId });
        if (order) {
            // Update existing order
            order.shippingAddress = shippingAddress || order.shippingAddress;
            order.paymentMethod = paymentMethod || order.paymentMethod;
            order.totalAmount = totalAmount || order.totalAmount;
            if (paymentDetails) {
                order.paymentDetails = paymentDetails;
                order.paymentStatus = 'completed';
                order.status = 'processing';
            }
        }
        else {
            // Create new order
            order = new ProductOrder_1.default({
                user: userId,
                items: cart.items,
                totalAmount,
                shippingAddress,
                paymentMethod,
                paymentDetails,
                paymentStatus: paymentDetails ? 'completed' : 'pending',
            });
        }
        yield order.save();
        if (paymentDetails) {
            // Remove cart items after successful payment
            yield cartItems_1.default.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        }
        (0, responseHandler_1.response)(res, 201, 'Order created/updated successfully', order);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, 'Error creating/updating order');
    }
});
exports.createOrUpdateOrder = createOrUpdateOrder;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield ProductOrder_1.default.findById(req.params.id)
            .populate('user', 'name email').populate('shippingAddress')
            .populate({
            path: 'items.product',
            model: 'Product',
        });
        if (!order) {
            return (0, responseHandler_1.response)(res, 404, 'Order not found');
        }
        (0, responseHandler_1.response)(res, 200, 'Order fetched successfully', order);
    }
    catch (error) {
        (0, responseHandler_1.response)(res, 500, 'Error fetching order');
    }
});
exports.getOrderById = getOrderById;
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        const orders = yield ProductOrder_1.default.find({ user: userId }).sort({ createdAt: -1 })
            .populate('user', 'name email').populate('shippingAddress')
            .populate({
            path: 'items.product',
            model: 'Product',
        });
        console.log(orders);
        (0, responseHandler_1.response)(res, 200, 'Orders fetched successfully', orders);
    }
    catch (error) {
        (0, responseHandler_1.response)(res, 500, 'Error fetching orders');
    }
});
exports.getUserOrders = getUserOrders;
const createPaymentWithRazorpay = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.body;
        const order = yield ProductOrder_1.default.findById(orderId);
        if (!order) {
            return (0, responseHandler_1.response)(res, 404, 'Order not found');
        }
        const razorpayOrder = yield razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: 'INR',
            receipt: order._id.toString(),
        });
        (0, responseHandler_1.response)(res, 200, 'Razorpay order created', { order: razorpayOrder });
    }
    catch (error) {
        console.error('Error creating Razorpay order:', error);
        (0, responseHandler_1.response)(res, 500, 'Error creating Razorpay order');
    }
});
exports.createPaymentWithRazorpay = createPaymentWithRazorpay;
const handleRazorpayWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto_1.default.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');
    if (digest === req.headers['x-razorpay-signature']) {
        const paymentId = req.body.payload.payment.entity.id;
        const orderId = req.body.payload.payment.entity.order_id;
        yield ProductOrder_1.default.findOneAndUpdate({ 'paymentDetails.razorpay_order_id': orderId }, {
            paymentStatus: 'completed',
            status: 'processing',
            'paymentDetails.razorpay_payment_id': paymentId,
        });
        (0, responseHandler_1.response)(res, 200, 'Webhook processed successfully');
    }
    else {
        (0, responseHandler_1.response)(res, 400, 'Invalid signature');
    }
});
exports.handleRazorpayWebhook = handleRazorpayWebhook;
