import { CartItem } from '@/types/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export interface CartState {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

const initialState: CartState = {
  _id: '',
  user: '',
  items: [],
  createdAt: '',
  updatedAt: '',
};


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartState>) => {
      return { ...state, ...action.payload };
    },
    addToCart: (state, action: PayloadAction<CartState>) => {
      return { ...state, ...action.payload };
    },
    clearCart: () => initialState,
  },
});

export const { setCart, addToCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
