import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const API_URLS = {
  // User related URLs
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  GOOGLE_LOGIN: `${BASE_URL}/auth/google`,
  VERIFY_EMAIL: (token: string) => `${BASE_URL}/auth/verify-email/${token}`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: (token: string) => `${BASE_URL}/auth/reset-password/${token}`,
  VERIFY_AUTH: `${BASE_URL}/auth/verify-auth`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  UPDATE_USER_PROFILE:(userId:string) => `${BASE_URL}/users/profile/update/${userId}`,
  
  // Product related URLs
  PRODUCTS: `${BASE_URL}/products`,
  PRODUCT_BY_ID: (id: string) => `${BASE_URL}/products/${id}`,
  GET_PRODUCT_BY_SELLERID : (sellerId:string) => `${BASE_URL}/products/seller/${sellerId}`,
  DELETE_PRODUCT_BY_PRODUCTID : (productId:string) => `${BASE_URL}/products/seller/${productId}`,
  
  // Cart related URLs
  CART:(userId: string) => `${BASE_URL}/cart/${userId}`,
  ADD_TO_CART: `${BASE_URL}/cart/add`,
  REMOVE_FROM_CART: (productId: string) => `${BASE_URL}/cart/remove/${productId}`,
  
  // Wishlist related URLs
  WISHLIST: `${BASE_URL}/wishlist`,
  ADD_TO_WISHLIST: `${BASE_URL}/wishlist/add`,
  REMOVE_FROM_WISHLIST: (productId: string) => `${BASE_URL}/wishlist/remove/${productId}`,
  
  // Order related URLs
  ORDERS: `${BASE_URL}/orders`,
  ORDER_BY_ID: (orderId: string) => `${BASE_URL}/orders/${orderId}`,
  CREATE_PAYMENT_INTENT: `${BASE_URL}/orders/payment-razorpay`,


  //address related URLs
    GET_ADDRESS: `${BASE_URL}/address`,
    ADD_OR_UPDATE_ADDRESS: `${BASE_URL}/address/create-or-update`,
};

export const api = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
    credentials: 'include', 
  }),
  tagTypes: ['User', 'Product', 'Cart', 'Wishlist', 'Order','Address'],
  endpoints: (builder) => ({
    // User endpoints
    register: builder.mutation({
      query: (userData) => ({
        url: API_URLS.REGISTER,
        method: 'POST',
        body: userData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: API_URLS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: API_URLS.VERIFY_EMAIL(token),
        method: 'GET',
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: API_URLS.FORGOT_PASSWORD,
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: API_URLS.RESET_PASSWORD(token),
        method: 'POST',
        body: { newPassword },
      }),
    }),
    verifyAuth: builder.mutation({
      query: () => ({
        url: API_URLS.VERIFY_AUTH,
        method: 'GET',
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: API_URLS.LOGOUT,
        method: 'GET',
      }),
    }),
    updateUser: builder.mutation({
      query: ({ userId, userData }) => ({
        url: API_URLS.UPDATE_USER_PROFILE(userId),
        method: 'PUT',
        body: userData,
      }),
    }),    

    // Product endpoints
    addProducts: builder.mutation({
      query: (productData) => ({
        url: API_URLS.PRODUCTS,
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),
    getProducts: builder.query({
      query: () => API_URLS.PRODUCTS,
      providesTags: ['Product'],
    }),
    getProductById: builder.query({
      query: (id) => API_URLS.PRODUCT_BY_ID(id),
      providesTags: ['Product'],
    }),
    getProductBySellerId: builder.query({
      query: (sellerId) => API_URLS.GET_PRODUCT_BY_SELLERID(sellerId),
      providesTags: ['Product'],
    }),

    deleteProductById: builder.mutation({
      query: (productId) => ({
        url: API_URLS.DELETE_PRODUCT_BY_PRODUCTID(productId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Cart endpoints
    getCart: builder.query({
      query: (userId) => API_URLS.CART(userId),
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (productData) => ({
        url: API_URLS.ADD_TO_CART,
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: API_URLS.REMOVE_FROM_CART(productId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Wishlist endpoints
    getWishlist: builder.query({
      query: () => API_URLS.WISHLIST,
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation({
      query: (productId) => ({
        url: API_URLS.ADD_TO_WISHLIST,
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: API_URLS.REMOVE_FROM_WISHLIST(productId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // Order endpoints
    getUserOrders: builder.query({
      query: () => API_URLS.ORDERS,
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (orderId) => API_URLS.ORDER_BY_ID(orderId),
      providesTags: ['Order'],
    }),
    createOrUpdateOrder: builder.mutation({
      query: ({ orderId, updates }) => ({
        url: API_URLS.ORDERS,
        method: orderId ? 'PATCH' : 'POST',
        body: updates,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    createRazorpayPayment: builder.mutation({
      query: (orderId) => ({
        url: API_URLS.CREATE_PAYMENT_INTENT,
        method: 'POST',
        body: { orderId },
      }),
    }),


    getAddresses: builder.query<any[], void>({
      query: () =>API_URLS.GET_ADDRESS,
      providesTags: ['Address'],
    }),
    addOrUpdateAddress: builder.mutation<any, any>({
      query: (address) => ({
        url: API_URLS.ADD_OR_UPDATE_ADDRESS,
        method: 'POST',
        body: address,
      }),
      invalidatesTags: ['Address'],
    }),

  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyAuthMutation,
  useLogoutMutation,
  useUpdateUserMutation,
  useAddProductsMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySellerIdQuery,
  useDeleteProductByIdMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrUpdateOrderMutation,
  useCreateRazorpayPaymentMutation,
   useAddOrUpdateAddressMutation,
  useGetAddressesQuery,
} = api;

