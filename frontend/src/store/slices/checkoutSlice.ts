import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address } from '@/types/type';

interface CheckoutState {
  step: 'cart' | 'address' | 'payment';

  orderId: string | null;
  orderAmount: number | null;
}

const initialState: CheckoutState = {
  step: 'cart',
  orderId: null,
  orderAmount: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCheckoutStep: (state, action: PayloadAction<'cart' | 'address' | 'payment'>) => {
      state.step = action.payload;
    },
    setOrderId: (state, action: PayloadAction<string | null>) => {
      state.orderId = action.payload;
    },
    setOrderAmount: (state, action: PayloadAction<number | null>) => {
      state.orderAmount = action.payload;
    },
    resetCheckout: (state) => {
      state.step = 'cart';
      state.orderAmount = null;
    },
  },
});

export const { setCheckoutStep, setOrderId, setOrderAmount, resetCheckout } = checkoutSlice.actions;

export default checkoutSlice.reducer;

