import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistItem {
  _id: string;
  products: string[];
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    addToWishlistAction: (state, action: PayloadAction<WishlistItem>) => {
      const existingItemIndex = state.items.findIndex(item => item._id === action.payload._id);
      if (existingItemIndex !== -1) {
        state.items[existingItemIndex] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromWishlistAction: (state, action: PayloadAction<string>) => {
      state.items = state.items.map(item => ({
        ...item,
        products: item.products.filter(productId => productId !== action.payload)
      })).filter(item => item.products.length > 0);
    },
  },
});

export const { setWishlist, clearWishlist, addToWishlistAction, removeFromWishlistAction } = wishlistSlice.actions;

export default wishlistSlice.reducer;

