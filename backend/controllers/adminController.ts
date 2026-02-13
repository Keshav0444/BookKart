import { Request, Response } from "express";
import SellerPayment from "../models/SellerPayment";
import ProductOrder from "../models/ProductOrder";
import {response} from '../utils/responseHandler'
import items from "razorpay/dist/types/items";
import User from "../models/User";
import Products from "../models/Products";

export const getAllOrders = async(req:Request,res:Response) => {
      try {
          const {status,paymentStatus,startDate,endDate} = req.query;

          const paidOrderRecord = await SellerPayment.find().select('order');
          const paidOrderIds = paidOrderRecord.map((record) => record.order.toString());

          const query : any= {
            paymentStatus:"completed",
            _id: {$nin: paidOrderIds}
          }

          if(status){
            query.status= status
          }
          query.paymentStatus = paymentStatus || "completed"

          if(startDate && endDate){
            query.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            }
          }


          const orders = await ProductOrder.find(query)
          .populate({
            path:"items.product",
            populate:{
                path:'seller',
                select:"name email phoneNumber paymentMode paymentDetails"
            }
          })
          .populate("user", "name email")
          .populate("shippingAddress")
          .sort({createdAt: -1})

          return response(res,200,"order fetched successfully",{orders})


      } catch (error) {
         console.error('Error fetching orders:', error)
       return response(res,500, 'Internal server error');
      }
}


//update order
export const updateOrder = async (req:Request,res:Response) =>{
    try {
        const {id} = req.params;
        const {status,paymentStatus,notes}= req.body;
        const order = await ProductOrder.findById(id);

        if(!order) {
            return response(res,404,'Order not found')
        }
        if(status) order.status = status;
        if(paymentStatus) order.paymentStatus= paymentStatus;
         if(notes) order.notes = notes;


        await order.save();

        return response(res,200, "Orderupdate successfully",order)

    } catch (error) {
        console.error('Error updating order:', error)
        return response(res,500, 'Internal server error');
    }
}


export const processSellerPayment = async (req:Request,res:Response) =>{
    try {
         const {orderId} = req.params;
         const {productId, paymentMethod,amount,notes} = req.body;
         const user = req.id;


         if(!productId || !paymentMethod || !amount){
            return response(res,400,"Missing required fields: productdId, payemtmethod, amount")
         }

         const order = await ProductOrder.findById(orderId).populate({
            path:"items.product",
            populate:{
                path:"seller",
            }
         })

         if(!order){
            return response(res,404,'Order not found')
         }


         //find the specific product in the order;

         const orderItem = order.items.find((item) => (item.product)._id.toString() === productId);
         if(!orderItem) {
            return response(res,404, "Product not found in this order")
         }

         const sellerPayment = new SellerPayment({
              seller :(orderItem.product as any).seller._id,
              order:orderId,
              product:productId,
              amount,
              paymentMethod,
              status:'completed',
              processedBy:user,
              notes
         })
         await sellerPayment.save();
         return response(res,200,"Payment to seller processed successfully", sellerPayment);
    } catch (error) {
        console.error('Error processed seller payment:', error)
        return response(res,500, 'Internal server error');
    }
}

export const getDashboardStats = async(req:Request,res:Response) =>{
    try {
          const [totalOrders, totalUsers, totalProducts,statusCounts,recentOrders,revenue,monthlySales] =
          await  Promise.all([
            //Get Count 
            ProductOrder.countDocuments().lean(),
            User.countDocuments().lean(),
            Products.countDocuments().lean(),

            //Get order by status in single query
            ProductOrder.aggregate([
                {
                    $group:{
                        _id:"$status",
                        count:{$sum : 1}
                    }
                }
            ]),

            //Get recent order
            ProductOrder.find()
            .select("user totalAmount status createdAt")
            .populate("user", "name")
            .sort({createdAt: -1})
            .limit(5)
            .lean(),


            //calculate revenue

            ProductOrder.aggregate([
                {$match : {paymentStatus: "completed"}},
                {$group: {_id: null, total: {$sum: "$totalAmount"}}}
            ]),

            //Get monthly sales data for chart
            ProductOrder.aggregate([
                {$match : {paymentStatus: "completed"}},
                {
                    $group:{
                        _id:{
                             month:{$month: "$createdAt"},
                             year:{$year: "$createdAt"}
                        },
                        total: {$sum: "$totalAmount"},
                        count:{$sum:1},
                    }
                },
                {$sort: {"_id.year" : 1, "_id.month": 1}}
            ])
          ]) 

                 //Process status count
                 const ordersByStatus = {
                    processing:0,
                    shipped:0,
                    delivered:0,
                    cancelled:0
                 }


                 statusCounts.forEach((item:any) =>{
                    const status = item._id as keyof typeof ordersByStatus;
                    if(ordersByStatus.hasOwnProperty(status)){
                        ordersByStatus[status] = item.count;
                    }
                 });


                 return response(res,200, "Dashboard statistics fetched successfully", {
                    counts: {
                        orders:totalOrders,
                        users:totalUsers,
                        products:totalProducts,
                        revenue:revenue.length > 0 ? revenue[0].total : 0,
                    },
                    ordersByStatus,
                    recentOrders,
                    monthlySales
                 })
    } catch (error) {
        console.error('Error processed dashboard statitics:', error)
        return response(res,500, 'Internal server error');
    }
}


export const getSellerPayment = async (req:Request,res:Response) =>{

    try {
         const {sellerId, status,paymentMethod,startDate,endDate} = req.query;

         const query: any = {};

         if(sellerId && sellerId !=='all') {
            query.seller = sellerId;
         }

         if(status && status !=='all') {
            query.status = status;
         }

         if(paymentMethod && paymentMethod !=='all') {
            query.paymentMethod = paymentMethod;
         }


         if(startDate && endDate){
            query.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            }
          }


          const payments = await SellerPayment.find(query)
          .populate("seller", "name email phoneNumber paymentMode paymentDetails")
          .populate("order")
          .populate("product", "subject finalPrice images")
          .populate("processedBy", "name")
          .sort({createdAt: -1})


          const users = await User.find();
    

          return response(res,200,"seller Payments fetched successfully",{payments,users} );
         
    } catch (error) {
        console.error('failed to fetched  seller Payments', error)
        return response(res,500, 'Internal server error');
    }
}