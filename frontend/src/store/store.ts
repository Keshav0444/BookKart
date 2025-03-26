import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import { api } from './api';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import checkoutReducer from './slices/checkoutSlice'

// Persist configuration for user, cart, and wishlist slices
const userPersistConfig = { key: 'user', storage, whitelist: ['user', 'isEmailVerified','isLoggedIn'] };
const cartPersistConfig = { key: 'cart', storage, whitelist: ['items'] }; 
const wishlistPersistConfig = { key: 'wishlist', storage };
const checkoutPersistConfig = { key: 'checkout', storage };



// Wrap reducers with `persistReducer`
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedWishlistReducer = persistReducer(wishlistPersistConfig, wishlistReducer);
const persistedCheckoutReducer = persistReducer(checkoutPersistConfig, checkoutReducer);


// Configure store with persisted reducers
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer, // RTK Query API
    user: persistedUserReducer,
    cart: persistedCartReducer,
    wishlist: persistedWishlistReducer,
    checkout: persistedCheckoutReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER], 
      },
    }).concat(api.middleware),
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Create the persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
