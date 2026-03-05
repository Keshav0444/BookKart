import { Request, Response } from 'express';
import Wishlist from '../models/wishList';
import Product from '../models/Products';
import { response } from '../utils/responseHandler';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache';

const WISHLIST_KEY = (userId: string) => `wishlist:${userId}`;
const WISHLIST_TTL = 300; // 5 minutes

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return response(res, 404, 'Product not found');
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    // Invalidate wishlist cache
    await cacheDel(WISHLIST_KEY(userId!));

    return response(res, 200, 'Product added to wishlist', wishlist);
  } catch (error) {
    return response(res, 500, 'Error adding product to wishlist');
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return response(res, 404, 'Wishlist not found');
    }

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();

    // Invalidate wishlist cache
    await cacheDel(WISHLIST_KEY(userId!));

    return response(res, 200, 'Product removed from wishlist', wishlist);
  } catch (error) {
    return response(res, 500, 'Error removing product from wishlist');
  }
};

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    const key = WISHLIST_KEY(userId!);

    // Try cache first
    const cached = await cacheGet<any>(key);
    if (cached) {
      return response(res, 200, 'Wishlist fetched successfully', cached);
    }

    const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    if (!wishlist) {
      return response(res, 404, 'Wishlist not found');
    }

    await cacheSet(key, wishlist, WISHLIST_TTL);
    response(res, 200, 'Wishlist fetched successfully', wishlist);
  } catch (error) {
    response(res, 500, 'Error fetching wishlist');
  }
};