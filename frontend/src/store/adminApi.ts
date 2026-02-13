import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const adminApi = createApi({
    reducerPath:'adminApi',
    baseQuery: fetchBaseQuery({
        baseUrl:BASE_URL,
        credentials:"include",
    }),
    tagTypes:["AdminStats", "AdminOrders", "SellerPayments"],
    endpoints:(builder) =>({
        getDashboardStats :builder.query({
            query: () => '/admin/dashboard-stats',
            providesTags:["AdminStats"]
        }),

        getAdminOrders: builder.query({
            query:(params) => {
                const queryParams = new URLSearchParams();
                if(params){
                    Object.entries(params).forEach(([key,value]) =>{
                        if(value) queryParams.append(key,value.toString())
                    })
                }
                return `/admin/orders?${queryParams}`
            },
            providesTags:["AdminOrders"]
        }),

        updateOrder: builder.mutation({
            query:({orderId, update} ) =>({
                url:`/admin/orders/${orderId}`,
                method:"PUT",
                body:update
            }),
            invalidatesTags:(result, error, {orderId})=> [
                {type: "AdminOrders", id:orderId},
                "AdminOrders",
                "AdminStats",
            ],
        }),

        getSellerPayments: builder.query({
            query:(params) => {
                const queryParams = new URLSearchParams();
                if(params){
                    Object.entries(params).forEach(([key,value]) =>{
                        if(value) queryParams.append(key,value.toString())
                    })
                }
                return `/admin/seller-payments?${queryParams}`
            },
            providesTags:["SellerPayments"]
        }),

        processSellerPayment: builder.mutation({
            query:({orderId, paymentData} ) =>({
                url:`/admin/process-seller-payment/${orderId}`,
                method:"POST",
                body:paymentData
            }),
            invalidatesTags:(result, error, {orderId})=> [
                {type: "AdminOrders", id:orderId},
                "AdminOrders",
                "AdminStats",
                "SellerPayments"
            ],
        }),

    })
})

export const {
      useGetDashboardStatsQuery,
      useGetAdminOrdersQuery,
      useUpdateOrderMutation,
      useProcessSellerPaymentMutation,
      useGetSellerPaymentsQuery,
}= adminApi;