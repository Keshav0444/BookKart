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
exports.getSellerPayment = exports.getDashboardStats = exports.processSellerPayment = exports.updateOrder = exports.getAllOrders = void 0;
const SellerPayment_1 = __importDefault(require("../models/SellerPayment"));
const ProductOrder_1 = __importDefault(require("../models/ProductOrder"));
const responseHandler_1 = require("../utils/responseHandler");
const User_1 = __importDefault(require("../models/User"));
const Products_1 = __importDefault(require("../models/Products"));
const cache_1 = require("../utils/cache");
const DASHBOARD_KEY = 'admin:dashboard';
const ADMIN_ORDERS_KEY = 'admin:orders';
const ADMIN_SELLER_PAYMENTS_KEY = 'admin:seller-payments';
const ADMIN_TTL = 60; // 1 minute — admin data changes frequently
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, paymentStatus, startDate, endDate } = req.query;
        // Build a stable cache key from query params
        const cacheKey = `${ADMIN_ORDERS_KEY}:${status || ''}:${paymentStatus || ''}:${startDate || ''}:${endDate || ''}`;
        const cached = yield (0, cache_1.cacheGet)(cacheKey);
        if (cached) {
            return (0, responseHandler_1.response)(res, 200, "order fetched successfully", { orders: cached });
        }
        const paidOrderRecord = yield SellerPayment_1.default.find().select('order');
        const paidOrderIds = paidOrderRecord.map((record) => record.order.toString());
        const query = {
            paymentStatus: "completed",
            _id: { $nin: paidOrderIds }
        };
        if (status) {
            query.status = status;
        }
        query.paymentStatus = paymentStatus || "completed";
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const orders = yield ProductOrder_1.default.find(query)
            .populate({
            path: "items.product",
            populate: {
                path: 'seller',
                select: "name email phoneNumber paymentMode paymentDetails"
            }
        })
            .populate("user", "name email")
            .populate("shippingAddress")
            .sort({ createdAt: -1 });
        yield (0, cache_1.cacheSet)(cacheKey, orders, ADMIN_TTL);
        return (0, responseHandler_1.response)(res, 200, "order fetched successfully", { orders });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return (0, responseHandler_1.response)(res, 500, 'Internal server error');
    }
});
exports.getAllOrders = getAllOrders;
//update order
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, paymentStatus, notes } = req.body;
        const order = yield ProductOrder_1.default.findById(id);
        if (!order) {
            return (0, responseHandler_1.response)(res, 404, 'Order not found');
        }
        if (status)
            order.status = status;
        if (paymentStatus)
            order.paymentStatus = paymentStatus;
        if (notes)
            order.notes = notes;
        yield order.save();
        // Invalidate admin orders, dashboard, and specific order caches
        yield Promise.all([
            (0, cache_1.cacheDelByPrefix)(ADMIN_ORDERS_KEY),
            (0, cache_1.cacheDel)(DASHBOARD_KEY),
            (0, cache_1.cacheDel)(`orders:${id}`),
            (0, cache_1.cacheDelByPrefix)('orders:user:'),
        ]);
        return (0, responseHandler_1.response)(res, 200, "Orderupdate successfully", order);
    }
    catch (error) {
        console.error('Error updating order:', error);
        return (0, responseHandler_1.response)(res, 500, 'Internal server error');
    }
});
exports.updateOrder = updateOrder;
const processSellerPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const { productId, paymentMethod, amount, notes } = req.body;
        const user = req.id;
        if (!productId || !paymentMethod || !amount) {
            return (0, responseHandler_1.response)(res, 400, "Missing required fields: productdId, payemtmethod, amount");
        }
        const order = yield ProductOrder_1.default.findById(orderId).populate({
            path: "items.product",
            populate: {
                path: "seller",
            }
        });
        if (!order) {
            return (0, responseHandler_1.response)(res, 404, 'Order not found');
        }
        //find the specific product in the order;
        const orderItem = order.items.find((item) => (item.product)._id.toString() === productId);
        if (!orderItem) {
            return (0, responseHandler_1.response)(res, 404, "Product not found in this order");
        }
        const sellerPayment = new SellerPayment_1.default({
            seller: orderItem.product.seller._id,
            order: orderId,
            product: productId,
            amount,
            paymentMethod,
            status: 'completed',
            processedBy: user,
            notes
        });
        yield sellerPayment.save();
        // Invalidate seller payments and dashboard caches
        yield Promise.all([
            (0, cache_1.cacheDelByPrefix)(ADMIN_SELLER_PAYMENTS_KEY),
            (0, cache_1.cacheDel)(DASHBOARD_KEY),
        ]);
        return (0, responseHandler_1.response)(res, 200, "Payment to seller processed successfully", sellerPayment);
    }
    catch (error) {
        console.error('Error processed seller payment:', error);
        return (0, responseHandler_1.response)(res, 500, 'Internal server error');
    }
});
exports.processSellerPayment = processSellerPayment;
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Try cache first
        const cached = yield (0, cache_1.cacheGet)(DASHBOARD_KEY);
        if (cached) {
            return (0, responseHandler_1.response)(res, 200, "Dashboard statistics fetched successfully", cached);
        }
        const [totalOrders, totalUsers, totalProducts, statusCounts, recentOrders, revenue, monthlySales] = yield Promise.all([
            //Get Count 
            ProductOrder_1.default.countDocuments().lean(),
            User_1.default.countDocuments().lean(),
            Products_1.default.countDocuments().lean(),
            //Get order by status in single query
            ProductOrder_1.default.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),
            //Get recent order
            ProductOrder_1.default.find()
                .select("user totalAmount status createdAt")
                .populate("user", "name")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            //calculate revenue
            ProductOrder_1.default.aggregate([
                { $match: { paymentStatus: "completed" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            //Get monthly sales data for chart
            ProductOrder_1.default.aggregate([
                { $match: { paymentStatus: "completed" } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 },
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);
        //Process status count
        const ordersByStatus = {
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };
        statusCounts.forEach((item) => {
            const status = item._id;
            if (ordersByStatus.hasOwnProperty(status)) {
                ordersByStatus[status] = item.count;
            }
        });
        const statsPayload = {
            counts: {
                orders: totalOrders,
                users: totalUsers,
                products: totalProducts,
                revenue: revenue.length > 0 ? revenue[0].total : 0,
            },
            ordersByStatus,
            recentOrders,
            monthlySales
        };
        yield (0, cache_1.cacheSet)(DASHBOARD_KEY, statsPayload, ADMIN_TTL);
        return (0, responseHandler_1.response)(res, 200, "Dashboard statistics fetched successfully", statsPayload);
    }
    catch (error) {
        console.error('Error processed dashboard statitics:', error);
        return (0, responseHandler_1.response)(res, 500, 'Internal server error');
    }
});
exports.getDashboardStats = getDashboardStats;
const getSellerPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sellerId, status, paymentMethod, startDate, endDate } = req.query;
        // Build a stable cache key from query params
        const cacheKey = `${ADMIN_SELLER_PAYMENTS_KEY}:${sellerId || 'all'}:${status || 'all'}:${paymentMethod || 'all'}:${startDate || ''}:${endDate || ''}`;
        const cached = yield (0, cache_1.cacheGet)(cacheKey);
        if (cached) {
            return (0, responseHandler_1.response)(res, 200, "seller Payments fetched successfully", cached);
        }
        const query = {};
        if (sellerId && sellerId !== 'all') {
            query.seller = sellerId;
        }
        if (status && status !== 'all') {
            query.status = status;
        }
        if (paymentMethod && paymentMethod !== 'all') {
            query.paymentMethod = paymentMethod;
        }
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const payments = yield SellerPayment_1.default.find(query)
            .populate("seller", "name email phoneNumber paymentMode paymentDetails")
            .populate("order")
            .populate("product", "subject finalPrice images")
            .populate("processedBy", "name")
            .sort({ createdAt: -1 });
        const users = yield User_1.default.find();
        const payload = { payments, users };
        yield (0, cache_1.cacheSet)(cacheKey, payload, ADMIN_TTL);
        return (0, responseHandler_1.response)(res, 200, "seller Payments fetched successfully", payload);
    }
    catch (error) {
        console.error('failed to fetched  seller Payments', error);
        return (0, responseHandler_1.response)(res, 500, 'Internal server error');
    }
});
exports.getSellerPayment = getSellerPayment;
