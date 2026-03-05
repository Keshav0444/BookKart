import { Request, Response } from 'express';
import Order from '../models/ProductOrder';
import Cart from '../models/cartItems';
import Razorpay from 'razorpay';
import dotenv from 'dotenv'
import { response } from '../utils/responseHandler';
import crypto from 'crypto';
import { cacheGet, cacheSet, cacheDel, cacheDelByPrefix } from '../utils/cache';
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

const ORDER_KEY = (id: string) => `orders:${id}`;
const USER_ORDERS_KEY = (userId: string) => `orders:user:${userId}`;
const ORDERS_PREFIX = 'orders:';
const ORDER_TTL = 120; // 2 minutes

export const createOrUpdateOrder = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    const { orderId, shippingAddress, paymentMethod, totalAmount, paymentDetails } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return response(res, 400, 'Cart is empty');
    }

    let order = await Order.findOne({ _id: orderId });

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
    } else {
      // Create new order
      order = new Order({
        user: userId,
        items: cart.items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentDetails,
        paymentStatus: paymentDetails ? 'completed' : 'pending',
      });
    }

    await order.save();

    if (paymentDetails) {
      // Remove cart items after successful payment
      await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } }
      );
      // Invalidate cart cache since items were cleared
      await cacheDel(`cart:${userId}`);
    }

    // Invalidate order caches
    await Promise.all([
      cacheDel(USER_ORDERS_KEY(userId!), ORDER_KEY(order._id.toString())),
      cacheDel('admin:orders', 'admin:dashboard'),
    ]);

    response(res, 201, 'Order created/updated successfully', order);
  } catch (error) {
    console.error(error);
    response(res, 500, 'Error creating/updating order');
  }
};


export const getOrderById = async (req: Request, res: Response) => {
  try {
    const key = ORDER_KEY(req.params.id);

    // Try cache first
    const cached = await cacheGet<any>(key);
    if (cached) {
      return response(res, 200, 'Order fetched successfully', cached);
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email').populate('shippingAddress')
      .populate({
        path: 'items.product',
        model: 'Product',
      });
    if (!order) {
      return response(res, 404, 'Order not found');
    }

    await cacheSet(key, order, ORDER_TTL);
    response(res, 200, 'Order fetched successfully', order);
  } catch (error) {
    response(res, 500, 'Error fetching order');
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    const key = USER_ORDERS_KEY(userId!);

    // Try cache first
    const cached = await cacheGet<any[]>(key);
    if (cached) {
      return response(res, 200, 'Orders fetched successfully', cached);
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 })
      .populate('user', 'name email').populate('shippingAddress')
      .populate({
        path: 'items.product',
        model: 'Product',
      });

    await cacheSet(key, orders, ORDER_TTL);
    response(res, 200, 'Orders fetched successfully', orders);
  } catch (error) {
    response(res, 500, 'Error fetching orders');
  }
};

export const createPaymentWithRazorpay = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return response(res, 404, 'Order not found');
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order._id.toString(),
    });
    response(res, 200, 'Razorpay order created', { order: razorpayOrder });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    response(res, 500, 'Error creating Razorpay order');
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const paymentId = req.body.payload.payment.entity.id;
    const orderId = req.body.payload.payment.entity.order_id;

    const updated = await Order.findOneAndUpdate(
      { 'paymentDetails.razorpay_order_id': orderId },
      {
        paymentStatus: 'completed',
        status: 'processing',
        'paymentDetails.razorpay_payment_id': paymentId,
      },
      { new: true }
    );

    // Invalidate all order-related caches
    if (updated) {
      await Promise.all([
        cacheDelByPrefix(ORDERS_PREFIX),
        cacheDel('admin:orders', 'admin:dashboard'),
      ]);
    }

    response(res, 200, 'Webhook processed successfully');
  } else {
    response(res, 400, 'Invalid signature');
  }
};
