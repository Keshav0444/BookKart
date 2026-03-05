import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Products';
import { response } from '../utils/responseHandler';
import { uploadFileToCloudinary } from '../config/cloudnaryConfig';
import { cacheGet, cacheSet, cacheDel, cacheDelByPrefix } from '../utils/cache';

const PRODUCTS_ALL_KEY = 'products:all';
const PRODUCT_KEY = (id: string) => `products:${id}`;
const PRODUCTS_SELLER_KEY = (sellerId: string) => `products:seller:${sellerId}`;
const PRODUCTS_SELLER_PREFIX = 'products:seller:';
const PRODUCTS_TTL = 300; // 5 minutes

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category, condition, author, subject, edition, finalPrice, shippingCharge, classType, paymentMode, paymentDetails } = req.body;
    const images = req.files as Express.Multer.File[];
    const loggedInUser = req.id;

    if (!images || images.length === 0) {
      return response(res, 400, 'No images provided');
    }

    let parsedPaymentDetails = JSON.parse(paymentDetails);
    // Validate payment details
    if (paymentMode === 'UPI' && (!parsedPaymentDetails || !parsedPaymentDetails.upiId)) {
      return response(res, 400, 'UPI ID is required for UPI payment mode.');
    }

    if (paymentMode === 'Bank Account' &&
      (!parsedPaymentDetails || !parsedPaymentDetails.bankDetails ||
        !parsedPaymentDetails.bankDetails.accountNumber ||
        !parsedPaymentDetails.bankDetails.ifscCode ||
        !parsedPaymentDetails.bankDetails.bankName)) {
      return response(res, 400, 'Complete bank details are required for Bank Account payment mode.');
    }

    // Upload each file to Cloudinary and store the resulting URLs
    const uploadPromises = images.map(file => uploadFileToCloudinary(file as any));
    const uploadedImages = await Promise.all(uploadPromises);
    const imageUrls = uploadedImages.map(image => image.secure_url);

    const product = new Product({
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

    await product.save();

    // Invalidate product list caches
    await Promise.all([
      cacheDel(PRODUCTS_ALL_KEY),
      cacheDelByPrefix(PRODUCTS_SELLER_PREFIX),
    ]);

    return response(res, 201, 'Product created successfully', product);
  } catch (error) {
    console.error(error)
    return response(res, 500, 'Error creating product');
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Try cache first
    const cached = await cacheGet<IProduct[]>(PRODUCTS_ALL_KEY);
    if (cached) {
      return response(res, 200, 'Products fetched successfully', cached);
    }

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('seller', 'name email');

    await cacheSet(PRODUCTS_ALL_KEY, products, PRODUCTS_TTL);
    response(res, 200, 'Products fetched successfully', products);
  } catch (error) {
    response(res, 500, 'Error fetching products');
  }
};


export const getProductById = async (req: Request, res: Response) => {
  try {
    const key = PRODUCT_KEY(req.params.id);

    // Try cache first
    const cached = await cacheGet<IProduct>(key);
    if (cached) {
      return response(res, 200, 'Product fetched successfully', cached);
    }

    const product = await Product.findById(req.params.id)
      .populate({
        path: 'seller',
        select: 'name email profilePicture phoneNumber addresses',
        populate: {
          path: 'addresses',
          model: 'Address',
        },
      });

    if (!product) {
      return response(res, 404, 'Product not found');
    }

    await cacheSet(key, product, PRODUCTS_TTL);
    response(res, 200, 'Product fetched successfully', product);
  } catch (error) {
    response(res, 500, 'Error fetching product');
  }
};


export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return response(res, 404, 'Product not found');
    }

    // Invalidate related caches
    await Promise.all([
      cacheDel(PRODUCTS_ALL_KEY, PRODUCT_KEY(req.params.productId)),
      cacheDelByPrefix(PRODUCTS_SELLER_PREFIX),
    ]);

    response(res, 200, 'Product deleted successfully');
  } catch (error) {
    response(res, 500, 'Error deleting product');
  }
};


export const getProductsBySeller = async (req: Request, res: Response) => {
  try {
    const sellerId = req.params.sellerId;

    if (!sellerId) {
      return response(res, 400, 'Seller ID is required');
    }

    const key = PRODUCTS_SELLER_KEY(sellerId);

    // Try cache first
    const cached = await cacheGet<IProduct[]>(key);
    if (cached) {
      return response(res, 200, 'Products fetched successfully', cached);
    }

    const products = await Product.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .populate('seller', 'name email profilePicture phoneNumber');

    if (products.length === 0) {
      return response(res, 202, 'No products found for this seller');
    }

    await cacheSet(key, products, PRODUCTS_TTL);
    return response(res, 200, 'Products fetched successfully', products);
  } catch (error) {
    console.error(error);
    return response(res, 500, 'Error fetching products');
  }
};
